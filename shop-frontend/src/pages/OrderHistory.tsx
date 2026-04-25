import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

const API = "https://bepmam-backend.onrender.com/api";

export default function OrderHistory() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [isAuth, setIsAuth] = useState<boolean>(true);
  const navigate = useNavigate();
  const location = useLocation();
  const [infoModal, setInfoModal] = useState<string | null>((location.state as any)?.infoModal || null);

  const statusLabel = (s: string | undefined) => {
    if (!s) return 'Chờ xử lý';
    if (s === 'cho_xu_ly') return 'Chờ xử lý';
    if (s === 'da_thanh_toan') return 'Đã thanh toán';
    if (s === 'dang_giao') return 'Đang giao';
    if (s === 'hoan_tat') return 'Hoàn thành';
    if (s === 'huy') return 'Đã hủy';
    return s;
  };

  const badgeClassFor = (s: string | undefined) => {
    if (!s || s === 'cho_xu_ly') return 'bg-gray-100 text-gray-800';
    if (s === 'da_thanh_toan') return 'bg-green-100 text-green-800';
    if (s === 'dang_giao') return 'bg-yellow-100 text-yellow-800';
    if (s === 'hoan_tat') return 'bg-emerald-100 text-emerald-800';
    if (s === 'huy') return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  const fetchOrders = async () => {
    const token = localStorage.getItem("token");
    const userRaw = localStorage.getItem("user");
    if (!token || !userRaw) {
      setIsAuth(false);
      setOrders([]);
      return;
    }
    setIsAuth(true);
    const user = JSON.parse(userRaw);
    try {
      setLoading(true);
      setErrorMsg(null);
      console.debug('OrderHistory: POST /customers', { ho_ten: user.ho_ten || user.ten_dang_nhap, ma_tai_khoan: user.id });
      const custRes = await axios.post(`${API}/customers`, { ho_ten: user.ho_ten || user.ten_dang_nhap, ma_tai_khoan: user.id }, { headers: { Authorization: `Bearer ${token}` } });
      const ma_khach_hang = custRes.data.ma_khach_hang;
      const res = await axios.get(`${API}/customers/${ma_khach_hang}/orders`, { headers: { Authorization: `Bearer ${token}` } });
      setOrders(res.data || []);
    } catch (err) {
      console.error('OrderHistory error', err);
      const msg = (err as any)?.response?.data?.message || (err as any)?.message || 'Lỗi khi lấy đơn hàng';
      setErrorMsg(msg.toString());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleViewDetail = async (ma_don_hang: number | string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsAuth(false);
      return;
    }
    try {
      setLoading(true);
      setErrorMsg(null);
      console.debug('OrderHistory: GET /orders/' + ma_don_hang);
      const res = await axios.get(`${API}/orders/${ma_don_hang}`, { headers: { Authorization: `Bearer ${token}` } });
      setSelectedOrder(res.data);
    } catch (err) {
      console.error('Order detail error', err);
      const msg = (err as any)?.response?.data?.message || (err as any)?.message || 'Lỗi khi lấy chi tiết đơn hàng';
      setErrorMsg(msg.toString());
    } finally {
      setLoading(false);
    }
  };

  const closeDetail = () => setSelectedOrder(null);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Đơn hàng của bạn</h1>
      {!isAuth && (
        <div className="p-6 bg-yellow-50 border-l-4 border-yellow-300 text-yellow-800 rounded mb-4">Đăng nhập để thấy đơn hàng của bạn</div>
      )}
      {/* Info modal shown when navigated from payment modal */}
      {infoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full text-center">
            <div className="mb-4 text-gray-800">{infoModal}</div>
            <div className="flex justify-center">
              <button
                onClick={() => setInfoModal(null)}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="flex items-center justify-end mb-4">
        <button onClick={fetchOrders} className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded">Làm mới</button>
      </div>
      {loading ? (
        <p>Đang tải...</p>
      ) : errorMsg ? (
        <p className="text-red-600">{errorMsg}</p>
      ) : orders.length === 0 ? (
        <p>{isAuth ? 'Bạn chưa đặt đơn hàng nào.' : 'Chưa có dữ liệu.'}</p>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o.ma_don_hang} className="border p-4 rounded">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-semibold">Mã đơn: {o.ma_don_hang}</div>
                  <div className="text-sm text-gray-600">Ngày: {o.thoi_gian_mua}</div>
                  <div className="text-sm">Người nhận: {o.ten_nguoi_nhan || o.ten_khach_hang || o.ho_ten || '-'}</div>
                  <div className="text-sm">SĐT nhận: {o.so_dien_thoai_nhan || o.so_dien_thoai || '-'}</div>
                  <div className="text-sm">Địa chỉ: {o.dia_chi_nhan || o.dia_chi_giao_hang || o.dia_chi || '-'}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${badgeClassFor(o.trang_thai)}`}>{statusLabel(o.trang_thai)}</span>
                  <button onClick={() => handleViewDetail(o.ma_don_hang)} className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1 rounded">Chi tiết</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white w-11/12 md:w-2/3 lg:w-1/2 p-6 rounded shadow-lg max-h-[80vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Chi tiết đơn {selectedOrder.ma_don_hang}</h2>
              <button onClick={closeDetail} className="text-gray-600 hover:text-gray-900">Đóng</button>
            </div>

            <div className="text-sm text-gray-700 mb-3">
              <div><strong>Ngày:</strong> {selectedOrder.thoi_gian_mua}</div>
              <div><strong>Khách:</strong> {selectedOrder.ho_ten || selectedOrder.ten_khach_hang || ''}</div>
              <div><strong>Người nhận:</strong> {selectedOrder.ten_nguoi_nhan || selectedOrder.ten_khach_hang || selectedOrder.ho_ten || ''}</div>
              <div><strong>SĐT nhận:</strong> {selectedOrder.so_dien_thoai_nhan || selectedOrder.so_dien_thoai || ''}</div>
              <div><strong>Địa chỉ:</strong> {selectedOrder.dia_chi_nhan || selectedOrder.dia_chi_giao_hang || selectedOrder.dia_chi || ''}</div>
              <div className="mt-2"><strong>Trạng thái:</strong> <span className={`px-2 py-1 rounded ${badgeClassFor(selectedOrder.trang_thai)}`}>{statusLabel(selectedOrder.trang_thai)}</span></div>
            </div>

            <div>
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="text-left text-gray-600 border-b">
                    <th className="py-2">Sản phẩm</th>
                    <th className="py-2">Số lượng</th>
                    <th className="py-2">Đơn giá</th>
                    <th className="py-2">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items?.map((it: any, idx: number) => (
                    <tr key={idx} className="border-b">
                      <td className="py-2">{it.ten_san_pham}</td>
                      <td className="py-2">{it.so_luong}</td>
                      <td className="py-2">{it.don_gia?.toLocaleString?.() ?? it.don_gia}đ</td>
                      <td className="py-2">{((it.so_luong || 0) * (it.don_gia || 0)).toLocaleString()}đ</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mt-4 text-right font-semibold">Tổng: {selectedOrder.tong_tien?.toLocaleString ? selectedOrder.tong_tien.toLocaleString() + 'đ' : selectedOrder.tong_tien}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
