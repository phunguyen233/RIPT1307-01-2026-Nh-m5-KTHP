import React from "react";
import { motion } from "framer-motion";

export default function BranchPage() {
  return (
    <div className="w-full flex flex-col items-center">
      {/* HERO SECTION */}
      <div className="relative w-full h-[70vh] md:h-[80vh] overflow-hidden ">
        <img
          src="/images/branch-hero.jpg"
          alt="Chi nhánh Bếp Mầm"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50 flex flex-col justify-center items-center text-center text-white p-4">
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            Chi Nhánh Chính Bếp Mầm
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-lg md:text-xl max-w-2xl"
          >
            209 Kim Mã, Ba Đình, Hà Nội · Hotline: 0945 079 155 · Mở cửa: 6:30 - 20:00
          </motion.p>
        </div>
      </div>

      {/* INTRO CARD */}
      <div className="w-full max-w-5xl px-4 -mt-20 z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-white rounded-2xl shadow-xl p-6 md:p-10"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Giới thiệu chi nhánh</h2>
          <p className="text-gray-600 text-lg leading-relaxed mb-4">
            Chi nhánh của Bếp Mầm hiện nay chỉ sở hữu 1 chi nhánh chính tại 209 Kim Mã, Ba Đình, Hà Nội và sẽ mở rộng phát triển trong tương lai với mục tiêu mang đến cho khách hàng không gian sức khỏe xanh lành mạnh và trải nghiệm các sản phẩm sữa hạt tươi nguyên chất mỗi ngày.
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2 ">
            <li>Lý do mở chi nhánh: Mang đến cho mọi người sức khỏe xanh lành mạnh.</li>
            <li>Sản phẩm bán mang về: sữa hạt, nước ép, sinh tố, detox.</li>
            <li>Khách hàng nổi bật: dân văn phòng, người có gia đình, khách du lịch, mẹ bầu và trẻ em.</li>
          </ul>
        </motion.div>
      </div>

      {/* GALLERY */}
      <div className="w-full max-w-6xl px-4 mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
        {["gallery1.jpg", "gallery2.jpg", "gallery3.jpg"].map((img, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.15 }}
            className="overflow-hidden rounded-2xl shadow-lg"
          >
            <img
              src={`/images/${img}`}
              alt="Hình quán"
              className="w-full h-64 object-cover transition-transform duration-500 hover:scale-110"
            />
          </motion.div>
        ))}
      </div>

      {/* MAP FULL WIDTH */}
      <div className="w-full mt-20 px-4">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-2xl md:text-3xl font-bold mb-6 text-center"
        >
          Bản đồ & Chỉ đường của Bếp Mầm 
        </motion.h2>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="rounded-2xl overflow-hidden shadow-xl w-full h-[400px] md:h-[500px]"
        >
          <iframe
            title="Bản đồ chi nhánh Bếp Mầm"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.023535018051!2d105.82067227596986!3d21.031744287674815!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135abc93acbb111%3A0x362ca2ad681af31e!2zQuG6v3AgTeG6p20gLSBT4buvYSBo4bqhdCB0aHXhuqduIGNoYXk!5e0!3m2!1svi!2s!4v1764589512696!5m2!1svi!2s" 
            className="w-full h-full border-0"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </motion.div>
      </div>

      <div className="h-20" />
    </div>
  );
}