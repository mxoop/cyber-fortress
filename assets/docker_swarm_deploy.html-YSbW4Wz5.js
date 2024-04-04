import{_ as l,r as i,o as r,c as d,a as s,e,f as a,d as t}from"./app-DyHwY41V.js";const c={},o=t(`<h1 id="docker集群➕docker-registry搭建" tabindex="-1"><a class="header-anchor" href="#docker集群➕docker-registry搭建"><span>Docker集群➕Docker Registry搭建</span></a></h1><hr><blockquote><p>环境介绍，四台虚拟机均使用桥接网络搭建</p></blockquote><table><thead><tr><th>hostname</th><th>用途</th><th>ip</th></tr></thead><tbody><tr><td>docker-registry</td><td>搭建docker仓库</td><td>192.168.0.100</td></tr><tr><td>docker-master</td><td>docker集群主节点</td><td>192.168.0.101</td></tr><tr><td>docker-worker1</td><td>docker集群worker节点</td><td>192.168.0.102</td></tr><tr><td>docker-worker2</td><td>docker集群worker节点</td><td>192.168.0.103</td></tr></tbody></table><p><strong>思路：</strong></p><ul><li>搭建docker-registry节点，在节点中搭建docker环境，搭建registry2</li><li>克隆docker-registry，修改对应的主机名以及ip地址</li><li>验证其他节点能否拉取docker-registry节点的镜像</li><li>使用docker swarm搭建docker集群</li></ul><blockquote><p>会使用到命令</p></blockquote><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token comment">#修改主机名</span>
<span class="token function">sudo</span> hostnamectl set-hostname 新主机名

<span class="token comment">#设置静态IP地址</span>
<span class="token function">vim</span> /etc/sysconfig/network-scripts/ifcfg-ens33

<span class="token comment">#重启网卡生效</span>
systemctl restart network.service
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token assign-left variable">TYPE</span><span class="token operator">=</span>Ethernet
<span class="token assign-left variable">PROXY_METHOD</span><span class="token operator">=</span>none
<span class="token assign-left variable">BROWSER_ONLY</span><span class="token operator">=</span>no
<span class="token assign-left variable">BOOTPROTO</span><span class="token operator">=</span>static
<span class="token assign-left variable">DEFROUTE</span><span class="token operator">=</span>yes
<span class="token assign-left variable">IPV4_FAILURE_FATAL</span><span class="token operator">=</span>no
<span class="token assign-left variable">IPV6INIT</span><span class="token operator">=</span>yes
<span class="token assign-left variable">IPV6_AUTOCONF</span><span class="token operator">=</span>yes
<span class="token assign-left variable">IPV6_DEFROUTE</span><span class="token operator">=</span>yes
<span class="token assign-left variable">IPV6_FAILURE_FATAL</span><span class="token operator">=</span>no
<span class="token assign-left variable">IPV6_ADDR_GEN_MODE</span><span class="token operator">=</span>stable-privacy
<span class="token assign-left variable">NAME</span><span class="token operator">=</span>ens33
<span class="token assign-left variable">UUID</span><span class="token operator">=</span>824ec4bd-a9ae-4410-8346-17ce7f3dd111
<span class="token assign-left variable">DEVICE</span><span class="token operator">=</span>ens33
<span class="token assign-left variable">ONBOOT</span><span class="token operator">=</span>yes
<span class="token assign-left variable">IPADDR</span><span class="token operator">=</span><span class="token number">192.168</span>.0.100
<span class="token assign-left variable">NETMASK</span><span class="token operator">=</span><span class="token number">255.255</span>.255.0
<span class="token assign-left variable">GATEWAY</span><span class="token operator">=</span><span class="token number">192.168</span>.0.1
<span class="token assign-left variable">DNS1</span><span class="token operator">=</span><span class="token number">8.8</span>.8.8
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><hr><h2 id="docker-registry节点搭建" tabindex="-1"><a class="header-anchor" href="#docker-registry节点搭建"><span>docker-registry节点搭建</span></a></h2><h3 id="docker环境搭建" tabindex="-1"><a class="header-anchor" href="#docker环境搭建"><span>docker环境搭建</span></a></h3>`,12),p={href:"https://docs.docker.com/engine/install/centos/",target:"_blank",rel:"noopener noreferrer"},u=t(`<ul><li>配置镜像加速</li></ul><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token function">vim</span> /etc/docker/daemon.json

<span class="token punctuation">{</span>
 <span class="token string">&quot;registry-mirrors&quot;</span><span class="token builtin class-name">:</span> <span class="token punctuation">[</span><span class="token string">&quot;http://hub-mirror.c.163.com&quot;</span><span class="token punctuation">]</span>
<span class="token punctuation">}</span>

systemctl daemon-reload
systemctl restart docker.service
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="docker-registry搭建" tabindex="-1"><a class="header-anchor" href="#docker-registry搭建"><span>docker registry搭建</span></a></h3><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token function">docker</span> run <span class="token parameter variable">-d</span> <span class="token parameter variable">-p</span> <span class="token number">5000</span>:5000 <span class="token parameter variable">--restart</span><span class="token operator">=</span>always <span class="token parameter variable">-v</span> /mydata/registry:/var/lib/registry <span class="token parameter variable">--name</span> registry2 registry:2.8
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><ul><li>配置docker http注册表</li></ul>`,5),v=s("p",null,"参考官网：",-1),m={href:"https://docs.docker.com/registry/insecure/",target:"_blank",rel:"noopener noreferrer"},k={href:"https://docs.docker.com/config/daemon/remote-access/",target:"_blank",rel:"noopener noreferrer"},b=t(`<div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token builtin class-name">echo</span> <span class="token string">&#39;{ &quot;insecure-registries&quot;:[&quot;192.168.0.100:5000&quot;] }&#39;</span> <span class="token operator">&gt;</span> /etc/docker/daemon.json
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><ul><li><p>每台虚拟机都配置docker-registry的地址，这样其他docker客户端就能拉取docker-registry的镜像了</p></li><li><p>修改配置后需要使用如下命令使配置生效</p></li></ul><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code>systemctl daemon-reload
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><ul><li>重新启动Docker服务</li></ul><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code>systemctl restart <span class="token function">docker</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><hr><h2 id="克隆虚拟机" tabindex="-1"><a class="header-anchor" href="#克隆虚拟机"><span>克隆虚拟机</span></a></h2><ul><li>克隆docker-registry节点，修改对应主机名及IP地址</li></ul><h3 id="测试效果" tabindex="-1"><a class="header-anchor" href="#测试效果"><span>测试效果</span></a></h3><ul><li>首先下载一个测试用的镜像<code>busybox</code></li></ul><div class="language-text line-numbers-mode" data-ext="text" data-title="text"><pre class="language-text"><code>docker pull busybox
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><ul><li>给镜像<code>busybox</code>打上私有仓库的标签，并设置版本为<code>v1.0</code></li></ul><div class="language-text line-numbers-mode" data-ext="text" data-title="text"><pre class="language-text"><code>docker tag busybox 192.168.0.100:5000/busybox:v1.0
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><ul><li>之后推送到私有镜像仓库去</li></ul><div class="language-text line-numbers-mode" data-ext="text" data-title="text"><pre class="language-text"><code>docker push 192.168.0.100:5000/busybox:v1.0
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><ul><li>在master节点拉取registry节点的镜像</li></ul><div class="language-text line-numbers-mode" data-ext="text" data-title="text"><pre class="language-text"><code>docker pull 192.168.0.100:5000/busybox:v1.0
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>到这里，docker私有仓库搭建告一段落。后续在docker集群搭建完后，配置docker-registry远程api访问，以及TLS</p><hr><h2 id="docker-swarm-搭建集群" tabindex="-1"><a class="header-anchor" href="#docker-swarm-搭建集群"><span>docker swarm 搭建集群</span></a></h2>`,20),h=s("p",null,"官网地址：",-1),g={href:"https://docs.docker.com/engine/swarm/swarm-tutorial/",target:"_blank",rel:"noopener noreferrer"},f=t(`<h3 id="环境准备" tabindex="-1"><a class="header-anchor" href="#环境准备"><span>环境准备</span></a></h3><ul><li>在集群的每个节点都开放这三个端口</li></ul><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token comment"># 开放 2377/tcp 端口</span>
<span class="token function">sudo</span> firewall-cmd --add-port<span class="token operator">=</span><span class="token number">2377</span>/tcp <span class="token parameter variable">--permanent</span>
<span class="token comment"># 开放 7946/tcp 和 7946/udp 端口</span>
<span class="token function">sudo</span> firewall-cmd --add-port<span class="token operator">=</span><span class="token number">7946</span>/tcp <span class="token parameter variable">--permanent</span>
<span class="token function">sudo</span> firewall-cmd --add-port<span class="token operator">=</span><span class="token number">7946</span>/udp <span class="token parameter variable">--permanent</span>
<span class="token comment"># 开放 4789/udp 端口</span>
<span class="token function">sudo</span> firewall-cmd --add-port<span class="token operator">=</span><span class="token number">4789</span>/udp <span class="token parameter variable">--permanent</span>
<span class="token comment"># 重新加载防火墙规则使其生效</span>
<span class="token function">sudo</span> firewall-cmd <span class="token parameter variable">--reload</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="创建集群" tabindex="-1"><a class="header-anchor" href="#创建集群"><span>创建集群</span></a></h3><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token comment">#在主节点执行</span>
<span class="token comment">#docker swarm init --advertise-addr &lt;MANAGER-IP&gt;</span>
<span class="token function">docker</span> swarm init --advertise-addr <span class="token number">192.168</span>.0.101
Swarm initialized: current <span class="token function">node</span> <span class="token punctuation">(</span>dxn1zf6l61qsb1josjja83ngz<span class="token punctuation">)</span> is now a manager.

To <span class="token function">add</span> a worker to this swarm, run the following command:

    <span class="token function">docker</span> swarm <span class="token function">join</span> <span class="token punctuation">\\</span>
    <span class="token parameter variable">--token</span> SWMTKN-1-49nj1cmql0jkz5s954yi3oex3nedyz0fb0xx14ie39trti4wxv-8vxv8rssmk743ojnwacrr2e7c <span class="token punctuation">\\</span>
    <span class="token number">192.168</span>.0.101:2377

To <span class="token function">add</span> a manager to this swarm, run <span class="token string">&#39;docker swarm join-token manager&#39;</span> and follow the instructions.
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ul><li>将节点添加到群中</li></ul><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code> <span class="token comment">#在子节点执行上面生成的命令</span>
 <span class="token function">docker</span> swarm <span class="token function">join</span> <span class="token punctuation">\\</span>
    <span class="token parameter variable">--token</span> SWMTKN-1-49nj1cmql0jkz5s954yi3oex3nedyz0fb0xx14ie39trti4wxv-8vxv8rssmk743ojnwacrr2e7c <span class="token punctuation">\\</span>
    <span class="token number">192.168</span>.0.101:2377
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ul><li>查看集群节点状态</li></ul><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token punctuation">[</span>root@docker-master ~<span class="token punctuation">]</span><span class="token comment"># docker node ls</span>
ID                            <span class="token environment constant">HOSTNAME</span>         STATUS    AVAILABILITY   MANAGER STATUS   ENGINE VERSION
ep8anhf9h4uox6j00k81ixsbc *   docker-master    Ready     Active         Leader           <span class="token number">24.0</span>.5
xblpc7gpoztrwmg7k05d77b52     docker-worker1   Ready     Active                          <span class="token number">24.0</span>.5
og5uwjm5d50g5cv1avt525af1     docker-worker2   Ready     Active                          <span class="token number">24.0</span>.5
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="部署服务" tabindex="-1"><a class="header-anchor" href="#部署服务"><span>部署服务</span></a></h3><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token punctuation">[</span>root@docker-registry ~<span class="token punctuation">]</span><span class="token comment"># docker pull nginx:1.25</span>

<span class="token punctuation">[</span>root@docker-registry ~<span class="token punctuation">]</span><span class="token comment"># docker tag nginx:1.25 192.168.0.100:5000/ngnix:v1.0</span>

<span class="token punctuation">[</span>root@docker-registry ~<span class="token punctuation">]</span><span class="token comment"># docker push 192.168.0.100:5000/ngnix:v1.0</span>

<span class="token punctuation">[</span>root@docker-master ~<span class="token punctuation">]</span><span class="token comment"># docker pull 192.168.0.100:5000/ngnix:v1.0</span>

<span class="token punctuation">[</span>root@docker-master ~<span class="token punctuation">]</span><span class="token comment"># docker service create --name mynginx --replicas 3 -p 8080:80 192.168.0.100:5000/ngnix:v1.0 </span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="常用命令" tabindex="-1"><a class="header-anchor" href="#常用命令"><span>常用命令</span></a></h2><ul><li>查看运行的服务列表</li></ul><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token function">docker</span> <span class="token function">service</span> <span class="token function">ls</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><ul><li>查看服务详细信息</li></ul><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token function">docker</span> <span class="token function">service</span> inspect <span class="token parameter variable">--pretty</span> mynginx
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><ul><li>查看服务在哪些节点正在运行</li></ul><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token function">docker</span> <span class="token function">service</span> <span class="token function">ps</span> mynginx
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><ul><li>移除服务</li></ul><div class="language-text line-numbers-mode" data-ext="text" data-title="text"><pre class="language-text"><code>docker service rm mynginx
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><ul><li>移除节点</li></ul><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token function">docker</span> swarm leave
<span class="token comment">#如果是主节点</span>
<span class="token function">docker</span> swarm leave <span class="token parameter variable">--force</span>
<span class="token comment">#节点离开群后，您可以在主节点：从节点列表中删除节点。</span>
<span class="token function">docker</span> <span class="token function">node</span> <span class="token function">rm</span> <span class="token operator">&lt;</span>hostname<span class="token operator">&gt;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,22);function x(y,_){const n=i("ExternalLinkIcon");return r(),d("div",null,[o,s("blockquote",null,[s("p",null,[e("参考官网地址："),s("a",p,[e("Install Docker Engine on CentOS | Docker Documentation"),a(n)])])]),u,s("blockquote",null,[v,s("p",null,[s("a",m,[e("测试不安全的注册表 |码头工人文档 (docker.com)"),a(n)])]),s("p",null,[s("a",k,[e("为 Docker 守护程序配置远程访问 |码头工人文档"),a(n)])])]),b,s("blockquote",null,[h,s("p",null,[s("a",g,[e("群模式入门 |码头工人文档 (docker.com)"),a(n)])])]),f])}const T=l(c,[["render",x],["__file","docker_swarm_deploy.html.vue"]]),E=JSON.parse('{"path":"/deploy/docker_swarm_deploy.html","title":"Docker集群➕Docker Registry搭建","lang":"zh-CN","frontmatter":{"order":4,"star":true,"date":"2024-04-01T00:00:00.000Z","copyright":false,"footer":true,"category":["deploy"],"tag":["deploy","docker"]},"headers":[{"level":2,"title":"docker-registry节点搭建","slug":"docker-registry节点搭建","link":"#docker-registry节点搭建","children":[{"level":3,"title":"docker环境搭建","slug":"docker环境搭建","link":"#docker环境搭建","children":[]},{"level":3,"title":"docker registry搭建","slug":"docker-registry搭建","link":"#docker-registry搭建","children":[]}]},{"level":2,"title":"克隆虚拟机","slug":"克隆虚拟机","link":"#克隆虚拟机","children":[{"level":3,"title":"测试效果","slug":"测试效果","link":"#测试效果","children":[]}]},{"level":2,"title":"docker swarm 搭建集群","slug":"docker-swarm-搭建集群","link":"#docker-swarm-搭建集群","children":[{"level":3,"title":"环境准备","slug":"环境准备","link":"#环境准备","children":[]},{"level":3,"title":"创建集群","slug":"创建集群","link":"#创建集群","children":[]},{"level":3,"title":"部署服务","slug":"部署服务","link":"#部署服务","children":[]}]},{"level":2,"title":"常用命令","slug":"常用命令","link":"#常用命令","children":[]}],"git":{"createdTime":1712219267000,"updatedTime":1712219267000,"contributors":[{"name":"mxoop","email":"1592013653@qq.com","commits":1}]},"readingTime":{"minutes":3.19,"words":957},"filePathRelative":"deploy/docker_swarm_deploy.md","localizedDate":"2024年4月1日","excerpt":"\\n<hr>\\n<blockquote>\\n<p>环境介绍，四台虚拟机均使用桥接网络搭建</p>\\n</blockquote>\\n<table>\\n<thead>\\n<tr>\\n<th>hostname</th>\\n<th>用途</th>\\n<th>ip</th>\\n</tr>\\n</thead>\\n<tbody>\\n<tr>\\n<td>docker-registry</td>\\n<td>搭建docker仓库</td>\\n<td>192.168.0.100</td>\\n</tr>\\n<tr>\\n<td>docker-master</td>\\n<td>docker集群主节点</td>\\n<td>192.168.0.101</td>\\n</tr>\\n<tr>\\n<td>docker-worker1</td>\\n<td>docker集群worker节点</td>\\n<td>192.168.0.102</td>\\n</tr>\\n<tr>\\n<td>docker-worker2</td>\\n<td>docker集群worker节点</td>\\n<td>192.168.0.103</td>\\n</tr>\\n</tbody>\\n</table>"}');export{T as comp,E as data};
