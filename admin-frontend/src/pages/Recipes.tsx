import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, Select, message, InputNumber, Space } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { productAPI } from "../api/productAPI";
import { Product } from "../types/Product";
import { ingredientAPI, Ingredient } from "../api/ingredientAPI";
import { recipeAPI, Recipe, RecipeIngredient } from "../api/recipeAPI";
import { recipeIngredientsAPI } from "../api/recipeIngredientsAPI";
import { unitAPI, Unit } from "../api/unitAPI";

const Recipes = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [allRecipeIngredients, setAllRecipeIngredients] = useState<RecipeIngredient[]>([]);

  // Recipe management
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
  const [recipeIngredients, setRecipeIngredients] = useState<RecipeIngredient[]>([]);
  const [recipeError, setRecipeError] = useState("");
  const [recipeSaving, setRecipeSaving] = useState(false);

  // Add ingredient modal
  const [ingredientSearch, setIngredientSearch] = useState("");
  const [showAddIngredient, setShowAddIngredient] = useState(false);

  // Recipe modal
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const fetchData = async () => {
    try {
      const [productsData, ingredientsData, unitsData, recipeIngredientsData, recipesData] = await Promise.all([
        productAPI.getAll(),
        ingredientAPI.getAll(),
        unitAPI.getAll(),
        recipeIngredientsAPI.getAll(),
        recipeAPI.getAll()
      ]);
      setProducts(productsData || []);
      setIngredients(ingredientsData || []);
      setUnits(unitsData || []);
      setAllRecipeIngredients(recipeIngredientsData || []);
      setRecipes(recipesData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getUnitById = (id?: number) => {
    return units.find(u => u.id === id);
  };

  const getUnitSymbol = (unitId: number) => {
    return units.find(u => u.id === unitId)?.symbol || "";
  };

  const getUnitsForIngredient = (ingredientId: number) => {
    const ingredient = ingredients.find(i => i.id === ingredientId);
    if (!ingredient) return units;
    const ingredientUnit = getUnitById(ingredient.unit_id);
    if (!ingredientUnit) return units;
    return units.filter(u => u.type === ingredientUnit.type);
  };

  const getFactorToBase = (unit?: Unit): number => {
    if (!unit) return 1;
    if (!unit.base_unit_id) return 1;
    const parentUnit = getUnitById(unit.base_unit_id);
    return unit.conversion_factor * getFactorToBase(parentUnit);
  };

  const convertQuantityToIngredientUnit = (quantity: number, fromUnitId: number, ingredientId: number) => {
    const ingredient = ingredients.find(i => i.id === ingredientId);
    if (!ingredient) return quantity;
    const fromUnit = getUnitById(fromUnitId);
    const toUnit = getUnitById(ingredient.unit_id);
    if (!fromUnit || !toUnit || fromUnit.type !== toUnit.type) return quantity;
    const fromFactor = getFactorToBase(fromUnit);
    const toFactor = getFactorToBase(toUnit);
    return (quantity * fromFactor) / toFactor;
  };

  const fmtQty = (v: any) => {
    const num = Number(v || 0);
    if (!isFinite(num)) return "0";
    if (Math.abs(num - Math.round(num)) < 1e-9) return String(Math.round(num));
    return num.toFixed(4).replace(/\.?0+$/, "");
  };

  const getDisplayStockQuantity = (ingredient: Ingredient) => {
    return ingredient.stock_quantity || 0;
  };

  // Get recipe ingredients for a product
  const getRecipeIngredientsForProduct = (productId: number | undefined) => {
    if (!productId) return [];
    const recipe = recipes.find(r => r.product_id === productId);
    if (!recipe) return [];
    return allRecipeIngredients.filter(ri => ri.recipe_id === recipe.id);
  };

  // Open add recipe modal
  const openAddRecipeModal = () => {
    setSelectedProduct(null);
    setRecipeIngredients([]);
    setIsEditMode(false);
    setRecipeError("");
    setShowRecipeModal(true);
  };

  // Open edit recipe modal for a product
  const openEditRecipeModal = async (productId: number | undefined) => { if (!productId) return; 
    const recipe = recipes.find(r => r.product_id === productId);
    if (recipe) {
      const ingredientsList = allRecipeIngredients.filter(ri => ri.recipe_id === recipe.id);
      setRecipeIngredients(ingredientsList);
      setIsEditMode(true);
    } else {
      setRecipeIngredients([]);
      setIsEditMode(false);
    }
    setSelectedProduct(productId);
    setRecipeError("");
    setShowRecipeModal(true);
  };

  // Add ingredient to recipe
  const addIngredientToRecipe = (ingredient: Ingredient) => {
    const exists = recipeIngredients.some(ri => ri.ingredient_id === ingredient.id);
    if (exists) {
      message.warning("Nguyên liệu này đã có trong công thức");
      return;
    }
    const newItem: RecipeIngredient = {
      id: 0,
      recipe_id: 0,
      ingredient_id: ingredient.id,
      quantity: 1,
      unit_id: ingredient.unit_id
    };
    setRecipeIngredients([...recipeIngredients, newItem]);
    setIngredientSearch("");
  };

  // Remove ingredient from recipe
  const removeIngredientFromRecipe = (index: number) => {
    setRecipeIngredients(recipeIngredients.filter((_, i) => i !== index));
  };

  // Update ingredient in recipe
  const updateRecipeIngredient = (index: number, field: string, value: any) => {
    const updated = [...recipeIngredients];
    (updated[index] as any)[field] = value;
    setRecipeIngredients(updated);
  };

  // Calculate estimated cost
  const calculateEstimatedCost = () => {
    let totalCost = 0;
    recipeIngredients.forEach(ri => {
      const ingredient = ingredients.find(i => i.id === ri.ingredient_id);
      if (ingredient && ingredient.avg_price && ri.quantity) {
        // Convert quantity to ingredient's unit before calculating cost
        const convertedQuantity = convertQuantityToIngredientUnit(ri.quantity, ri.unit_id, ri.ingredient_id);
        totalCost += (convertedQuantity * ingredient.avg_price);
      }
    });
    return totalCost;
  };

  // Calculate total cost for a product
  const calculateTotalCostForProduct = (productId: number | undefined) => {
    if (!productId) return 0;
    const recipe = recipes.find(r => r.product_id === productId);
    if (!recipe) return 0;
    const ingredientsForRecipe = allRecipeIngredients.filter(ri => ri.recipe_id === recipe.id);
    let totalCost = 0;
    ingredientsForRecipe.forEach(ri => {
      const ingredient = ingredients.find(i => i.id === ri.ingredient_id);
      if (ingredient && ingredient.avg_price && ri.quantity) {
        const convertedQuantity = convertQuantityToIngredientUnit(ri.quantity, ri.unit_id, ri.ingredient_id);
        totalCost += convertedQuantity * ingredient.avg_price;
      }
    });
    return totalCost;
  };

  // Delete recipe
  const deleteRecipe = async (productId: number) => {
    const recipe = recipes.find(r => r.product_id === productId);
    if (!recipe) return;

    Modal.confirm({
      title: 'Xác nhận xóa',
      content: `Bạn có chắc muốn xóa công thức cho sản phẩm ${products.find(p => p.id === productId)?.name}?`,
      onOk: async () => {
        try {
          await recipeAPI.delete(recipe.id);
          message.success('Xóa công thức thành công!');
          await fetchData();
        } catch (error: any) {
          console.error('Error deleting recipe:', error);
          message.error(error?.response?.data?.message || 'Lỗi khi xóa công thức');
        }
      }
    });
  };

  // Save recipe
  async function saveRecipe() {
    // Validate quantities
    for (const ri of recipeIngredients) {
      if (!ri.quantity || Number(ri.quantity) <= 0) {
        setRecipeError(`Nguyên liệu ${ingredients.find(i => i.id === ri.ingredient_id)?.name} phải có số lượng > 0`);
        return;
      }
      if (!ri.unit_id) {
        setRecipeError(`Nguyên liệu ${ingredients.find(i => i.id === ri.ingredient_id)?.name} phải chọn đơn vị`);
        return;
      }
    }

    try {
      setRecipeSaving(true);

      const existingRecipe = recipes.find(r => r.product_id === selectedProduct);
      if (existingRecipe) {
        // Update existing recipe ingredients
        const existingIngredients = allRecipeIngredients.filter(ri => ri.recipe_id === existingRecipe.id);
        // First, remove all existing ingredients
        await Promise.all(existingIngredients.map(ri => recipeAPI.deleteIngredient(ri.id)));
        // Then add new ones
        await Promise.all(recipeIngredients.map(ri => recipeAPI.addIngredient({
          recipe_id: existingRecipe.id,
          ingredient_id: ri.ingredient_id,
          quantity: Number(ri.quantity),
          unit_id: ri.unit_id
        })));
      } else {
        // Create new recipe
        const newRecipe = await recipeAPI.create({
          product_id: selectedProduct!
        });

        if (newRecipe && newRecipe.id) {
          await Promise.all(recipeIngredients.map(ri => recipeAPI.addIngredient({
            recipe_id: newRecipe.id,
            ingredient_id: ri.ingredient_id,
            quantity: Number(ri.quantity),
            unit_id: ri.unit_id
          })));
        }
      }

      message.success(isEditMode ? "Cập nhật công thức thành công!" : "Tạo công thức thành công!");
      setShowRecipeModal(false);
      setSelectedProduct(null);
      setRecipeIngredients([]);
      await fetchData(); // Reload all data
    } catch (error: any) {
      console.error("Error saving recipe:", error);
      setRecipeError(error?.response?.data?.message || error?.message || "Lỗi khi lưu công thức");
    } finally {
      setRecipeSaving(false);
    }
  };

  const filteredIngredients = ingredients.filter(i =>
    i.name?.toLowerCase().includes(ingredientSearch.toLowerCase())
  );

  // Table columns for products
  const productColumns = [
    {
      title: "Tên sản phẩm",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Giá cost nguyên liệu",
      dataIndex: "price",
      key: "price",
      render: (_: any, record: Product) => {
        const totalCost = calculateTotalCostForProduct(record.id);
        return totalCost > 0 ? `${totalCost.toLocaleString()}đ` : "N/A";
      },
    },
    {
      title: "Hành động",
      key: "action",
      render: (_: any, record: Product) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => openEditRecipeModal(record.id!)}
          >
            Chỉnh sửa
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => deleteRecipe(record.id!)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  // Expanded row render
  const expandedRowRender = (record: Product) => {
    const recipeIngredientsForProduct = getRecipeIngredientsForProduct(record.id);
    const hasRecipe = recipeIngredientsForProduct.length > 0;

    return (
      <div>
        {hasRecipe ? (
          <div>
            <div style={{ marginBottom: 16 }}>
              <h4>Công thức cho: {record.name}</h4>
            </div>
            <Table
              columns={[
                {
                  title: "Nguyên liệu",
                  dataIndex: "ingredient_id",
                  key: "ingredient",
                  render: (ingredientId: number) => {
                    const ingredient = ingredients.find(i => i.id === ingredientId);
                    return ingredient?.name || "N/A";
                  },
                },
                {
                  title: "Số lượng",
                  dataIndex: "quantity",
                  key: "quantity",
                  render: (quantity: number) => fmtQty(quantity),
                },
                {
                  title: "Đơn vị",
                  dataIndex: "unit_id",
                  key: "unit",
                  render: (unitId: number) => getUnitSymbol(unitId),
                },
                {
                  title: "Giá ước tính",
                  key: "estimated_cost",
                  render: (_: any, record: RecipeIngredient) => {
                    const ingredient = ingredients.find(i => i.id === record.ingredient_id);
                    if (!ingredient || !ingredient.avg_price || !record.quantity) return '-';

                    const unit = units.find(u => u.id === record.unit_id);
                    const conversionFactor = unit?.conversion_factor || 1;
                    const cost = record.quantity * conversionFactor * ingredient.avg_price;
                    return `${cost.toLocaleString()}đ`;
                  },
                },
              ]}
              dataSource={recipeIngredientsForProduct}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: 16 }}>
            <p>Chưa có công thức cho sản phẩm này.</p>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => openEditRecipeModal(record.id!)}
            >
              Tạo công thức
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>Quản lý công thức</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={openAddRecipeModal}>
          Thêm công thức
        </Button>
      </div>

      <Table
        columns={productColumns}
        dataSource={products.filter(p => recipes.some(r => r.product_id === p.id))}
        rowKey="id"
        expandable={{
          expandedRowRender,
          rowExpandable: () => true,
        }}
        pagination={{ pageSize: 10 }}
      />

      {/* Recipe Modal */}
      <Modal
        title={isEditMode ? "Chỉnh sửa công thức" : "Tạo công thức mới"}
        open={showRecipeModal}
        onCancel={() => {
          setShowRecipeModal(false);
          setSelectedProduct(null);
          setRecipeIngredients([]);
          setRecipeError("");
        }}
        footer={[
          <Button key="cancel" onClick={() => setShowRecipeModal(false)}>
            Hủy
          </Button>,
          <Button
            key="save"
            type="primary"
            loading={recipeSaving}
            onClick={saveRecipe}
          >
            💾 Lưu công thức
          </Button>,
        ]}
        width={800}
      >
        {selectedProduct ? (
          <div style={{ marginBottom: 16 }}>
            <h3>Sản phẩm: {products.find(p => p.id === selectedProduct)?.name}</h3>
          </div>
        ) : (
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>Chọn sản phẩm *</label>
            <Select
              placeholder="Chọn sản phẩm để tạo công thức"
              value={selectedProduct}
              onChange={(value) => setSelectedProduct(value)}
              style={{ width: '100%' }}
            >
              {products.map(product => (
                <Select.Option key={product.id} value={product.id}>
                  {product.name}
                </Select.Option>
              ))}
            </Select>
          </div>
        )}

        {recipeError && (
          <div style={{ color: 'red', marginBottom: 16, padding: 8, backgroundColor: '#fff2f0', borderRadius: 4 }}>
            {recipeError}
          </div>
        )}

        <div style={{ marginBottom: 16 }}>
          <span style={{ color: '#52c41a', fontWeight: 'bold' }}>
            Giá cost ước tính: {calculateEstimatedCost().toLocaleString()}đ
          </span>
        </div>

        <div style={{ marginBottom: 16 }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setShowAddIngredient(true)}
          >
            Thêm nguyên liệu
          </Button>
        </div>

        <Table
          columns={[
            {
              title: "Nguyên liệu",
              dataIndex: "ingredient_id",
              key: "ingredient",
              render: (ingredientId: number) => {
                const ingredient = ingredients.find(i => i.id === ingredientId);
                return ingredient?.name || "N/A";
              },
            },
            {
              title: "Số lượng",
              dataIndex: "quantity",
              key: "quantity",
              render: (quantity: number, record: RecipeIngredient, index: number) => (
                <InputNumber
                  value={quantity}
                  onChange={(value) => updateRecipeIngredient(index, 'quantity', value)}
                  min={0.01}
                  step={0.1}
                  style={{ width: 100 }}
                />
              ),
            },
            {
              title: "Đơn vị",
              dataIndex: "unit_id",
              key: "unit",
              render: (unitId: number, record: RecipeIngredient, index: number) => (
                <Select
                  value={unitId}
                  onChange={(value) => updateRecipeIngredient(index, 'unit_id', value)}
                  style={{ width: 80 }}
                >
                  {getUnitsForIngredient(record.ingredient_id).map(unit => (
                    <Select.Option key={unit.id} value={unit.id}>
                      {unit.symbol}
                    </Select.Option>
                  ))}
                </Select>
              ),
            },
            {
              title: "Giá cost",
              key: "estimated_cost",
              render: (_: any, record: RecipeIngredient) => {
                const ingredient = ingredients.find(i => i.id === record.ingredient_id);
                if (!ingredient || !ingredient.avg_price || !record.quantity) return '-';

                const convertedQuantity = convertQuantityToIngredientUnit(record.quantity, record.unit_id, record.ingredient_id);
                const cost = convertedQuantity * ingredient.avg_price;
                return `${cost.toLocaleString()}đ`;
              },
            },
            {
              title: "Xóa",
              key: "action",
              render: (_: any, __: RecipeIngredient, index: number) => (
                <Button
                  type="link"
                  danger
                  onClick={() => removeIngredientFromRecipe(index)}
                >
                  Xóa
                </Button>
              ),
            },
          ]}
          dataSource={recipeIngredients}
          rowKey={(record, index) => `${record.ingredient_id}-${index}`}
          pagination={false}
          size="small"
        />
      </Modal>

      {/* Add Ingredient Modal */}
      <Modal
        title="Thêm nguyên liệu vào công thức"
        open={showAddIngredient}
        onCancel={() => setShowAddIngredient(false)}
        footer={null}
        width={600}
      >
        <div style={{ marginBottom: 16 }}>
          <Input
            placeholder="Tìm nguyên liệu..."
            value={ingredientSearch}
            onChange={(e) => setIngredientSearch(e.target.value)}
          />
        </div>

        <div style={{
          maxHeight: 300,
          overflowY: 'auto',
          border: '1px solid #d9d9d9',
          borderRadius: 6,
          padding: 8
        }}>
          {filteredIngredients.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#999', padding: 16 }}>
              Không tìm thấy nguyên liệu
            </div>
          ) : (
            filteredIngredients.map(ingredient => (
              <div
                key={ingredient.id}
                style={{
                  padding: '8px 12px',
                  cursor: 'pointer',
                  borderRadius: 4,
                  marginBottom: 4,
                  backgroundColor: '#f5f5f5',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
                onClick={() => {
                  addIngredientToRecipe(ingredient);
                  setShowAddIngredient(false);
                }}
              >
                <span>{ingredient.name}</span>
                <span style={{ color: '#666', fontSize: '12px' }}>
                  {getUnitSymbol(ingredient.unit_id)} | Tồn: {fmtQty(getDisplayStockQuantity(ingredient))}
                </span>
              </div>
            ))
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Recipes;
