import React, { useEffect, useState } from "react";
import { Card, Row, Col, Statistic, Spin } from "antd";
import { productAPI } from "../api/productAPI";
import { customerAPI } from "../api/customerAPI";
import { orderAPI } from "../api/orderAPI";
import { Product } from "../types/Product";
import axiosClient from "../api/axiosClient";
import PieChart from "../components/PieChart";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer } from "recharts";

const Dashboard: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [customersCount, setCustomersCount] = useState<number>(0);
  const [ordersCount, setOrdersCount] = useState<number>(0);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [totalInventoryCost, setTotalInventoryCost] = useState<number>(0);
  const [profit, setProfit] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [prodRes, custRes, orderRes] = await Promise.all([
          productAPI.getAll(),
          customerAPI.getAll(),
          orderAPI.getAll(),
        ]);

        setProducts(prodRes || []);
        setCustomersCount((custRes || []).length || 0);
        setOrders(orderRes || []);
        setOrdersCount((orderRes || []).length || 0);

        // Compute totalRevenue from paid orders (server may also provide totals,
        // but ensure dashboard totalRevenue equals sum of orders with trạng_thái = 'da_thanh_toan')
        try {
          const completedRevenue = (orderRes || []).reduce((sum: number, o: any) => {
            const status = o.trang_thai || o.trangThai || o.status;
            const amount = Number(o.tong_tien || o.tongTien || o.total || 0) || 0;
            return sum + ((status === 'hoan_tat') ? amount : 0);
          }, 0);
          setTotalRevenue(completedRevenue);

          // Fetch inventory cost from statistics (last 30 days) to compute profit
          const today = new Date();
          const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
          const startDate = thirtyDaysAgo.toISOString().split("T")[0];
          const endDate = today.toISOString().split("T")[0];
          const statRes = await axiosClient.get(`/statistics`, { params: { startDate, endDate, full: true } });
          const d = statRes.data || {};
          const invCost = Number(d.inventoryCost || 0);
          setTotalInventoryCost(invCost);
          // profit = revenue from completed orders - inventory cost
          setProfit(completedRevenue - invCost);
        } catch (e) {
          console.error("Không lấy được thống kê cho dashboard:", e);
        }
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // listen for external updates (orders completed, new receipts)
    const handler = (e: Event) => {
      try {
        const ev = e as CustomEvent;
        const d = ev?.detail || {};
        if (d && (d.orderCompletedAmount || d.orderRevertedAmount || d.inventoryAdded || d.inventoryTotal !== undefined)) {
          // prefer authoritative total from event when provided
          if (typeof d.inventoryTotal !== 'undefined') {
            const invTot = Number(d.inventoryTotal || 0);
            setTotalInventoryCost(invTot);
            setProfit((prev) => {
              const newProfit = totalRevenue - invTot;
              return newProfit;
            });
            // also refetch in background to fully sync
            setTimeout(() => { fetchData(); }, 200);
            return;
          }

          // compute new totals based on previous values and the delta in the event
          setTotalRevenue((prevRevenue) => {
            const inc = Number(d.orderCompletedAmount || 0);
            const dec = Number(d.orderRevertedAmount || 0);
            const nextRevenue = prevRevenue + inc - dec;
            // also update profit using current inventory cost state
            setTotalInventoryCost((prevInv) => {
              const addInv = Number(d.inventoryAdded || 0);
              const nextInv = prevInv + addInv;
              setProfit(nextRevenue - nextInv);
              return nextInv;
            });
            // schedule a quick refetch to sync with server
            setTimeout(() => { fetchData(); }, 200);
            return nextRevenue;
          });
        } else {
          // generic update — refetch full stats
          fetchData();
        }
      } catch (err) {
        console.error('statsUpdated handler error', err);
        fetchData();
      }
    };
    window.addEventListener('statsUpdated', handler);
    return () => window.removeEventListener('statsUpdated', handler);
  }, []);

  // ============================
  // 📌 Chỉ số Dashboard
  // ============================
  const totalProducts = products.length;
  // avoid redeclaring `totalRevenue` (state) — compute product list total separately
  const totalProductsValue = products.reduce((sum, product) => sum + product.price, 0);

  // local formatter for VND values
  const formatVND = (value: number) => `${Number(value || 0).toLocaleString('vi-VN')} đ`;

  // Data for charts
  const chartData = products.map((p) => ({
    name: p.name,
    price: Number(p.price || 0),
    stock: 0,
  }));

  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>Bảng điều khiển</h1>

      {loading ? (
        <Spin size="large" />
      ) : (
        <Row gutter={16} style={{ marginBottom: '24px' }}>
          <Col span={6}>
            <Card>
              <Statistic title="Tổng sản phẩm" value={totalProducts} />
              <p style={{ fontSize: '14px', color: '#666' }}>Sản phẩm đang kinh doanh</p>
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic title="Đơn hàng" value={ordersCount} />
              <p style={{ fontSize: '14px', color: '#666' }}>Tổng số đơn hàng</p>
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic title="Doanh thu" value={totalRevenue} formatter={(value) => formatVND(value as number)} />
              <p style={{ fontSize: '14px', color: '#666' }}>Tổng doanh thu từ đơn hàng đã thanh toán</p>
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic title="Tổng giá trị sản phẩm" value={totalProductsValue} formatter={(value) => formatVND(value as number)} />
              <p style={{ fontSize: '14px', color: '#666' }}>Tổng giá bán tất cả sản phẩm</p>
            </Card>
          </Col>
        </Row>
      )}

      {/* Revenue / Inventory / Profit chart */}
      <Card title="Phân bố: Doanh thu / Nhập kho / Lợi nhuận (30 ngày gần nhất)" style={{ marginTop: '24px' }}>
        <Row gutter={16}>
          <Col span={12}>
            <PieChart
              data={[
                { label: "Tổng doanh thu", value: totalRevenue, color: "#16a34a" },
                { label: "Tổng tiền nhập nguyên liệu", value: totalInventoryCost, color: "#f59e0b" },
                { label: "Lợi nhuận", value: Math.max(0, profit), color: "#3b82f6" },
              ]}
            />
          </Col>
          <Col span={12}>
            <div style={{ padding: '16px', background: '#f5f5f5', borderRadius: '8px', marginBottom: '16px' }}>
              <div style={{ fontSize: '14px', color: '#666' }}>Tổng doanh thu</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#16a34a' }}>{Number(totalRevenue).toLocaleString()} đ</div>
            </div>
            <div style={{ padding: '16px', background: '#f5f5f5', borderRadius: '8px', marginBottom: '16px' }}>
              <div style={{ fontSize: '14px', color: '#666' }}>Tổng tiền nhập nguyên liệu</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>{Number(totalInventoryCost).toLocaleString()} đ</div>
            </div>
            <div style={{ padding: '16px', background: '#f5f5f5', borderRadius: '8px' }}>
              <div style={{ fontSize: '14px', color: '#666' }}>Lợi nhuận</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: profit >= 0 ? '#16a34a' : '#dc2626' }}>{Number(profit).toLocaleString()} đ</div>
            </div>
            {profit < 0 && (
              <p style={{ fontSize: '14px', color: '#dc2626', marginTop: '16px' }}>Lưu ý: Lợi nhuận âm (lỗ) trong khoảng thời gian đã chọn.</p>
            )}
          </Col>
        </Row>
      </Card>

      {/* Price Chart */}
      <Card title="Biểu đồ Giá bán" style={{ marginTop: '24px' }}>
        {products.length > 0 ? (
          <div style={{ height: '400px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#d9d9d9"
                />
                <XAxis dataKey="name" stroke="#000" tick={false} axisLine={false} tickLine={false} />
                <YAxis stroke="#000" />
                <Tooltip
                  cursor={{ fill: "rgba(200, 200, 200, 0.2)" }}
                  contentStyle={{
                    backgroundColor: "#fff",
                    borderColor: "#d9d9d9",
                    color: "#000",
                  }}
                />
                <Legend />
                <Bar
                  dataKey="price"
                  name="Giá bán"
                  fill="#1890ff"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p style={{ textAlign: 'center', padding: '32px 0', color: '#666' }}>
            Chưa có sản phẩm
          </p>
        )}
      </Card>

      {/* Inventory Chart */}
      <Card title="Biểu đồ Tồn kho" style={{ marginTop: '24px' }}>
            <h2 className="text-xl font-bold text-foreground">
               Biểu đồ Tồn kho
            </h2>

        {products.length > 0 ? (
          <div style={{ height: '400px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#d9d9d9"
                />
                <XAxis dataKey="name" stroke="#000" tick={false} axisLine={false} tickLine={false} />
                <YAxis stroke="#000" />
                <Tooltip
                  cursor={{ fill: "rgba(200, 200, 200, 0.2)" }}
                  contentStyle={{
                    backgroundColor: "#fff",
                    borderColor: "#d9d9d9",
                    color: "#000",
                  }}
                />
                <Legend />
                <Bar
                  dataKey="stock"
                  name="Tồn kho"
                  fill="#52c41a"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p style={{ textAlign: 'center', padding: '32px 0', color: '#666' }}>
            Chưa có sản phẩm
          </p>
        )}
      </Card>
    </div>
  );
};

export default Dashboard;
