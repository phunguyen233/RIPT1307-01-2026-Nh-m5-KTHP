import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Form, Input, Select, InputNumber, message, Space } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { Ingredient } from "../types";
import { ingredientAPI } from "../api/ingredientAPI";
import { receiptAPI, InventoryImport } from "../api/receiptAPI";
import { unitAPI, Unit } from "../api/unitAPI";

const InventoryImport: React.FC = () => {
  const [imports, setImports] = useState<InventoryImport[]>([]);
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

  const fetchData = async () => {
    try {
      const [importsData, ingredientsData, unitsData] = await Promise.all([
        receiptAPI.getAll(),
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

  const handleImportStock = async () => {
    setError("");

    if (!formData.ingredient_id) {
      setError("Vui lòng chọn nguyên liệu");
      return;
    }
    if (!formData.quantity || Number(formData.quantity) <= 0) {
      setError("Số lượng phải lớn hơn 0");
      return;
    }
    if (!formData.unit_id) {
      setError("Vui lòng chọn đơn vị");
      return;
    }
    if (!formData.import_price || Number(formData.import_price) < 0) {
      setError("Giá nhập không hợp lệ");
      return;
    }

    try {
      setLoading(true);
      await receiptAPI.add(formData.ingredient_id, {
        quantity: Number(formData.quantity),
        unit_id: formData.unit_id,
        import_price: Number(formData.import_price)
      });

      // Get updated ingredient data to show new stock and avg price
      const updatedIngredients = await ingredientAPI.getAll();
      const updatedIngredient = updatedIngredients.find(ing => ing.id === formData.ingredient_id);

      setSuccess(`Nhập kho thành công! Tồn kho mới: ${updatedIngredient?.stock_quantity || 0}, Giá TB mới: ${updatedIngredient?.avg_price?.toLocaleString() || 0}đ`);
      setFormData({ ingredient_id: 0, quantity: "", unit_id: 0, import_price: "" });
      setShowModal(false);
      await fetchData();
      setTimeout(() => setSuccess(""), 5000);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Lỗi khi nhập kho");
    } finally {
      setLoading(false);
    }
  };

  const filteredImports = imports.filter(i =>
    (ingredients.find(ing => ing.id === i.ingredient_id)?.name || "").toLowerCase().includes(search.toLowerCase())
  );

  const getIngredientName = (id: number) => {
    return ingredients.find(ing => ing.id === id)?.name || "N/A";
  };

  const getUnitSymbol = (id: number) => {
    return units.find(u => u.id === id)?.symbol || "";
  };

  const formatCurrency = (value: number) => {
    return Number(value).toLocaleString("vi-VN");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const columns = [
    {
      title: "Nguyên liệu",
      dataIndex: "ingredient_id",
      key: "ingredient",
      render: (ingredientId: number) => getIngredientName(ingredientId),
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      render: (quantity: number) => quantity,
    },
    {
      title: "Đơn vị",
      dataIndex: "unit_id",
      key: "unit",
      render: (unitId: number) => getUnitSymbol(unitId),
    },
    {
      title: "Giá nhập",
      dataIndex: "import_price",
      key: "import_price",
      render: (price: number) => `${formatCurrency(price)}đ`,
    },
    {
      title: "Thành tiền",
      key: "total",
      render: (_: any, record: InventoryImport) => `${formatCurrency(record.quantity * record.import_price)}đ`,
    },
    {
      title: "Ngày nhập",
      dataIndex: "created_at",
      key: "created_at",
      render: (date: string) => formatDate(date),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>📦 Nhập kho nguyên liệu</h2>
      </div>

      {success && (
        <div style={{ backgroundColor: '#f6ffed', border: '1px solid #b7eb8f', color: '#52c41a', padding: 12, borderRadius: 6, marginBottom: 16 }}>
          {success}
        </div>
      )}

      {error && (
        <div style={{ backgroundColor: '#fff2f0', border: '1px solid #ffccc7', color: '#ff4d4f', padding: 12, borderRadius: 6, marginBottom: 16 }}>
          {error}
        </div>
      )}

      {/* Import Form */}
      <div style={{ backgroundColor: '#fafafa', padding: 20, borderRadius: 8, marginBottom: 24 }}>
        <h3 style={{ marginBottom: 16 }}>Nhập nguyên liệu mới</h3>
        <div style={{ display: 'flex', gap: 16, alignItems: 'end', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>Nguyên liệu</label>
            <Select
              value={formData.ingredient_id || undefined}
              onChange={(value) => setFormData({ ...formData, ingredient_id: value })}
              placeholder="Chọn nguyên liệu"
              style={{ width: '100%' }}
            >
              {ingredients.map(ingredient => (
                <Select.Option key={ingredient.id} value={ingredient.id}>
                  {ingredient.name}
                </Select.Option>
              ))}
            </Select>
          </div>

          <div style={{ minWidth: 120 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>Số lượng</label>
            <InputNumber<number>
              value={Number(formData.quantity) || 0}
              onChange={(value) => setFormData({ ...formData, quantity: String(value || 0) })}
              min={0.01}
              step={0.1}
              placeholder="0"
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ minWidth: 100 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>Đơn vị</label>
            <Select
              value={formData.unit_id || undefined}
              onChange={(value) => setFormData({ ...formData, unit_id: value })}
              placeholder="Đơn vị"
              style={{ width: '100%' }}
            >
              {units.map(unit => (
                <Select.Option key={unit.id} value={unit.id}>
                  {unit.symbol}
                </Select.Option>
              ))}
            </Select>
          </div>

          <div style={{ minWidth: 120 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>Giá nhập</label>
            <InputNumber<number>
              value={Number(formData.import_price) || 0}
              onChange={(value) => setFormData({ ...formData, import_price: String(value || 0) })}
              min={0}
              step={1000}
              placeholder="0"
              style={{ width: '100%' }}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
            />
          </div>

          <Button
            type="primary"
            loading={loading}
            onClick={handleImportStock}
            style={{ height: 32 }}
          >
            Nhập kho
          </Button>
        </div>
      </div>

      {/* Import History */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3>Lịch sử nhập kho</h3>
          <Input
            placeholder="Tìm kiếm..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: 300 }}
          />
        </div>

        <Table
          columns={columns}
          dataSource={filteredImports}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </div>
    </div>
  );
};

export default InventoryImport;
