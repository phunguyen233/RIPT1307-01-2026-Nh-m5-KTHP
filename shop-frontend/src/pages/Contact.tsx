import React from "react";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Facebook, MessageCircle, Instagram } from "lucide-react";

export default function Contact() {
  return (
    <div className="w-full flex flex-col items-center pt-20 pb-20 px-6">
      
      {/* TITLE */}
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl font-bold text-green-700 mb-10"
      >
        Liên hệ với chúng tôi
      </motion.h1>

      <div className="w-full max-w-3xl grid md:grid-cols-2 gap-10">
        
        {/* LEFT – Contact Info */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white shadow-lg rounded-2xl p-8 space-y-6"
        >
          <h2 className="text-2xl font-semibold text-gray-800">
            Thông tin liên hệ
          </h2>

          <div className="flex items-center space-x-4">
            <Phone className="w-7 h-7 text-green-600" />
            <p className="text-lg">SĐT: 0945 079 155</p>
          </div>

          <div className="flex items-center space-x-4">
            <Mail className="w-7 h-7 text-green-600" />
            <p className="text-lg">Email: BepMam@gmail.com</p>
          </div>

          <div className="flex items-center space-x-4">
            <MapPin className="w-7 h-7 text-green-600" />
            <p className="text-lg">Địa chỉ: 209 Kim Mã, Ba Đình, Hà Nội</p>
          </div>

          <p className="text-gray-600">
            Hãy nhắn cho chúng tôi qua các nền tảng bên cạnh để được phản hồi nhanh trong 10 phút!
          </p>
        </motion.div>

        {/* RIGHT – Social Icons */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white shadow-lg rounded-2xl p-8 flex flex-col justify-center items-center space-y-6"
        >
          <h2 className="text-2xl font-semibold text-gray-800">Nhắn tin qua</h2>

          <div className="flex space-x-8">
            {/* Facebook */}
            <motion.a
              whileHover={{ scale: 1.2 }}
              href="https://www.facebook.com/Bepmamthuanchay?locale=vi_VN"
              target="_blank"
              className="p-4 bg-blue-600 rounded-full shadow-md"
            >
              <Facebook className="w-8 h-8 text-white" />
            </motion.a>

            {/* Zalo */}
            <motion.a
              whileHover={{ scale: 1.2 }}
              href="https://zalo.me/0348086092"
              target="_blank"
              className="p-4 bg-blue-500 rounded-full shadow-md"
            >
              <MessageCircle className="w-8 h-8 text-white" />
            </motion.a>

            {/* Instagram */}
            <motion.a
              whileHover={{ scale: 1.2 }}
              href="https://www.instagram.com/bepmam_hanoi?fbclid=IwY2xjawOiXx1leHRuA2FlbQIxMABicmlkETFUZmdpR3lpVExBZkJKNUpTc3J0YwZhcHBfaWQQMjIyMDM5MTc4ODIwMDg5MgABHhrP2u0raMDIzkMkG1oGZk3llQuaKwfIUll-mPJ8ZVBlM1Q8HDtkB5oEeZWh_aem_qfTcFr6czROmFJrbt46SKA"
              target="_blank"
              className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-md"
            >
              <Instagram className="w-8 h-8 text-white" />
            </motion.a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
