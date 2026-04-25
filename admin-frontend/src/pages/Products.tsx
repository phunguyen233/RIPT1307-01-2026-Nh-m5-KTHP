import { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, Select, Upload, Switch, Space, Image, message } from "antd";
import { UploadOutlined, EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { productAPI } from "../api/productAPI";
import { categoryAPI, Category } from "../api/categoryAPI";
import { Product } from "../types/Product";
import axiosClient from "../api/axiosClient";

const { Option } = Select;

export default function Products() {
  // Product states
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Product>({
    name: "",
    price: 0,
    cost_price: 0,
    description: "",
    image_url: "",
    category_id: undefined,
    is_active: true,
    image_base64: "",
  });
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [productFieldErrors, setProductFieldErrors] = useState<{ name?: string; price?: string; }>({});

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesError, setCategoriesError] = useState("");

  // Lấy danh sách sản phẩm
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productAPI.getAll();
      setProducts(data);
    } catch (error) {
      console.error("Lỗi khi lấy sản phẩm:", error);
      alert("Lỗi khi lấy danh sách sản phẩm!");
    } finally {
      setLoading(false);
    }
  };

  // Lấy danh sách phân loại
  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      setCategoriesError("");
      const data = await categoryAPI.getAll();
      setCategories(data);
    } catch (error) {
      console.error("Lỗi khi lấy phân loại:", error);
      setCategoriesError("Không thể tải danh mục");
    } finally {
      setCategoriesLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // ===== Product Functions =====
  const handleAddProductClick = () => {
    setEditingProductId(null);
    setFormData({
      name: "",
      price: 0,
      cost_price: 0,
      description: "",
      image_url: "",
      category_id: undefined,
      is_active: true,
    });
    setPreview(null);
    setShowProductForm(true);
  };

  const handleEditProductClick = (product: Product) => {
    setEditingProductId(product.id || null);
    setFormData(product);
    setPreview(product.image_url || null);
    setShowProductForm(true);
  };

  const handleDeleteProduct = async (id: number) => {
    if (window.confirm("Bạn chắc chắn muốn xóa sản phẩm này?")) {
      try {
        await productAPI.delete(id);
        alert("Xóa sản phẩm thành công!");
        fetchProducts();
      } catch (error) {
        console.error("Lỗi khi xóa sản phẩm:", error);
        alert("Lỗi khi xóa sản phẩm!");
      }
    }
  };

  const handleToggleProductVisibility = async (id: number) => {
    try {
      const product = products.find(p => p.id === id);
      if (product) {
        await productAPI.update(id, { ...product, is_active: !product.is_active });
        fetchProducts();
      }
    } catch (err) {
      console.error('Lỗi khi đổi trạng thái sản phẩm', err);
      alert('Lỗi khi đổi trạng thái sản phẩm');
    }
  };

  const handleProductInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: (name === "price" || name === "cost_price") ? parseFloat(value) || 0 : value,
    });
  };

  const handleProductTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleProductSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value ? parseInt(value) : undefined,
    });
  };

  const handleProductSubmit = async (values: any) => {
    try {
      setUploading(true);
      const productData = {
        ...values,
        price: Number(values.price),
        cost_price: Number(values.cost_price || 0),
        is_active: values.is_active !== false,
        image_base64: formData.image_base64,
      };

      if (editingProductId) {
        if (formData.image_base64) {
          await productAPI.updateWithImage(editingProductId, productData);
        } else {
          await productAPI.update(editingProductId, productData);
        }
        message.success("Cập nhật sản phẩm thành công!");
      } else {
        if (formData.image_base64) {
          await productAPI.createWithImage(productData);
        } else {
          await productAPI.create(productData);
        }
        message.success("Thêm sản phẩm thành công!");
      }

      setShowProductForm(false);
      setFormData({
        name: "",
        price: 0,
        cost_price: 0,
        description: "",
        image_url: "",
        category_id: undefined,
        is_active: true,
        image_base64: "",
      });
      setPreview(null);
      fetchProducts();
    } catch (error) {
      console.error("Lỗi khi lưu sản phẩm:", error);
      message.error("Lỗi khi lưu sản phẩm!");
    } finally {
      setUploading(false);
    }
  };

  // Get category name by id
  const getCategoryName = (categoryId: number | undefined) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || "Không có phân loại";
  };

  // Lọc sản phẩm dựa trên tìm kiếm
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.id?.toString().includes(searchTerm) ||
    p.product_code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      title: 'Mã',
      dataIndex: 'product_code',
      key: 'product_code',
      render: (text: string, record: Product) => text || record.id,
    },
    {
      title: 'Tên sản phẩm',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Product) => (
        <div>
          <span>{text}</span>
          {!record.is_active && <span style={{ marginLeft: 8, fontSize: '12px', background: '#f0f0f0', padding: '2px 6px', borderRadius: '4px' }}>Đã ẩn</span>}
        </div>
      ),
    },
    {
      title: 'Phân loại',
      dataIndex: 'category_id',
      key: 'category_id',
      render: (categoryId: number) => getCategoryName(categoryId),
    },
    {
      title: 'Giá bán',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => `${price.toLocaleString("vi-VN")}₫`,
    },
    {
      title: 'Hình ảnh',
      dataIndex: 'image_url',
      key: 'image_url',
      render: (imageUrl: string) => imageUrl ? <Image src={imageUrl} alt="product" width={40} height={40} /> : null,
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_: any, record: Product) => (
        <Space size="middle">
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEditProductClick(record)}>
            Sửa
          </Button>
          <Button type="link" danger icon={<DeleteOutlined />} onClick={() => handleDeleteProduct(record.id || 0)}>
            Xóa
          </Button>
          <Switch
            checked={record.is_active !== false}
            onChange={() => handleToggleProductVisibility(record.id || 0)}
            checkedChildren="Hiện"
            unCheckedChildren="Ẩn"
          />
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>Quản lý sản phẩm</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddProductClick}>
          Thêm sản phẩm
        </Button>
      </div>

      <div style={{ marginBottom: 16 }}>
        <Input
          placeholder="Tìm kiếm theo tên, mã..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: 300 }}
        />
      </div>

      <Table
        columns={columns}
        dataSource={filteredProducts}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingProductId ? "Sửa sản phẩm" : "Thêm sản phẩm mới"}
        open={showProductForm}
        onCancel={() => setShowProductForm(false)}
        footer={null}
      >
        <Form onFinish={handleProductSubmit} layout="vertical">
          <Form.Item
            label="Tên sản phẩm"
            name="name"
            rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm' }]}
          >
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </Form.Item>

          <Form.Item label="Danh mục sản phẩm" name="category_id">
            <Select
              value={formData.category_id}
              onChange={(value) => setFormData({ ...formData, category_id: value })}
              loading={categoriesLoading}
            >
              {categories.map((cat) => (
                <Option key={cat.id} value={cat.id}>
                  {cat.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Giá bán"
            name="price"
            rules={[{ required: true, message: 'Vui lòng nhập giá bán' }]}
          >
            <Input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
            />
          </Form.Item>

          <Form.Item label="Giá vốn" name="cost_price">
            <Input
              type="number"
              value={formData.cost_price}
              onChange={(e) => setFormData({ ...formData, cost_price: Number(e.target.value) })}
            />
          </Form.Item>

          <Form.Item label="Mô tả" name="description">
            <Input.TextArea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </Form.Item>

          <Form.Item label="Upload ảnh sản phẩm" name="image">
            <Upload
              listType="picture-card"
              className="avatar-uploader"
              showUploadList={false}
              beforeUpload={(file) => {
                const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
                if (!isJpgOrPng) {
                  message.error('Chỉ được upload file JPG/PNG!');
                  return false;
                }
                const isLt2M = file.size / 1024 / 1024 < 2;
                if (!isLt2M) {
                  message.error('Ảnh phải nhỏ hơn 2MB!');
                  return false;
                }
                return false; // Prevent auto upload
              }}
              onChange={async (info) => {
                if (info.file) {
                  setUploading(true);
                  try {
                    const fileToRead = info.file.originFileObj || (info.file as any);
                    const reader = new FileReader();
                    reader.onload = (e) => {
                      const base64 = e.target?.result as string;
                      setFormData({ ...formData, image_base64: base64 });
                      setPreview(base64);
                    };
                    reader.readAsDataURL(fileToRead);
                  } catch (error) {
                    message.error('Lỗi khi đọc file ảnh');
                  } finally {
                    setUploading(false);
                  }
                }
              }}
            >
              {preview || formData.image_url ? (
                <img src={preview || formData.image_url} alt="avatar" style={{ width: '100%' }} />
              ) : (
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              )}
            </Upload>
          </Form.Item>

          <Form.Item label="Trạng thái" name="is_active">
            <Switch
              checked={formData.is_active !== false}
              onChange={(checked) => setFormData({ ...formData, is_active: checked })}
              checkedChildren="Hoạt động"
              unCheckedChildren="Ẩn"
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={uploading}>
              {editingProductId ? "Cập nhật" : "Thêm"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}