import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { About } from "./pages/About";
import { Products } from "./pages/Products";
import { ProductDetail } from "./pages/ProductDetail";
import { Contact } from "./pages/Contact";
import { Login } from "./pages/auth/Login";
import { Register } from "./pages/auth/Register";
import { ForgotPassword } from "./pages/auth/ForgotPassword";
import { ResetPassword } from "./pages/auth/ResetPassword";
import { AdminRoute } from "./components/auth/AdminRoute";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { AdminProducts } from "./pages/admin/AdminProducts";
import { AdminInquiries } from "./pages/admin/AdminInquiries";
import { AdminOrders } from "./pages/admin/AdminOrders";
import { CheckoutSuccess } from "./pages/checkout/CheckoutSuccess";
import { CheckoutCancel } from "./pages/checkout/CheckoutCancel";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: "about", Component: About },
      { path: "products", Component: Products },
      { path: "products/:id", Component: ProductDetail },
      { path: "contact", Component: Contact },
    ],
  },
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/register",
    Component: Register,
  },
  {
    path: "/forgot-password",
    Component: ForgotPassword,
  },
  {
    path: "/reset-password",
    Component: ResetPassword,
  },
  {
    path: "/checkout/success",
    Component: CheckoutSuccess,
  },
  {
    path: "/checkout/cancel",
    Component: CheckoutCancel,
  },
  {
    path: "/admin",
    element: (
      <AdminRoute>
        <AdminDashboard />
      </AdminRoute>
    ),
  },
  {
    path: "/admin/products",
    element: (
      <AdminRoute>
        <AdminProducts />
      </AdminRoute>
    ),
  },
  {
    path: "/admin/inquiries",
    element: (
      <AdminRoute>
        <AdminInquiries />
      </AdminRoute>
    ),
  },
  {
    path: "/admin/orders",
    element: (
      <AdminRoute>
        <AdminOrders />
      </AdminRoute>
    ),
  },
]);
