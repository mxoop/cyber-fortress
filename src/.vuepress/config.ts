import { defineUserConfig } from "vuepress";
import theme from "./theme.js";
import { getDirname, path } from "vuepress/utils";

const __dirname = getDirname(import.meta.url);
export default defineUserConfig({
  base: "/cyber-fortress/",

  lang: "zh-CN",
  title: "Cyber-fortress",
  description: "Cyber-fortress blog",

  theme,

  // 和 PWA 一起启用
  shouldPrefetch: false,

  alias: {
    "@theme-hope/modules/blog/components/BlogHero": path.resolve(
      __dirname,
      "./components/BlogHero.vue",
    ),
  },
});
