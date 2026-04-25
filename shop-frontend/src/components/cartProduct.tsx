import React from 'react';
import { Product } from '../types/Product';

interface Props {
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
}

export default function CartProduct({ product, onClose, onAddToCart }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-3xl w-full overflow-hidden border border-border">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
          <div className="flex items-center justify-center">
            <img
              src={require('../api/imageHelper').resolveImageUrl(product.hinh_anh)}
              alt={product.ten_san_pham}
              onError={(e: any) => (e.currentTarget.src = '/placeholder.png')}
              className="w-full h-72 object-cover rounded-lg"
            />
          </div>
          <div className="p-2 flex flex-col">
            <h3 className="text-2xl font-bold mb-2 text-foreground">{product.ten_san_pham}</h3>
            <p className="text-green-600 font-bold text-xl mb-3">{Number(product.gia_ban).toLocaleString()}đ</p>
            <p className="text-sm text-muted-foreground mb-4">{product.mo_ta || 'Chưa có mô tả cho sản phẩm này.'}</p>

            <div className="mt-auto flex gap-3">
              <button
                onClick={() => { onAddToCart(product); onClose(); }}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold"
              >
                Thêm giỏ hàng
              </button>
              <button
                onClick={onClose}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-lg font-semibold"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
