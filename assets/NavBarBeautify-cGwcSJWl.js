import{i as m,h as f,j as p,n as r,r as i,o as _,g as h,w as y,a as b,_ as w}from"./app-DyHwY41V.js";/*!
  * vue-router v4.0.13
  * (c) 2022 Eduardo San Martin Morote
  * @license MIT
  */const B=typeof Symbol=="function"&&typeof Symbol.toStringTag=="symbol",v=e=>B?Symbol(e):"_vr_"+e,C=v("r");var a;(function(e){e.pop="pop",e.push="push"})(a||(a={}));var u;(function(e){e.back="back",e.forward="forward",e.unknown=""})(u||(u={}));var d;(function(e){e[e.aborted=4]="aborted",e[e.cancelled=8]="cancelled",e[e.duplicated=16]="duplicated"})(d||(d={}));function k(){return m(C)}const E=b("div",{class:"none"},"修改顶栏组件",-1),S=f({__name:"NavBarBeautify",setup(e){const n=t=>{let o=window.location.pathname;const s=document.documentElement.scrollTop;t&&(o=t);const c=document.getElementsByClassName("theme-container");if(c.length<1)return null;const l=c[0];s<60&&(o=="/"||o=="/en/")?l.classList.add("scroll-top"):l.classList.remove("scroll-top")};return p(()=>{r(()=>{window.removeEventListener("scroll",()=>{}),n(),window.addEventListener("scroll",()=>{n()})}),k().beforeEach(o=>{r(()=>{setTimeout(()=>{n(o.fullPath)},50)})})}),(t,o)=>{const s=i("ClientOnly");return _(),h(s,null,{default:y(()=>[E]),_:1})}}}),L=w(S,[["__file","NavBarBeautify.vue"]]);export{L as default};
