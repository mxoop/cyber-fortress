<script setup lang="ts">
import BlogHero from "vuepress-theme-hope/blog/components/BlogHero.js";
// 每日必应壁纸组件
import BingHeroBackground from "vuepress-theme-hope/presets/BingHeroBackground.js";
// 一言名句组件
import HitokotoBlogHero from "vuepress-theme-hope/presets/HitokotoBlogHero.js";
</script>

<template>
  <BlogHero>
    <template #heroInfo="heroInfo">
      <HitokotoBlogHero v-bind="heroInfo" />
    </template>

    <template #heroBg>
      <BingHeroBackground />
    </template>
  </BlogHero>
</template>
