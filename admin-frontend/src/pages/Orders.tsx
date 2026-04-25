import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, Select, Space, message, DatePicker, InputNumber, Tag } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined, EyeOutlined } from "@ant-design/icons";
import dayjs from 'dayjs';
import { orderAPI, Order } from "../api/orderAPI";
import { productAPI } from "../api/productAPI";
import { customerAPI } from "../api/customerAPI";
import { ingredientAPI } from "../api/ingredientAPI";

const Orders = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(false);
    const [query, setQuery] = useState("");
    const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'completed' | 'cancelled'>('all');
    const [detail, setDetail] = useState<Order | null>(null);
    const [newStatus, setNewStatus] = useState<string>("");
    const [filterOpen, setFilterOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [shipFee, setShipFee] = useState<number | null>(null);
    const [packagingOptions, setPackagingOptions] = useState<any[]>([]);
    const [packagedItems, setPackagedItems] = useState<Array<{ ma_nguyen_lieu: number; ten_nguyen_lieu?: string; so_luong: number; don_gia: number }>>([]);
    const [voucherType, setVoucherType] = useState<'amount' | 'percent'>('amount');
    const [voucherValue, setVoucherValue] = useState<number>(0);
    const [selectedPackagingId, setSelectedPackagingId] = useState<number | null>(null);
    const [packQty, setPackQty] = useState<number>(1);
    const [showAddModal, setShowAddModal] = useState(false);
    const [customers, setCustomers] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);

    // add order form state
    const [selectedCustomer, setSelectedCustomer] = useState<number | undefined>(undefined);
    // recipient name removed from schema
    const [recipientPhone, setRecipientPhone] = useState("");
    const [recipientAddress, setRecipientAddress] = useState("");
    const [deliveryTime, setDeliveryTime] = useState<string | null>(null);
    const [orderItems, setOrderItems] = useState<Array<{ ma_san_pham: number; ten_san_pham?: string; so_luong: number; don_gia: number }>>([]);
    const [orderFieldErrors, setOrderFieldErrors] = useState<{ customer?: string; items?: string; phone?: string; address?: string }>({});
    const [addVoucherType, setAddVoucherType] = useState<'amount' | 'percent'>('amount');
    const [addVoucherValue, setAddVoucherValue] = useState<number>(0);
    const [selectedProduct, setSelectedProduct] = useState<number | undefined>(undefined);

    // Use enum values from your DB: 'pending','completed','cancelled'
    const statuses = ["pending", "completed", "cancelled"];
    const statusLabels: Record<string, string> = {
        pending: "Đang chờ",
        completed: "Hoàn thành",
        cancelled: "Đã hủy",
    };

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const data = await orderAPI.getAll();
            setOrders(data);
        } catch (err) {
            console.error(err);
            alert("Lỗi khi lấy đơn hàng");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            const data = await customerAPI.getAll();
            setCustomers(data);
        } catch (err) {
            console.error('Lỗi khi lấy khách hàng', err);
        }
    };

    const fetchProducts = async () => {
        try {
            const data = await productAPI.getAll();
            setProducts(data);
        } catch (err) {
            console.error('Lỗi khi lấy sản phẩm', err);
        }
    };

    const handleSearch = async () => {
        try {
            const res = await orderAPI.search(query);
            setOrders(res);
        } catch (err) {
            console.error(err);
            alert("Lỗi tìm kiếm");
        }
    };

    const columns = [
        {
            title: "Mã đơn",
            dataIndex: "order_code",
            key: "order_code",
            render: (code: string) => code || "N/A",
        },
        {
            title: "Tên khách",
            dataIndex: "customer_name",
            key: "customer_name",
            render: (name: string) => name || "N/A",
        },
        {
            title: "Số điện thoại khách",
            dataIndex: "customer_phone",
            key: "customer_phone",
            render: (phone: string) => phone || "N/A",
        },
        {
            title: "Thời gian nhận",
            dataIndex: "created_at",
            key: "delivery_time",
            render: (date: string) => new Date(date).toLocaleString('vi-VN'),
        },
        {
            title: "Địa chỉ nhận",
            dataIndex: "shipping_address",
            key: "shipping_address",
        },
        {
            title: "Tổng tiền",
            dataIndex: "total_price",
            key: "total_price",
            render: (amount: number) => `${amount?.toLocaleString("vi-VN")}₫` || "0₫",
        },
        {
            title: "Hành động",
            key: "action",
            render: (_: any, record: Order) => (
                <Space size="middle">
                    <Button
                        type="link"
                        icon={<EyeOutlined />}
                        onClick={() => handleViewDetail(record)}
                    >
                        Chi tiết
                    </Button>
                </Space>
            ),
        },
    ];

    const openAddModal = async () => {
        await Promise.all([fetchCustomers(), fetchProducts()]);
        setSelectedCustomer(undefined);
        setRecipientPhone("");
        setRecipientAddress("");
        setDeliveryTime(null);
        setOrderItems([]);
        setAddVoucherType('amount');
        setAddVoucherValue(0);
        setShowAddModal(true);
    };

    const addProductLine = (productId: number) => {
        const p = products.find((x) => x.ma_san_pham === productId || x.id === productId);
        if (!p) return;
        const existing = orderItems.find((it) => it.ma_san_pham === (p.ma_san_pham || p.id));
        if (existing) {
            setOrderItems(orderItems.map(it => it.ma_san_pham === existing.ma_san_pham ? { ...it, so_luong: it.so_luong + 1 } : it));
        } else {
            setOrderItems([...orderItems, { ma_san_pham: p.ma_san_pham || p.id, ten_san_pham: p.ten_san_pham || p.ten_san_pham || p.ten_san_pham, so_luong: 1, don_gia: Number(p.gia_ban || p.gia || p.price || 0) }]);
        }
    };

    const removeProductLine = (ma_san_pham: number) => {
        setOrderItems(orderItems.filter(it => it.ma_san_pham !== ma_san_pham));
    };

    const setQtyFor = (ma_san_pham: number, qty: number) => {
        if (qty <= 0) return removeProductLine(ma_san_pham);
        setOrderItems(orderItems.map(it => it.ma_san_pham === ma_san_pham ? { ...it, so_luong: qty } : it));
    };

    const handleAddOrderSubmit = async (values: any) => {
        if (!selectedCustomer) {
            message.error("Vui lòng chọn khách hàng");
            return;
        }
        if (orderItems.length === 0) {
            message.error("Vui lòng thêm ít nhất một sản phẩm");
            return;
        }
        if (!recipientPhone.trim()) {
            message.error("Vui lòng nhập số điện thoại");
            return;
        }
        if (!recipientAddress.trim()) {
            message.error("Vui lòng nhập địa chỉ giao");
            return;
        }
        if (!deliveryTime) {
            message.error("Vui lòng chọn thời gian giao");
            return;
        }

        try {
            const totalPrice = orderItems.reduce((total, item) => total + (item.so_luong * item.don_gia), 0);

            const orderData = {
                customer_id: selectedCustomer,
                shipping_address: recipientAddress,
                total_price: totalPrice,
                status: 'pending',
                order_items: orderItems.map(item => ({
                    product_id: item.ma_san_pham,
                    quantity: item.so_luong,
                    price: item.don_gia,
                }))
            };

            await orderAPI.create(orderData);
            message.success("Tạo đơn hàng thành công!");
            setShowAddModal(false);
            fetchOrders();
        } catch (error) {
            console.error("Lỗi khi tạo đơn hàng:", error);
            message.error("Lỗi khi tạo đơn hàng!");
        }
    };

    const computeTotal = () => orderItems.reduce((s, it) => s + (it.so_luong || 0) * (it.don_gia || 0), 0);

    const handleCreateOrder = async () => {
        // client-side validation: only require at least one product line
        const errs: { items?: string } = {};
        if (!orderItems || orderItems.length === 0) errs.items = 'Vui lòng thêm ít nhất một sản phẩm';
        if (Object.keys(errs).length) {
            setOrderFieldErrors(errs as any);
            alert('Vui lòng thêm ít nhất một sản phẩm để tạo đơn hàng');
            return;
        }
        setOrderFieldErrors({});

        try {
            const chi_tiet = orderItems.map(it => ({ ma_san_pham: it.ma_san_pham, so_luong: it.so_luong, don_gia: it.don_gia }));
            const total = computeTotal();
            let so_tien_giam_for_create = 0;
            if (typeof addVoucherValue === 'number' && addVoucherValue > 0) {
                if (addVoucherType === 'percent') {
                    so_tien_giam_for_create = Math.round((total * (addVoucherValue / 100)) * 100) / 100;
                } else {
                    so_tien_giam_for_create = Number(addVoucherValue || 0);
                }
            }
            const payload: any = { customer_id: selectedCustomer, shipping_address: recipientAddress || null, total_price: total, items: chi_tiet };
            await orderAPI.create(payload);
            alert('Tạo đơn hàng thành công');
            setShowAddModal(false);
            fetchOrders();
            // notify dashboard/statistics to refresh totals
            try { window.dispatchEvent(new Event('statsUpdated')); } catch (e) { /* ignore */ }
        } catch (err) {
            console.error('Lỗi tạo đơn', err);
            alert('Lỗi khi tạo đơn hàng');
        }
    };

    const handleViewDetail = async (orderOrId: Order | number) => {
        const id = typeof orderOrId === 'number' ? orderOrId : orderOrId.id || 0;
        if (!id) return;
        try {
            const data = await orderAPI.getById(id);
            setDetail(data);
            setNewStatus(data.status || "pending");
            setShipFee(0);
            setVoucherValue(0);
            setVoucherType('amount');
            // load packaging options (ingredients of type 'dong_goi')
            try {
                const ingr = await ingredientAPI.getAll();
                const packs = (ingr || []).filter((i:any) => i.loai_nguyen_lieu === 'dong_goi');
                setPackagingOptions(packs);
            } catch (e) {
                console.error('Không thể tải nguyên liệu đóng gói', e);
                setPackagingOptions([]);
            }
            setPackagedItems([]);
        } catch (err) {
            console.error(err);
            alert("Lỗi khi lấy chi tiết");
        }
    };

    const handleEditStatus = (record: Order) => {
        setDetail(record);
        setNewStatus(record.status || 'pending');
    };

    const handleAddPackagedItem = async () => {
        if (!selectedPackagingId) return alert('Vui lòng chọn nguyên liệu đóng gói');
        if (!packQty || packQty <= 0) return alert('Số lượng phải lớn hơn 0');
        try {
            // Get ingredient info to check stock quantity
            const ingredient = await ingredientAPI.getById(selectedPackagingId);
            const available = ingredient ? Number(ingredient.stock_quantity || 0) : 0;
            if (available < packQty) {
                return alert('Trong kho không đủ nguyên liệu đóng gói cho số lượng này');
            }

            const p = packagingOptions.find(x => x.ma_nguyen_lieu === selectedPackagingId);
            if (!p) return alert('Nguyên liệu đóng gói không tồn tại');
            const perUnit = (Number(p.gia_nhap || 0) && Number(p.so_luong_ton || 0) > 0) ? (Number(p.gia_nhap || 0) / Number(p.so_luong_ton || 1)) : Number(p.gia_nhap || 0);
            const existing = packagedItems.find(it => it.ma_nguyen_lieu === selectedPackagingId);
            if (existing) {
                setPackagedItems(packagedItems.map(it => it.ma_nguyen_lieu === existing.ma_nguyen_lieu ? { ...it, so_luong: it.so_luong + packQty } : it));
            } else {
                setPackagedItems([...packagedItems, { ma_nguyen_lieu: p.ma_nguyen_lieu, ten_nguyen_lieu: p.ten_nguyen_lieu, so_luong: packQty, don_gia: perUnit }]);
            }
        } catch (e) {
            console.error('Lỗi kiểm tra kho đóng gói', e);
            alert('Không thể kiểm tra kho đóng gói');
        }
    };

    const handleUpdateStatus = async () => {
        if (!detail?.id) return;
        try {
            const previousStatus = detail.status;
            // validate allowed transitions on client side too
            const allowedTransitions: Record<string, string[]> = {
                pending: ['completed', 'cancelled'],
                completed: [],
                cancelled: []
            };
            if (previousStatus === 'cancelled' || previousStatus === 'completed') {
                alert('Đơn hàng ở trạng thái này không được chỉnh trạng thái.');
                return;
            }
            if (previousStatus && previousStatus !== newStatus) {
                const allowed = allowedTransitions[previousStatus] || [];
                if (!allowed.includes(newStatus)) {
                    alert('Không được phép chuyển trạng thái từ "' + (previousStatus || '') + '" sang "' + (newStatus || '') + '"');
                    return;
                }
            }

            const resp: any = await orderAPI.updateStatus(detail.id, newStatus);
            alert(resp?.message || 'Cập nhật trạng thái thành công');
            // refresh list and detail
            fetchOrders();
            const updated = await orderAPI.getById(detail.id);
            setDetail(updated);
            // Dispatch stats update event
            if ((previousStatus as string) !== 'completed' && newStatus === 'completed') {
                const amount = Number(updated.total_price || 0);
                window.dispatchEvent(new CustomEvent('statsUpdated', { detail: { orderCompletedAmount: amount } }));
            } else if ((previousStatus as string) === 'completed' && newStatus !== 'completed') {
                const amount = Number(updated.total_price || 0);
                window.dispatchEvent(new CustomEvent('statsUpdated', { detail: { orderRevertedAmount: amount } }));
            } else {
                window.dispatchEvent(new Event('statsUpdated'));
            }
        } catch (err) {
            console.error(err);
            // show backend error message when available
            const msg = (err as any)?.response?.data?.message || (err as any)?.message || 'Lỗi khi cập nhật trạng thái';
            alert(msg);
        }
    };

    const handleDeleteOrder = async (id: number) => {
        try {
            await orderAPI.delete(id);
            message.success('Xóa đơn hàng thành công');
            fetchOrders();
            setDetail(null);
        } catch (err) {
            console.error('Lỗi xóa đơn hàng', err);
            message.error('Lỗi khi xóa đơn hàng');
        }
    };

    // client-side filter based on selectedStatus and selectedDate (creation date YYYY-MM-DD)
    const displayedOrders = orders.filter(o => {
        if (selectedStatus !== 'all' && o.status !== selectedStatus) return false;
        if (selectedDate) {
            const t = o.created_at || '';
            if (!t.startsWith(selectedDate)) return false;
        }
        return true;
    });

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>Quản lý đơn hàng</h2>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={openAddModal}
                >
                    Thêm đơn hàng
                </Button>
            </div>

            <div style={{ marginBottom: 16, display: 'flex', gap: 16 }}>
                <Input
                    placeholder="Tìm kiếm theo mã, khách, sản phẩm..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onPressEnter={handleSearch}
                    style={{ width: 300 }}
                />
                <Button onClick={handleSearch}>Tìm</Button>
                <Select
                    value={selectedStatus}
                    onChange={(value) => setSelectedStatus(value)}
                    style={{ width: 150 }}
                >
                    <Select.Option value="all">Tất cả</Select.Option>
                    <Select.Option value="pending">Đang chờ</Select.Option>
                    <Select.Option value="completed">Hoàn thành</Select.Option>
                    <Select.Option value="cancelled">Đã hủy</Select.Option>
                </Select>
            </div>

            <Table
                columns={columns}
                dataSource={displayedOrders}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
            />

            {/* Order Detail Modal */}
            <Modal
                title="Chi tiết đơn hàng"
                open={!!detail}
                onCancel={() => setDetail(null)}
                footer={null}
                width={800}
            >
                {detail && (
                    <div>
                        <div style={{ marginBottom: '16px' }}>
                            <p><strong>Mã đơn:</strong> {detail.order_code || detail.id}</p>
                            <p><strong>Tên khách:</strong> {customers.find(c => c.id === detail.customer_id)?.name}</p>
                            <p><strong>Số điện thoại:</strong> {customers.find(c => c.id === detail.customer_id)?.phone}</p>
                            <p><strong>Địa chỉ giao:</strong> {detail.shipping_address}</p>
                            <p><strong>Thời gian giao:</strong> {new Date(detail.created_at || '').toLocaleString('vi-VN')}</p>
                            
                            <div style={{ marginTop: '16px', padding: '12px', background: '#f5f5f5', borderRadius: '8px' }}>
                                <p style={{ marginBottom: '8px' }}><strong>Cập nhật trạng thái đơn hàng:</strong></p>
                                <Space>
                                    <Select
                                        value={detail.status || 'pending'}
                                        onChange={async (value) => {
                                            if (detail.status === 'completed' || detail.status === 'cancelled') {
                                                message.warning("Đơn hàng đã hoàn thành hoặc đã hủy, không thể cập nhật!");
                                                return;
                                            }
                                            try {
                                                await orderAPI.updateStatus(detail!.id!, value);
                                                message.success("Cập nhật trạng thái thành công!");
                                                setDetail(null);
                                                fetchOrders();
                                            } catch (error) {
                                                message.error("Lỗi khi cập nhật trạng thái!");
                                            }
                                        }}
                                        style={{ width: '150px' }}
                                    >
                                        <Select.Option key="completed" value="completed">
                                            Hoàn thành
                                        </Select.Option>
                                        <Select.Option key="cancelled" value="cancelled">
                                            Đã hủy
                                        </Select.Option>
                                    </Select>
                                </Space>
                            </div>
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <h4>Sản phẩm trong đơn:</h4>
                            <Table
                                dataSource={detail.order_items || []}
                                columns={[
                                    {
                                        title: 'Tên sản phẩm',
                                        dataIndex: 'product_id',
                                        key: 'product_name',
                                        render: (productId: number) => {
                                            const product = products.find(p => p.id === productId);
                                            return product ? product.name : 'N/A';
                                        }
                                    },
                                    {
                                        title: 'Số lượng',
                                        dataIndex: 'quantity',
                                        key: 'quantity',
                                    },
                                    {
                                        title: 'Đơn giá',
                                        dataIndex: 'price',
                                        key: 'price',
                                        render: (price: number) => `${price?.toLocaleString("vi-VN")}₫`,
                                    },
                                    {
                                        title: 'Thành tiền',
                                        key: 'total',
                                        render: (record: any) => `${((record.quantity || 0) * (record.price || 0)).toLocaleString("vi-VN")}₫`,
                                    }
                                ]}
                                rowKey="id"
                                pagination={false}
                                size="small"
                            />
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <strong>Tổng tiền: {detail.total_price?.toLocaleString("vi-VN")}₫</strong>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Add Order Modal */}
            <Modal
                title="Thêm đơn hàng mới"
                open={showAddModal}
                onCancel={() => setShowAddModal(false)}
                footer={null}
                width={800}
            >
                <Form onFinish={handleAddOrderSubmit} layout="vertical">
                    <Form.Item
                        label="Chọn khách hàng"
                        name="customer_id"
                        rules={[{ required: true, message: 'Vui lòng chọn khách hàng' }]}
                    >
                        <Select
                            value={selectedCustomer}
                            onChange={(value) => {
                                setSelectedCustomer(value);
                                // Tự động điền số điện thoại khi chọn khách
                                const customer = customers.find(c => c.id === value);
                                if (customer) {
                                    setRecipientPhone(customer.phone || "");
                                }
                            }}
                            placeholder="Chọn khách hàng"
                        >
                            {customers.map((customer) => (
                                <Select.Option key={customer.id} value={customer.id}>
                                    {customer.name} - {customer.phone}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="Số điện thoại khách"
                        name="phone"
                        rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
                    >
                        <Input
                            value={recipientPhone}
                            onChange={(e) => setRecipientPhone(e.target.value)}
                            placeholder="Số điện thoại"
                        />
                    </Form.Item>

                    <Form.Item
                        label="Thời gian giao"
                        name="delivery_time"
                        rules={[{ required: true, message: 'Vui lòng chọn thời gian giao' }]}
                    >
                        <DatePicker
                            showTime
                            format="YYYY-MM-DD HH:mm:ss"
                            value={deliveryTime ? dayjs(deliveryTime) : null}
                            onChange={(date, dateString) => setDeliveryTime(dateString)}
                            placeholder="Chọn thời gian giao"
                        />
                    </Form.Item>

                    <Form.Item
                        label="Địa chỉ giao"
                        name="address"
                        rules={[{ required: true, message: 'Vui lòng nhập địa chỉ giao' }]}
                    >
                        <Input.TextArea
                            value={recipientAddress}
                            onChange={(e) => setRecipientAddress(e.target.value)}
                            placeholder="Địa chỉ giao hàng"
                            rows={3}
                        />
                    </Form.Item>

                    <div style={{ border: '1px solid #d9d9d9', padding: '16px', marginBottom: '16px', borderRadius: '6px' }}>
                        <h4>Sản phẩm trong đơn</h4>
                        {orderItems.map((item, index) => (
                            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <span>{item.ten_san_pham}</span>
                                <InputNumber
                                    min={1}
                                    value={item.so_luong}
                                    onChange={(value) => {
                                        const newItems = [...orderItems];
                                        newItems[index].so_luong = value || 1;
                                        setOrderItems(newItems);
                                    }}
                                    style={{ width: '80px' }}
                                />
                                <span>x {item.don_gia.toLocaleString("vi-VN")}₫</span>
                                <span>= {(item.so_luong * item.don_gia).toLocaleString("vi-VN")}₫</span>
                                <Button
                                    type="link"
                                    danger
                                    onClick={() => {
                                        setOrderItems(orderItems.filter((_, i) => i !== index));
                                    }}
                                >
                                    Xóa
                                </Button>
                            </div>
                        ))}

                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '16px' }}>
                            <Select
                                placeholder="Chọn sản phẩm"
                                style={{ flex: 1 }}
                                value={selectedProduct}
                                onChange={(value) => setSelectedProduct(value)}
                            >
                                {products.map((product) => (
                                    <Select.Option key={product.id} value={product.id}>
                                        {product.name} - {product.price.toLocaleString("vi-VN")}₫
                                    </Select.Option>
                                ))}
                            </Select>
                            <Button 
                                type="primary" 
                                onClick={() => {
                                    if (selectedProduct) {
                                        const product = products.find(p => p.id === selectedProduct);
                                        if (product) {
                                            const existingItem = orderItems.find(item => item.ma_san_pham === selectedProduct);
                                            if (existingItem) {
                                                setOrderItems(orderItems.map(item =>
                                                    item.ma_san_pham === selectedProduct
                                                        ? { ...item, so_luong: item.so_luong + 1 }
                                                        : item
                                                ));
                                            } else {
                                                setOrderItems([...orderItems, {
                                                    ma_san_pham: selectedProduct,
                                                    ten_san_pham: product.name,
                                                    so_luong: 1,
                                                    don_gia: product.price
                                                }]);
                                            }
                                            setSelectedProduct(undefined);
                                        }
                                    }
                                }}
                            >
                                Thêm sản phẩm
                            </Button>
                        </div>
                    </div>

                    <div style={{ textAlign: 'right', fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>
                        Tổng tiền: {orderItems.reduce((total, item) => total + (item.so_luong * item.don_gia), 0).toLocaleString("vi-VN")}₫
                    </div>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading}>
                            Tạo đơn hàng
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}

export default Orders;
