import React from "react";
import { createRoot } from "react-dom/client"; // Import createRoot from react-dom/client
import App from "./App";
import { TransactionsProvider } from "./context/TransactionContext.jsx";
import "./index.css";

// Get the root element
const container = document.getElementById("root");

// Create a root
const root = createRoot(container);

// Render the app
root.render(
  <TransactionsProvider>
    <App />
  </TransactionsProvider>
);
