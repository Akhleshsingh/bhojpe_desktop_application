import React, { createContext, useContext, useState } from "react";

type OrderTypeCtx = {
  orderType: any;
  setOrderType: (t: any) => void;
};

const Ctx = createContext<OrderTypeCtx>({ orderType: "", setOrderType: () => {} });

export const OrderTypeProvider = ({ children }: { children: React.ReactNode }) => {
  const [orderType, setOrderType] = useState<any>("");
  return <Ctx.Provider value={{ orderType, setOrderType }}>{children}</Ctx.Provider>;
};

export const useOrderType = () => useContext(Ctx);
