// import React from "react";
// import supporticon1 from "../assets/Group 82.png";
// import supporticon2 from "../assets/Group 83.png";

// const Footer: React.FC = () => {
//   return (
//     <div
//       style={{
//         width: "100%",
//         height: "65px",
//         backgroundColor: "#FFFFFF",
//         display: "flex",
      
//         borderTop: "1px solid #E0E0E0",
//         padding: "0 20px",
//       }}
//     >
//       <div
//         style={{
//           display: "flex",
//           alignItems: "start",
//           gap: "120px", // space between icons
//         }}
//       >
//         <img
//           src={supporticon1}
//           alt="Support"
//           style={{ width: "190px", cursor: "pointer" }}
//         />

//         <img
//           src={supporticon2}
//           alt="Email"
//           style={{ width: "250px", marginTop:'5px' , cursor: "pointer" }}
//         />
//       </div>
//     </div>
//   );
// };

// export default Footer;

import React from "react";
import supporticon1 from "../assets/Group 82.png";
import supporticon2 from "../assets/Group 83.png";

const Footer: React.FC = () => {
  return (
    <div
      style={{
        backgroundColor: "#FFFFFF",
        borderTop: "1px solid #E0E0E0",
        padding: "10px 20px",

        display: "flex",
        justifyContent: "center",
        alignItems: "center",

        flexWrap: "wrap",        
        gap: "20px",             
      }}
    >
    </div>
  );
};

export default Footer;
