import { sidebar } from "vuepress-theme-hope";

export default sidebar({
  "/": [
    // "",
    {
      // 必要的，分组的标题文字
      text: "部署篇",
      // 可选的, 分组标题对应的图标
      icon: "book",
      // 可选的，会添加到每个 item 链接地址之前
      prefix: "deploy/",
      // 可选的, 分组标题对应的链接
      link: "deploy/",
      // 可选的, 设置分组是否可以折叠，默认值是 false,
      collapsible: true,
      children:"structure"
    }
  ],
  // "/deploy/": "structure",
});
