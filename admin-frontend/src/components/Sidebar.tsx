import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, type MenuProps } from "antd";
import { HomeOutlined, ShoppingOutlined, AppstoreOutlined, UserOutlined, ShoppingCartOutlined, InboxOutlined, BookOutlined, StarOutlined, LogoutOutlined } from "@ant-design/icons";
import { useAuth } from "../contexts/AuthContext";

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { sidebarCollapsed, setToken } = useAuth();

  const handleLogout = () => {
    try { setToken(null); localStorage.removeItem("user"); } catch { }
    navigate('/login');
  };

  const menuItems: MenuProps['items'] = [
    {
      key: "/dashboard",
      icon: <HomeOutlined />,
      label: <Link to="/dashboard">Trang chủ</Link>,
    },
    {
      key: "/products",
      icon: <ShoppingOutlined />,
      label: <Link to="/products">Sản phẩm</Link>,
    },
    {
      key: "/categories",
      icon: <AppstoreOutlined />,
      label: <Link to="/categories">Danh mục</Link>,
    },
    {
      key: "/ingredients",
      icon: <StarOutlined />,
      label: <Link to="/ingredients">Nguyên liệu</Link>,
    },
    {
      key: "/recipes",
      icon: <BookOutlined />,
      label: <Link to="/recipes">Công thức</Link>,
    },
    {
      key: "/customers",
      icon: <UserOutlined />,
      label: <Link to="/customers">Khách hàng</Link>,
    },
    {
      key: "/orders",
      icon: <ShoppingCartOutlined />,
      label: <Link to="/orders">Đơn hàng</Link>,
    },
    {
      key: "/inventory",
      icon: <InboxOutlined />,
      label: <Link to="/inventory">Nhập kho</Link>,
    },
    {
      type: 'divider',
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: <span onClick={handleLogout}>Đăng xuất</span>,
    },
  ];

  return (
    <Menu
      mode="inline"
      selectedKeys={[location.pathname]}
      style={{ height: '100%', borderRight: 0 }}
      inlineCollapsed={sidebarCollapsed}
      items={menuItems}
    />
  );
}
