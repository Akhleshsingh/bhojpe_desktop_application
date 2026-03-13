import React from "react";
import  calendericon from "../assets/calendar.png";
const DateInputWithIcon = React.forwardRef<
  HTMLInputElement,
  any
>(({ value, onClick, placeholder }, ref) => (
  <div
    onClick={onClick}
    style={{
      display: "flex",
      alignItems: "center",
      gap: "6px",
      height: "39px",
      padding: "0 10px",
      border: "1px solid #ced4da",
      borderRadius: "6px",
      background: "#fff",
      cursor: "pointer",
      minWidth: 140,
    }}
  >
    <img
      src={calendericon}
      alt="calendar"
      style={{ width: 16, height: 16 }}
    />
    <input
      ref={ref}
      value={value}
      placeholder={placeholder}
      readOnly
      style={{
        border: "none",
        outline: "none",
        fontSize: "13px",
        background: "transparent",
        cursor: "pointer",
        width: "100%",
      }}
    />
  </div>
));
