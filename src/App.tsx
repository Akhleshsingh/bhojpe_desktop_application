import { HashRouter, Routes, Route } from "react-router-dom";
import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Login from "./Pages/Login";
import Dashboard from "./Pages/Dashboard";
import DashboardFull from "./Pages/DashboardFull";
import MyOrders from "./Pages/MyOrders";
import NewOrdersPage from "./Pages/NewOrder";
import OrdersHistory from "./Pages/OrdersHistory";
import { NetworkProvider } from "./context/NetworkContext";
import { ThemeProvider } from "./Theme/ThemeContext";
import "./styles/Theme.css";
import ClickSoundProvider from "./context/ClickSoundProvider";
import { OrdersProvider } from "./context/OrdersContext";
import { WaitersProvider } from "./context/WaitersContext";
import Waiters from "./Pages/Waiters";
import { TablesProvider } from "./context/TablesContext";
import Tables from "./Pages/Tables";
import type { Order } from "./types/order";
import MainDashboard from "./Pages/MainDashboard";
import DashboardLayout from "./Pages/DashboardLayout";
import { CustomersProvider } from "./context/CustomerContext";
import Customers from "./Pages/Customers";
import { KotProvider } from "./context/KotContext";
import KOTPage from "./components/KOTPage";
import { InventoryProvider } from "./context/InventoryContext";
import InventoryPage from "./CommonPages/InventoryPage";
import WaiterRequests from "./CommonPages/WaiterRequests";
import Reservations from "./CommonPages/Reservations";
import Operations from "./CommonPages/Operations";
import Reports from "./CommonPages/Reports";
import Kitchens from "./CommonPages/Kitchens";
import Updates from "./CommonPages/Updates";
import Payments from "./CommonPages/Payments";
import "react-datepicker/dist/react-datepicker.css";
import PrintReceipt from "./components/PrintReceipt";
import DuePayments from "./CommonPages/DuePayments";
import PrintKot from "./components/PrintKot";
import SetPasskey from "./Pages/setPasskey";
import ResetPasskey from "./Pages/ResetPasskey";
import ProtectedRoute from "./ProtectedRoute";
import PrintAllKot from "./components/PrintAllKot";
import { DeliveryExecutivesProvider } from "./context/DeliveryExecutive";
import StaffPage from "./CommonPages/StaffPage";
import PrintReceiptPage from "./components/PrintReceiptPage";
import { Toaster } from "react-hot-toast";
import AllKitchenKot from "./CommonPages/AllKitchenKot";
import DeliveryExecutivesPage from "./CommonPages/DeliveryExecutivesPage";
import PrinterSettings from "./CommonPages/PrinterSettings";
import Poss from "./Pages/Poss";
export default function App() {
  const [savedOrders, setSavedOrders] = useState<Order[]>([]);

  const handleSaveOrder = (newOrder: Omit<Order, "id">) => {
    setSavedOrders((prev) => [...prev, { id: prev.length + 1, ...newOrder }]);
  };

  return (
    <ThemeProvider>
      <Toaster
        position="top-right"
        containerStyle={{
          top: "70px",
          right: "20px",
        }}
        toastOptions={{
          style: {
            background: "#fff",
            color: "#2f2f2f",
            fontSize: "17px",
            padding: "18px 26px",
            borderRadius: "12px",
            minWidth: "350px",
            textAlign: "center",
          },
        }}
      />
      <InventoryProvider>
        <KotProvider>
          <CustomersProvider>
            <TablesProvider>
              <DeliveryExecutivesProvider>
                {" "}
                <WaitersProvider>
                  <OrdersProvider>
                    <NetworkProvider>
                      <div className="app-wrapper" style={{ overflow: "auto" }}>
                        <ClickSoundProvider />
                        <HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                          <Routes>
                            <Route path="/" element={<Login />} />

                            <Route
                              path="/tables"
                              element={
                                <DashboardLayout>
                                  <Dashboard />
                                </DashboardLayout>
                              }
                            />
                            <Route
                              path="/dashboard"
                              element={
                                <DashboardLayout>
                                  <MainDashboard />
                                </DashboardLayout>
                              }
                            />
                            <Route
                              path="/menudashboard"
                              element={
                                <DashboardLayout noPad>
                                  <DashboardFull
                                    savedOrders={savedOrders}
                                    onSaveOrder={handleSaveOrder}
                                  />
                                </DashboardLayout>
                              }
                            />

                            <Route
                              path="/myorders"
                              element={
                                <DashboardLayout>
                                  <MyOrders />
                                </DashboardLayout>
                              }
                            />
                            <Route
                              path="/neworders"
                              element={
                                <DashboardLayout>
                                  <NewOrdersPage />
                                </DashboardLayout>
                              }
                            />
                            <Route
                              path="/waiters"
                              element={
                                <DashboardLayout>
                                  <Waiters />
                                </DashboardLayout>
                              }
                            />
                            {/* Orders History Page */}
                            <Route
                              path="/orders"
                              element={
                                <DashboardLayout>
                                  <OrdersHistory />
                                </DashboardLayout>
                              }
                            />

                            <Route
                              path="/customers"
                              element={
                                <DashboardLayout>
                                  <Customers />
                                </DashboardLayout>
                              }
                            />
                            <Route
                              path="/manage-tables"
                              element={
                                <DashboardLayout>
                                  <Tables />
                                </DashboardLayout>
                              }
                            />
                            <Route
                              path="/kot"
                              element={
                                <DashboardLayout>
                                  <KOTPage />
                                </DashboardLayout>
                              }
                            />
                            <Route
                              path="/set-passkey"
                              element={
                                <DashboardLayout>
                                  <SetPasskey />
                                </DashboardLayout>
                              }
                            />
                            <Route
                              path="/reset-passkey"
                              element={
                                <DashboardLayout>
                                  <ResetPasskey />
                                </DashboardLayout>
                              }
                            />

                            <Route path="/poss" element={<Poss />} />
                            <Route path="/print" element={<PrintReceipt />} />
                            <Route path="/print-kot" element={<PrintKot />} />
                            <Route
                              path="/print-all-kot"
                              element={<PrintAllKot />}
                            />
                            <Route
                              path="/print-receipt"
                              element={<PrintReceiptPage />}
                            />
                            <Route
                              path="/inventory"
                              element={
                                <DashboardLayout>
                                  <InventoryPage />
                                </DashboardLayout>
                              }
                            />

                            <Route
                              path="/operations"
                              element={
                                <DashboardLayout>
                                  <Operations />
                                </DashboardLayout>
                              }
                            />

                            <Route
                              path="/waiter-requests"
                              element={
                                <DashboardLayout>
                                  <WaiterRequests />
                                </DashboardLayout>
                              }
                            />

                            <Route
                              path="/reservations"
                              element={
                                <DashboardLayout>
                                  <Reservations />
                                </DashboardLayout>
                              }
                            />
                            <Route
                              path="/payments"
                              element={
                                <DashboardLayout>
                                  <Payments />
                                </DashboardLayout>
                              }
                            />
                            <Route
                              path="/due-payments"
                              element={
                                <DashboardLayout>
                                  <DuePayments />
                                </DashboardLayout>
                              }
                            />

                            <Route
                              path="/reports"
                              element={
                                <DashboardLayout>
                                  <Reports />
                                </DashboardLayout>
                              }
                            />
                            <Route
                              path="/staff"
                              element={
                                <DashboardLayout>
                                  <StaffPage />
                                </DashboardLayout>
                              }
                            />
                            <Route
                              path="/kitchens"
                              element={
                                <DashboardLayout>
                                  <Kitchens />
                                </DashboardLayout>
                              }
                            />
                            <Route
                              path="/kots"
                              element={
                                <DashboardLayout>
                                  <AllKitchenKot />
                                </DashboardLayout>
                              }
                            />
                            <Route
                              path="/updates"
                              element={
                                <DashboardLayout>
                                  <Updates />
                                </DashboardLayout>
                              }
                            />
                            <Route
                              path="/delivery-executives"
                              element={
                                <DashboardLayout>
                                  <DeliveryExecutivesPage />
                                </DashboardLayout>
                              }
                            />
                            <Route
                              path="/printer-settings"
                              element={
                                <DashboardLayout>
                                  <PrinterSettings />
                                </DashboardLayout>
                              }
                            />
                          </Routes>
                        </HashRouter>
                      </div>
                    </NetworkProvider>
                  </OrdersProvider>
                </WaitersProvider>
              </DeliveryExecutivesProvider>
            </TablesProvider>
          </CustomersProvider>
        </KotProvider>
      </InventoryProvider>
    </ThemeProvider>
  );
}
