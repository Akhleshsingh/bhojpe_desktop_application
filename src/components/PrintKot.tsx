import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import { useAuth } from "../context/AuthContext";

interface KotToggles {
  rest_name: boolean; branch_name: boolean; logo: boolean;
  kot_num: boolean; table: boolean; order_type: boolean; date_time: boolean;
  waiter: boolean; pax: boolean; order_id: boolean;
  item_name_bold: boolean; item_qty_large: boolean; item_price: boolean;
  item_notes: boolean; modifiers: boolean; veg_indicator: boolean;
  footer: boolean; copy_num: boolean; cut_paper: boolean;
}

const DEFAULT_KOT_TOGGLES: KotToggles = {
  rest_name:true, branch_name:true, logo:false,
  kot_num:true, table:true, order_type:true, date_time:true,
  waiter:true, pax:true, order_id:true,
  item_name_bold:true, item_qty_large:false, item_price:true,
  item_notes:true, modifiers:true, veg_indicator:true,
  footer:true, copy_num:false, cut_paper:true,
};

function loadKotSettings() {
  try {
    const raw = localStorage.getItem("bhojpe_kot_settings");
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

function loadPaperSettings() {
  try {
    const raw = localStorage.getItem("bhojpe_paper_settings");
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

export default function PrintKot() {
  const [data, setData] = useState<any>(null);
  const { branchData } = useAuth();

  useEffect(() => {
    window.onafterprint = () => { window.close(); };
  }, []);

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (!event.data) return;
      if (event.data?.type === "PRINT_KOT") {
        setData(event.data.payload);
        setTimeout(() => { window.print(); }, 300);
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  if (!data) return null;

  const { kot, order } = data;

  const kotSettings = loadKotSettings();
  const paperSettings = loadPaperSettings();
  const toggles: KotToggles = kotSettings?.toggles ?? DEFAULT_KOT_TOGGLES;
  const restName = kotSettings?.restaurant_name || branchData?.data?.restaurant?.name || "Restaurant";
  const branchName = kotSettings?.branch_name || "";
  const footerMsg = kotSettings?.footer || "";

  const paperW = paperSettings?.paper_size === "58mm" ? 200 : paperSettings?.paper_size === "A4" ? 380 : 280;
  const fontPx = paperSettings?.font_size?.includes("7") ? 10 : paperSettings?.font_size?.includes("12") ? 14 : 12;
  const lh = paperSettings?.line_spacing === "Compact" ? 1.4 : paperSettings?.line_spacing === "Wide" ? 2 : 1.7;

  const kotItems: any[] = kot?.items ?? [];
  const nowStr = dayjs().format("DD/MM/YY  hh:mm A");

  return (
    <div style={{ width: paperW, fontFamily: "'Courier New', Courier, monospace", fontSize: fontPx, lineHeight: lh, padding: "14px 12px", color: "#000", margin: "0 auto" }}>
      {/* Restaurant Header */}
      {toggles.rest_name && (
        <div style={{ textAlign: "center", fontWeight: 700, fontSize: fontPx * 1.2, textTransform: "uppercase", letterSpacing: "0.5px" }}>
          {restName}
        </div>
      )}
      {toggles.branch_name && branchName && (
        <div style={{ textAlign: "center", fontSize: fontPx * 0.9 }}>{branchName}</div>
      )}

      {/* KOT Title */}
      <div style={{ textAlign: "center", marginTop: 2 }}>KITCHEN ORDER TICKET</div>
      <div style={{ borderTop: "1px dashed #000", margin: "5px 0" }} />

      {/* Order Details */}
      {toggles.kot_num && (
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontWeight: 700 }}>KOT #{kot?.kot_number ?? kot?.kotNumber ?? "—"}</span>
          <span>{kot?.kitchen_name ?? ""}</span>
        </div>
      )}
      {toggles.order_id && order?.order_number && (
        <div>Order #{order.order_number}</div>
      )}
      {(toggles.table || toggles.pax) && (
        <div>
          {toggles.table && order?.table_number ? `Table: ${order.table_number}` : ""}
          {toggles.table && toggles.pax && order?.table_number && order?.pax ? "  |  " : ""}
          {toggles.pax && order?.pax ? `Pax: ${order.pax}` : ""}
        </div>
      )}
      {toggles.waiter && order?.waiter_name && <div>Waiter: {order.waiter_name}</div>}
      {toggles.date_time && <div>{nowStr}</div>}
      {toggles.order_type && order?.order_type && (
        <div>Order Type: {String(order.order_type).toUpperCase()}</div>
      )}

      <div style={{ borderTop: "1px dashed #000", margin: "5px 0" }} />

      {/* Items */}
      {kotItems.length === 0 ? (
        <div style={{ textAlign: "center" }}>No items</div>
      ) : (
        kotItems.map((item: any, idx: number) => {
          const name =
            item.menu_item?.item_name ||
            item.menu_item?.translations?.[0]?.item_name ||
            item.name ||
            "Item";
          const qty = item.quantity ?? item.qty ?? 0;
          const price = item.price ?? item.amount ?? item.menu_item?.price ?? 0;
          const note = item.note ?? "";
          const isVeg = item.menu_item?.is_veg ?? item.is_veg ?? true;

          return (
            <div key={item.id ?? idx} style={{ marginBottom: 4 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                {toggles.veg_indicator && (
                  <span style={{ color: isVeg ? "#000" : "#000", fontSize: fontPx * 0.85 }}>{isVeg ? "●" : "▲"}</span>
                )}
                <span style={{ fontWeight: toggles.item_name_bold ? 700 : 400, fontSize: toggles.item_qty_large ? fontPx * 1.1 : fontPx, flex: 1 }}>
                  {name}
                </span>
                <span style={{ fontWeight: 800, fontSize: toggles.item_qty_large ? fontPx * 1.3 : fontPx, minWidth: 28, textAlign: "right" }}>
                  {qty}×
                </span>
                {toggles.item_price && (
                  <span style={{ minWidth: 48, textAlign: "right" }}>₹{qty * price}</span>
                )}
              </div>
              {toggles.item_notes && note && (
                <div style={{ paddingLeft: 12, fontSize: fontPx * 0.85, fontStyle: "italic" }}>● {note}</div>
              )}
              {toggles.modifiers && item.modifiers?.length > 0 && (
                <div style={{ paddingLeft: 12, fontSize: fontPx * 0.85 }}>
                  {item.modifiers.map((m: any) => `+ ${m.name}`).join(", ")}
                </div>
              )}
            </div>
          );
        })
      )}

      <div style={{ borderTop: "1px dashed #000", margin: "5px 0" }} />

      {/* Footer */}
      {toggles.footer && footerMsg && (
        <div style={{ textAlign: "center", fontSize: fontPx * 0.9 }}>{footerMsg}</div>
      )}
      {toggles.copy_num && (
        <div style={{ textAlign: "center", fontWeight: 700 }}>— COPY 1 / 1 —</div>
      )}
      <div style={{ textAlign: "center", fontWeight: 400 }}>*** KITCHEN COPY ***</div>

      <style>{`
        @media print {
          body { margin: 0; padding: 0; }
          @page { margin: 0; size: ${paperW}px auto; }
        }
      `}</style>
    </div>
  );
}
