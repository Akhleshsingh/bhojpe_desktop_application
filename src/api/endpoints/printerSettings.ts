/**
 * BhojPe — Printer / KDS / LED Settings API Layer
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │  ENDPOINT MAP — Production API ready होने पर सिर्फ यहाँ URL बदलें     │
 * │  Base URL src/utils/api.tsx → BASE_URL से auto-inject होता है          │
 * └─────────────────────────────────────────────────────────────────────────┘
 *
 * Endpoints:
 *
 *  Kitchens
 *    GET    /kitchens              → सभी kitchens list
 *    POST   /kitchens              → नई kitchen add करें
 *    PUT    /kitchens/:id          → kitchen update करें
 *    DELETE /kitchens/:id          → kitchen delete करें
 *
 *  Printers
 *    GET    /printers              → सभी printers list
 *    POST   /printers              → नया printer add करें
 *    PUT    /printers/:id          → printer update करें
 *    DELETE /printers/:id          → printer delete करें
 *    POST   /printers/:id/test     → test print भेजें
 *
 *  KOT / Bill / Direct / Paper Settings
 *    GET    /print-settings/kot    → KOT settings load
 *    POST   /print-settings/kot    → KOT settings save
 *    GET    /print-settings/bill   → Bill settings load
 *    POST   /print-settings/bill   → Bill settings save
 *    GET    /print-settings/direct → Direct print settings load
 *    POST   /print-settings/direct → Direct print settings save
 *    GET    /print-settings/paper  → Paper settings load
 *    POST   /print-settings/paper  → Paper settings save
 *
 *  KDS Settings
 *    GET    /kds-settings          → KDS config load
 *    POST   /kds-settings          → KDS config save
 *
 *  KDS Screens
 *    GET    /kds-screens           → screens list
 *    POST   /kds-screens           → screen add
 *    PUT    /kds-screens/:id       → screen update
 *    DELETE /kds-screens/:id       → screen delete
 *
 *  LED Settings
 *    GET    /led-settings          → LED config load
 *    POST   /led-settings          → LED config save
 *
 *  LED Images
 *    GET    /led-images            → images list
 *    POST   /led-images            → image upload (FormData)
 *    PUT    /led-images/:id        → duration/order update
 *    DELETE /led-images/:id        → image delete
 */

import client from "../client";
import dummy from "../../data/printerSettingsDummyData.json";

// ─── Endpoint URLs ────────────────────────────────────────────────────────────
// ⚠️  Production API ready होने पर सिर्फ इन values को बदलें
const EP = {
  // Kitchens
  KITCHENS:          "/kitchens",
  KITCHEN_BY_ID:     (id: string) => `/kitchens/${id}`,
  KITCHEN_TEST:      (id: string) => `/kitchens/${id}/test`,

  // Printers
  PRINTERS:          "/printers",
  PRINTER_BY_ID:     (id: string) => `/printers/${id}`,
  PRINTER_TEST:      (id: string) => `/printers/${id}/test`,
  PRINTER_TEST_ALL:  "/printers/test-all",

  // Print Settings (KOT / Bill / Direct / Paper)
  KOT_SETTINGS:      "/print-settings/kot",
  BILL_SETTINGS:     "/print-settings/bill",
  DIRECT_PRINT:      "/print-settings/direct",
  PAPER_SETTINGS:    "/print-settings/paper",

  // KDS
  KDS_SETTINGS:      "/kds-settings",
  KDS_SCREENS:       "/kds-screens",
  KDS_SCREEN_BY_ID:  (id: string) => `/kds-screens/${id}`,
  KDS_CONNECT_TEST:  "/kds-settings/test",

  // LED
  LED_SETTINGS:      "/led-settings",
  LED_IMAGES:        "/led-images",
  LED_IMAGE_BY_ID:   (id: string) => `/led-images/${id}`,
} as const;

// ─── API Response Types ───────────────────────────────────────────────────────

