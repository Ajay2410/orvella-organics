import { lazy, Suspense, type ComponentType } from "react";
import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { About } from "./pages/About";
import { Products } from "./pages/Products";
import { ProductDetail } from "./pages/ProductDetail";
import { Contact } from "./pages/Contact";

const AdminLogin = lazy(() => import("./pages/admin/AdminLogin").then((module) => ({ default: module.AdminLogin })));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts").then((module) => ({ default: module.AdminProducts })));

function AdminRoute({ Component }: { Component: ComponentType }) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-bg-cream px-4 py-16 text-center font-body text-text-muted">Loading admin...</div>}>
      <Component />
    </Suspense>
  );
}

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
      { path: "admin/login", element: <AdminRoute Component={AdminLogin} /> },
      { path: "admin/products", element: <AdminRoute Component={AdminProducts} /> },
    ],
  },
]);
