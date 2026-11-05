import type { ComponentType } from "react";
import list from "../../../blocks/index.json";
import Dashboard01 from "../../../blocks/dashboard-01";
import Login01 from "../../../blocks/login-01";
import Mail01 from "../../../blocks/mail-01";
import Pricing01 from "../../../blocks/pricing-01";
import Settings01 from "../../../blocks/settings-01";

/** The blocks as `urushi add` ships them (blocks/index.json), each with its screen. */
const screens: Record<string, ComponentType> = {
  "login-01": Login01,
  "settings-01": Settings01,
  "dashboard-01": Dashboard01,
  "mail-01": Mail01,
  "pricing-01": Pricing01,
};

export const blocks = list.map((block) => ({ ...block, Screen: screens[block.name] }));
