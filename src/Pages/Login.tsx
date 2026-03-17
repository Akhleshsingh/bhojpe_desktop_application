import React, { useState, useEffect } from "react";
import Header from "../CommonPages/header";
import Footer from "../CommonPages/footer";
import { TextField } from "@mui/material";
import "../styles/login.css";
import Rectangle from "../assets/Rectangle 462 (1).png";
import videoCall from "../assets/login-illustration-nobg.png";
import loginicon from "../assets/image 225 (1).png";
import loginicon1 from "../assets/image 221.png";
import passkeyicon from "../assets/image 224.png";
import backIcon from "../assets/image 225.png";
import submitIcon from "../assets/image 226.png";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useOrders } from "../context/OrdersContext";
import { useWaiters } from "../context/WaitersContext";
import toast from "react-hot-toast";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [usePasskey, setUsePasskey] = useState(false);
  const [passcode, setPasscode] = useState("");
  const { login } = useAuth();
  const { fetchOrders } = useOrders();
  const { fetchWaiters } = useWaiters();
  const navigate = useNavigate();
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem("remember_email");
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleNumberClick = (num: number) => {
    if (passcode.length < 4) setPasscode(passcode + num);
  };

  const handleBackspace = () => setPasscode(passcode.slice(0, -1));

  const handleSubmit = async () => {
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
      fetchOrders();
      fetchWaiters();
      navigate("/main-dashboard");
    } else {
      toast.error("Invalid credentials");
    }
  };

  return (
    <div className="login-wrapper">
      <Header />
      <div className="login-container">
        {/* LEFT ILLUSTRATION */}
        <div className="login-left">
          <img src={videoCall} className="login-video" alt="Login illustration" />
        </div>

        {/* RIGHT FORM */}
        <div className="login-right">
          <div className="login-center">
            <div className="login-paper">
              {!usePasskey ? (
                <>
                  <h2 className="login-title">Welcome to Bhojpe</h2>
                  <p className="login-title-2">Fast billing. Easy management.</p>

                  <TextField
                    fullWidth
                    placeholder="User Name / Email Id"
                    value={email}
                    error={!!emailError}
                    helperText={emailError}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setEmailError("");
                    }}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                    InputProps={{
                      startAdornment: (
                        <img src={loginicon1} className="input-icon" alt="" />
                      ),
                    }}
                    sx={{
                      mb: 2,
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                        backgroundColor: "#FFFFFF",
                        fontFamily: "Poppins, sans-serif",
                        fontSize: "14px",
                        "& fieldset": { borderColor: "#E0DADA" },
                        "&:hover fieldset": { borderColor: "#FF3D01" },
                        "&.Mui-focused fieldset": { borderColor: "#FF3D01" },
                      },
                      "& .MuiInputBase-input::placeholder": {
                        color: "#AAAAAA",
                        opacity: 1,
                        fontFamily: "Poppins, sans-serif",
                        fontSize: "14px",
                      },
                    }}
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
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                    InputProps={{
                      startAdornment: (
                        <img src={passkeyicon} className="input-icon" alt="" />
                      ),
                    }}
                    sx={{
                      mb: 2.5,
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "8px",
                        backgroundColor: "#FFFFFF",
                        fontFamily: "Poppins, sans-serif",
                        fontSize: "14px",
                        "& fieldset": { borderColor: "#E0DADA" },
                        "&:hover fieldset": { borderColor: "#FF3D01" },
                        "&.Mui-focused fieldset": { borderColor: "#FF3D01" },
                      },
                      "& .MuiInputBase-input::placeholder": {
                        color: "#AAAAAA",
                        opacity: 1,
                        fontFamily: "Poppins, sans-serif",
                        fontSize: "14px",
                      },
                    }}
                  />

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "20px",
                    }}
                  >
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        style={{
                          width: 16,
                          height: 16,
                          accentColor: "#FF3D01",
                          cursor: "pointer",
                        }}
                      />
                      <span
                        style={{
                          fontSize: 13,
                          color: "#777",
                          fontFamily: "Poppins, sans-serif",
                        }}
                      >
                        Remember me
                      </span>
                    </label>
                  </div>

                  <button
                    onClick={handleSubmit}
                    style={{
                      width: "100%",
                      padding: "13px",
                      backgroundColor: "#FF3D01",
                      color: "#FFFFFF",
                      border: "none",
                      borderRadius: "8px",
                      fontSize: "16px",
                      fontWeight: 600,
                      fontFamily: "Poppins, sans-serif",
                      cursor: "pointer",
                      marginBottom: "24px",
                      letterSpacing: "0.3px",
                      transition: "background-color 0.2s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#e63500")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "#FF3D01")
                    }
                  >
                    Login In
                  </button>
                </>
              ) : (
                <>
                  <h2 className="login-title">Enter the Passcode</h2>
                  <div className="passcode-dots">
                    {[0, 1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={
                          passcode[i]
                            ? "passcode-dot passcode-dot-filled"
                            : "passcode-dot"
                        }
                      />
                    ))}
                  </div>
                  <div className="keypad-grid">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                      <div
                        key={num}
                        className="keypad-btn"
                        onClick={() => handleNumberClick(num)}
                      >
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
                      <img src={backIcon} style={{ width: 32 }} alt="back" />
                    </div>
                    <div
                      className="keypad-large-btn keypad-btn"
                      onClick={() => handleNumberClick(0)}
                    >
                      0
                    </div>
                    <div className="keypad-large-btn" onClick={handleSubmit}>
                      <img src={submitIcon} style={{ width: 32 }} alt="submit" />
                    </div>
                  </div>
                </>
              )}

              {/* LOGIN / PASSKEY TABS */}
              <div className="login-footer">
                <div
                  onClick={() => {
                    setUsePasskey(false);
                    setPasscode("");
                  }}
                  className={`login-option ${
                    !usePasskey ? "login-active" : "login-inactive"
                  }`}
                >
                  <img src={loginicon} alt="login" />
                  <span>Login</span>
                </div>
                <div
                  onClick={() => {
                    setUsePasskey(true);
                    setEmail("");
                    setPassword("");
                  }}
                  className={`login-option ${
                    usePasskey ? "login-active" : "login-inactive"
                  }`}
                >
                  <img src={passkeyicon} alt="passcode" />
                  <span>Passcode</span>
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
