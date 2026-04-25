import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import authAPI from "../api/authAPI";
import { useAuth } from "../contexts/AuthContext";

const Auth: React.FC = () => {
  // Mode: 'login' or 'register'
  const [mode, setMode] = useState<"login" | "register">("login");

  // Login fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // Register fields
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [regShopName, setRegShopName] = useState("");
  const [regShopEmail, setRegShopEmail] = useState("");
  const [regError, setRegError] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { setToken } = useAuth();

  const from = (location.state as any)?.from?.pathname || "/dashboard";

  // Validate email format
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    if (!email || !password) {
      setLoginError("Email và mật khẩu là bắt buộc");
      return;
    }

    if (!validateEmail(email)) {
      setLoginError("Email không hợp lệ");
      return;
    }

    try {
      const res = await authAPI.login({ email, password });

      if (res.user.role !== "admin") {
        setLoginError("Chỉ admin được phép đăng nhập tại đây");
        return;
      }

      if (res.token) {
        setToken(res.token);
        localStorage.setItem("user", JSON.stringify(res.user));
        localStorage.setItem("shop_id", res.user.shop_id);
        localStorage.setItem("api_key", res.user.api_key || "");

        navigate(from, { replace: true });
      }
    } catch (err: any) {
      setLoginError(err?.response?.data?.error || "Email hoặc mật khẩu bị sai");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError("");

    if (!regName || !regEmail || !regPassword || !regShopName) {
      setRegError("Vui lòng điền đầy đủ thông tin (bao gồm tên cửa hàng)");
      return;
    }

    if (!validateEmail(regEmail)) {
      setRegError("Email không hợp lệ");
      return;
    }

    if (regShopEmail && !validateEmail(regShopEmail)) {
      setRegError("Email cửa hàng không hợp lệ");
      return;
    }

    if (regPassword.length < 6) {
      setRegError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setRegError("Mật khẩu không khớp");
      return;
    }

    setIsRegistering(true);
    try {
      const res = await authAPI.registerAdmin({
        name: regName,
        email: regEmail,
        password: regPassword,
        shop_name: regShopName,
        shop_email: regShopEmail || undefined,
      });

      if (res.user && res.token) {
        // Store user and token
        setToken(res.token);
        localStorage.setItem("user", JSON.stringify(res.user));
        localStorage.setItem("shop_id", res.user.shop_id);
        if (res.user.api_key) {
          localStorage.setItem("api_key", res.user.api_key);
        }
        if (res.shop?.name) {
          localStorage.setItem("shop_name", res.shop.name);
        }

        // Navigate to dashboard
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      setRegError(err?.response?.data?.error || "Đăng ký thất bại");
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <div className="bg-card text-card-foreground shadow-md rounded-xl px-6 py-6 w-full max-w-md border border-border">
        <h1 className="text-2xl font-bold text-center text-foreground">Hệ Thống Quản Lý Cửa Hàng</h1>
        <p className="text-sm text-muted-foreground text-center mt-1">
          {mode === "login" ? "Chỉ admin được phép đăng nhập" : "Tạo tài khoản admin mới"}
        </p>

        <div className="mt-4">
          {mode === "login" ? (
            <form onSubmit={handleLogin} className="space-y-3">
              <input
                className="border border-input bg-background text-foreground p-2 w-full rounded-md focus:ring-2 focus:ring-black focus:outline-none"
                placeholder="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                className="border border-input bg-background text-foreground p-2 w-full rounded-md focus:ring-2 focus:ring-black focus:outline-none"
                type="password"
                placeholder="Mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <div>
                {loginError && <p className="text-destructive text-sm mb-2 text-center">{loginError}</p>}
                <button
                  type="submit"
                  className="w-full py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white border border-transparent transition shadow-sm"
                >
                  Đăng nhập
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-3">
              <input
                className="border border-input bg-background text-foreground p-2 w-full rounded-md focus:ring-2 focus:ring-black focus:outline-none"
                placeholder="Họ và tên *"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
              />
              <input
                className="border border-input bg-background text-foreground p-2 w-full rounded-md focus:ring-2 focus:ring-black focus:outline-none"
                placeholder="Email cá nhân *"
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
              />
              <input
                className="border border-input bg-background text-foreground p-2 w-full rounded-md focus:ring-2 focus:ring-black focus:outline-none"
                type="password"
                placeholder="Mật khẩu *"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
              />
              <input
                className="border border-input bg-background text-foreground p-2 w-full rounded-md focus:ring-2 focus:ring-black focus:outline-none"
                type="password"
                placeholder="Xác nhận mật khẩu *"
                value={regConfirmPassword}
                onChange={(e) => setRegConfirmPassword(e.target.value)}
              />
              <input
                className="border border-input bg-background text-foreground p-2 w-full rounded-md focus:ring-2 focus:ring-black focus:outline-none"
                placeholder="Tên cửa hàng *"
                value={regShopName}
                onChange={(e) => setRegShopName(e.target.value)}
              />
              <input
                className="border border-input bg-background text-foreground p-2 w-full rounded-md focus:ring-2 focus:ring-black focus:outline-none"
                placeholder="Email cửa hàng (tùy chọn)"
                type="email"
                value={regShopEmail}
                onChange={(e) => setRegShopEmail(e.target.value)}
              />
              <div>
                {regError && <p className="text-destructive text-sm mb-2 text-center">{regError}</p>}
                <button
                  type="submit"
                  disabled={isRegistering}
                  className="w-full py-2 rounded-md bg-green-600 hover:bg-green-700 text-white border border-transparent transition shadow-sm disabled:opacity-50"
                >
                  {isRegistering ? "Đang tạo..." : "Đăng ký"}
                </button>
              </div>
            </form>
          )}

          <div className="mt-4 text-center">
            <p className="text-xs text-muted-foreground">
              {mode === "login" ? "Không có tài khoản? " : "Đã có tài khoản? "}
              <button
                type="button"
                onClick={() => {
                  setMode(mode === "login" ? "register" : "login");
                  setLoginError("");
                  setRegError("");
                }}
                className="text-blue-600 hover:underline font-semibold"
              >
                {mode === "login" ? "Đăng ký" : "Đăng nhập"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
