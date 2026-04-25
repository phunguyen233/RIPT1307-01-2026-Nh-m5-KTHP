import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Input, Select, Space, message, InputNumber } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { Ingredient } from "../types";
import { ingredientAPI } from "../api/ingredientAPI";
import { inventoryImportAPI } from "../api/inventoryImportAPI";
import { unitAPI, Unit } from "../api/unitAPI";

const Inventory: React.FC = () => {
  const [imports, setImports] = useState<any[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    ingredient_id: 0,
    quantity: "",
    unit_id: 0,
    import_price: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const columns = [
    {
      title: "Nguyên liệu",
      dataIndex: "ingredient_id",
      key: "ingredient",
      render: (ingredientId: number) => {
        const ingredient = ingredients.find(i => i.id === ingredientId);
        return ingredient ? ingredient.name : "N/A";
      },
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Đơn vị",
      dataIndex: "unit_id",
      key: "unit",
      render: (unitId: number) => {
        const unit = units.find(u => u.id === unitId);
        return unit ? unit.name : "N/A";
      },
    },
    {
      title: "Giá nhập",
      dataIndex: "import_price",
      key: "import_price",
      render: (price: number) => price ? `${price.toLocaleString()}₫` : "N/A",
    },
    {
      title: "Ngày nhập",
      dataIndex: "created_at",
      key: "created_at",
      render: (date: string) => new Date(date).toLocaleDateString('vi-VN'),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => {
              Modal.confirm({
                title: 'Xác nhận xóa',
                content: 'Bạn có chắc chắn muốn xóa phiếu nhập này?',
                okText: 'Xóa',
                cancelText: 'Hủy',
                onOk: () => handleDeleteImport(record.id),
              });
            }}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  const fetchData = async () => {
    try {
      const [importsData, ingredientsData, unitsData] = await Promise.all([
        inventoryImportAPI.getAll(),
        ingredientAPI.getAll(),
        unitAPI.getAll()
      ]);
      setImports(importsData || []);
      setIngredients(ingredientsData || []);
      setUnits(unitsData || []);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Lỗi khi tải dữ liệu");
    }
  };

  const handleImportStock = async (values: any) => {
    setError("");

    const ingredient_id = values.ingredient_id || formData.ingredient_id;
    const quantity = values.quantity || formData.quantity;
    const unit_id = values.unit_id || formData.unit_id;
    const import_price = values.import_price || formData.import_price;

    if (!ingredient_id) {
      setError("Vui lòng chọn nguyên liệu");
      return;
    }
    if (!quantity || Number(quantity) <= 0) {
      setError("Số lượng phải lớn hơn 0");
      return;
    }
    if (!unit_id) {
      setError("Vui lòng chọn đơn vị");
      return;
    }
    if (!import_price || Number(import_price) < 0) {
      setError("Giá nhập không hợp lệ");
      return;
    }

    try {
      setLoading(true);
      await inventoryImportAPI.create({
        ingredient_id,
        quantity: Number(quantity),
        unit_id,
        import_price: Number(import_price)
      });
      message.success("Nhập kho thành công!");
      setFormData({ ingredient_id: 0, quantity: "", unit_id: 0, import_price: "" });
      setShowModal(false);
      await fetchData();
    } catch (err: any) {
      setError(err?.response?.data?.error || "Lỗi khi nhập kho");
      message.error(err?.response?.data?.error || "Lỗi khi nhập kho");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteImport = async (id: number) => {
    try {
      await inventoryImportAPI.delete(id);
      message.success("Xóa phiếu nhập thành công!");
      await fetchData();
    } catch (err: any) {
      message.error(err?.response?.data?.error || "Lỗi khi xóa phiếu nhập");
    }
  };

  const filteredImports = imports.filter(i =>
    (i.ingredient_name || "").toLowerCase().includes(search.toLowerCase())
  );

  const getUnitSymbol = (id: number) => {
    return units.find(u => u.id === id)?.symbol || "";
  };

  const formatCurrency = (value: number) => {
    return Number(value).toLocaleString("vi-VN");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>Quản lý nhập kho</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setFormData({ ingredient_id: 0, quantity: "", unit_id: 0, import_price: "" });
            setError("");
            setShowModal(true);
          }}
        >
          Nhập kho
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={filteredImports}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title="Nhập kho nguyên liệu"
        open={showModal}
        onCancel={() => setShowModal(false)}
        footer={null}
      >
        <Form onFinish={handleImportStock} layout="vertical">
          <Form.Item
            label="Nguyên liệu"
            name="ingredient_id"
            rules={[{ required: true, message: 'Vui lòng chọn nguyên liệu' }]}
          >
            <Select placeholder="Chọn nguyên liệu">
              {ingredients.map(ing => (
                <Select.Option key={ing.id} value={ing.id}>
                  {ing.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Số lượng"
            name="quantity"
            rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}
          >
            <InputNumber
              min={0}
              step={0.01}
              placeholder="Nhập số lượng"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            label="Đơn vị"
            name="unit_id"
            rules={[{ required: true, message: 'Vui lòng chọn đơn vị' }]}
          >
            <Select placeholder="Chọn đơn vị">
              {units.map(unit => (
                <Select.Option key={unit.id} value={unit.id}>
                  {unit.symbol}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Giá nhập (₫ / đơn vị)"
            name="import_price"
            rules={[{ required: true, message: 'Vui lòng nhập giá nhập' }]}
          >
            <InputNumber
              min={0}
              step={0.01}
              placeholder="Nhập giá"
              style={{ width: '100%' }}
            />
          </Form.Item>

          {error && (
            <div style={{ color: 'red', marginBottom: 16 }}>
              {error}
            </div>
          )}

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Nhập kho
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Inventory;


