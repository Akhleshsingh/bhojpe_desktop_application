import React, { useState , useEffect } from "react";
import Header from "../CommonPages/header";
import Footer from "../CommonPages/footer";
import { Button, TextField, Paper } from "@mui/material";
import "../styles/login.css";
import Rectangle from "../assets/Rectangle 462 (1).png";
// import Bhojpe from "../assets/Computer login-bro 1.png";
import videoCall from "../assets/Computer login-bro (1) 1.png";
import loginicon from "../assets/image 225 (1).png";
import loginicon1 from "../assets/image 221.png";
import passkeyicon from "../assets/image 224.png";
import backIcon from "../assets/image 225.png";        
import submitIcon from "../assets/image 226.png";    
import { useNavigate } from "react-router-dom";
import { API_ENDPOINTS } from "../utils/api";
import { apiFetch } from "../utils/apiFetch";
import { useAuth } from "../context/AuthContext"
import { NetworkProvider } from "../context/NetworkContext";
import { OrdersProvider, useOrders } from "../context/OrdersContext";
import { useWaiters, WaitersProvider } from "../context/WaitersContext";
import toast from "react-hot-toast";


const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
const [passwordError, setPasswordError] = useState("");
  const [usePasskey, setUsePasskey] = useState(false);
  const [passcode, setPasscode] = useState("");
 const { login } = useAuth();
 const { fetchOrders} = useOrders();
 const {  fetchWaiters} = useWaiters();
  const navigate = useNavigate(); 
const [rememberMe, setRememberMe] = useState(false);
useEffect(() => {
  const savedEmail = localStorage.getItem("remember_email");
  if (savedEmail) {
    setEmail(savedEmail);
    setRememberMe(true);
  }
}, []);

const handleLogin = async () => {
  const success = await login(email, password);

  if (success) {
    if (rememberMe) {
      localStorage.setItem("remember_email", email);
    } else {
      localStorage.removeItem("remember_email");
    }

    navigate("/main-dashboard");
  } else {
    alert("Invalid credentials");
  }
};

  const handleNumberClick = (num: number) => {
    if (passcode.length < 4) setPasscode(passcode + num);
  };

  const handleBackspace = () => setPasscode(passcode.slice(0, -1));

const handleSubmit = async () => {

  // Reset errors
  setEmailError("");
  setPasswordError("");

  if (!usePasskey) {
    let valid = true;

    if (!email.trim()) {
      setEmailError("Please enter username");
      valid = false;
    }

    if (!password.trim()) {
      setPasswordError("Please enter password");
      valid = false;
    }

    if (!valid) return;
  }

  if (usePasskey) {
    const savedPasskey = localStorage.getItem("pos_passkey");

    if (!savedPasskey) {
      toast.error("No passkey set");
      return;
    }

    if (passcode === savedPasskey) {
      localStorage.setItem("offline_login", "true");
      navigate("/main-dashboard");
      return;
    } else {
      toast.error("Wrong passkey");
      return;
    }
  }

  const success = await login(email, password);

  if (success) {
    if (rememberMe) {
      localStorage.setItem("remember_email", email);
    } else {
      localStorage.removeItem("remember_email");
    }

    navigate("/main-dashboard");
  } else {
    toast.error("Invalid credentials");
  }
};

  return (
    <div className="login-wrapper">
      <Header />
      <div className="login-container">
        <div className="login-left">
          <img src={Rectangle} className="login-bg" />
          <img src={videoCall} className="login-video" />
        </div>
        <div className="login-right">
          <div className="login-center">
            <div className="login-paper">
              {!usePasskey ? (
                <>
                  <h2 className="login-title">Welcome to Bhojpe</h2>
                   <h5 className="login-title-2">Fast billing. Easy management.</h5>
                  <TextField
  fullWidth
  placeholder="Username"
  value={email}
  error={!!emailError}
  helperText={emailError}
  onChange={(e) => {
    setEmail(e.target.value);
    setEmailError("");
  }}
  InputProps={{
    startAdornment: <img src={loginicon1} className="input-icon" />,
  }}
  sx={{ mb: 2 }}
/>
               <TextField
  fullWidth
  placeholder="Password"
  type="password"
  value={password}
  error={!!passwordError}
  helperText={passwordError}
  onChange={(e) => {
    setPassword(e.target.value);
    setPasswordError("");
  }}
  InputProps={{
    startAdornment: <img src={passkeyicon} className="input-icon" />,
  }}
  sx={{ mb: 2 }}
/>
                  <div
  style={{
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "16px",
  }}
>
  <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
    <input
      type="checkbox"
      checked={rememberMe}
      onChange={(e) => setRememberMe(e.target.checked)}
      style={{ width: 16, height: 16 }}
    />
    <span style={{ fontSize: 14, color: "#555" }}>Remember me</span>
  </label>
</div>

                  <Button
                    variant="contained"
                    fullWidth
                    onClick={handleSubmit}
                    sx={{
                      backgroundColor: "#000000",
                      color: "#fff",
                      padding: "12px",
                      borderRadius: "10px",
                      fontSize: "16px",
                      fontWeight: 600,
                      mb: 3,
                      textTransform: "none",
                      "&:hover": { backgroundColor: "#90AB8B" },
                    }}
                  >
                    Login
                  </Button>
                </>
              ) : (
                <>
                  <h2 className="login-title">Enter the Passcode</h2>
                  <div className="passcode-dots">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={
                          passcode[i] ? "passcode-dot passcode-dot-filled" : "passcode-dot"
                        }
                      ></div>
                    ))}
                  </div>
                  <div className="keypad-grid">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                      <div key={num} className="keypad-btn" onClick={() => handleNumberClick(num)}>
                        {num}
                      </div>
                    ))}
                    <div
                      className="keypad-large-btn"
                      onClick={() => {
                        setUsePasskey(false);
                        setPasscode("");
                      }}
                    >
                      <img src={backIcon} style={{ width: 35 }} />
                    </div>
                    <div
                      className="keypad-large-btn keypad-btn"
                      onClick={() => handleNumberClick(0)}
                    >
                      0
                    </div>
                    <div className="keypad-large-btn" onClick={handleSubmit}>
                      <img src={submitIcon} style={{ width: 35 }} />
                    </div>
                  </div>
                </>
              )}
              <div className="login-footer">
                <div
                  onClick={() => {
                    setUsePasskey(false);
                    setPasscode("");
                  }}
                  className={`login-option ${!usePasskey ? "login-active" : "login-inactive"}`}
                >
                  <img src={loginicon} />
                  <span>Login</span>
                </div>
                <div
                  onClick={() => {
                    setUsePasskey(true);
                    setEmail("");
                    setPassword("");
                  }}
                  className={`login-option ${usePasskey ? "login-active" : "login-inactive"}`}
                >
                  <img src={passkeyicon} />
                  <span>Passkey</span>
                </div>
              </div>
            </div>
          </div>
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Login;




