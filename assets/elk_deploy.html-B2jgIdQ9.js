import{_ as l,r as i,o,c as p,a as s,e as n,f as e,d as t}from"./app-D_rNMysR.js";const c={},r=t(`<h1 id="elk-安装部署" tabindex="-1"><a class="header-anchor" href="#elk-安装部署"><span>ELK 安装部署</span></a></h1><hr><ul><li><p>创建 <code>es</code>用户 。</p><div class="language-text line-numbers-mode" data-ext="text" data-title="text"><pre class="language-text"><code>adduser es
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div></li></ul><h2 id="elasticsearch" tabindex="-1"><a class="header-anchor" href="#elasticsearch"><span>Elasticsearch</span></a></h2>`,4),d=s("p",null,[s("strong",null,"参考文档：")],-1),u=s("em",null,"重点",-1),v={href:"https://www.elastic.co/guide/en/elasticsearch/reference/8.10/configuring-stack-security.html#_use_the_ca_certificate_5",target:"_blank",rel:"noopener noreferrer"},k=s("em",null,"密码设置",-1),m={href:"https://www.elastic.co/guide/en/elasticsearch/reference/8.10/security-minimal-setup.html",target:"_blank",rel:"noopener noreferrer"},b=t(`<blockquote><p><strong>注意事项：</strong></p><ul><li>新版本<code>elasticsearch</code>启动时就默认开启了<code>ssl</code>检查</li><li>事先为ELK三个组件创建一个es用户，使用<code>chowdn -R es:es ./\${组件目录名} </code>赋予权限，之后都用<code>es</code>用户启动</li><li><code>kibana</code>与<code>elastic</code>使用命令建立关联，而<code>logstash</code>需要在配置文件配置http的ca证书和账户密码</li></ul></blockquote><ul><li>解压至 <code>/usr/local</code> 目录</li><li>进入解压目录，修改<strong>config/elasticsearch.yml</strong></li><li>添加以下几行</li></ul><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code>cluster.name: kwin-elk-es
node.name: node-1
path.data: /usr/local/elasticsearch-8.10.1/data
path.logs: /usr/local/elasticsearch-8.10.1/logs
network.host: <span class="token number">0.0</span>.0.0
http.port: <span class="token number">9200</span>
cluster.initial_master_nodes: <span class="token punctuation">[</span><span class="token string">&quot;node-1&quot;</span><span class="token punctuation">]</span>
http.cors.enabled: <span class="token boolean">true</span>
http.cors.allow-origin: <span class="token string">&quot;*&quot;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ul><li><p>创建对应的<code>data</code>、<code>logs</code>目录</p></li><li><p>将对应安装目录权限赋予 <code>es</code> 用户</p><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code> <span class="token function">chown</span> <span class="token parameter variable">-R</span> es /usr/local/elasticsearch
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div></li><li><p>切换至 <code>es</code> 用户，后台启动。</p><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token function">su</span> es
./bin/elasticsearch <span class="token parameter variable">-d</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div></li></ul><h2 id="kibana" tabindex="-1"><a class="header-anchor" href="#kibana"><span>Kibana</span></a></h2><ul><li><p>解压至 <code>/usr/local/ </code>目录</p></li><li><p>修改配置</p><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token function">vim</span> ./config/kibana.yml

<span class="token comment"># 添加以下几行</span>
logging.appenders.default:
 type: <span class="token function">file</span>
 fileName: /usr/local/kibana-8.10.1/logs/kibana.log
 layout:
  type: json
server.port: <span class="token number">5601</span>
server.host: <span class="token number">0.0</span>.0.0
server.publicBaseUrl: <span class="token string">&quot;http://192.168.0.194:5601&quot;</span>    <span class="token comment">#192.168.0.194为Elastic本机IP</span>
elasticsearch.hosts: <span class="token punctuation">[</span><span class="token string">&#39;https://192.168.0.194:9200&#39;</span><span class="token punctuation">]</span>
i18n.locale: zh-CN
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></li><li><p>文件授权</p><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code> <span class="token function">chown</span> <span class="token parameter variable">-R</span> es /usr/local/kibana-8.10.1
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div></li><li><p>注册启用安全性<code>kibana</code></p><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token comment">#参考命令</span>
bin/elasticsearch-create-enrollment-token <span class="token parameter variable">-s</span> kibana <span class="token parameter variable">--url</span> <span class="token string">&quot;https://192.168.0.194:9200&quot;</span>

bin/kibana-setup --enrollment-token <span class="token operator">&lt;</span>enrollment-token<span class="token operator">&gt;</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></li><li><p>切换用户并启动</p><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token function">su</span> es
./bin/kibana
<span class="token comment">#后台启动</span>
<span class="token function">nohup</span> ./bin/kibana <span class="token operator">&amp;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></li></ul><h2 id="logstash" tabindex="-1"><a class="header-anchor" href="#logstash"><span>Logstash</span></a></h2><ul><li><p>解压至 <code>/usr/local/</code> 目录</p></li><li><p>修改配置文件</p><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token function">cp</span> config/logstash-sample.conf config/logstash.conf
<span class="token function">vim</span> config/logstash.conf
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>logstash.conf</strong></p><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token comment"># Sample Logstash configuration for creating a simple</span>
<span class="token comment"># Beats -&gt; Logstash -&gt; Elasticsearch pipeline.</span>

input <span class="token punctuation">{</span>
  tcp <span class="token punctuation">{</span>
    mode <span class="token operator">=</span><span class="token operator">&gt;</span> <span class="token string">&quot;server&quot;</span>
    <span class="token function">host</span> <span class="token operator">=</span><span class="token operator">&gt;</span> <span class="token string">&quot;0.0.0.0&quot;</span>
    port <span class="token operator">=</span><span class="token operator">&gt;</span> <span class="token number">4570</span>
    codec <span class="token operator">=</span><span class="token operator">&gt;</span> json_lines
    <span class="token builtin class-name">type</span> <span class="token operator">=</span><span class="token operator">&gt;</span> <span class="token string">&quot;debug&quot;</span>
  <span class="token punctuation">}</span>
  tcp <span class="token punctuation">{</span>
    mode <span class="token operator">=</span><span class="token operator">&gt;</span> <span class="token string">&quot;server&quot;</span>
    <span class="token function">host</span> <span class="token operator">=</span><span class="token operator">&gt;</span> <span class="token string">&quot;0.0.0.0&quot;</span>
    port <span class="token operator">=</span><span class="token operator">&gt;</span> <span class="token number">4571</span>
    codec <span class="token operator">=</span><span class="token operator">&gt;</span> json_lines
    <span class="token builtin class-name">type</span> <span class="token operator">=</span><span class="token operator">&gt;</span> <span class="token string">&quot;error&quot;</span>
  <span class="token punctuation">}</span>
  tcp <span class="token punctuation">{</span>
    mode <span class="token operator">=</span><span class="token operator">&gt;</span> <span class="token string">&quot;server&quot;</span>
    <span class="token function">host</span> <span class="token operator">=</span><span class="token operator">&gt;</span> <span class="token string">&quot;0.0.0.0&quot;</span>
    port <span class="token operator">=</span><span class="token operator">&gt;</span> <span class="token number">4572</span>
    codec <span class="token operator">=</span><span class="token operator">&gt;</span> json_lines
    <span class="token builtin class-name">type</span> <span class="token operator">=</span><span class="token operator">&gt;</span> <span class="token string">&quot;business&quot;</span>
  <span class="token punctuation">}</span>
  tcp <span class="token punctuation">{</span>
    mode <span class="token operator">=</span><span class="token operator">&gt;</span> <span class="token string">&quot;server&quot;</span>
    <span class="token function">host</span> <span class="token operator">=</span><span class="token operator">&gt;</span> <span class="token string">&quot;0.0.0.0&quot;</span>
    port <span class="token operator">=</span><span class="token operator">&gt;</span> <span class="token number">4573</span>
    codec <span class="token operator">=</span><span class="token operator">&gt;</span> json_lines
    <span class="token builtin class-name">type</span> <span class="token operator">=</span><span class="token operator">&gt;</span> <span class="token string">&quot;record&quot;</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span>
filter <span class="token punctuation">{</span>
  <span class="token keyword">if</span> <span class="token punctuation">[</span>type<span class="token punctuation">]</span> <span class="token operator">==</span> <span class="token string">&quot;record&quot;</span> <span class="token punctuation">{</span>
    mutate <span class="token punctuation">{</span>
      remove_field <span class="token operator">=</span><span class="token operator">&gt;</span> <span class="token punctuation">[</span><span class="token string">&quot;port&quot;</span>, <span class="token string">&quot;host&quot;</span>, <span class="token string">&quot;@version&quot;</span><span class="token punctuation">]</span>
    <span class="token punctuation">}</span>
    json <span class="token punctuation">{</span>
      <span class="token builtin class-name">source</span> <span class="token operator">=</span><span class="token operator">&gt;</span> <span class="token string">&quot;message&quot;</span>
      remove_field <span class="token operator">=</span><span class="token operator">&gt;</span> <span class="token punctuation">[</span><span class="token string">&quot;message&quot;</span><span class="token punctuation">]</span>
    <span class="token punctuation">}</span>
    ruby <span class="token punctuation">{</span>
      code <span class="token operator">=</span><span class="token operator">&gt;</span> <span class="token string">&#39;event.set(&quot;parameter&quot;, event.get(&quot;parameter&quot;).to_json)&#39;</span>
    <span class="token punctuation">}</span>
    ruby <span class="token punctuation">{</span>
      code <span class="token operator">=</span><span class="token operator">&gt;</span> <span class="token string">&#39;event.set(&quot;result&quot;, event.get(&quot;result&quot;).to_json)&#39;</span>
    <span class="token punctuation">}</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span>

output <span class="token punctuation">{</span>
  elasticsearch <span class="token punctuation">{</span>
    hosts <span class="token operator">=</span><span class="token operator">&gt;</span> <span class="token punctuation">[</span><span class="token string">&quot;https://192.168.0.194:9200&quot;</span><span class="token punctuation">]</span>	<span class="token comment">#elastic 主机IP地址</span>
    index <span class="token operator">=</span><span class="token operator">&gt;</span> <span class="token string">&quot;kwin-%{type}-%{+YYYY.MM.dd}&quot;</span> <span class="token comment">#索引匹配规则</span>
    ssl <span class="token operator">=</span><span class="token operator">&gt;</span> <span class="token boolean">true</span>
    cacert <span class="token operator">=</span><span class="token operator">&gt;</span> <span class="token string">&quot;/usr/local/elasticsearch-8.10.1/config/certs/http_ca.crt&quot;</span> <span class="token comment">#elastic 默认安全目录</span>
    user <span class="token operator">=</span><span class="token operator">&gt;</span> <span class="token string">&quot;elastic&quot;</span> <span class="token comment">#elastic 用户名</span>
    password <span class="token operator">=</span><span class="token operator">&gt;</span> <span class="token string">&quot;S4dcMP3FsEKEmQWTtWsA&quot;</span> <span class="token comment">#elastic 用户密码</span>
  <span class="token punctuation">}</span>
<span class="token punctuation">}</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div></li><li><p>启动</p><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code> <span class="token function">nohup</span> ./bin/logstash <span class="token parameter variable">-f</span> ./config/logstash.conf <span class="token operator">&amp;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div></li></ul><h2 id="启动脚本" tabindex="-1"><a class="header-anchor" href="#启动脚本"><span>启动脚本</span></a></h2><p>脚本目录：<code>/etc/init.d</code></p><p><strong>elasticsearch</strong></p><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token shebang important">#!/bin/sh</span>
<span class="token comment"># chkconfig: - 85 15</span>
<span class="token comment">#description: elasticsearch</span>
<span class="token builtin class-name">export</span> <span class="token assign-left variable">ES_HOME</span><span class="token operator">=</span>/usr/local/elasticsearch-6.2.3
 
<span class="token keyword">case</span> <span class="token string">&quot;<span class="token variable">$1</span>&quot;</span> <span class="token keyword">in</span>
start<span class="token punctuation">)</span>
    <span class="token function">su</span> es<span class="token operator">&lt;&lt;</span><span class="token operator">!</span>
    <span class="token builtin class-name">cd</span> <span class="token variable">$ES_HOME</span>
    ./bin/elasticsearch <span class="token parameter variable">-d</span> <span class="token parameter variable">-p</span> pid
<span class="token operator">!</span>
    <span class="token builtin class-name">echo</span> <span class="token string">&quot;elasticsearch startup&quot;</span>
    <span class="token punctuation">;</span><span class="token punctuation">;</span>  
stop<span class="token punctuation">)</span>
    <span class="token function">kill</span> <span class="token parameter variable">-9</span> <span class="token variable"><span class="token variable">\`</span><span class="token function">cat</span> $ES_HOME/pid<span class="token variable">\`</span></span>
    <span class="token builtin class-name">echo</span> <span class="token string">&quot;elasticsearch stopped&quot;</span>
    <span class="token punctuation">;</span><span class="token punctuation">;</span>  
restart<span class="token punctuation">)</span>
    <span class="token function">kill</span> <span class="token parameter variable">-9</span> <span class="token variable"><span class="token variable">\`</span><span class="token function">cat</span> $ES_HOME/pid<span class="token variable">\`</span></span>
    <span class="token builtin class-name">echo</span> <span class="token string">&quot;elasticsearch stopped&quot;</span>
    <span class="token function">su</span> es<span class="token operator">&lt;&lt;</span><span class="token operator">!</span>
    <span class="token builtin class-name">cd</span> <span class="token variable">$ES_HOME</span>
    ./bin/elasticsearch <span class="token parameter variable">-d</span> <span class="token parameter variable">-p</span> pid
<span class="token operator">!</span>
    <span class="token builtin class-name">echo</span> <span class="token string">&quot;elasticsearch startup&quot;</span>
    <span class="token punctuation">;</span><span class="token punctuation">;</span>  
*<span class="token punctuation">)</span>
    <span class="token builtin class-name">echo</span> <span class="token string">&quot;start|stop|restart&quot;</span>
    <span class="token punctuation">;</span><span class="token punctuation">;</span>  
<span class="token keyword">esac</span>
<span class="token builtin class-name">exit</span> <span class="token variable">$?</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>kibana</strong></p><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token shebang important">#!/bin/sh</span>
<span class="token comment"># chkconfig: - 85 15</span>
<span class="token comment"># description: kibana</span>
<span class="token builtin class-name">export</span> <span class="token assign-left variable">ES_HOME</span><span class="token operator">=</span>/usr/local/kibana-8.10.1
<span class="token assign-left variable">LOG_FILE</span><span class="token operator">=</span><span class="token variable">$ES_HOME</span>/kibana.log

<span class="token keyword">case</span> <span class="token string">&quot;<span class="token variable">$1</span>&quot;</span> <span class="token keyword">in</span>
start<span class="token punctuation">)</span>
    <span class="token function">nohup</span> <span class="token function">su</span> es <span class="token parameter variable">-c</span> <span class="token string">&quot;cd <span class="token variable">$ES_HOME</span> &amp;&amp; ./bin/kibana -p pid &gt; <span class="token variable">$LOG_FILE</span> 2&gt;&amp;1 &amp;&quot;</span>
    <span class="token builtin class-name">echo</span> <span class="token string">&quot;Kibana started in the background. Check <span class="token variable">$LOG_FILE</span> for logs.&quot;</span>
    <span class="token punctuation">;</span><span class="token punctuation">;</span>
stop<span class="token punctuation">)</span>
    <span class="token function">kill</span> <span class="token parameter variable">-9</span> <span class="token variable"><span class="token variable">\`</span><span class="token function">cat</span> $ES_HOME/pid<span class="token variable">\`</span></span>
    <span class="token builtin class-name">echo</span> <span class="token string">&quot;Kibana stopped&quot;</span>
    <span class="token punctuation">;</span><span class="token punctuation">;</span>
restart<span class="token punctuation">)</span>
    <span class="token function">kill</span> <span class="token parameter variable">-9</span> <span class="token variable"><span class="token variable">\`</span><span class="token function">cat</span> $ES_HOME/pid<span class="token variable">\`</span></span>
    <span class="token builtin class-name">echo</span> <span class="token string">&quot;Kibana stopped&quot;</span>
    <span class="token function">nohup</span> <span class="token function">su</span> es <span class="token parameter variable">-c</span> <span class="token string">&quot;cd <span class="token variable">$ES_HOME</span> &amp;&amp; ./bin/kibana -p pid &gt; <span class="token variable">$LOG_FILE</span> 2&gt;&amp;1 &amp;&quot;</span>
    <span class="token builtin class-name">echo</span> <span class="token string">&quot;Kibana restarted in the background. Check <span class="token variable">$LOG_FILE</span> for logs.&quot;</span>
    <span class="token punctuation">;</span><span class="token punctuation">;</span>
*<span class="token punctuation">)</span>
    <span class="token builtin class-name">echo</span> <span class="token string">&quot;Usage: <span class="token variable">$0</span> {start|stop|restart}&quot;</span>
    <span class="token punctuation">;</span><span class="token punctuation">;</span>
<span class="token keyword">esac</span>
<span class="token builtin class-name">exit</span> <span class="token variable">$?</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>logstash</strong></p><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token shebang important">#!/bin/sh</span>
<span class="token comment"># chkconfig: - 85 15</span>
<span class="token comment"># description: logstash</span>
<span class="token builtin class-name">export</span> <span class="token assign-left variable">ES_HOME</span><span class="token operator">=</span>/usr/local/logstash-8.10.1
<span class="token assign-left variable">LOG_FILE</span><span class="token operator">=</span><span class="token variable">$ES_HOME</span>/logstash.log

<span class="token keyword">case</span> <span class="token string">&quot;<span class="token variable">$1</span>&quot;</span> <span class="token keyword">in</span>
start<span class="token punctuation">)</span>
    <span class="token function">su</span> es <span class="token parameter variable">-c</span> <span class="token string">&quot;cd <span class="token variable">$ES_HOME</span> &amp;&amp; ./bin/logstash -f ./config/logstash.conf &gt; <span class="token variable">$LOG_FILE</span> 2&gt;&amp;1 &amp;&quot;</span>
    <span class="token builtin class-name">echo</span> <span class="token string">&quot;Logstash started in the background.&quot;</span>
    <span class="token builtin class-name">echo</span> <span class="token string">&quot;To view the log, run: tail -f <span class="token variable">$LOG_FILE</span>&quot;</span>
    <span class="token punctuation">;</span><span class="token punctuation">;</span>  
*<span class="token punctuation">)</span>
    <span class="token builtin class-name">echo</span> <span class="token string">&quot;Usage: <span class="token variable">$0</span> {start|stop|restart}&quot;</span>
    <span class="token punctuation">;</span><span class="token punctuation">;</span>  
<span class="token keyword">esac</span>
<span class="token builtin class-name">exit</span> <span class="token variable">$?</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="内存配置" tabindex="-1"><a class="header-anchor" href="#内存配置"><span>内存配置</span></a></h2><ul><li>elasticsearch</li></ul><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token comment">#运行时内存在node.options中</span>
<span class="token parameter variable">-Xms1g</span>
<span class="token parameter variable">-Xmx1g</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ul><li><p>logstash 运行时内存配置只能在jvm.options中配</p></li><li><p>kibana</p></li></ul><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token comment">#运行时内存在node.options中</span>
--max-old-space-size<span class="token operator">=</span><span class="token number">1024</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div>`,21);function h(g,q){const a=i("ExternalLinkIcon");return o(),p("div",null,[r,s("blockquote",null,[d,s("ul",null,[s("li",null,[s("p",null,[u,n("：[Start the Elastic Stack with security enabled automatically | Elasticsearch Guide "),s("a",v,[n("8.10] | Elastic"),e(a)])])]),s("li",null,[s("p",null,[k,n("：[Set up minimal security for Elasticsearch | Elasticsearch Guide "),s("a",m,[n("8.10] | Elastic"),e(a)])])])])]),b])}const _=l(c,[["render",h],["__file","elk_deploy.html.vue"]]),E=JSON.parse('{"path":"/deploy/elk_deploy.html","title":"ELK 安装部署","lang":"zh-CN","frontmatter":{"order":2,"star":true,"date":"2024-04-01T00:00:00.000Z","copyright":false,"footer":true,"category":["deploy"],"tag":["deploy","docker","日志"]},"headers":[{"level":2,"title":"Elasticsearch","slug":"elasticsearch","link":"#elasticsearch","children":[]},{"level":2,"title":"Kibana","slug":"kibana","link":"#kibana","children":[]},{"level":2,"title":"Logstash","slug":"logstash","link":"#logstash","children":[]},{"level":2,"title":"启动脚本","slug":"启动脚本","link":"#启动脚本","children":[]},{"level":2,"title":"内存配置","slug":"内存配置","link":"#内存配置","children":[]}],"git":{"createdTime":1712219267000,"updatedTime":1712219267000,"contributors":[{"name":"mxoop","email":"1592013653@qq.com","commits":1}]},"readingTime":{"minutes":2.58,"words":773},"filePathRelative":"deploy/elk_deploy.md","localizedDate":"2024年4月1日","excerpt":"\\n<hr>\\n<ul>\\n<li>\\n<p>创建 <code>es</code>用户 。</p>\\n<div class=\\"language-text\\" data-ext=\\"text\\" data-title=\\"text\\"><pre class=\\"language-text\\"><code>adduser es\\n</code></pre></div></li>\\n</ul>\\n<h2>Elasticsearch</h2>\\n<blockquote>\\n<p><strong>参考文档：</strong></p>\\n<ul>\\n<li>\\n<p><em>重点</em>：[Start the Elastic Stack with security enabled automatically | Elasticsearch Guide <a href=\\"https://www.elastic.co/guide/en/elasticsearch/reference/8.10/configuring-stack-security.html#_use_the_ca_certificate_5\\" target=\\"_blank\\" rel=\\"noopener noreferrer\\">8.10] | Elastic</a></p>\\n</li>\\n<li>\\n<p><em>密码设置</em>：[Set up minimal security for Elasticsearch | Elasticsearch Guide <a href=\\"https://www.elastic.co/guide/en/elasticsearch/reference/8.10/security-minimal-setup.html\\" target=\\"_blank\\" rel=\\"noopener noreferrer\\">8.10] | Elastic</a></p>\\n</li>\\n</ul>\\n</blockquote>"}');export{_ as comp,E as data};
