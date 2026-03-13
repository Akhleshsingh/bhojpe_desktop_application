import React, { createContext, useContext, useState } from "react";

type OrderTypeCtx = {
  orderType: string;
  setOrderType: (t: string) => void;
};

const Ctx = createContext<OrderTypeCtx>({ orderType: "", setOrderType: () => {} });

export const OrderTypeProvider = ({ children }: { children: React.ReactNode }) => {
  const [orderType, setOrderType] = useState<string>("");
  return <Ctx.Provider value={{ orderType, setOrderType }}>{children}</Ctx.Provider>;
};

export const useOrderType = () => useContext(Ctx);
