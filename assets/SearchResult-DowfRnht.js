import{u as B,g as Z,h as ee,i as M,j as te,k as se,t as le,l as ae,m as L,n as F,p as re,w as Y,q as s,s as ue,R as O,v as ie,x as oe,y as ne,z as I,A as U,B as ce,C as ve,D as pe,E as de,O as ye,F as he,G as me,P as ge,H as fe,I as He,J as _}from"./app-BjGuTC8s.js";const ke=["/","/intro.html","/architecture/","/essay/","/essay/mysql_opt_case_01.html","/deploy/","/deploy/docker_elk_deploy.html","/deploy/docker_netdata_deploy.html","/deploy/docker_swarm_deploy.html","/deploy/elk_deploy.html","/deploy/gitlab_deploy.html","/deploy/lpg_deploy.html","/architecture/java/","/architecture/mq/","/architecture/mysql/","/architecture/redis/","/404.html","/category/","/category/%E9%9A%8F%E7%AC%94/","/category/deploy/","/tag/","/tag/%E9%9A%8F%E7%AC%94/","/tag/mysql/","/tag/deploy/","/tag/docker/","/tag/%E6%97%A5%E5%BF%97/","/tag/git/","/article/","/star/","/timeline/"],Re="SEARCH_PRO_QUERY_HISTORY",y=B(Re,[]),Qe=()=>{const{queryHistoryCount:l}=_,a=l>0;return{enabled:a,queryHistory:y,addQueryHistory:r=>{a&&(y.value.length<l?y.value=Array.from(new Set([r,...y.value])):y.value=Array.from(new Set([r,...y.value.slice(0,l-1)])))},removeQueryHistory:r=>{y.value=[...y.value.slice(0,r),...y.value.slice(r+1)]}}},P=l=>ke[l.id]+("anchor"in l?`#${l.anchor}`:""),qe="SEARCH_PRO_RESULT_HISTORY",{resultHistoryCount:b}=_,h=B(qe,[]),we=()=>{const l=b>0;return{enabled:l,resultHistory:h,addResultHistory:a=>{if(l){const r={link:P(a),display:a.display};"header"in a&&(r.header=a.header),h.value.length<b?h.value=[r,...h.value]:h.value=[r,...h.value.slice(0,b-1)]}},removeResultHistory:a=>{h.value=[...h.value.slice(0,a),...h.value.slice(a+1)]}}},_e=l=>{const a=ce(),r=M(),C=ve(),i=L(!1),f=pe([]);return de(()=>{const{search:R,terminate:m}=ye(),Q=()=>{f.value=[],i.value=!1},H=He(c=>{const k=c.join(" "),{searchFilter:x=d=>d,splitWord:A,suggestionsFilter:T,...g}=a.value;i.value=!0,k?R(c.join(" "),r.value,g).then(d=>x(d,k,r.value,C.value)).then(d=>{f.value=d,i.value=!1}).catch(d=>{console.error(d),Q()}):Q()},_.searchDelay-_.suggestDelay);Y([l,r],([c])=>H(c),{immediate:!0}),he(()=>{m()})}),{searching:i,results:f}};var xe=Z({name:"SearchResult",props:{queries:{type:Array,required:!0},isFocusing:Boolean},emits:["close","updateQuery"],setup(l,{emit:a}){const r=ee(),C=M(),i=te(se),{enabled:f,addQueryHistory:R,queryHistory:m,removeQueryHistory:Q}=Qe(),{enabled:H,resultHistory:c,addResultHistory:k,removeResultHistory:x}=we(),A=f||H,T=le(l,"queries"),{results:g,searching:d}=_e(T),u=ae({isQuery:!0,index:0}),v=L(0),p=L(0),$=F(()=>A&&(m.value.length>0||c.value.length>0)),E=F(()=>g.value.length>0),S=F(()=>g.value[v.value]||null),z=()=>{const{isQuery:e,index:t}=u;t===0?(u.isQuery=!e,u.index=e?c.value.length-1:m.value.length-1):u.index=t-1},G=()=>{const{isQuery:e,index:t}=u;t===(e?m.value.length-1:c.value.length-1)?(u.isQuery=!e,u.index=0):u.index=t+1},J=()=>{v.value=v.value>0?v.value-1:g.value.length-1,p.value=S.value.contents.length-1},V=()=>{v.value=v.value<g.value.length-1?v.value+1:0,p.value=0},K=()=>{p.value<S.value.contents.length-1?p.value+=1:V()},N=()=>{p.value>0?p.value-=1:J()},D=e=>e.map(t=>me(t)?t:s(t[0],t[1])),W=e=>{if(e.type==="customField"){const t=ge[e.index]||"$content",[o,w=""]=fe(t)?t[C.value].split("$content"):t.split("$content");return e.display.map(n=>s("div",D([o,...n,w])))}return e.display.map(t=>s("div",D(t)))},q=()=>{v.value=0,p.value=0,a("updateQuery",""),a("close")};return re("keydown",e=>{if(l.isFocusing){if(E.value){if(e.key==="ArrowUp")N();else if(e.key==="ArrowDown")K();else if(e.key==="Enter"){const t=S.value.contents[p.value];R(l.queries.join(" ")),k(t),r.push(P(t)),q()}}else if(H){if(e.key==="ArrowUp")z();else if(e.key==="ArrowDown")G();else if(e.key==="Enter"){const{index:t}=u;u.isQuery?(a("updateQuery",m.value[t]),e.preventDefault()):(r.push(c.value[t].link),q())}}}}),Y([v,p],()=>{var e;(e=document.querySelector(".search-pro-result-list-item.active .search-pro-result-item.active"))==null||e.scrollIntoView(!1)},{flush:"post"}),()=>s("div",{class:["search-pro-result-wrapper",{empty:l.queries.length?!E.value:!$.value}],id:"search-pro-results"},l.queries.length?d.value?s(ue,{hint:i.value.searching}):E.value?s("ul",{class:"search-pro-result-list"},g.value.map(({title:e,contents:t},o)=>{const w=v.value===o;return s("li",{class:["search-pro-result-list-item",{active:w}]},[s("div",{class:"search-pro-result-title"},e||i.value.defaultTitle),t.map((n,X)=>{const j=w&&p.value===X;return s(O,{to:P(n),class:["search-pro-result-item",{active:j,"aria-selected":j}],onClick:()=>{R(l.queries.join(" ")),k(n),q()}},()=>[n.type==="text"?null:s(n.type==="title"?ie:n.type==="heading"?oe:ne,{class:"search-pro-result-type"}),s("div",{class:"search-pro-result-content"},[n.type==="text"&&n.header?s("div",{class:"content-header"},n.header):null,s("div",W(n))])])})])})):i.value.emptyResult:A?$.value?[f?s("ul",{class:"search-pro-result-list"},s("li",{class:"search-pro-result-list-item"},[s("div",{class:"search-pro-result-title"},i.value.queryHistory),m.value.map((e,t)=>s("div",{class:["search-pro-result-item",{active:u.isQuery&&u.index===t}],onClick:()=>{a("updateQuery",e)}},[s(I,{class:"search-pro-result-type"}),s("div",{class:"search-pro-result-content"},e),s("button",{class:"search-pro-remove-icon",innerHTML:U,onClick:o=>{o.preventDefault(),o.stopPropagation(),Q(t)}})]))])):null,H?s("ul",{class:"search-pro-result-list"},s("li",{class:"search-pro-result-list-item"},[s("div",{class:"search-pro-result-title"},i.value.resultHistory),c.value.map((e,t)=>s(O,{to:e.link,class:["search-pro-result-item",{active:!u.isQuery&&u.index===t}],onClick:()=>{q()}},()=>[s(I,{class:"search-pro-result-type"}),s("div",{class:"search-pro-result-content"},[e.header?s("div",{class:"content-header"},e.header):null,s("div",e.display.map(o=>D(o)).flat())]),s("button",{class:"search-pro-remove-icon",innerHTML:U,onClick:o=>{o.preventDefault(),o.stopPropagation(),x(t)}})]))])):null]:i.value.emptyHistory:i.value.emptyResult)}});export{xe as default};
