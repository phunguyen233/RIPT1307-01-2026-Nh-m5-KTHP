import React, { useEffect, useState } from "react";
import axios from "axios";
import { Product } from "../types/Product";
import CartProduct from "../components/cartProduct";
import { resolveImageUrl } from "../api/imageHelper";

const API_URL = "https://bepmam-backend.onrender.com/api/products";

export default function ShopProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState<string>("");
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [pressedButton, setPressedButton] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    axios
      .get(API_URL)
      .then((res) => {
        const mapped: Product[] = res.data.map((row: any) => ({
          id: row.ma_san_pham ?? row.id,
          ten_san_pham: row.ten_san_pham ?? row.name ?? "",
          gia_ban: row.gia_ban ?? 0,
          so_luong_ton: row.so_luong_ton ?? 0,
          hinh_anh: row.hinh_anh ?? "",
          mo_ta: row.mo_ta ?? "",
          hien_thi: (row.trang_thai ?? row.hien_thi) === "hien" || row.hien_thi === true,
        }));

        // Include hidden products too; the UI will mark them as out-of-stock
        setProducts(mapped);
      })
      .catch((err) => {
        console.error("Lỗi khi lấy sản phẩm:", err);
      });
  }, []);

  const handleAddToCart = (product: Product) => {
    try {
      // Prevent adding if product is hidden (admin can hide)
      if (!product.hien_thi) {
        alert('Sản phẩm hiện không có sẵn để đặt (đang ẩn).');
        return;
      }
      const raw = localStorage.getItem("cart");
      const cart: Array<any> = raw ? JSON.parse(raw) : [];
      const existing = cart.find((c) => c.id === product.id);
      if (existing) {
        const nextQty = (existing.quantity || 1) + 1;
        existing.quantity = nextQty;
      } else {
        cart.push({ ...product, quantity: 1 });
      }
      localStorage.setItem("cart", JSON.stringify(cart));
      alert(`${product.ten_san_pham} đã được thêm vào giỏ hàng`);
    } catch (err) {
      console.error("Lỗi khi thêm vào giỏ hàng:", err);
    }
  };

  // details view removed — single-button product cards
  const filteredProducts = products.filter((p) =>
    p.ten_san_pham?.toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <>
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="mb-8 flex items-center justify-center" style={{ marginTop: 24 }}>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm sản phẩm..."
          className="p-4 border border-gray-300 shadow-lg text-sm w-full max-w-xl rounded-full"
          aria-label="Tìm sản phẩm"
        />
      </div>

      <div className="grid gap-4 justify-items-center grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        {filteredProducts.map((p) => (
          <div key={p.id} className="p-2 w-full max-w-xs">
            <div
              onMouseEnter={() => setHoveredId(p.id)}
              onMouseLeave={() => setHoveredId(null)}
              className="bg-white rounded-2xl shadow-sm overflow-hidden transition border border-gray-200"
              style={{
                padding: 20,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                transform: hoveredId === p.id ? "translateY(-6px)" : "none",
                boxShadow: hoveredId === p.id ? "0px 10px 20px rgba(0,0,0,0.12)" : undefined,
                transition: "transform 150ms ease, box-shadow 250ms ease",
              }}
            >
              {/* Image (square 1:1) */}
              <div
                className="w-full mb-2 overflow-hidden rounded-xl"
                style={{ position: "relative", width: "100%", paddingTop: "100%", }}
              >
                <img
                  src={resolveImageUrl(p.hinh_anh)}
                  alt={p.ten_san_pham}
                  onError={(e: any) => {
                    e.currentTarget.src = "/placeholder.png";
                  }}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: 20,
                  }}
                />
              </div>

              {/* Info under the image */}
              <div className="text-center px-2">
                <h2 className="font-semibold text-lg mb-1 truncate">{p.ten_san_pham}</h2>
                <p className="text-green-600 font-bold mb-3">{Number(p.gia_ban).toLocaleString()}đ</p>
              </div>

              {/* Buttons row: left is Add-to-cart or 'Hết hàng' when out of stock; right is always 'Chi tiết' */}
              <div className="px-2 mt-3 flex gap-3 w-full">
                {/* Left button: either active add-to-cart or disabled "Hết hàng" */}
                {(!p.hien_thi) ? (
                  <button
                    type="button"
                    disabled
                    className="flex-1 bg-gray-300 text-white py-3.5 rounded-2xl cursor-not-allowed select-none"
                  >
                    Không khả dụng
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleAddToCart(p)}
                    onMouseDown={() => setPressedButton(`${p.id}-add`)}
                    onMouseUp={() => setPressedButton(null)}
                    onMouseLeave={() => setPressedButton(null)}
                    onTouchStart={() => setPressedButton(`${p.id}-add`)}
                    onTouchEnd={() => setPressedButton(null)}
                    className={`
                      flex-1 py-3.5 text-[15px] font-medium text-white rounded-2xl
                      transition-all duration-150 shadow-sm
                      ${pressedButton === `${p.id}-add`
                        ? "bg-green-800 scale-95"
                        : "bg-green-600 hover:bg-green-700 active:bg-green-800"}
                    `}
                  >
                    Thêm giỏ hàng
                  </button>
                )}

                {/* Right button: always show details */}
                <button
                  type="button"
                  onClick={() => setSelectedProduct(p)}
                  className="
                    flex-1 py-3.5 text-[15px] font-medium rounded-2xl 
                    bg-white border border-gray-300 text-gray-700 
                    hover:bg-gray-50 active:bg-gray-200 
                    transition-all duration-150
                  "
                >
                  Chi tiết
                </button>
              </div>

            </div>
          </div>
        ))}
      </div>
    </div>
      {/* Detail modal */}
      {selectedProduct && (
        <CartProduct
          product={selectedProduct as Product}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={(prod) => handleAddToCart(prod)}
        />
      )}
    </>
  );
}
