import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";

const API = "https://bepmam-backend.onrender.com/api";

export default function Auth() {
  const [tab, setTab] = useState<"login" | "register">("login");

  // login
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginFieldErrors, setLoginFieldErrors] = useState<{ username?: string; password?: string }>({});
  const [loginSuccess, setLoginSuccess] = useState("");

  // register
  const [regUsername, setRegUsername] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [hoTen, setHoTen] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [registerError, setRegisterError] = useState("");
  const [registerFieldErrors, setRegisterFieldErrors] = useState<{
    ten_dang_nhap?: string;
    mat_khau?: string;
    ho_ten?: string;
    email?: string;
    so_dien_thoai?: string;
    general?: string;
  }>({});
  const [registerSuccess, setRegisterSuccess] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const stateFrom = (location.state as any) || {};
  const from = stateFrom.from || "/";

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoginError("");
    setLoginFieldErrors({});
    setLoginSuccess("");
    // client-side basic validation
    const fieldErrs: { username?: string; password?: string } = {};
    if (!username.trim()) fieldErrs.username = "Vui lòng nhập tên đăng nhập";
    if (!password) fieldErrs.password = "Vui lòng nhập mật khẩu";
    if (Object.keys(fieldErrs).length) {
      setLoginFieldErrors(fieldErrs);
      return;
    }
    try {
      const res = await axios.post(`${API}/auth/login`, { ten_dang_nhap: username, mat_khau: password });
      if (res.data?.token) {
        localStorage.setItem("token", res.data.token);
        if (res.data.user) localStorage.setItem("user", JSON.stringify(res.data.user));
        // Notify same-tab listeners that auth state changed
        window.dispatchEvent(new Event('authChange'));
        // show success message then navigate
        setLoginSuccess("Đăng nhập thành công");
        // Preserve autoCheckout flag so cart can resume checkout automatically
        setTimeout(() => navigate(from, { replace: true, state: { autoCheckout: stateFrom.autoCheckout } }), 700);
      }
    } catch (err: any) {
      const data = err?.response?.data;
      // server may return field-specific errors
      if (data?.errors && typeof data.errors === "object") {
        setLoginFieldErrors(data.errors);
      } else if (data?.fieldErrors && typeof data.fieldErrors === "object") {
        setLoginFieldErrors(data.fieldErrors);
      } else {
        setLoginError(data?.message || "Lỗi đăng nhập");
      }
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError("");
    setRegisterSuccess("");
    setRegisterFieldErrors({});
    // client-side validation
    const errs: any = {};
    if (!regUsername.trim()) errs.ten_dang_nhap = "Vui lòng nhập tên đăng nhập";
    if (!regPassword || regPassword.length < 6) errs.mat_khau = "Mật khẩu phải có ít nhất 6 ký tự";
    if (!hoTen.trim()) errs.ho_ten = "Vui lòng nhập họ tên";
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRe.test(email)) errs.email = "Email không hợp lệ";
    const phoneRe = /^\+?[0-9\s\-]{7,20}$/;
    if (!phone.trim() || !phoneRe.test(phone)) errs.so_dien_thoai = "Số điện thoại không hợp lệ";
    if (Object.keys(errs).length) {
      setRegisterFieldErrors(errs);
      // Build a user-friendly list of missing/invalid fields for an alert
      const labelMap: { [k: string]: string } = {
        ten_dang_nhap: 'Tên đăng nhập',
        mat_khau: 'Mật khẩu',
        ho_ten: 'Họ tên',
        email: 'Email',
        so_dien_thoai: 'Số điện thoại',
      };
      const msgs = Object.entries(errs).map(([k, v]) => `${labelMap[k] || k}: ${v}`);
      alert('Vui lòng sửa các lỗi sau trước khi đăng ký:\n' + msgs.join('\n'));
      return;
    }
    try {
      const res = await axios.post(`${API}/auth/register`, { ten_dang_nhap: regUsername, mat_khau: regPassword, ho_ten: hoTen, email, so_dien_thoai: phone });
      // Show success message and then switch to login tab. Do NOT auto-login.
      setRegisterSuccess("Đăng ký thành công");
      setTimeout(() => {
        setTab("login");
        setRegisterSuccess("");
        // show success on the login page above the login button
        setLoginSuccess("Đăng ký thành công");
        // clear the login success after a short display
        setTimeout(() => setLoginSuccess(""), 2000);
      }, 900);
    } catch (err: any) {
      const data = err?.response?.data;
      // Prefer structured field errors from the server
      const fieldErrors = (data && (data.errors || data.fieldErrors)) || null;
      if (fieldErrors && typeof fieldErrors === "object") {
        setRegisterFieldErrors(fieldErrors);
        // pick a primary error to show above the button (prefer email)
        const primary = fieldErrors.email || fieldErrors.ten_dang_nhap || fieldErrors.mat_khau || Object.values(fieldErrors)[0];
        if (primary) setRegisterError(String(primary));
      } else if (err?.response?.status === 409) {
        // conflict (duplicate) — show a single general message above the register button
        // Do NOT show field-level errors for email/phone in this case.
        const dupMsg = 'tài khoản đã tồn tại';
        setRegisterFieldErrors({});
        setRegisterError(dupMsg);
      } else if (data?.message) {
        const msg: string = String(data.message || '').trim();
        const lower = msg.toLowerCase();
        // Map common server messages to clearer Vietnamese texts
        let friendly = msg;
        if (lower.includes('email') || lower.includes('gmail')) {
          if (lower.includes('exist') || lower.includes('already') || lower.includes('đã tồn tại')) {
            friendly = 'Email đã tồn tại';
            // prefer showing as general message above button (not under field)
            setRegisterFieldErrors({});
          } else if (lower.includes('invalid') || lower.includes('không hợp lệ')) {
            friendly = 'Email không hợp lệ';
            setRegisterFieldErrors({ email: friendly });
          } else {
            setRegisterFieldErrors({ email: friendly });
          }
        } else if (lower.includes('tên') || lower.includes('username') || lower.includes('ten_dang_nhap')) {
          if (lower.includes('exist') || lower.includes('đã tồn tại')) {
            friendly = 'Tên đăng nhập đã tồn tại';
            setRegisterFieldErrors({});
          } else {
            setRegisterFieldErrors({ ten_dang_nhap: friendly });
          }
        } else if (lower.includes('số') || lower.includes('điện thoại') || lower.includes('phone')) {
          if (lower.includes('exist') || lower.includes('đã tồn tại')) {
            friendly = 'Số điện thoại đã tồn tại';
            setRegisterFieldErrors({});
          } else if (lower.includes('invalid') || lower.includes('không hợp lệ')) {
            friendly = 'Số điện thoại không hợp lệ';
            setRegisterFieldErrors({ so_dien_thoai: friendly });
          } else {
            setRegisterFieldErrors({ so_dien_thoai: friendly });
          }
        } else {
          // fallback: use server message as-is if it's informative
          friendly = msg || 'Đã xảy ra lỗi trong quá trình đăng ký';
        }
        setRegisterError(friendly);
      } else {
        setRegisterError('Đã xảy ra lỗi trong quá trình đăng ký');
      }
    }
  };

  // Extracted initializer so the click handler can ensure GSI is ready before prompting
  function initGSI(): Promise<void> {
    return new Promise((resolve) => {
      try {
        const scriptId = 'gsi-client-script';
        const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
        if (!clientId) {
          resolve();
          return;
        }

        const finishInit = () => {
          try {
            // Initialize ID token client (one-tap / credential responses)
            try {
              (window as any).google.accounts.id.initialize({
                client_id: clientId,
                callback: async (resp: any) => {
                  try {
                    const idToken = resp?.credential;
                    if (!idToken) return;
                    const res = await axios.post(`${API}/auth/google`, { idToken });
                    if (res.data?.token) {
                      localStorage.setItem('token', res.data.token);
                      if (res.data.user) localStorage.setItem('user', JSON.stringify(res.data.user));
                      window.dispatchEvent(new Event('authChange'));
                      setLoginSuccess('Đăng nhập thành công');
                      setTimeout(() => navigate(from, { replace: true, state: { autoCheckout: stateFrom.autoCheckout } }), 700);
                    }
                  } catch (e: any) {
                    setLoginError(e?.response?.data?.message || 'Lỗi đăng nhập Google');
                  }
                }
              });
            } catch (err) {
              console.debug('Could not init id client', err);
            }

            // Initialize Authorization Code client for server-side exchange
            try {
              const codeClient = (window as any).google.accounts.oauth2.initCodeClient({
                client_id: clientId,
                scope: 'openid profile email',
                ux_mode: 'popup',
                callback: async (resp: any) => {
                  try {
                    const code = resp?.code;
                    if (!code) return;
                    const res = await axios.post(`${API}/auth/google/code`, { code });
                    if (res.data?.token) {
                      localStorage.setItem('token', res.data.token);
                      if (res.data.user) localStorage.setItem('user', JSON.stringify(res.data.user));
                      window.dispatchEvent(new Event('authChange'));
                      setLoginSuccess('Đăng nhập thành công');
                      setTimeout(() => navigate(from, { replace: true, state: { autoCheckout: stateFrom.autoCheckout } }), 700);
                    }
                  } catch (e: any) {
                    setLoginError(e?.response?.data?.message || 'Lỗi đăng nhập Google (code)');
                  }
                }
              });
              // expose to window so our custom button can use it
              (window as any).__googleCodeClient = codeClient;
            } catch (err) {
              console.debug('Could not init code client', err);
            }

            // render button into container (hidden container used for fallback rendering)
            const container = document.getElementById('g_id_signin');
            if (container && (window as any).google?.accounts?.id) {
              try {
                (window as any).google.accounts.id.renderButton(container, { theme: 'outline', size: 'large', text: 'signin_with' });
              } catch (err) {
                // ignore render errors
              }
            }
          } catch (err) {
            console.error('GSI init error', err);
          }
          resolve();
        };

        // if google script not loaded, inject it
        if (!(window as any).google && !document.getElementById(scriptId)) {
          const script = document.createElement('script');
          script.src = 'https://accounts.google.com/gsi/client';
          script.id = scriptId;
          script.async = true;
          script.defer = true;
          script.onload = () => finishInit();
          document.head.appendChild(script);
          return;
        }

        if (!(window as any).google) {
          // script present but google object not ready yet, wait a tick
          setTimeout(() => finishInit(), 50);
          return;
        }

        // already available
        finishInit();
      } catch (err) {
        console.error('GSI init error', err);
        resolve();
      }
    });
  }

  useEffect(() => {
    // try to initialize on mount
    initGSI().catch((e) => console.error('initGSI error', e));
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white shadow-md rounded-lg w-full max-w-md p-6">
        <h2 className="text-lg font-semibold text-center mb-2">Đăng nhập hoặc đăng ký để tiếp tục</h2>
        <div className="flex gap-2 mb-4">
          <button onClick={() => setTab("login")} className={`flex-1 py-2 rounded ${tab === "login" ? "bg-gray-100 font-semibold" : "bg-transparent"}`}>Đăng nhập</button>
          <button onClick={() => setTab("register")} className={`flex-1 py-2 rounded ${tab === "register" ? "bg-gray-100 font-semibold" : "bg-transparent"}`}>Đăng ký</button>
        </div>

        {tab === "login" ? (
          <form onSubmit={handleLogin} className="space-y-3">
            <div>
              <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Tên đăng nhập" className="w-full p-2 border rounded" />
              {loginFieldErrors.username && <p className="text-red-600 text-xs mt-1">{loginFieldErrors.username}</p>}
            </div>
            <div>
              <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mật khẩu" type="password" className="w-full p-2 border rounded" />
              {loginFieldErrors.password && <p className="text-red-600 text-xs mt-1">{loginFieldErrors.password}</p>}
            </div>
            {/* Success / General login error shown directly above the submit button */}
            {loginSuccess && <p className="text-green-600 text-sm text-center">{loginSuccess}</p>}
            {loginError && <p className="text-red-600 text-sm text-center">{loginError}</p>}
            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">{loginSuccess ? "Đăng nhập thành công" : "Đăng nhập"}</button>
            <div className="text-center text-sm text-gray-500 mt-2">Hoặc đăng nhập bằng</div>
            <div className="mt-2">
              <div className="w-full">
                <button
                  type="button"
                  onClick={async () => {
                    setLoginError('');
                    try {
                      await initGSI();
                      // After init, try code client first, then id prompt
                      const codeClient = (window as any).__googleCodeClient;
                      if (codeClient && typeof codeClient.requestCode === 'function') {
                        codeClient.requestCode();
                        return;
                      }
                      if ((window as any).google && (window as any).google.accounts && (window as any).google.accounts.id) {
                        (window as any).google.accounts.id.prompt();
                        return;
                      }
                      setLoginError('Google Sign-in chưa sẵn sàng hoặc chưa cấu hình');
                    } catch (err) {
                      console.error('GSI init + sign-in error', err);
                      setLoginError('Không thể mở Google Sign-in');
                    }
                  }}
                  className="w-full flex items-center justify-center gap-3 bg-white border rounded py-2 hover:shadow-sm"
                >
                  {/* Google logo */}
                  <svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.27 1.53 8.14 2.79l6.03-6.03C34.56 3.2 29.65 1.5 24 1.5 14.81 1.5 6.99 6.86 3.3 14.34l7.42 5.78C12.95 15.01 18.97 9.5 24 9.5z"/>
                    <path fill="#4285F4" d="M46.5 24c0-1.6-.15-3.14-.42-4.62H24v8.76h12.88c-.55 2.96-2.21 5.46-4.72 7.15l7.42 5.77C43.99 36.77 46.5 30.8 46.5 24z"/>
                    <path fill="#FBBC05" d="M10.72 29.12A14.94 14.94 0 0 1 9.5 24c0-1.92.34-3.76.95-5.44L3.03 12.8A23.99 23.99 0 0 0 1.5 24c0 3.42.82 6.65 2.27 9.5l7-4.38z"/>
                    <path fill="#34A853" d="M24 46.5c6.45 0 11.87-2.14 15.83-5.82l-7.42-5.77C30.35 36.64 27.3 37.9 24 37.9c-5.03 0-11.05-5.51-13.28-10.62l-7.42 5.78C6.99 41.64 14.81 46.5 24 46.5z"/>
                  </svg>
                  <span className="text-sm font-medium">Google</span>
                </button>
                <div id="g_id_signin" style={{ display: 'none' }}></div>
              </div>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-3">
            <div>
              <input value={regUsername} onChange={(e) => setRegUsername(e.target.value)} placeholder="Tên đăng nhập" className="w-full p-2 border rounded" />
              {registerFieldErrors.ten_dang_nhap && <p className="text-red-600 text-xs mt-1">{registerFieldErrors.ten_dang_nhap}</p>}
            </div>
            <div>
              <input value={regPassword} onChange={(e) => setRegPassword(e.target.value)} placeholder="Mật khẩu" type="password" className="w-full p-2 border rounded" />
              {registerFieldErrors.mat_khau && <p className="text-red-600 text-xs mt-1">{registerFieldErrors.mat_khau}</p>}
            </div>
            <div>
              <input value={hoTen} onChange={(e) => setHoTen(e.target.value)} placeholder="Họ tên" className="w-full p-2 border rounded" />
              {registerFieldErrors.ho_ten && <p className="text-red-600 text-xs mt-1">{registerFieldErrors.ho_ten}</p>}
            </div>
            <div>
              <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full p-2 border rounded" />
              {(registerFieldErrors.email && (registerFieldErrors.email || '').toLowerCase().trim() !== 'tài khoản đã tồn tại') && (
                <p className="text-red-600 text-xs mt-1">{registerFieldErrors.email}</p>
              )}
            </div>
            <div>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Số điện thoại" className="w-full p-2 border rounded" />
              {registerFieldErrors.so_dien_thoai && <p className="text-red-600 text-xs mt-1">{registerFieldErrors.so_dien_thoai}</p>}
            </div>
            {/* Show register error or success directly above the register button */}
            {registerError && <p className="text-red-600 text-sm text-center">{registerError}</p>}
            {registerSuccess && <p className="text-green-600 text-sm text-center">{registerSuccess}</p>}
            <button type="submit" className="w-full bg-green-600 text-white py-2 rounded">{registerSuccess ? "Đăng ký thành công" : "Đăng ký"}</button>
          </form>
        )}
      </div>
    </div>
  );
}