export interface Kitchen {
  id: string;
  name: string;
  color: string;
  printer: string;
  printer_id: string;
  categories: string[];
  online: boolean;
  auto_kot: boolean;
  show_notes: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PrinterDevice {
  id: string;
  name: string;
  model: string;
  conn: "wifi" | "lan" | "bt" | "usb" | "cash";
  ip: string;
  port: string;
  paper_size: string;
  copies: string;
  encoding: string;
  function: string;
  print_type: "kot" | "bill" | "both";
  auto_print: boolean;
  active: boolean;
  status: "online" | "offline" | "warn";
  icon: string;
  created_at?: string;
}

export interface KotSettings {
  restaurant_name: string;
  branch_name: string;
  footer: string;
  toggles: {
    rest_name: boolean;
    branch_name: boolean;
    logo: boolean;
    kot_num: boolean;
    table: boolean;
    order_type: boolean;
    date_time: boolean;
    waiter: boolean;
    pax: boolean;
    order_id: boolean;
    item_name_bold: boolean;
    item_qty_large: boolean;
    item_price: boolean;
    item_notes: boolean;
    modifiers: boolean;
    veg_indicator: boolean;
    footer: boolean;
    copy_num: boolean;
    cut_paper: boolean;
  };
}

export interface BillSettings {
  restaurant_name: string;
  address: string;
  phone: string;
  gstin: string;
  fssai: string;
  email: string;
  upi_id: string;
  footer_line1: string;
  footer_line2: string;
  copies: string;
  toggles: {
    logo: boolean;
    rest_name: boolean;
    address: boolean;
    phone: boolean;
    gstin: boolean;
    fssai: boolean;
    bill_num: boolean;
    table: boolean;
    date_time: boolean;
    waiter: boolean;
    pax: boolean;
    customer: boolean;
    gst_breakup: boolean;
    discount: boolean;
    delivery: boolean;
    round_off: boolean;
    amt_words: boolean;
    upi_qr: boolean;
    website: boolean;
    print_invoice: boolean;
    cut_paper: boolean;
  };
}

export interface DirectPrintSettings {
  kot_direct: boolean;
  bill_direct: boolean;
  auto_kot_on_add: boolean;
  auto_bill_on_checkout: boolean;
  open_drawer: boolean;
  ebill_send: boolean;
  kot_sound: boolean;
  new_order_sound: boolean;
  reprint_confirm: boolean;
  partial_kot: boolean;
}

export interface PaperSettings {
  paper_size: string;
  chars_per_line: string;
  font_size: string;
  line_spacing: string;
}

export interface KdsSettings {
  ip: string;
  conn_type: string;
  cols: string;
  card_size: string;
  theme: string;
  font_size: string;
  normal_min: string;
  warn_min: string;
  crit_min: string;
  blink_on_critical: boolean;
  sound_on_critical: boolean;
  toggles: {
    auto_send: boolean;
    show_timer: boolean;
    sound_alert: boolean;
    auto_remove: boolean;
    order_type: boolean;
    customer_name: boolean;
    platform: boolean;
  };
}

export interface KdsScreen {
  id: string;
  name: string;
  ip: string;
  desc: string;
  status: "online" | "offline";
  categories: string[];
}

export interface LedSettings {
  default_duration: string;
  transition: string;
  transition_speed: string;
  image_fit: string;
  orientation: string;
  loop: boolean;
  toggles: {
    customer_display: boolean;
    auto_start: boolean;
    pause_on_order: boolean;
  };
}

export interface LedImage {
  id: string;
  name: string;
  size: string;
  duration: number;
  src: string;
}

// ─── Kitchens API ─────────────────────────────────────────────────────────────

export async function getKitchens(): Promise<Kitchen[]> {
  try {
    const res = await client.get(EP.KITCHENS);
    return res.data?.data ?? res.data;
  } catch {
    return dummy.kitchens.data as Kitchen[];
  }
}

export async function addKitchen(payload: Omit<Kitchen, "id" | "created_at" | "updated_at">): Promise<Kitchen> {
  const res = await client.post(EP.KITCHENS, payload);
  return res.data?.data ?? res.data;
}

export async function updateKitchen(id: string, payload: Partial<Kitchen>): Promise<Kitchen> {
  const res = await client.put(EP.KITCHEN_BY_ID(id), payload);
  return res.data?.data ?? res.data;
}

export async function deleteKitchen(id: string): Promise<void> {
  await client.delete(EP.KITCHEN_BY_ID(id));
}

export async function testKitchenPrinter(id: string): Promise<void> {
  await client.post(EP.KITCHEN_TEST(id), {});
}

// ─── Printers API ─────────────────────────────────────────────────────────────

export async function getPrinters(): Promise<PrinterDevice[]> {
  try {
    const res = await client.get(EP.PRINTERS);
    return res.data?.data ?? res.data;
  } catch {
    return dummy.printers.data as PrinterDevice[];
  }
}

export async function addPrinter(payload: Omit<PrinterDevice, "id" | "status" | "created_at">): Promise<PrinterDevice> {
  const res = await client.post(EP.PRINTERS, payload);
  return res.data?.data ?? res.data;
}

export async function updatePrinter(id: string, payload: Partial<PrinterDevice>): Promise<PrinterDevice> {
  const res = await client.put(EP.PRINTER_BY_ID(id), payload);
  return res.data?.data ?? res.data;
}

export async function deletePrinter(id: string): Promise<void> {
  await client.delete(EP.PRINTER_BY_ID(id));
}

export async function testPrinter(id: string): Promise<void> {
  await client.post(EP.PRINTER_TEST(id), {});
}

export async function testAllPrinters(): Promise<void> {
  await client.post(EP.PRINTER_TEST_ALL, {});
}

// ─── KOT Settings API ─────────────────────────────────────────────────────────

export async function getKotSettings(): Promise<KotSettings> {
  try {
    const res = await client.get(EP.KOT_SETTINGS);
    return res.data?.data ?? res.data;
  } catch {
    return dummy.kot_settings.data as KotSettings;
  }
}

export async function saveKotSettings(payload: KotSettings): Promise<void> {
  await client.post(EP.KOT_SETTINGS, payload);
}

// ─── Bill Settings API ────────────────────────────────────────────────────────

export async function getBillSettings(): Promise<BillSettings> {
  try {
    const res = await client.get(EP.BILL_SETTINGS);
    return res.data?.data ?? res.data;
  } catch {
    return dummy.bill_settings.data as BillSettings;
  }
}

export async function saveBillSettings(payload: BillSettings): Promise<void> {
  await client.post(EP.BILL_SETTINGS, payload);
}

// ─── Direct Print Settings API ────────────────────────────────────────────────

export async function getDirectPrintSettings(): Promise<DirectPrintSettings> {
  try {
    const res = await client.get(EP.DIRECT_PRINT);
    return res.data?.data ?? res.data;
  } catch {
    return dummy.direct_print.data as DirectPrintSettings;
  }
}

export async function saveDirectPrintSettings(payload: DirectPrintSettings): Promise<void> {
  await client.post(EP.DIRECT_PRINT, payload);
}

// ─── Paper Settings API ───────────────────────────────────────────────────────

export async function getPaperSettings(): Promise<PaperSettings> {
  try {
    const res = await client.get(EP.PAPER_SETTINGS);
    return res.data?.data ?? res.data;
  } catch {
    return dummy.paper_settings.data as PaperSettings;
  }
}

export async function savePaperSettings(payload: PaperSettings): Promise<void> {
  await client.post(EP.PAPER_SETTINGS, payload);
}

// ─── KDS Settings API ─────────────────────────────────────────────────────────

export async function getKdsSettings(): Promise<KdsSettings> {
  try {
    const res = await client.get(EP.KDS_SETTINGS);
    return res.data?.data ?? res.data;
  } catch {
    return dummy.kds_settings.data as KdsSettings;
  }
}

export async function saveKdsSettings(payload: KdsSettings): Promise<void> {
  await client.post(EP.KDS_SETTINGS, payload);
}

export async function testKdsConnection(): Promise<{ connected: boolean; latency_ms: number }> {
  const res = await client.post(EP.KDS_CONNECT_TEST, {});
  return res.data?.data ?? { connected: false, latency_ms: 0 };
}

// ─── KDS Screens API ──────────────────────────────────────────────────────────

export async function getKdsScreens(): Promise<KdsScreen[]> {
  try {
    const res = await client.get(EP.KDS_SCREENS);
    return res.data?.data ?? res.data;
  } catch {
    return dummy.kds_screens.data as KdsScreen[];
  }
}

export async function addKdsScreen(payload: Omit<KdsScreen, "id">): Promise<KdsScreen> {
  const res = await client.post(EP.KDS_SCREENS, payload);
  return res.data?.data ?? res.data;
}

export async function updateKdsScreen(id: string, payload: Partial<KdsScreen>): Promise<KdsScreen> {
  const res = await client.put(EP.KDS_SCREEN_BY_ID(id), payload);
  return res.data?.data ?? res.data;
}

export async function deleteKdsScreen(id: string): Promise<void> {
  await client.delete(EP.KDS_SCREEN_BY_ID(id));
}

// ─── LED Settings API ─────────────────────────────────────────────────────────

export async function getLedSettings(): Promise<LedSettings> {
  try {
    const res = await client.get(EP.LED_SETTINGS);
    return res.data?.data ?? res.data;
  } catch {
    return dummy.led_settings.data as LedSettings;
  }
}

export async function saveLedSettings(payload: LedSettings): Promise<void> {
  await client.post(EP.LED_SETTINGS, payload);
}

// ─── LED Images API ───────────────────────────────────────────────────────────

export async function getLedImages(): Promise<LedImage[]> {
  try {
    const res = await client.get(EP.LED_IMAGES);
    return res.data?.data ?? res.data;
  } catch {
    return dummy.led_images.data as LedImage[];
  }
}

export async function uploadLedImage(file: File, duration: number): Promise<LedImage> {
  const form = new FormData();
  form.append("image", file);
  form.append("duration", String(duration));
  const res = await client.post(EP.LED_IMAGES, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data?.data ?? res.data;
}

export async function updateLedImage(id: string, payload: { duration?: number; order?: number }): Promise<LedImage> {
  const res = await client.put(EP.LED_IMAGE_BY_ID(id), payload);
  return res.data?.data ?? res.data;
}

export async function deleteLedImage(id: string): Promise<void> {
  await client.delete(EP.LED_IMAGE_BY_ID(id));
}

// ─── Convenience: Load all settings at once ────────────────────────────────────
export async function loadAllPrinterSettings() {
  const [kitchens, printers, kotSettings, billSettings, directPrint, paperSettings, kdsSettings, kdsScreens, ledSettings, ledImages] = await Promise.allSettled([
    getKitchens(),
    getPrinters(),
    getKotSettings(),
    getBillSettings(),
    getDirectPrintSettings(),
    getPaperSettings(),
    getKdsSettings(),
    getKdsScreens(),
    getLedSettings(),
    getLedImages(),
  ]);

  return {
    kitchens:      kitchens.status      === "fulfilled" ? kitchens.value      : dummy.kitchens.data,
    printers:      printers.status      === "fulfilled" ? printers.value      : dummy.printers.data,
    kotSettings:   kotSettings.status   === "fulfilled" ? kotSettings.value   : dummy.kot_settings.data,
    billSettings:  billSettings.status  === "fulfilled" ? billSettings.value  : dummy.bill_settings.data,
    directPrint:   directPrint.status   === "fulfilled" ? directPrint.value   : dummy.direct_print.data,
    paperSettings: paperSettings.status === "fulfilled" ? paperSettings.value : dummy.paper_settings.data,
    kdsSettings:   kdsSettings.status   === "fulfilled" ? kdsSettings.value   : dummy.kds_settings.data,
    kdsScreens:    kdsScreens.status    === "fulfilled" ? kdsScreens.value    : dummy.kds_screens.data,
    ledSettings:   ledSettings.status   === "fulfilled" ? ledSettings.value   : dummy.led_settings.data,
    ledImages:     ledImages.status     === "fulfilled" ? ledImages.value     : dummy.led_images.data,
  };
}
