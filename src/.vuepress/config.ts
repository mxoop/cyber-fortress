import { defineUserConfig } from "vuepress";
import theme from "./theme.js";
import { getDirname, path } from "vuepress/utils";
import { searchProPlugin } from "vuepress-plugin-search-pro";
import { cut } from "nodejs-jieba";

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

  plugins: [
    searchProPlugin({
      indexContent: true,
      hotReload: true,
      customFields: [
        {
          getter: ({ frontmatter }): string[] => <string[]>frontmatter["tag"],
          formatter: `Tag: $content`,
        },
      ],
      indexOptions: {
        tokenize: (text, fieldName) =>
          fieldName === "id" ? [text] : cut(text, true),
      },
    }),
  ],

});
