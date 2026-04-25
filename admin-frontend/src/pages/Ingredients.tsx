import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, Select, Space, message, InputNumber } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined, HistoryOutlined } from "@ant-design/icons";
import { ingredientAPI, Ingredient } from "../api/ingredientAPI";
import { unitAPI, Unit } from "../api/unitAPI";
import { receiptAPI, InventoryImport } from "../api/receiptAPI";

const Ingredients: React.FC = () => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [search, setSearch] = useState("");

  // Add ingredient modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ name: "", unit_id: 0, stock_quantity: null as number | null });
  const [addError, setAddError] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Edit ingredient modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState({ name: "", unit_id: 0, stock_quantity: null as number | null });
  const [editError, setEditError] = useState("");

  // Import stock modal
  const [showImportModal, setShowImportModal] = useState(false);
  const [importData, setImportData] = useState({ ingredient_id: 0, quantity: null as number | null, unit_id: 0, import_price: null as number | null });
  const [importError, setImportError] = useState("");
  const [importLoading, setImportLoading] = useState(false);

  // Import history modal
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyIngredient, setHistoryIngredient] = useState<Ingredient | null>(null);
  const [importHistory, setImportHistory] = useState<InventoryImport[]>([]);

  const fetchData = async () => {
    try {
      const [ingredientsData, unitsData] = await Promise.all([
        ingredientAPI.getAll(),
        unitAPI.getAll()
      ]);
      setIngredients(ingredientsData || []);
      setUnits(unitsData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getUnitSymbol = (unitId: number) => {
    return units.find(u => u.id === unitId)?.symbol || "";
  };

  const fmtQty = (v: any) => {
    const num = Number(v || 0);
    if (!isFinite(num)) return "0";
    if (Math.abs(num - Math.round(num)) < 1e-9) return String(Math.round(num));
    return num.toFixed(4).replace(/\.?0+$/, "");
  };

  const filteredIngredients = ingredients.filter(i =>
    i.name?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    {
      title: "Tên nguyên liệu",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Tồn kho",
      dataIndex: "stock_quantity",
      key: "stock_quantity",
      render: (quantity: number, record: Ingredient) => {
        const displayQty = getDisplayStockQuantity(record);
        const baseUnitQty = getStockInBaseUnit(record);
        let badgeColor = '#52c41a'; // xanh lá - đủ
        let badgeText = 'Đủ';

        // Check against base unit threshold (250g = 250ml = 250 units)
        if (baseUnitQty < 250) {
          badgeColor = '#ff4d4f'; // đỏ - sắp hết
          badgeText = 'Sắp hết';
        }

        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>{fmtQty(displayQty)}</span>
            <span
              style={{
                backgroundColor: badgeColor,
                color: 'white',
                padding: '2px 6px',
                borderRadius: 4,
                fontSize: '12px'
              }}
            >
              {badgeText}
            </span>
          </div>
        );
      },
    },
    {
      title: "Đơn vị",
      dataIndex: "unit_id",
      key: "unit",
      render: (unitId: number) => {
        const unit = units.find(u => u.id === unitId);
        return unit ? unit.symbol : "N/A";
      },
    },
    {
      title: "Giá TB",
      dataIndex: "avg_price",
      key: "avg_price",
      render: (price: number) => {
        const p = price || 0;
        return p > 0 ? `${p.toLocaleString()}đ` : '-';
      },
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: any, record: Ingredient) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEditIngredient(record)}
          >
            Sửa
          </Button>
          <Button
            type="link"
            icon={<HistoryOutlined />}
            onClick={() => openHistoryModal(record)}
          >
            Lịch sử
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => {
              Modal.confirm({
                title: 'Xác nhận xóa',
                content: 'Bạn có chắc chắn muốn xóa nguyên liệu này?',
                okText: 'Xóa',
                cancelText: 'Hủy',
                onOk: () => handleDeleteIngredient(record.id || 0),
              });
            }}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  // Add ingredient
  const handleAddIngredient = async (values: any) => {
    setAddError("");
    
    const name = values.name || formData.name;
    const unit_id = values.unit_id || formData.unit_id;
    const stock_quantity = values.stock_quantity || formData.stock_quantity;
    
    if (!name.trim()) {
      setAddError("Tên nguyên liệu không được trống");
      return;
    }
    if (!unit_id) {
      setAddError("Vui lòng chọn đơn vị");
      return;
    }

    try {
      setAddLoading(true);
      await ingredientAPI.add({
        name,
        unit_id,
        stock_quantity: Number(stock_quantity) || 0
      });
      message.success("Thêm nguyên liệu thành công!");
      setFormData({ name: "", unit_id: 0, stock_quantity: null });
      setShowAddModal(false);
      await fetchData();
    } catch (err: any) {
      setAddError(err?.response?.data?.message || "Lỗi khi thêm nguyên liệu");
      message.error(err?.response?.data?.message || "Lỗi khi thêm nguyên liệu");
    } finally {
      setAddLoading(false);
    }
  };

  const handleEditIngredient = (record: Ingredient) => {
    setEditId(record.id);
    const displayQty = getDisplayStockQuantity(record);
    setEditFormData({
      name: record.name,
      unit_id: record.unit_id,
      stock_quantity: displayQty
    });
    setShowEditModal(true);
  };

  const handleEditIngredientSubmit = async (values: any) => {
    setEditError("");
    
    const name = values.name || editFormData.name;
    const unit_id = values.unit_id || editFormData.unit_id;
    const stock_quantity = values.stock_quantity || editFormData.stock_quantity;
    
    if (!name.trim()) {
      setEditError("Tên nguyên liệu không được trống");
      return;
    }
    if (!unit_id) {
      setEditError("Vui lòng chọn đơn vị");
      return;
    }

    try {
      if (editId) {
        await ingredientAPI.update(editId, {
          name,
          unit_id,
          stock_quantity: Number(stock_quantity) || 0
        });
        message.success("Cập nhật nguyên liệu thành công!");
        setShowEditModal(false);
        await fetchData();
      }
    } catch (error: any) {
      setEditError(error?.response?.data?.error || "Lỗi khi cập nhật nguyên liệu");
      message.error(error?.response?.data?.error || "Lỗi khi cập nhật nguyên liệu");
    }
  };

  // Delete ingredient
  const handleDeleteIngredient = async (id: number) => {
    try {
      await ingredientAPI.delete(id);
      message.success("Xóa nguyên liệu thành công!");
      await fetchData();
    } catch (error: any) {
      message.error(error?.response?.data?.error || "Lỗi khi xóa nguyên liệu");
    }
  };

  // Import stock
  const openImportModal = (ingredient: Ingredient) => {
    setImportData({
      ingredient_id: ingredient.id,
      quantity: null,
      unit_id: ingredient.unit_id,
      import_price: null
    });
    setShowImportModal(true);
  };

  const handleImportStock = async () => {
    setImportError("");
    
    if (!importData.quantity || Number(importData.quantity) <= 0) {
      setImportError("Số lượng phải lớn hơn 0");
      return;
    }
    if (!importData.unit_id) {
      setImportError("Vui lòng chọn đơn vị");
      return;
    }
    if (!importData.import_price || Number(importData.import_price) < 0) {
      setImportError("Giá nhập không hợp lệ");
      return;
    }

    try {
      setImportLoading(true);
      const convertedQuantity = getConvertedImportQuantity();
      if (convertedQuantity === null || Number.isNaN(convertedQuantity)) {
        setImportError("Không thể quy đổi đơn vị nhập kho với đơn vị hiện tại của nguyên liệu");
        return;
      }
      await receiptAPI.add(importData.ingredient_id, {
        quantity: Number(importData.quantity),
        unit_id: importData.unit_id,
        import_price: Number(importData.import_price)
      });
      setSuccessMsg("Nhập kho thành công!");
      setShowImportModal(false);
      setImportData({ ingredient_id: 0, quantity: null, unit_id: 0, import_price: null });
      await fetchData();
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (error: any) {
      setImportError(error?.response?.data?.error || "Lỗi khi nhập kho");
    } finally {
      setImportLoading(false);
    }
  };

  // View import history
  const openHistoryModal = async (ingredient: Ingredient) => {
    try {
      const history = await receiptAPI.getAll();
      const filtered = history.filter(h => h.ingredient_id === ingredient.id);
      setHistoryIngredient(ingredient);
      setImportHistory(filtered);
      setShowHistoryModal(true);
    } catch (error) {
      console.error("Lỗi khi tải lịch sử:", error);
    }
  };

  const getUnitById = (id?: number) => {
    return units.find(u => u.id === id);
  };

  const getIngredientUnit = (ingredientId: number) => {
    const ingredient = ingredients.find(i => i.id === ingredientId);
    return ingredient ? getUnitById(ingredient.unit_id) : undefined;
  };

  const getImportUnitsForIngredient = (ingredientId: number) => {
    const ingredientUnit = getIngredientUnit(ingredientId);
    if (!ingredientUnit) return units;
    return units.filter(u => u.type === ingredientUnit.type);
  };

  const getFactorToBase = (unit?: Unit): number => {
    if (!unit) return 1;
    if (!unit.base_unit_id) return 1;
    const parentUnit = getUnitById(unit.base_unit_id);
    return unit.conversion_factor * getFactorToBase(parentUnit);
  };

  const convertQuantity = (quantity: number, fromUnitId: number, toUnitId: number) => {
    const fromUnit = getUnitById(fromUnitId);
    const toUnit = getUnitById(toUnitId);
    if (!fromUnit || !toUnit || fromUnit.type !== toUnit.type) return NaN;
    const fromFactor = getFactorToBase(fromUnit);
    const toFactor = getFactorToBase(toUnit);
    return (quantity * fromFactor) / toFactor;
  };

  const getConvertedImportQuantity = () => {
    if (!importData.quantity || !importData.unit_id || !importData.ingredient_id) return null;
    const ingredient = ingredients.find(i => i.id === importData.ingredient_id);
    if (!ingredient) return null;
    const converted = convertQuantity(Number(importData.quantity), importData.unit_id, ingredient.unit_id);
    return Number.isFinite(converted) ? converted : null;
  };

  const getDisplayStockQuantity = (ingredient: Ingredient) => {
    return ingredient.stock_quantity || 0;
  };

  // Convert stock to base unit (g/ml/unit) for threshold check
  const getStockInBaseUnit = (ingredient: Ingredient) => {
    if (!ingredient.stock_quantity || !ingredient.unit_id) return 0;
    const ingredientUnit = getUnitById(ingredient.unit_id);
    if (!ingredientUnit) return ingredient.stock_quantity || 0;
    const factor = getFactorToBase(ingredientUnit);
    return ingredient.stock_quantity * factor;
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>Quản lý nguyên liệu</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setShowAddModal(true)}
        >
          Thêm nguyên liệu
        </Button>
      </div>

      <div style={{ marginBottom: 16 }}>
        <Input
          placeholder="Tìm kiếm nguyên liệu..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: 300 }}
        />
      </div>

      <Table
        columns={columns}
        dataSource={filteredIngredients}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      {/* Add Ingredient Modal */}
      <Modal
        title="Thêm nguyên liệu mới"
        open={showAddModal}
        onCancel={() => setShowAddModal(false)}
        footer={null}
      >
        <Form onFinish={handleAddIngredient} layout="vertical">
          <Form.Item
            label="Tên nguyên liệu"
            name="name"
            rules={[{ required: true, message: 'Vui lòng nhập tên nguyên liệu' }]}
          >
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </Form.Item>

          <Form.Item
            label="Đơn vị"
            name="unit_id"
            rules={[{ required: true, message: 'Vui lòng chọn đơn vị' }]}
          >
            <Select
              value={formData.unit_id}
              onChange={(value) => setFormData({ ...formData, unit_id: value })}
            >
              {units.map((unit) => (
                <Select.Option key={unit.id} value={unit.id}>
                  {unit.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Số lượng tồn kho ban đầu" name="stock_quantity">
            <InputNumber
              min={0}
              value={formData.stock_quantity ?? undefined}
              onChange={(value) => setFormData({ ...formData, stock_quantity: value ?? null })}
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={addLoading}>
              Thêm
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Ingredient Modal */}
      <Modal
        title="Sửa nguyên liệu"
        open={showEditModal}
        onCancel={() => setShowEditModal(false)}
        footer={null}
      >
        <Form onFinish={handleEditIngredientSubmit} layout="vertical">
          <Form.Item
            label="Tên nguyên liệu"
            name="name"
            rules={[{ required: true, message: 'Vui lòng nhập tên nguyên liệu' }]}
          >
            <Input
              value={editFormData.name}
              onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
            />
          </Form.Item>

          <Form.Item
            label="Đơn vị"
            name="unit_id"
            rules={[{ required: true, message: 'Vui lòng chọn đơn vị' }]}
          >
            <Select
              value={editFormData.unit_id}
              onChange={(value) => setEditFormData({ ...editFormData, unit_id: value })}
            >
              {units.map((unit) => (
                <Select.Option key={unit.id} value={unit.id}>
                  {unit.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Số lượng tồn kho" name="stock_quantity">
            <InputNumber
              min={0}
              value={editFormData.stock_quantity ?? undefined}
              onChange={(value) => setEditFormData({ ...editFormData, stock_quantity: value ?? null })}
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Cập nhật
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Import Stock Modal */}
      <Modal
        title="Nhập kho nguyên liệu"
        open={showImportModal}
        onCancel={() => setShowImportModal(false)}
        footer={null}
      >
        <Form onFinish={() => handleImportStock()} layout="vertical">
          <Form.Item label="Số lượng nhập" name="quantity" rules={[{ required: true, message: 'Vui lòng nhập số lượng' }]}>
            <InputNumber
              min={0}
              value={importData.quantity ?? undefined}
              onChange={(value) => setImportData({ ...importData, quantity: value ?? null })}
              style={{ width: '100%' }}
            />
          </Form.Item>
          <Form.Item label="Đơn vị" name="unit_id" rules={[{ required: true, message: 'Vui lòng chọn đơn vị' }]}>\n            <Select
              value={importData.unit_id}
              onChange={(value) => setImportData({ ...importData, unit_id: value })}
              style={{ width: '100%' }}
            >
              {getImportUnitsForIngredient(importData.ingredient_id).map((unit) => (
                <Select.Option key={unit.id} value={unit.id}>
                  {`${unit.name} (${unit.symbol})`}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          {getConvertedImportQuantity() !== null && (
            <div style={{ marginBottom: 16, color: '#1890ff' }}>
              Quy đổi sang đơn vị hiện tại: {fmtQty(getConvertedImportQuantity())} {getUnitById(ingredients.find(i => i.id === importData.ingredient_id)?.unit_id)?.symbol}
            </div>
          )}
          <Form.Item label="Giá nhập (₫)" name="import_price">
            <InputNumber
              min={0}
              value={importData.import_price ?? undefined}
              onChange={(value) => setImportData({ ...importData, import_price: value ?? null })}
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={importLoading}>
              Nhập kho
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Import History Modal */}
      <Modal
        title={`Lịch sử nhập kho - ${historyIngredient?.name}`}
        open={showHistoryModal}
        onCancel={() => setShowHistoryModal(false)}
        footer={null}
        width={800}
      >
        <Table
          columns={[
            { title: 'Ngày nhập', dataIndex: 'created_at', key: 'created_at', render: (date: string) => new Date(date).toLocaleDateString('vi-VN') },
            { title: 'Số lượng', dataIndex: 'quantity', key: 'quantity' },
            { title: 'Giá nhập', dataIndex: 'import_price', key: 'import_price', render: (price: number) => price ? `${price.toLocaleString()}₫` : 'N/A' },
          ]}
          dataSource={importHistory}
          rowKey="id"
          pagination={false}
        />
      </Modal>
    </div>
  );
};

export default Ingredients;
