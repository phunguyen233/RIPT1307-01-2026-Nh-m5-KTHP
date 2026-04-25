import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

type Props = {
  maDonHang?: number | null; // optional order id
  amount?: number; // optional prefilled amount
  info?: string; // optional prefilled info/content
  onClose?: () => void;
  onCancelled?: (maDonHang: number) => void;
  onPaid?: (maDonHang?: number) => void;
};

export default function PaymentModal({ maDonHang = null, amount: initAmount = 0, info: initInfo = "", onClose, onCancelled, onPaid }: Props) {
  const [amount, setAmount] = useState<number>(initAmount);
  const [info, setInfo] = useState<string>(initInfo);
  const [qrUrl, setQrUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    if ((amount !== undefined && amount !== null) && info && info.trim() !== "") {
      createQR();
    }
  }, [amount, info]);


  const createQR = async () => {
    if (!amount || !info) {
      alert("Nhập số tiền và nội dung!");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.get(`https://bepmam-backend.onrender.com/api/payment/vietqr`, {
        params: { amount, info },
      });

      setQrUrl(res.data.qrUrl);
    } catch (err) {
      console.log(err);
      alert("Lỗi tạo mã QR");
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async () => {
    if (!maDonHang) {
      alert("Không có mã đơn hàng để hủy.");
      return;
    }

    if (!window.confirm("Bạn có chắc muốn hủy đơn hàng này?")) return;

    try {
      setLoading(true);
      const res = await axios.post(`https://bepmam-backend.onrender.com/api/payment/cancel`, { ma_don_hang: maDonHang });
      if (res.data && res.data.success) {
        alert("Đã hủy đơn hàng.");
        onCancelled && onCancelled(maDonHang);
        onClose && onClose();
      } else {
        alert(res.data.message || "Hủy đơn thất bại");
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi khi hủy đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  const markPaid = () => {
    // If parent provided onPaid, call it so it can clear cart / update UI
    if (onPaid) {
      try {
        onPaid(maDonHang ?? undefined);
      } catch (e) {
        console.error('onPaid handler error', e);
      }
    }
    // navigate to order history with a message
    navigate('/orders-history', { state: { infoModal: 'vui lòng chờ đơn hàng được xác nhận.' } });
    onClose && onClose();
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md w-[350px]">
      <h2 className="text-xl font-bold mb-3">Thanh toán VietQR</h2>
      {/* Top summary removed per request: no Close button, no top total/content */}

      {qrUrl && (
        <div className="mt-4 text-center">
            <img src={qrUrl} alt="VietQR" className="w-[250px] mx-auto rounded-lg" />
            <div className="mt-2 text-sm text-left">
              <div className="py-1"><strong>Ngân hàng:</strong> MB Bank</div>
              <div className="py-1"><strong>Số tài khoản:</strong> 0945079155</div>
              {maDonHang && <div className="py-1"><strong>Mã đơn hàng:</strong> {maDonHang}</div>}
              <div className="py-1"><strong>Tổng tiền:</strong> {Number(amount || 0).toLocaleString()}đ</div>
              <div className="py-1"><strong>Nội dung:</strong> {info || "(không có)"}</div>
            </div>

            <div className="mt-3 flex justify-center gap-8">
              <button onClick={cancelOrder} className="bg-red-600 text-white px-4 py-2 rounded" disabled={loading}>
                Hủy đơn hàng
              </button>
              <button onClick={markPaid} className="bg-green-600 text-white px-4 py-2 rounded" disabled={loading}>
                Đã thanh toán
              </button>
            </div>
          </div>
      )}
    </div>
  );
}
