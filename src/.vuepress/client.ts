import { defineClientConfig } from "vuepress/client";
import { defineAsyncComponent } from 'vue';
import { onMounted } from 'vue';

//为页面图标添加鼠标悬停的跳动效果。
import "vuepress-theme-hope/presets/bounce-icon.scss";
//将博主信息移动至文章列表的左侧。
// import "vuepress-theme-hope/presets/left-blog-info.scss";

const BlogBeautify = defineAsyncComponent(() => import('./components/BlogBeautify.vue'));
const NavBarBeautify = defineAsyncComponent(() => import('./components/NavBarBeautify.vue'));

export default defineClientConfig({
  setup() {
    onMounted(() => {});
  },
  rootComponents: [
    NavBarBeautify,
    BlogBeautify,
    // ...
  ],
});
