import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Box,
  Button,
  FormControl,
  Menu,
  MenuItem,
  Select
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { useState } from "react";

type Props = {
  activeType: string;
  onSelect: (type: string) => void;
  isTableView: boolean;
};

const buttonStyle = (active: boolean) => ({
  boxShadow: "0px 0px 4px 0px #00000040",
  backgroundColor: active ? "#000000" : "#FFFFFF",
  color: active ? "#fff" : "#000",
  textTransform: "none",
  flex: 1,
  minWidth: 0,
  height: "44px",
  border: active ? "1px solid #000000" : "0.5px solid #b7ababff",
  fontSize: 13,
  whiteSpace: "nowrap",
});

export default function OrderTypeSwitcher({
  activeType,
  onSelect,
  isTableView,
}: Props) {
  const navigate = useNavigate();
  const { branchData } = useAuth();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<string>("");

  const open = Boolean(anchorEl);

  const orderTypes =
    branchData?.data?.order_types?.filter(
      (o: any) => o.is_active === 1
    ) ?? [];

  const deliveryPlatforms =
    branchData?.data?.delivery_platforms?.filter(
      (p: any) => p.is_active === 1
    ) ?? [];

  const handleOpenMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleSelectPlatform = (name: string) => {
    setSelectedPlatform(name);
    handleCloseMenu();
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        flexWrap: "nowrap",
        overflowX: "hidden",
        width: "100%",
      }}
    >
      {/* ORDER TYPE BUTTONS */}
      {orderTypes.map((ot: any) => {
        const frontendType = ot.type;
        const isActive = activeType === frontendType;

        return (
          <Button
            key={ot.id}
            variant="contained"
            sx={buttonStyle(isActive) }
            onClick={() => onSelect(frontendType)}
          >
            {ot.order_type_name}
          </Button>
        );
      })}
     <FormControl
  variant="standard"
  sx={{
    minWidth: 90,
    flexShrink: 0,
    height: 44,
    justifyContent: "center",
  }}
>
  <Select
    value={selectedPlatform}
    onChange={(e) => setSelectedPlatform(e.target.value)}
    disableUnderline
    displayEmpty
    sx={{
      fontSize: "12px",
      fontWeight: 500,
      color: "#000",
      height: 44,
      "& .MuiSelect-select": {
        padding: "0 2px 0 0",
        display: "flex",
        alignItems: "right",
      },
      "& .MuiSelect-icon": {
        right: 0,
      },
    }}
    renderValue={(selected) =>
      selected ? selected : "Select Platform"
    }
  >
    {deliveryPlatforms.map((p: any) => (
      <MenuItem key={p.id} value={p.name}>
        {p.name}
      </MenuItem>
    ))}
  </Select>
</FormControl>
      {/* TABLE BUTTON */}
      {isTableView && (
        <Button
          variant="contained"
          sx={{
            boxShadow: "0px 0px 4px 0px #00000040",
            backgroundColor: "#fff",
            color: "#000",
            textTransform: "none",
            width: 147,
            height: 53,
            flexShrink: 0,
          }}
          onClick={() => navigate("/tables")}
        >
          Add Table
        </Button>
      )}
    </Box>
  );
}
