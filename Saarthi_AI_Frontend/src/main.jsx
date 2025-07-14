import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

import { BrowserRouter, Route, Routes } from "react-router-dom";
import CheckAuth from "./components/check-auth.jsx";
import Tickets from "./pages/tickets.jsx";
import TicketDetailsPage from "./pages/ticket.jsx";
import Login from "./pages/login.jsx";
import Signup from "./pages/signup.jsx";
import Admin from "./pages/admin.jsx";
import Layout from "./components/Layout.jsx"; // ✅ Uses Navbar + Outlet

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* ✅ Protected Routes - with Layout (Navbar inside Layout) */}
        <Route
          element={
            <CheckAuth protected={true}>
              <Layout />
            </CheckAuth>
          }
        >
          <Route path="/" element={<Tickets />} />
          <Route path="/tickets/:id" element={<TicketDetailsPage />} />
          <Route path="/admin" element={<Admin />} />
        </Route>

        {/* ❌ Public Routes - No Navbar */}
        <Route
          path="/login"
          element={
            <CheckAuth protected={false}>
              <Login />
            </CheckAuth>
          }
        />
        <Route
          path="/signup"
          element={
            <CheckAuth protected={false}>
              <Signup />
            </CheckAuth>
          }
        />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
