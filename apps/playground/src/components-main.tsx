import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { toast } from "@yourlib/react";
import "@yourlib/react/styles.css";
import "@yourlib/packs/all.css";
import "./app.css";
import "./gallery.css";
import { App } from "./App.tsx";
import { Gallery } from "./Gallery.tsx";
import { ToastDemo } from "./ToastDemo.tsx";

// Lets end-to-end tests raise a toast while a modal dialog is open.
Object.assign(window, { yourlibToast: toast });

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App page="components">
      <Gallery toastDemo={<ToastDemo />} />
    </App>
  </StrictMode>,
);
