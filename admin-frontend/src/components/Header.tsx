import { useNavigate } from "react-router-dom";
import { Layout, Button, Avatar, Dropdown } from "antd";
import { MenuFoldOutlined, MenuUnfoldOutlined, UserOutlined, LogoutOutlined, MoonOutlined, SunOutlined } from "@ant-design/icons";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";

const { Header: AntHeader } = Layout;

export default function Header() {
  const navigate = useNavigate();
  const { setToken, sidebarCollapsed, setSidebarCollapsed } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const userRaw = localStorage.getItem("user");
  const user = userRaw ? JSON.parse(userRaw) : null;

  const handleLogout = () => {
    setToken(null);
    navigate("/login");
  };

  const userMenuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      onClick: handleLogout,
    },
  ];

  return (
    <AntHeader style={{ background: '#fff', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Button
          type="text"
          icon={sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          style={{ fontSize: '16px', width: 64, height: 64 }}
        />
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>Hệ thống quản lý cửa hàng</h1>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Button
          type="text"
          icon={theme === 'dark' ? <SunOutlined /> : <MoonOutlined />}
          onClick={toggleTheme}
        />
        {user && (
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <Avatar icon={<UserOutlined />} />
              <span style={{ marginLeft: '8px' }}>{user.ho_ten || user.ten_dang_nhap}</span>
            </div>
          </Dropdown>
        )}
      </div>
    </AntHeader>
  );
}
