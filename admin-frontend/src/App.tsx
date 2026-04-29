import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "antd";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import RequireAuth from "./components/RequireAuth";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Categories from "./pages/Categories";
import Customers from "./pages/Customers";
import Orders from "./pages/Orders";
import Inventory from "./pages/Inventory";
import Ingredients from "./pages/Ingredients";
import Recipes from "./pages/Recipes";
import ApiKey from "./pages/ApiKey";
import Auth from "./pages/Auth";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";

const { Content, Sider } = Layout;

function InnerApp() {
  const { token, sidebarCollapsed } = useAuth();

  return (
    <Router>
      {token ? (
        <Layout style={{ minHeight: '100vh' }}>
          <Sider
            width={280}
            collapsedWidth={0}
            collapsed={sidebarCollapsed}
            style={{ background: '#fff' }}
          >
            <Sidebar />
          </Sider>
          <Layout>
            <Header />
            <Content style={{ margin: '24px 16px', padding: 24, background: '#fff' }}>
              <Routes>
                <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
                <Route path="/" element={<RequireAuth><Dashboard /></RequireAuth>} />
                <Route path="/products" element={<RequireAuth><Products /></RequireAuth>} />
                <Route path="/categories" element={<RequireAuth><Categories /></RequireAuth>} />
                <Route path="/customers" element={<RequireAuth><Customers /></RequireAuth>} />
                <Route path="/ingredients" element={<RequireAuth><Ingredients /></RequireAuth>} />
                <Route path="/recipes" element={<RequireAuth><Recipes /></RequireAuth>} />
                <Route path="/orders" element={<RequireAuth><Orders /></RequireAuth>} />
                <Route path="/inventory" element={<RequireAuth><Inventory /></RequireAuth>} />
                <Route path="/api-key" element={<RequireAuth><ApiKey /></RequireAuth>} />
                <Route path="*" element={<RequireAuth><Dashboard /></RequireAuth>} />
              </Routes>
            </Content>
          </Layout>
        </Layout>
      ) : (
        <div>
          <Routes>
            <Route path="/login" element={<Auth />} />
            <Route path="/register" element={<Auth />} />
            {/* If not authenticated, redirect everything else to login */}
            <Route path="*" element={<Auth />} />
          </Routes>
        </div>
      )}
    </Router>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <InnerApp />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
