import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, Space, message } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { customerAPI, Customer } from "../api/customerAPI";

const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Customer>({
    name: "",
    phone: "",
    address: "",
  });

  // Lấy danh sách khách hàng
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const data = await customerAPI.getAll();
      setCustomers(data);
    } catch (error) {
      console.error("Lỗi khi lấy khách hàng:", error);
      alert("Lỗi khi lấy danh sách khách hàng!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Mở form thêm khách hàng
  const handleAddClick = () => {
    setEditingId(null);
    setFormData({
      name: "",
      phone: "",
      address: "",
    });
    setShowForm(true);
  };

  // Mở form sửa khách hàng
  const handleEditClick = (customer: Customer) => {
    setEditingId(customer.id || null);
    setFormData(customer);
    setShowForm(true);
  };

  // Xóa khách hàng
  const handleDeleteCustomer = async (id: number) => {
    try {
      await customerAPI.delete(id);
      message.success("Xóa khách hàng thành công!");
      fetchCustomers();
    } catch (error) {
      console.error("Lỗi khi xóa khách hàng:", error);
      message.error("Lỗi khi xóa khách hàng!");
    }
  };

  // (Lịch sử mua hàng được chuyển sang trang Thống kê)
  const validatePhone = (phone: string) => {
    if (!phone) {
      return true;
    }
    if (!/^[0-9]+$/.test(phone)) {
      alert("Số điện thoại chỉ được chứa chữ số.");
      return false;
    }
    if (phone.length < 8 || phone.length > 12) {
      alert("Số điện thoại phải từ 8 đến 12 chữ số.");
      return false;
    }
    return true;
  };
  // Xử lý submit form
  const handleSubmit = async (values: any) => {
    try {
      const name = values.name || formData.name;
      const phone = values.phone || formData.phone;
      const address = values.address || formData.address;

      const errs: string[] = [];
      if (!name || !name.trim()) errs.push('Tên khách hàng');
      if (!phone || !phone.trim()) errs.push('Số điện thoại');
      if (errs.length) {
        message.error('Vui lòng điền đầy đủ các trường: ' + errs.join(', '));
        return;
      }
      if (!validatePhone(phone || "")) {
        return;
      }
      if (editingId) {
        // Cập nhật khách hàng
        await customerAPI.update(editingId, { name, phone, address });
        message.success("Cập nhật khách hàng thành công!");
      } else {
        const existsByPhone = customers.some(c => c.phone === phone);
        if (existsByPhone) {
          message.error("Số điện thoại đã tồn tại trong danh sách khách hàng!");
          return;
        }
        // Nếu chưa trùng, tạo mới
        await customerAPI.create({ name, phone, address });
        message.success("Thêm khách hàng thành công!");
      }
      setShowForm(false);
      fetchCustomers();
    } catch (error) {
      console.error("Lỗi:", error);
      message.error("Lỗi khi lưu khách hàng!");
    }
  };

  // Xử lý thay đổi input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Lọc khách hàng theo tìm kiếm (tên hoặc mã hoặc số điện thoại)
  const filteredCustomers = customers.filter((c) => {
    const q = (searchTerm || "").trim().toLowerCase();
    if (!q) return true;
    return (
      (c.name || "").toLowerCase().includes(q) ||
      (c.customer_code || "").toLowerCase().includes(q) ||
      (c.phone || "").toLowerCase().includes(q) ||
      (c.address || "").toLowerCase().includes(q)
    );
  });

  const columns = [
    {
      title: "Mã khách",
      dataIndex: "customer_code",
      key: "customer_code",
      render: (code: string, record: Customer) => code || record.id,
    },
    {
      title: "Tên khách hàng",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Số điện thoại",
      dataIndex: "phone",
      key: "phone",
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      key: "address",
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: any, record: Customer) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEditClick(record)}
          >
            Sửa
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => {
              Modal.confirm({
                title: 'Xác nhận xóa',
                content: 'Bạn có chắc chắn muốn xóa khách hàng này?',
                okText: 'Xóa',
                cancelText: 'Hủy',
                onOk: () => handleDeleteCustomer(record.id || 0),
              });
            }}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  const fetchOrdersForCustomer = async (id: number) => {
    try {
      // Orders functionality moved to Orders page
    } catch (err) {
      console.error('Lỗi khi lấy đơn hàng của khách hàng', err);
    }
  };

  const handleSelectCustomer = (id: number) => {
    // Select customer functionality simplified
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>Quản lý khách hàng</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddClick}
        >
          Thêm khách hàng
        </Button>
      </div>

      <div style={{ marginBottom: 16 }}>
        <Input
          placeholder="Tìm theo tên, SĐT hoặc địa chỉ..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: 300 }}
        />
      </div>

      <Table
        columns={columns}
        dataSource={filteredCustomers}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingId ? "Sửa khách hàng" : "Thêm khách hàng mới"}
        open={showForm}
        onCancel={() => setShowForm(false)}
        footer={null}
      >
        <Form onFinish={handleSubmit} layout="vertical">
          <Form.Item
            label="Tên khách hàng"
            name="name"
            rules={[{ required: true, message: 'Vui lòng nhập tên khách hàng' }]}
          >
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </Form.Item>

          <Form.Item
            label="Số điện thoại"
            name="phone"
            rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
          >
            <Input
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </Form.Item>

          <Form.Item label="Địa chỉ" name="address">
            <Input.TextArea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              {editingId ? "Cập nhật" : "Thêm"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Customers;