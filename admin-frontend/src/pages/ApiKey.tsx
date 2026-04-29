import React, { useEffect, useState } from "react";
import { Card, Alert, Button, message, Spin, Typography, Space } from "antd";
import { CopyOutlined, ReloadOutlined, CheckCircleOutlined } from "@ant-design/icons";
import axiosClient from "../api/axiosClient";

const { Title, Text } = Typography;

interface ShopInfo {
  id: number;
  name: string;
  email: string;
  api_key: string;
  created_at: string;
}

const ApiKey: React.FC = () => {
  const [shopInfo, setShopInfo] = useState<ShopInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    fetchShopInfo();
  }, []);

  const fetchShopInfo = async () => {
    try {
      setLoading(true);
      const res = await axiosClient.get("/users/current-shop");
      setShopInfo(res.data);
    } catch (error: any) {
      message.error(error.response?.data?.error || "Không thể lấy thông tin API key");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (shopInfo?.api_key) {
      navigator.clipboard.writeText(shopInfo.api_key);
      setCopySuccess(true);
      message.success("Đã sao chép API key!");
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const regenerateApiKey = async () => {
    try {
      const res = await axiosClient.put("/users/current-shop/regenerate-key");
      setShopInfo(res.data);
      message.success("Đã tạo API key mới!");
    } catch (error: any) {
      message.error(error.response?.data?.error || "Không thể tạo API key mới");
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!shopInfo) {
    return (
      <Card>
        <Alert
          message="Lỗi"
          description="Không tìm thấy thông tin shop. Vui lòng đăng nhập lại."
          type="error"
          showIcon
        />
      </Card>
    );
  }

  return (
    <div style={{ padding: "24px" }}>
      <Title level={2}>Hệ thống API Key</Title>
      
      <Alert
        message="Hướng dẫn sử dụng API"
        description={
          <div>
            <p>Sử dụng API key này để kết nối với shop-frontend hoặc ứng dụng di động.</p>
            <p>Thêm header <code>x-api-key</code> vào mỗi request:</p>
            <pre style={{ 
              background: "#f5f5f5", 
              padding: "12px", 
              borderRadius: "6px",
              marginTop: "8px",
              fontSize: "13px"
            }}>
{`fetch("https://api.yourdomain.com/products", {
  method: "GET",
  headers: {
    "x-api-key": "${shopInfo.api_key}"
  }
});`}
            </pre>
          </div>
        }
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Card title="Thông tin Shop" style={{ marginBottom: 24 }}>
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <div>
            <Text strong>Tên Shop: </Text>
            <Text>{shopInfo.name}</Text>
          </div>
          <div>
            <Text strong>Email: </Text>
            <Text>{shopInfo.email || "Chưa cập nhật"}</Text>
          </div>
          <div>
            <Text strong>Ngày tạo: </Text>
            <Text>{new Date(shopInfo.created_at).toLocaleDateString("vi-VN")}</Text>
          </div>
        </Space>
      </Card>

      <Card 
        title="API Key" 
        extra={
          <Button 
            type="primary" 
            danger 
            icon={<ReloadOutlined />} 
            onClick={regenerateApiKey}
          >
            Tạo key mới
          </Button>
        }
      >
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: "12px",
          background: "#f0f0f0",
          padding: "16px",
          borderRadius: "8px"
        }}>
          <code style={{ 
            fontSize: "16px", 
            wordBreak: "break-all",
            flex: 1 
          }}>
            {shopInfo.api_key}
          </code>
          <Button 
            type={copySuccess ? "default" : "primary"}
            icon={copySuccess ? <CheckCircleOutlined /> : <CopyOutlined />}
            onClick={copyToClipboard}
          >
            {copySuccess ? "Đã copy!" : "Copy"}
          </Button>
        </div>
        
        <Alert
          message="Lưu ý bảo mật"
          description="API key này là duy nhất cho tài khoản của bạn. Hãy giữ bí mật và không chia sẻ công khai."
          type="warning"
          showIcon
          style={{ marginTop: 16 }}
        />
      </Card>
    </div>
  );
};

export default ApiKey;