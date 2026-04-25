import React, { useEffect, useState } from "react";
import { useTheme } from "../contexts/ThemeContext";
import axiosClient from "../api/axiosClient";
import { orderAPI } from "../api/orderAPI";

interface StatData {
  date: string;
  revenue: number;
  orders: number;
  inventoryCost?: number;
  profit?: number;
}

export default function StatisticsPage() {
  const { theme } = useTheme();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [groupBy, setGroupBy] = useState<"day" | "month" | "year">("month");

  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<StatData[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [inventoryCost, setInventoryCost] = useState(0);
  const [profit, setProfit] = useState(0);

  const [ordersList, setOrdersList] = useState<any[]>([]);
  const [receiptsList, setReceiptsList] = useState<any[]>([]);

  const fetchStatistics = async (sDate?: string, eDate?: string, grp?: "day" | "month" | "year") => {
    let sd = sDate || startDate;
    let ed = eDate || endDate;
    const gb = grp || groupBy;

    // If dates are missing, choose sensible defaults:
    // - when grouping by day, default to today (so totals show for today)
    // - otherwise default to last 30 days
    if (!sd || !ed) {
      const today = new Date();
      if (gb === 'day') {
        const iso = today.toISOString().split('T')[0];
        sd = sd || iso;
        ed = ed || iso;
      } else {
        const defaultStart = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        sd = sd || defaultStart.toISOString().split("T")[0];
        ed = ed || today.toISOString().split("T")[0];
      }
      // reflect defaults in the UI
      setStartDate(sd);
      setEndDate(ed);
    }
    try {
      setLoading(true);

      const res = await axiosClient.get(`/statistics`, {
        params: { startDate: sd, endDate: ed, groupBy: gb, full: true },
      });

      const data = res.data || {};

      setStats(data.stats || []);
      setInventoryCost(data.inventoryCost || 0);
      setOrdersList(data.ordersList || []);
      setReceiptsList(data.receiptsList || []);

      // Use server-provided totals (server now computes revenue as sum of orders with status 'hoan_tat')
      setTotalRevenue(Number(data.totalRevenue || 0));
      setTotalOrders(Number(data.totalOrders || 0));
      setProfit(Number(data.profit || 0));

    } catch (err) {
      console.error(err);
      alert("Lỗi lấy thống kê!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handler = (e: any) => {
      try {
        const d = e?.detail || {};
        // if server provided an aggregate inventory total, just refresh the statistics
        if (typeof d.inventoryTotal !== 'undefined') {
          // refresh the current selection
          fetchStatistics();
        } else if (typeof d.inventoryAdded !== 'undefined') {
          // small delta arrived — refresh to keep everything consistent
          fetchStatistics();
        }
      } catch (err) {
        console.error('statsUpdated handler on Statistics failed', err);
        fetchStatistics();
      }
    };
    window.addEventListener('statsUpdated', handler as EventListener);
    return () => window.removeEventListener('statsUpdated', handler as EventListener);
  }, []);
  
  const handleQuickFilter = (days: number) => {
    const today = new Date();
    const pastDate = new Date(today.getTime() - days * 24 * 60 * 60 * 1000);
    setStartDate(pastDate.toISOString().split("T")[0]);
    setEndDate(today.toISOString().split("T")[0]);
  };

  // NOTE: Do not auto-fetch on group change. Instead, fetchStatistics will
  // default to last 30 days when groupBy === 'day' and dates are not provided.

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Thống kê doanh thu</h1>

      {/* Quick Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <h2 className="text-lg font-semibold mb-3">Lọc nhanh</h2>
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => handleQuickFilter(7)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            7 ngày qua
          </button>
          <button
            onClick={() => handleQuickFilter(30)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            30 ngày qua
          </button>
          <button
            onClick={() => handleQuickFilter(90)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            90 ngày qua
          </button>
          <button
            onClick={() => handleQuickFilter(365)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            1 năm qua
          </button>
          {/* removed quick 'Tải theo ngày' button per request */}
        </div>
      </div>

      {/* Date Range Picker */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <h2 className="text-lg font-semibold mb-3">Chọn khoảng thời gian</h2>
        <div className="flex gap-4 items-end flex-wrap">
          <div>
            <label className={"block text-sm font-medium mb-1 " + (theme === 'light' ? 'text-black' : 'text-card-foreground')}>Từ ngày</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded"
              style={{ color: '#000' }}
            />
          </div>
          <div>
            <label className={"block text-sm font-medium mb-1 " + (theme === 'light' ? 'text-black' : 'text-card-foreground')}>Đến ngày</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded"
              style={{ color: '#000' }}
            />
          </div>
          <div>
            <label className={"block text-sm font-medium mb-1 " + (theme === 'light' ? 'text-black' : 'text-card-foreground')}>Nhóm theo</label>
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value as "day" | "month" | "year")}
              className="px-4 py-2 border border-gray-300 rounded"
              style={{ color: '#000' }}
            >
              <option value="day">Theo ngày</option>
              <option value="month">Theo tháng</option>
              <option value="year">Theo năm</option>
            </select>
          </div>
          <button
            onClick={() => fetchStatistics()}
            disabled={loading}
            className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
          >
            Tải dữ liệu 
          </button>
        </div>

        {/* removed total orders box from date-range picker */}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-gray-600 text-sm font-medium">Tổng doanh thu</h3>
          <p className="text-3xl font-bold text-green-600">{Number(totalRevenue).toLocaleString()}đ</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-gray-600 text-sm font-medium">Tổng đơn hàng</h3>
          <p className="text-3xl font-bold text-blue-600">{totalOrders}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-gray-600 text-sm font-medium">Tổng tiền nhập nguyên liệu</h3>
          <p className="text-3xl font-bold text-yellow-600">{Number(inventoryCost).toLocaleString()}đ</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-gray-600 text-sm font-medium">Lợi nhuận</h3>
          <p className={`text-3xl font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>{Number(profit).toLocaleString()}đ</p>
        </div>
      </div>

      {/* Statistics Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-6 py-3 text-left font-semibold text-gray-700">
                {groupBy === "day" ? "Ngày" : groupBy === "month" ? "Tháng" : "Năm"}
              </th>
              <th className="px-6 py-3 text-right font-semibold text-gray-700">
                Doanh thu
              </th>
              <th className="px-6 py-3 text-right font-semibold text-gray-700">
                Số đơn hàng
              </th>
              <th className="px-6 py-3 text-right font-semibold text-gray-700">
                Tổng tiền nhập nguyên liệu
              </th>
              <th className="px-6 py-3 text-right font-semibold text-gray-700">
                Lợi nhuận
              </th>
              <th className="px-6 py-3 text-right font-semibold text-gray-700">
                Doanh thu / đơn
              </th>
            </tr>
          </thead>
          <tbody>
            {stats.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  Không có dữ liệu để hiển thị
                </td>
              </tr>
            ) : (
              stats.map((stat, idx) => (
                <tr key={idx} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-3 text-gray-700">{stat.date}</td>
                  <td className="px-6 py-3 text-right font-semibold text-green-600">
                    {Number(stat.revenue).toLocaleString()}đ
                  </td>
                  <td className="px-6 py-3 text-right text-gray-700">{stat.orders}</td>
                  <td className="px-6 py-3 text-right text-yellow-600">{Number(stat.inventoryCost || 0).toLocaleString()}đ</td>
                  <td className={`px-6 py-3 text-right ${((stat.profit || 0) >= 0) ? 'text-green-600' : 'text-red-600'}`}>{Number(stat.profit || 0).toLocaleString()}đ</td>
                  <td className="px-6 py-3 text-right text-gray-600">
                    {stat.orders > 0
                      ? Number((stat.revenue || 0) / stat.orders).toLocaleString("vi-VN", {
                          maximumFractionDigits: 0,
                        })
                      : 0}
                    đ
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
