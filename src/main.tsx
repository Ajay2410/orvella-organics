  // @ts-ignore
  import React from "react";
  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  import "./styles/index.css";
  import { CartProvider } from "./app/cart/CartContext";

  createRoot(document.getElementById("root")!).render(
    <CartProvider>
      <App />
    </CartProvider>
  );
  