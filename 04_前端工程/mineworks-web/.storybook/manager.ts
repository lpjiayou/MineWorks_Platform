import { addons } from "storybook/manager-api";
import { create } from "storybook/theming/create";

addons.setConfig({
  theme: create({
    base: "light",
    brandTitle: "MineWorks UI",
    brandUrl: "/",
    brandTarget: "_self",
    colorPrimary: "#148E9D",
    colorSecondary: "#2F7DA3",
    appBg: "#F3F7F9",
    appContentBg: "#FFFFFF",
    appBorderColor: "#CFDEE4",
    textColor: "#10252E",
    barSelectedColor: "#148E9D",
  }),
});
