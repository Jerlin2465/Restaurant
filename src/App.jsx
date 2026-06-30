import "./App.css";
import { useState } from "react";
import { Routes, Route } from "react-router-dom";

import Home from "./home/Home";
import Navbar from "./pages/Navbar";
import Tablebooking from "./pages/Tablebooking";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Menu from "./pages/Menu";
import Adminpannel from "./pages/admin/Adminpannel";
import AdminRoute from "./pages/admin/AdminRoute";
import Addproduct from "./pages/admin/Addproduct";
import Cart from "./pages/Cart";
import Logout from "./pages/Logout";
import Workeracc from "./pages/admin/loginpage/Workeracc";
import Manageracc from "./pages/admin/loginpage/Manageracc";
import Dashboard from "./pages/profile/Dashboard";
import Productlist from "./pages/admin/Productlist";
import Orderstatus from "./pages/admin/Orderstatus";
import Account from "./pages/profile/Account";
import OrderDetails from "./pages/profile/Orderdetails";
import Payment from "./pages/Payment";
import Workerrouter from "./pages/Workers/Workerrouter";
import MyBookings from "./pages/profile/Mybooking";
import ChefDashboard from "./pages/Chefdashboard";
import ServerDashboard from "./pages/Serverdashboard";
import Chefmenu from "./pages/Workers/Chefmenu";
import Deliverydashboard from "./pages/Deliverydashboard";
import Serverfoodmenu from "./pages/Workers/Serverfoodmenu";
import Serverfoodorders from "./pages/Workers/Serverfoodorder";
import Serverbill from "./pages/Workers/Serverbill";
import Tableorderstatus from "./pages/admin/Tableorderstatus";

import ForgotPassword from "./pages/Forgotpassword";
import ResetPassword from "./pages/Resetpassword";
import NotFound from "./pages/Notfound";
import Chefdeliveryorder from "./pages/Workers/Chefdeliveryorder";
import Deliveryfooddetails from "./pages/Workers/Deliveryfooddetails";

function App() {
  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("user") || "{}"),
  );

  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        <Route path="/resetpassword" element={<ForgotPassword />} />
        <Route path="/resetpassword/:token" element={<ResetPassword />} />
        {(user?.designation === "user" ||
          ["admin", "manager", "user"].includes(user?.role?.toLowerCase())) && (
          <>
            <Route path="/tablebooking" element={<Tablebooking />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="dashboard" element={<Dashboard />}>
              <Route path="mybooking" element={<MyBookings />} />
              <Route path="orderdetails" element={<OrderDetails />} />
            </Route>
          </>
        )}
        <Route path="dashboard" element={<Dashboard />}>
          <Route path="account" element={<Account />} />
        </Route>
        <Route path="/logout" element={<Logout />} />
        <Route path="/payment" element={<Payment />} />
        <Route
          path="/adminpannel"
          element={
            <AdminRoute>
              <Adminpannel />
            </AdminRoute>
          }
        >
          <Route path="addproduct" element={<Addproduct />} />
          <Route path="manageracc" element={<Manageracc />} />
          <Route path="workeracc" element={<Workeracc />} />
          <Route path="productlist" element={<Productlist />} />
          <Route path="orderstatus" element={<Orderstatus />} />
          <Route path="tableorderstatus" element={<Tableorderstatus />} />
        </Route>
        <Route path="workerrouter" element={<Workerrouter />} />
        {(["chef", "manager", "admin"].includes(
          user?.designation?.toLowerCase(),
        ) ||
          ["admin", "manager"].includes(user?.role?.toLowerCase())) && (
          <>
            <Route path="/chefdashboard" element={<ChefDashboard />} />
            <Route path="/chefmenu" element={<Chefmenu />} />
            <Route path="/chefdeliveryorder" element={<Chefdeliveryorder/>} />
          </>
        )}
        {(["server", "manager", "admin"].includes(
          user?.designation?.toLowerCase(),
        ) ||
          ["admin", "manager"].includes(user?.role?.toLowerCase())) && (
          <>
            <Route path="/serverdashboard" element={<ServerDashboard />} />
            <Route path="/serverbill" element={<Serverbill />} />
            <Route path="/serverfoodmenu" element={<Serverfoodmenu />} />
            <Route path="/serverfoodorder" element={<Serverfoodorders />} />
          </>
        )}

        {(["delivery", "manager", "admin"].includes(
          user?.designation?.toLowerCase(),
        ) ||
          ["admin", "manager"].includes(user?.role?.toLowerCase())) && (
          <>
            <Route path="/deliverydashboard" element={<Deliverydashboard />} />
            <Route
              path="/deliveryfooddetails"
              element={<Deliveryfooddetails />}
            />
          </>
        )}
        <Route path="/notfound" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
