import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import PaymentModal from "../components/paymentModal";

const API = "https://bepmam-backend.onrender.com/api";

export default function Cart() {
  const [cart, setCart] = useState<Array<any>>([]);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const raw = localStorage.getItem("cart");
    setCart(raw ? JSON.parse(raw) : []);
  }, []);

  const save = (next: any) => {
    setCart(next);
    localStorage.setItem("cart", JSON.stringify(next));
  };

  const inc = (id: any) => {
    const next = cart.map((c) => {
      if (c.id !== id) return c;
      const desired = (c.quantity || 1) + 1;
      return { ...c, quantity: desired };
    });
    save(next);
  };

  const dec = (id: any) => {
    let next = cart.map((c) => (c.id === id ? { ...c, quantity: (c.quantity || 1) - 1 } : c));
    next = next.filter((c) => c.quantity > 0);
    save(next);
  };

  const remove = (id: any) => {
    const next = cart.filter((c) => c.id !== id);
    save(next);
  };

  const total = cart.reduce((s, c) => s + (c.quantity || 1) * Number(c.gia_ban || c.price || 0), 0);

  const handleCheckout = async () => {
    const token = localStorage.getItem("token");
    const userRaw = localStorage.getItem("user");
    if (!token || !userRaw) {
      // Inform user and redirect to auth page so they can login/register
      alert('Vui lòng đăng nhập hoặc đăng ký để tiếp tục đặt hàng');
      // include autoCheckout so after login we can continue the checkout flow
      navigate('/auth', { state: { from: '/cart', autoCheckout: true } });
      return;
    }

    const user = JSON.parse(userRaw);

    // Validate checkout fields before creating order
    const fieldErrs: { name?: string; phone?: string; address?: string } = {};
    if (!checkoutName || !checkoutName.trim()) fieldErrs.name = 'Vui lòng nhập tên người nhận';
    const phoneRe = /^[0-9\+\-\s]{7,20}$/;
    if (!checkoutPhone || !phoneRe.test(checkoutPhone)) fieldErrs.phone = 'Số điện thoại không hợp lệ';
    if (!checkoutAddress || !checkoutAddress.trim()) fieldErrs.address = 'Vui lòng nhập địa chỉ nhận hàng';
    if (Object.keys(fieldErrs).length) {
      setCheckoutFieldErrors(fieldErrs);
      const missing = Object.values(fieldErrs).join('\n');
      alert('Vui lòng hoàn thành thông tin nhận hàng:\n' + missing);
      return;
    }
    setCheckoutFieldErrors({});

    try {
      // create or find customer linked to account (include phone if provided)
      const custRes = await axios.post(
        `${API}/customers`,
        { ho_ten: user.ho_ten || user.ten_dang_nhap, ma_tai_khoan: user.id, so_dien_thoai: checkoutPhone },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const ma_khach_hang = custRes.data.ma_khach_hang;

      const chi_tiet = cart.map((c) => ({ ma_san_pham: c.id, so_luong: c.quantity || 1, don_gia: c.gia_ban || c.price || 0 }));

      const orderRes = await axios.post(
        `${API}/orders`,
        {
          ma_khach_hang,
          trang_thai: 'cho_xu_ly',
          tong_tien: total,
          chi_tiet,
          ten_nguoi_nhan: checkoutName,
          so_dien_thoai_nhan: checkoutPhone,
          dia_chi_nhan: checkoutAddress,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Instead of clearing cart immediately, open payment modal showing QR and account info
      const ma_don_hang = orderRes.data.ma_don_hang;
      setMaDonHang(ma_don_hang);
      setShowPaymentModal(true);
      // keep checkout modal open behind payment modal if needed
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.message || 'Lỗi khi đặt hàng');
    }
  };

  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutName, setCheckoutName] = useState("");
  const [checkoutPhone, setCheckoutPhone] = useState("");
  const [checkoutAddress, setCheckoutAddress] = useState("");
  const [checkoutFieldErrors, setCheckoutFieldErrors] = useState<{ name?: string; phone?: string; address?: string }>({});
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [maDonHang, setMaDonHang] = useState<number | null>(null);
  const rawUser = localStorage.getItem('user');
  const currentUser = rawUser ? JSON.parse(rawUser) : null;

  // If user was redirected to login for checkout, and now returns with autoCheckout flag,
  // automatically run checkout (only if logged in).
  React.useEffect(() => {
    const s = (location.state as any) || {};
    if (s.autoCheckout) {
      const tokenNow = localStorage.getItem('token');
      if (tokenNow) {
        // small delay so any navigation/localStorage updates settle
        setTimeout(() => {
          handleCheckout();
        }, 200);
      }
      // clear the state so we don't trigger again
      navigate('/cart', { replace: true, state: {} });
    }
  }, [location.state]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Giỏ hàng</h1>
      {cart.length === 0 ? (
        <p>Giỏ hàng của bạn đang trống.</p>
      ) : (
        <div className="space-y-4">
          {cart.map((c) => (
            <div key={c.id} className="flex items-center gap-4 border p-3 rounded">
              <img src={require('../api/imageHelper').resolveImageUrl(c.hinh_anh)} alt={c.ten_san_pham} style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8 }} />
              <div className="flex-1">
                <div className="font-semibold">{c.ten_san_pham}</div>
                <div className="text-green-600 font-bold">{Number(c.gia_ban || c.price || 0).toLocaleString()}đ</div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => dec(c.id)} className="px-3 py-1 bg-gray-200 rounded">-</button>
                <div className="px-3">{c.quantity || 1}</div>
                <button onClick={() => inc(c.id)} className="px-3 py-1 bg-gray-200 rounded">+</button>
              </div>
              <button onClick={() => remove(c.id)} className="ml-4 text-red-600">✕</button>
            </div>
          ))}

          <div className="text-right font-semibold">Tổng: {Number(total).toLocaleString()}đ</div>

          <div className="text-right">
            <button onClick={() => {
              setCheckoutName(currentUser?.ho_ten || currentUser?.ten_dang_nhap || "");
              setCheckoutPhone(currentUser?.so_dien_thoai || "");
              setShowCheckout(true);
            }} className="bg-blue-600 text-white px-6 py-2 rounded">Đặt hàng</button>
          </div>
        </div>
      )}
      {/* Checkout modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
            <h3 className="text-xl font-semibold mb-4">Thông tin nhận hàng</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm mb-1">Tên người nhận</label>
                <input className={`w-full border rounded px-3 py-2 ${checkoutFieldErrors.name ? 'border-red-500' : ''}`} value={checkoutName} onChange={(e) => setCheckoutName(e.target.value)} />
                {checkoutFieldErrors.name && <p className="text-red-600 text-xs mt-1">{checkoutFieldErrors.name}</p>}
              </div>
              <div>
                <label className="block text-sm mb-1">Số điện thoại</label>
                <input className={`w-full border rounded px-3 py-2 ${checkoutFieldErrors.phone ? 'border-red-500' : ''}`} value={checkoutPhone} onChange={(e) => setCheckoutPhone(e.target.value)} />
                {checkoutFieldErrors.phone && <p className="text-red-600 text-xs mt-1">{checkoutFieldErrors.phone}</p>}
              </div>
              <div>
                <label className="block text-sm mb-1">Địa chỉ nhận</label>
                <input className={`w-full border rounded px-3 py-2 ${checkoutFieldErrors.address ? 'border-red-500' : ''}`} value={checkoutAddress} onChange={(e) => setCheckoutAddress(e.target.value)} />
                {checkoutFieldErrors.address && <p className="text-red-600 text-xs mt-1">{checkoutFieldErrors.address}</p>}
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <button onClick={() => setShowCheckout(false)} className="px-4 py-2 bg-gray-300 rounded">Hủy</button>
                <button onClick={handleCheckout} className="px-4 py-2 bg-blue-600 text-white rounded">Xác nhận đặt hàng</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment modal shown after order creation */}
      {showPaymentModal && maDonHang && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <PaymentModal
            maDonHang={maDonHang}
            amount={total}
            info={`Thanh toán đơn ${maDonHang}`}
            onClose={() => setShowPaymentModal(false)}
            onCancelled={(id) => {
              // after cancellation, clear cart and close modals
              save([]);
              setShowPaymentModal(false);
              setShowCheckout(false);
              setMaDonHang(null);
              navigate('/');
            }}
            onPaid={(id) => {
              // when user marks as paid, clear cart and close modals
              save([]);
              setShowPaymentModal(false);
              setShowCheckout(false);
              setMaDonHang(null);
              navigate('/');
            }}
          />
        </div>
      )}
    </div>
  );
}
