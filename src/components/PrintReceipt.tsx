import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface BillToggles {
  logo: boolean; rest_name: boolean; address: boolean; phone: boolean;
  gstin: boolean; fssai: boolean; bill_num: boolean; table: boolean;
  date_time: boolean; waiter: boolean; pax: boolean; customer: boolean;
  gst_breakup: boolean; discount: boolean; delivery: boolean;
  round_off: boolean; amt_words: boolean; upi_qr: boolean;
  website: boolean; print_invoice: boolean; cut_paper: boolean;
}

const DEFAULT_BILL_TOGGLES: BillToggles = {
  logo: false, rest_name: true, address: true, phone: true,
  gstin: false, fssai: false, bill_num: true, table: true,
  date_time: true, waiter: true, pax: true, customer: false,
  gst_breakup: true, discount: true, delivery: false,
  round_off: false, amt_words: false, upi_qr: false,
  website: false, print_invoice: false, cut_paper: true,
};

function loadBillSettings() {
  try {
    const raw = localStorage.getItem("bhojpe_bill_settings");
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

function numToWords(n: number): string {
  const ones = ["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine",
    "Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"];
  const tens = ["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];
  if (n === 0) return "Zero";
  if (n < 20) return ones[n];
  if (n < 100) return tens[Math.floor(n/10)] + (n%10?" "+ones[n%10]:"");
  if (n < 1000) return ones[Math.floor(n/100)]+" Hundred"+(n%100?" "+numToWords(n%100):"");
  if (n < 100000) return numToWords(Math.floor(n/1000))+" Thousand"+(n%1000?" "+numToWords(n%1000):"");
  return numToWords(Math.floor(n/100000))+" Lakh"+(n%100000?" "+numToWords(n%100000):"");
}

export default function PrintReceipt() {
  const { branchData } = useAuth();
  const [data, setData] = useState<any>(null);
  const location = useLocation();

  useEffect(() => {
    window.onafterprint = () => { window.close(); };
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tokenFromUrl = params.get("token");
    if (tokenFromUrl) { localStorage.setItem("token", tokenFromUrl); }
  }, [location.search]);

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (!event.data) return;
      if (event.data?.type === "PRINT_ORDER" || event.data?.type === "PRINT_KOT") {
        setData(event.data.payload);
        setTimeout(() => { window.print(); }, 300);
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  if (!data) return null;

  const { order, items, kot, cart } = data;

  const billSettings = loadBillSettings();
  const paperSettings = loadPaperSettings();
  const toggles: BillToggles = billSettings?.toggles ?? DEFAULT_BILL_TOGGLES;

  const restName = billSettings?.restaurant_name || branchData?.data?.restaurant?.name || "Restaurant";
  const address = billSettings?.address || branchData?.data?.restaurant?.address || "";
  const phone = billSettings?.phone || (branchData?.data?.restaurant ? `+${branchData.data.restaurant.phone_code} ${branchData.data.restaurant.phone_number}` : "");
  const gstin = billSettings?.gstin || "";
  const fssai = billSettings?.fssai || "";
  const upiId = billSettings?.upi_id || "";
  const footer1 = billSettings?.footer_line1 || "Thank you for visiting!";
  const footer2 = billSettings?.footer_line2 || "Visit Again";
  const email = billSettings?.email || "";

  const paperW = paperSettings?.paper_size === "58mm" ? 200 : paperSettings?.paper_size === "A4" ? 380 : 280;
  const fontPx = paperSettings?.font_size?.includes("7") ? 10 : paperSettings?.font_size?.includes("12") ? 14 : 12;
  const lh = paperSettings?.line_spacing === "Compact" ? 1.4 : paperSettings?.line_spacing === "Wide" ? 2 : 1.7;

  const sourceItems = items || cart || kot?.items || [];
  const printItems = sourceItems.map((i: any) => ({
    id: i.id,
    name: i.name || i.menu_item?.item_name || i.menu_item?.translations?.[0]?.item_name || "Item",
    qty: i.qty ?? i.quantity ?? 0,
    price: i.price ?? 0,
    note: i.note ?? "",
  }));

  const subTotal = order?.sub_total ?? printItems.reduce((s: number, i: any) => s + (i.qty * i.price), 0);
  const tax = order?.total_tax_amount ?? 0;
  const cgst = +(tax / 2).toFixed(2);
  const sgst = +(tax / 2).toFixed(2);
  const discount = order?.discount_amount ?? 0;
  const delivery = order?.delivery_charge ?? 0;
  const total = order?.total ?? (subTotal + tax - discount + delivery);
  const totalInt = Math.round(total);

  const orderDate = order?.created_at ? dayjs(order.created_at).format("DD/MM/YY  hh:mm A") : dayjs().format("DD/MM/YY  hh:mm A");

  return (
    <div style={{ width: paperW, fontFamily: "'Courier New', Courier, monospace", fontSize: fontPx, lineHeight: lh, padding: "14px 12px", color: "#000", margin: "0 auto" }}>

      {/* Restaurant Header */}
      {toggles.rest_name && (
        <div style={{ textAlign: "center", fontWeight: 700, fontSize: fontPx * 1.2, textTransform: "uppercase", letterSpacing: "0.5px" }}>
          {restName}
        </div>
      )}
      {toggles.address && address && (
        <div style={{ textAlign: "center", fontSize: fontPx * 0.85 }}>{address}</div>
      )}
      {toggles.phone && phone && (
        <div style={{ textAlign: "center", fontSize: fontPx * 0.85 }}>Ph: {phone}</div>
      )}
      {toggles.gstin && gstin && (
        <div style={{ textAlign: "center", fontSize: fontPx * 0.8 }}>GSTIN: {gstin}</div>
      )}
      {toggles.fssai && fssai && (
        <div style={{ textAlign: "center", fontSize: fontPx * 0.8 }}>FSSAI: {fssai}</div>
      )}

      <div style={{ borderTop: "1px dashed #000", margin: "5px 0" }} />

      {toggles.print_invoice && (
        <div style={{ textAlign: "center", fontWeight: 700, letterSpacing: "1px" }}>TAX INVOICE</div>
      )}
      {!toggles.print_invoice && (
        <div style={{ textAlign: "center", fontWeight: 700 }}>BILL / RECEIPT</div>
      )}

      <div style={{ borderTop: "1px dashed #000", margin: "5px 0" }} />

      {/* Bill Details */}
      {toggles.bill_num && (
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Bill #: {order?.show_formatted_order_number || order?.order_number || "—"}</span>
        </div>
      )}
      {toggles.date_time && <div>Date: {orderDate}</div>}
      {toggles.table && order?.table_number && (
        <div>
          Table: {order.table_number}
          {toggles.pax && order?.pax ? `  |  Pax: ${order.pax}` : ""}
        </div>
      )}
      {toggles.waiter && order?.waiter_name && <div>Waiter: {order.waiter_name}</div>}
      {toggles.customer && order?.customer_name && <div>Customer: {order.customer_name}</div>}

      <div style={{ borderTop: "1px dashed #000", margin: "5px 0" }} />

      {/* Items Header */}
      <div style={{ display: "flex", fontWeight: 700, fontSize: fontPx * 0.9 }}>
        <span style={{ flex: 1 }}>Item</span>
        <span style={{ width: 28, textAlign: "center" }}>Qty</span>
        <span style={{ width: 54, textAlign: "right" }}>Amt</span>
      </div>
      <div style={{ borderTop: "1px solid #000", marginBottom: 4 }} />

      {/* Items */}
      {printItems.length === 0 ? (
        <div style={{ textAlign: "center" }}>No items</div>
      ) : (
        printItems.map((i: any, idx: number) => (
          <div key={i.id ?? idx} style={{ marginBottom: 3 }}>
            <div style={{ display: "flex" }}>
              <span style={{ flex: 1 }}>{i.name}</span>
              <span style={{ width: 28, textAlign: "center" }}>{i.qty}</span>
              <span style={{ width: 54, textAlign: "right" }}>₹{i.qty * i.price}</span>
            </div>
            {i.note && (
              <div style={{ paddingLeft: 8, fontSize: fontPx * 0.85, fontStyle: "italic" }}>● {i.note}</div>
            )}
          </div>
        ))
      )}

      <div style={{ borderTop: "1px dashed #000", margin: "5px 0" }} />

      {/* Totals */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span>Subtotal</span><span>₹{subTotal}</span>
      </div>
      {toggles.discount && discount > 0 && (
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Discount</span><span>-₹{discount}</span>
        </div>
      )}
      {toggles.gst_breakup && tax > 0 ? (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: fontPx * 0.85 }}>
            <span>CGST 2.5%</span><span>₹{cgst}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: fontPx * 0.85 }}>
            <span>SGST 2.5%</span><span>₹{sgst}</span>
          </div>
        </>
      ) : tax > 0 ? (
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Tax</span><span>₹{tax}</span>
        </div>
      ) : null}
      {toggles.delivery && delivery > 0 && (
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Delivery Charge</span><span>₹{delivery}</span>
        </div>
      )}
      {toggles.round_off && (
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: fontPx * 0.85 }}>
          <span>Round Off</span><span>₹{(totalInt - total).toFixed(2)}</span>
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: fontPx * 1.15, marginTop: 4, borderTop: "1px solid #000", paddingTop: 3 }}>
        <span>TOTAL</span><span>₹{totalInt}</span>
      </div>
      {toggles.amt_words && (
        <div style={{ fontSize: fontPx * 0.8, fontStyle: "italic", marginTop: 2 }}>
          Amount: {numToWords(totalInt)} Rupees Only
        </div>
      )}

      {/* UPI QR */}
      {toggles.upi_qr && (
        <div style={{ textAlign: "center", margin: "8px 0", fontSize: fontPx * 0.85 }}>
          <div style={{ border: "1px solid #000", display: "inline-block", padding: "4px", margin: "4px auto", fontSize: fontPx * 2.5 }}>▪▫▪</div>
          <div>UPI: {upiId || "scan to pay"}</div>
        </div>
      )}

      <div style={{ borderTop: "1px dashed #000", margin: "5px 0" }} />

      {/* Footer */}
      {footer1 && <div style={{ textAlign: "center", fontSize: fontPx * 0.9 }}>{footer1}</div>}
      {footer2 && <div style={{ textAlign: "center", fontSize: fontPx * 0.9 }}>{footer2}</div>}
      {toggles.website && email && (
        <div style={{ textAlign: "center", fontSize: fontPx * 0.8 }}>{email}</div>
      )}

      <style>{`
        @media print {
          body { margin: 0; padding: 0; }
          @page { margin: 0; size: ${paperW}px auto; }
        }
      `}</style>
    </div>
  );
}
