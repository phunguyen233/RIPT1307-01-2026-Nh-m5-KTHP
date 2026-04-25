import React from "react";
import { motion } from "framer-motion";

export default function AboutPage() {
  return (
    <div className="w-full flex flex-col items-center text-[#0a2c1f]">
      {/* HERO */}
      <section className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-10 py-16 px-6">
        <div className="rounded-3xl overflow-hidden shadow-lg">
          <img
            src="/assets/about-hero.jpg"
            alt="Bếp Mầm"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex flex-col justify-center">
          <h2 className="text-4xl font-bold mb-4">CÂU CHUYỆN THƯƠNG HIỆU</h2>
          <h3 className="text-3xl font-semibold text-green-600 mb-4">BẾP MẦM</h3>
          <p className="text-lg leading-relaxed mb-4">
            Bếp Mầm được thành lập với sứ mệnh mang đến các sản phẩm dinh dưỡng
            lành mạnh như sữa hạt, detox, nước ép và thực phẩm tốt cho sức khỏe.
            Với sự tâm huyết trong từng nguyên liệu, chúng tôi mong muốn mang lại
            những giá trị bền vững và nâng cao chất lượng cuộc sống cho cộng đồng.
          </p>
          <p className="text-lg leading-relaxed">
            Từ những ngày đầu tiên, Bếp Mầm luôn hướng đến sự tự nhiên, tinh khiết
            và đảm bảo chất lượng trong từng sản phẩm. Chúng tôi đang mở rộng hệ
            thống phân phối, phục vụ hàng nghìn khách hàng mỗi năm.
          </p>
        </div>
      </section>

      {/* NUMBERS */}
      <section className="w-full max-w-6xl grid grid-cols-2 md:grid-cols-4 gap-6 py-10 px-6">
        {[
          { number: "1K+", label: "Lượt khách" },
          { number: "10+", label: "Sản phẩm" },
          { number: "2024", label: "Thành lập" },
          { number: "5★", label: "Đánh giá" },
        ].map((item, i) => (
          <div
            key={i}
            className="flex flex-col items-center bg-white shadow-md rounded-2xl p-6"
          >
            <div className="text-3xl font-bold text-green-600">{item.number}</div>
            <div className="mt-2 text-lg font-medium">{item.label}</div>
          </div>
        ))}
      </section>

      {/* VISION - MISSION */}
      <section className="w-full max-w-6xl py-16 px-6">
        <h2 className="text-3xl font-bold mb-6">TẦM NHÌN & SỨ MỆNH</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-b from-green-500 to-green-700 text-white rounded-3xl p-6 shadow-lg">
            <h3 className="text-xl font-semibold mb-3">GIÁ TRỊ THƯƠNG HIỆU</h3>
            <p>Bếp Mầm cam kết cung cấp sản phẩm chất lượng và an toàn nhất.</p>
          </div>
          <div className="bg-gradient-to-b from-green-500 to-green-700 text-white rounded-3xl p-6 shadow-lg">
            <h3 className="text-xl font-semibold mb-3">TIN TƯỞNG ĐỒNG HÀNH</h3>
            <p>Luôn lắng nghe và hoàn thiện để mang đến trải nghiệm tốt nhất.</p>
          </div>
          <div className="bg-gradient-to-b from-green-500 to-green-700 text-white rounded-3xl p-6 shadow-lg">
            <h3 className="text-xl font-semibold mb-3">PHÁT TRIỂN BỀN VỮNG</h3>
            <p>Mở rộng và phát triển các dòng sản phẩm có lợi cho sức khỏe.</p>
          </div>
        </div>
      </section>

      {/* MAIN PRODUCTS */}
      <section className="w-full max-w-6xl py-16 px-6">
        <h2 className="text-3xl font-bold mb-10">3 DÒNG SẢN PHẨM CHÍNH</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              id: 1,
              title: "SỮA HẠT",
              desc: "Sữa hạt nguyên chất tốt cho sức khỏe, phù hợp mọi độ tuổi.",
              img: "/assets/suahat.png",
            },
            {
              id: 2,
              title: "NƯỚC ÉP",
              desc: "Nước ép trái cây tươi bổ sung vitamin mỗi ngày.",
              img: "/assets/nuocep.png",
            },
            {
              id: 3,
              title: "DETOX",
              desc: "Detox thanh lọc cơ thể, cải thiện hệ miễn dịch.",
              img: "/assets/detox.png",
            },
          ].map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl p-4 shadow-xl overflow-hidden flex flex-col md:flex-row items-start gap-4"
            >
              {/* Image */}
              <div className="w-full md:w-1/2 flex-shrink-0">
                <div className="overflow-hidden rounded-2xl">
                  <img src={item.img} alt={item.title} className="w-full h-48 md:h-56 object-cover" />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="text-sm text-green-600 font-bold mb-2">0{item.id}</div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">{item.title}</h3>
                <p className="text-gray-700">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CORE DEVELOPMENT */}
      <section className="w-full max-w-6xl py-16 px-6 grid grid-cols-1 md:grid-cols-2 gap-10">
        <img
          src="/assets/coredev.png"
          alt="Phát triển cốt lõi"
          className="rounded-3xl shadow-xl"
        />

        <div className="flex flex-col gap-6">
          <h2 className="text-3xl font-bold">PHÁT TRIỂN CỐT LÕI</h2>

          <div className="bg-white border border-green-600 rounded-2xl p-6 shadow-md">
            <h3 className="text-xl font-semibold mb-2 text-green-700">CÔNG THỨC SÁNG TẠO</h3>
            <p>
              Công thức chế biến được cập nhật liên tục để mang đến chất lượng tốt
              nhất cho khách hàng.
            </p>
          </div>

          <div className="bg-white border border-green-600 rounded-2xl p-6 shadow-md">
            <h3 className="text-xl font-semibold mb-2 text-green-700">ỨNG DỤNG CÔNG NGHỆ</h3>
            <p>
              Công nghệ hiện đại được áp dụng để tối ưu quy trình sản xuất và trải
              nghiệm khách hàng.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
