import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@urushi/react/styles.css";
import "@urushi/packs/all.css";
import "./app.css";
import { App } from "./App.tsx";
import { Showcase } from "./Showcase.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App page="home">
      <Showcase />
    </App>
  </StrictMode>,
);
