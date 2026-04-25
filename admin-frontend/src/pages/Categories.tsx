import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Input, Space, message } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { categoryAPI, Category } from "../api/categoryAPI";

const Categories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentId, setCurrentId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const columns = [
    {
      title: "Tên danh mục",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: any, record: Category) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEditCategory(record)}
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
                content: 'Bạn có chắc chắn muốn xóa danh mục này?',
                okText: 'Xóa',
                cancelText: 'Hủy',
                onOk: () => handleDeleteCategory(record.id || 0),
              });
            }}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  const fetchCategories = async () => {
    try {
      setInitialLoading(true);
      const data = await categoryAPI.getAll();
      setCategories(data || []);
      setError("");
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError("Lỗi khi tải danh mục");
    } finally {
      setInitialLoading(false);
    }
  };

  const handleAddCategory = async (values: any) => {
    setError("");
    const name = values.name || formData.name;
    if (!name.trim()) {
      setError("Tên danh mục không được trống");
      return;
    }

    try {
      setLoading(true);
      if (isEditMode && currentId) {
        await categoryAPI.update(currentId, { name });
        message.success("Cập nhật danh mục thành công!");
      } else {
        await categoryAPI.create({ name });
        message.success("Thêm danh mục thành công!");
      }
      setFormData({ name: "" });
      setShowModal(false);
      setIsEditMode(false);
      setCurrentId(null);
      await fetchCategories();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Lỗi khi lưu danh mục");
      message.error(err?.response?.data?.message || "Lỗi khi lưu danh mục");
    } finally {
      setLoading(false);
    }
  };

  const handleEditCategory = (category: Category) => {
    setCurrentId(category.id || 0);
    setFormData({ name: category.name });
    setIsEditMode(true);
    setShowModal(true);
    setError("");
  };

  const handleDeleteCategory = async (id: number) => {
    try {
      await categoryAPI.delete(id);
      message.success("Xóa danh mục thành công!");
      await fetchCategories();
    } catch (err: any) {
      message.error(err?.response?.data?.message || "Lỗi khi xóa danh mục");
    }
  };

  const filteredCategories = categories.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>Quản lý danh mục</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setFormData({ name: "" });
            setIsEditMode(false);
            setCurrentId(null);
            setError("");
            setShowModal(true);
          }}
        >
          Thêm danh mục
        </Button>
      </div>

      <div style={{ marginBottom: 16 }}>
        <Input
          placeholder="Tìm kiếm danh mục..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: 300 }}
        />
      </div>

      <Table
        columns={columns}
        dataSource={filteredCategories}
        rowKey="id"
        loading={initialLoading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={isEditMode ? "Sửa danh mục" : "Thêm danh mục mới"}
        open={showModal}
        onCancel={() => setShowModal(false)}
        footer={null}
      >
        <Form onFinish={handleAddCategory} layout="vertical">
          <Form.Item
            label="Tên danh mục"
            name="name"
            rules={[{ required: true, message: 'Vui lòng nhập tên danh mục' }]}
          >
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              {isEditMode ? "Cập nhật" : "Thêm"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Categories;
