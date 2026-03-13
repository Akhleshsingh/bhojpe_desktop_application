import React from "react";
import supporticon1 from "../assets/supportnew.png";
import mail from "../assets/mailiconsupport.png";
import supporticon2 from "../assets/suppoericon2new.png";
import Bhojpeblack from "../assets/imp.png";

const Header: React.FC = () => {
  return (
    <div
      style={{
        backgroundColor: "#FFFFFF",
        borderBottom: "1px solid #E0E0E0",
        height: 90,                     // ⭐ balanced height
        padding: "0 24px",

        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      {/* 🔹 LEFT → LOGO */}
      <img
        src={Bhojpeblack}
        alt="Bhojpe Logo"
        style={{
          height: 148,                 // ⭐ fixed logo size
          objectFit: "contain",
          cursor: "pointer",
        }}
      />

      {/* 🔹 RIGHT → SUPPORT SECTION */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 18,                   // ⭐ even spacing
        }}
      >
        {/* Support Call */}
        <img
          src={supporticon1}
          alt="Support"
          style={{
            height: 42,
            objectFit: "contain",
            cursor: "pointer",
          }}
        />

        {/* Mail */}
        <img
          src={mail}
          alt="Mail"
          style={{
            height: 42,
            objectFit: "contain",
            cursor: "pointer",
          }}
        />

        {/* Secondary Support */}
        <img
          src={supporticon2}
          alt="Email Support"
          style={{
            height: 42,
            objectFit: "contain",
            cursor: "pointer",
          }}
        />
      </div>
    </div>
  );
};

export default Header;
