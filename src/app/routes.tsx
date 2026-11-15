import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { About } from "./pages/About";
import { Products } from "./pages/Products";
import { ProductDetail } from "./pages/ProductDetail";
import { Contact } from "./pages/Contact";
import { Account } from "./pages/Account";
import { Checkout } from "./pages/Checkout";
import { OrderConfirmation } from "./pages/OrderConfirmation";
import { Orders } from "./pages/Orders";

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
      { path: "account", Component: Account },
      { path: "checkout", Component: Checkout },
      { path: "order-confirmation/:orderNo", Component: OrderConfirmation },
      { path: "orders", Component: Orders },
    ],
  },
]);
