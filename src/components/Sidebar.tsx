// src/components/Sidebar.tsx
// import React from "react";
// import { Box, Button } from "@mui/material";

// type Props = {
//   categories: string[];
//   selected: string;
//   onSelect: (c: string) => void;
// };

// export default function Sidebar({ categories, selected, onSelect }: Props) {
//   return (
//     <Box
//       sx={{
//         width: "190px",
//         height: "890px",
//         backgroundColor: "#F5F5F5",
//         borderRadius: "0px",
//         overflowY: "auto",
//         fontFamily: "Poppins",
//       }}
//     >
//       {categories.map((cat, idx) => {
//         // FIGMA COLORS
//         const bgColor =
//           idx === 0
//             ? "#2C72C7"
//             : idx === 1
//             ? "#287752"
//             : "#3D3636A3";

//         const isSelected = selected === cat;

//         return (
//           <Button
//             key={cat}
//             onClick={() => onSelect(cat)}
//             sx={{
//               width: "100%",
//               height: "48px",
//               justifyContent: "flex-start",
//               textTransform: "none",
//               borderRadius: "0px",
//               mb: 0,
//               backgroundColor: isSelected ? "#000000" : bgColor,
//               color: "#FFFFFF",
//                border : "1px solid #C3C3C3",
//               fontSize: "15px",
//               fontWeight: 400,
//               letterSpacing: "0.05em",

//               "&:hover": {
//                 backgroundColor: isSelected ? "#000000" : bgColor,
//               },
//             }}
//           >
//             {cat}
//           </Button>
//         );
//       })}
//     </Box>
//   );
// }
import React from "react";
import { Box, Button } from "@mui/material";

type Menu = {
  id: number;
  menu_name: { en: string };
};

type Props = {
  menus: Menu[];
  selectedMenuId: number | null;
  onSelect: (menu: Menu) => void;
};

export default function Sidebar({ menus, selectedMenuId, onSelect }: Props) {
  return (
    <Box
      sx={{
       width: "100%",
        height: "91%", 
        backgroundColor: "#F5F5F5",
        overflowY: "auto",     
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        fontFamily: "Poppins",              
               overflow :'auto', 
      }}
    >
      {menus.map((menu, idx) => {
        const isSelected = selectedMenuId === menu.id;

        return (
          <Button
            key={menu.id}
            onClick={() => onSelect(menu)}
            sx={{
              width: "100%",
              height: "48px",
              justifyContent: "flex-start",
              textTransform: "none",
              borderRadius: 0,
              backgroundColor: isSelected ? "#C5D89D " : "#F6F0D7",
              color: "#000",
              borderBottom: "1px solid #C3C3C3",
              "&:hover": {
             backgroundColor: isSelected ? "#C5D89D " : "#F6F0D7",
              },
            }}
          >
            {menu.menu_name.en}
          </Button>
        );
      })}
    </Box>
  );
}
