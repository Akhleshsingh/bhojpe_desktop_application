import React from "react";

interface ThemeSwitchProps {
  checked: boolean;
  onChange: () => void;
}

const ThemeSwitch: React.FC<ThemeSwitchProps> = ({ checked, onChange }) => {
  return (
    <label style={{ position: "relative", display: "inline-block", width: 50, height: 26, cursor: "pointer" }}>
      {/* Hidden checkbox */}
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        style={{ opacity: 0, width: 0, height: 0 }}
      />

      {/* Track */}
      <span
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: checked ? "#BA3131" : "#ccc",
          borderRadius: 30,
          transition: "0.3s",
        }}
      ></span>

      {/* Knob */}
      <span
        style={{
          position: "absolute",
          height: 22,
          width: 22,
          left: checked ? 26 : 2,
          top: 2,
          backgroundColor: "white",
          borderRadius: "50%",
          transition: "0.3s",
          boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
        }}
      ></span>
    </label>
  );
};

export default ThemeSwitch;

