import{_ as l,r as i,o as p,c as o,a as n,e as a,f as e,d as t}from"./app-DPhaBOmn.js";const c={},u=t('<h1 id="lpg-日志收集部署" tabindex="-1"><a class="header-anchor" href="#lpg-日志收集部署"><span>LPG 日志收集部署</span></a></h1><hr><h2 id="下载安装" tabindex="-1"><a class="header-anchor" href="#下载安装"><span>下载安装</span></a></h2><h3 id="loki" tabindex="-1"><a class="header-anchor" href="#loki"><span>Loki</span></a></h3>',4),r=n("p",null,"官网地址：",-1),d={href:"https://github.com/grafana/loki/releases/",target:"_blank",rel:"noopener noreferrer"},k=n("ul",null,[n("li",null,"Linux下载：loki-linux-amd64.zip")],-1),m=n("h3",{id:"promtail",tabindex:"-1"},[n("a",{class:"header-anchor",href:"#promtail"},[n("span",null,"Promtail")])],-1),v=n("p",null,"官网地址：",-1),b={href:"https://github.com/grafana/loki/releases/",target:"_blank",rel:"noopener noreferrer"},h=n("ul",null,[n("li",null,"Linux下载：promtail-linux-amd64.zip")],-1),g=n("h3",{id:"grafana",tabindex:"-1"},[n("a",{class:"header-anchor",href:"#grafana"},[n("span",null,"Grafana")])],-1),f=n("p",null,"官网地址：开源版",-1),y={href:"https://grafana.com/grafana/download?platform=linux&edition=oss",target:"_blank",rel:"noopener noreferrer"},_=t(`<ul><li>Linux下载：grafana-10.3.3.linux-amd64.tar.gz</li></ul><div class="language-text line-numbers-mode" data-ext="text" data-title="text"><pre class="language-text"><code>zip：使用 unzip your_file -d path

tar.gz：使用 tar -zxvf your_file -C path
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="配置启动" tabindex="-1"><a class="header-anchor" href="#配置启动"><span>配置启动</span></a></h2><h3 id="loki配置" tabindex="-1"><a class="header-anchor" href="#loki配置"><span>Loki配置</span></a></h3><blockquote><p>https://grafana.com/docs/loki/latest/configure/</p></blockquote><div class="language-yaml line-numbers-mode" data-ext="yml" data-title="yml"><pre class="language-yaml"><code><span class="token key atrule">auth_enabled</span><span class="token punctuation">:</span> <span class="token boolean important">false</span>

<span class="token key atrule">server</span><span class="token punctuation">:</span>
  <span class="token key atrule">http_listen_port</span><span class="token punctuation">:</span> <span class="token number">3100</span>
  <span class="token key atrule">grpc_listen_port</span><span class="token punctuation">:</span> <span class="token number">9096</span>

<span class="token key atrule">common</span><span class="token punctuation">:</span>
  <span class="token key atrule">instance_addr</span><span class="token punctuation">:</span> 127.0.0.1
  <span class="token key atrule">path_prefix</span><span class="token punctuation">:</span> /mydata/loki/tmp/loki
  <span class="token key atrule">storage</span><span class="token punctuation">:</span>
    <span class="token key atrule">filesystem</span><span class="token punctuation">:</span>
      <span class="token key atrule">chunks_directory</span><span class="token punctuation">:</span> /mydata/loki/tmp/loki/chunks
      <span class="token key atrule">rules_directory</span><span class="token punctuation">:</span> /mydata/loki/tmp/loki/rules
  <span class="token key atrule">replication_factor</span><span class="token punctuation">:</span> <span class="token number">1</span>
  <span class="token key atrule">ring</span><span class="token punctuation">:</span>
    <span class="token key atrule">kvstore</span><span class="token punctuation">:</span>
      <span class="token key atrule">store</span><span class="token punctuation">:</span> inmemory

<span class="token key atrule">schema_config</span><span class="token punctuation">:</span>
  <span class="token key atrule">configs</span><span class="token punctuation">:</span>
    <span class="token punctuation">-</span> <span class="token key atrule">from</span><span class="token punctuation">:</span> <span class="token datetime number">2020-10-24</span>
      <span class="token key atrule">store</span><span class="token punctuation">:</span> boltdb<span class="token punctuation">-</span>shipper
      <span class="token key atrule">object_store</span><span class="token punctuation">:</span> filesystem
      <span class="token key atrule">schema</span><span class="token punctuation">:</span> v11
      <span class="token key atrule">index</span><span class="token punctuation">:</span>
        <span class="token key atrule">prefix</span><span class="token punctuation">:</span> index_
        <span class="token key atrule">period</span><span class="token punctuation">:</span> 24h

<span class="token key atrule">storage_config</span><span class="token punctuation">:</span>      <span class="token comment"># 为索引和块配置存储方式</span>
  <span class="token key atrule">boltdb_shipper</span><span class="token punctuation">:</span>
    <span class="token key atrule">active_index_directory</span><span class="token punctuation">:</span> /mydata/loki/index
    <span class="token key atrule">cache_location</span><span class="token punctuation">:</span> /mydata/loki/index_cache
    <span class="token key atrule">cache_ttl</span><span class="token punctuation">:</span> 24h         
    <span class="token key atrule">shared_store</span><span class="token punctuation">:</span> filesystem
  <span class="token key atrule">filesystem</span><span class="token punctuation">:</span>
    <span class="token key atrule">directory</span><span class="token punctuation">:</span> /mydata/loki/chunks

<span class="token key atrule">limits_config</span><span class="token punctuation">:</span>  <span class="token comment">#设置全局和每租户限制</span>
  <span class="token key atrule">reject_old_samples</span><span class="token punctuation">:</span> <span class="token boolean important">true</span> <span class="token comment">#是否拒绝旧样本。默认值为 true</span>
  <span class="token key atrule">reject_old_samples_max_age</span><span class="token punctuation">:</span> 1w <span class="token comment">#拒绝旧样本的最大年龄。默认值为 1w（1周）。</span>
  <span class="token key atrule">max_streams_per_user</span><span class="token punctuation">:</span> <span class="token number">5000</span> <span class="token comment">#每个用户的最大活动流数。默认值为 0（禁用）。</span>
  <span class="token key atrule">ingestion_rate_mb</span><span class="token punctuation">:</span> <span class="token number">32</span>
  <span class="token key atrule">ingestion_burst_size_mb</span><span class="token punctuation">:</span> <span class="token number">64</span>

<span class="token key atrule">table_manager</span><span class="token punctuation">:</span>
  <span class="token key atrule">retention_deletes_enabled</span><span class="token punctuation">:</span> <span class="token boolean important">true</span>  <span class="token comment">#允许删除数据库表中的过期数据。</span>
  <span class="token key atrule">retention_period</span><span class="token punctuation">:</span> 168h <span class="token comment">#设置数据保留的时间段，超过此时间的表将被删除。</span>

<span class="token key atrule">ingester</span><span class="token punctuation">:</span>
  <span class="token key atrule">chunk_idle_period</span><span class="token punctuation">:</span> 30m  <span class="token comment">#块在没有更新的情况下在内存中停留的持续时间，如果它们没有达到最大块大小，则会被刷新。这意味着即使是半空的块也会在一定时间后被刷新，只要它们不再收到活动，默认为30分钟。</span>
  <span class="token key atrule">chunk_block_size</span><span class="token punctuation">:</span> <span class="token number">262144</span> <span class="token comment">#块的目标未压缩大小，当超过此阈值时，头块将被剪切并在块内压缩，默认为262144字节。</span>
  <span class="token key atrule">chunk_retain_period</span><span class="token punctuation">:</span> 1m  <span class="token comment">#刷新后内存中保留块的持续时间，默认为0秒。</span>
  <span class="token key atrule">max_transfer_retries</span><span class="token punctuation">:</span> <span class="token number">0</span>  <span class="token comment">#在降级到刷新之前尝试传输块的次数。如果设置为0或负值，则禁用传输，默认为0。</span>
  <span class="token key atrule">lifecycler</span><span class="token punctuation">:</span>       <span class="token comment">#配置ingester的生命周期，以及在哪里注册以进行发现</span>
    <span class="token key atrule">ring</span><span class="token punctuation">:</span>
      <span class="token key atrule">kvstore</span><span class="token punctuation">:</span>
        <span class="token key atrule">store</span><span class="token punctuation">:</span> inmemory      <span class="token comment"># 用于ring的后端存储，支持consul、etcd、inmemory</span>
      <span class="token key atrule">replication_factor</span><span class="token punctuation">:</span> <span class="token number">1</span>  <span class="token comment"># 写入和读取的ingester数量，至少为1（为了冗余和弹性，默认情况下为3）</span>

<span class="token key atrule">compactor</span><span class="token punctuation">:</span>
  <span class="token key atrule">working_directory</span><span class="token punctuation">:</span> /mydata/loki/compactor
  <span class="token key atrule">shared_store</span><span class="token punctuation">:</span> filesystem

<span class="token key atrule">ruler</span><span class="token punctuation">:</span>
  <span class="token key atrule">alertmanager_url</span><span class="token punctuation">:</span> http<span class="token punctuation">:</span>//localhost<span class="token punctuation">:</span><span class="token number">9093</span>

<span class="token comment"># By default, Loki will send anonymous, but uniquely-identifiable usage and configuration</span>
<span class="token comment"># analytics to Grafana Labs. These statistics are sent to https://stats.grafana.org/</span>
<span class="token comment">#</span>
<span class="token comment"># Statistics help us better understand how Loki is used, and they show us performance</span>
<span class="token comment"># levels for most users. This helps us prioritize features and documentation.</span>
<span class="token comment"># For more information on what&#39;s sent, look at</span>
<span class="token comment"># https://github.com/grafana/loki/blob/main/pkg/usagestats/stats.go</span>
<span class="token comment"># Refer to the buildReport method to see what goes into a report.</span>
<span class="token comment">#</span>
<span class="token comment"># If you would like to disable reporting, uncomment the following lines:</span>
<span class="token key atrule">analytics</span><span class="token punctuation">:</span>
  <span class="token key atrule">reporting_enabled</span><span class="token punctuation">:</span> <span class="token boolean important">false</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="promtail配置" tabindex="-1"><a class="header-anchor" href="#promtail配置"><span>Promtail配置</span></a></h3><blockquote><p>https://grafana.com/docs/loki/latest/send-data/promtail/configuration/</p></blockquote><div class="language-yaml line-numbers-mode" data-ext="yml" data-title="yml"><pre class="language-yaml"><code><span class="token key atrule">server</span><span class="token punctuation">:</span>
  <span class="token key atrule">http_listen_port</span><span class="token punctuation">:</span> <span class="token number">9080</span>
  <span class="token key atrule">grpc_listen_port</span><span class="token punctuation">:</span> <span class="token number">0</span>

<span class="token key atrule">positions</span><span class="token punctuation">:</span>
  <span class="token key atrule">filename</span><span class="token punctuation">:</span> /mydata/promtail/tmp/positions.yaml

<span class="token key atrule">clients</span><span class="token punctuation">:</span>
  <span class="token punctuation">-</span> <span class="token key atrule">url</span><span class="token punctuation">:</span> http<span class="token punctuation">:</span>//localhost<span class="token punctuation">:</span>3100/loki/api/v1/push

<span class="token key atrule">scrape_configs</span><span class="token punctuation">:</span>
<span class="token punctuation">-</span> <span class="token key atrule">job_name</span><span class="token punctuation">:</span> debug	<span class="token comment">#根据需要可定义多个</span>
  <span class="token key atrule">static_configs</span><span class="token punctuation">:</span>
  <span class="token punctuation">-</span> <span class="token key atrule">targets</span><span class="token punctuation">:</span>
      <span class="token punctuation">-</span> localhost
    <span class="token key atrule">labels</span><span class="token punctuation">:</span>
      <span class="token key atrule">job</span><span class="token punctuation">:</span> debug
      <span class="token key atrule">__path__</span><span class="token punctuation">:</span> /kwin/kwin<span class="token punctuation">-</span>cloud<span class="token punctuation">-</span>bloc/logs/debug/<span class="token important">*log</span>  <span class="token comment">#实际的日志文件目录</span>
  <span class="token key atrule">pipeline_stages</span><span class="token punctuation">:</span> <span class="token comment">#可有可无</span>
    <span class="token punctuation">-</span> <span class="token key atrule">cri</span><span class="token punctuation">:</span> <span class="token punctuation">{</span><span class="token punctuation">}</span>
    <span class="token punctuation">-</span> <span class="token key atrule">match</span><span class="token punctuation">:</span>
        <span class="token key atrule">selector</span><span class="token punctuation">:</span> <span class="token string">&#39;{job=&quot;debug&quot;}&#39;</span>
        <span class="token key atrule">stages</span><span class="token punctuation">:</span>
          <span class="token punctuation">-</span> <span class="token key atrule">regex</span><span class="token punctuation">:</span>
              <span class="token comment"># 官方提供的正则表达式，但是有问题：解析为流之后就不能读取到之后的标签，所以pipeline_stages这段代码可用可无</span>
              <span class="token key atrule">expression</span><span class="token punctuation">:</span> <span class="token string">&quot;^(?s)(?P&lt;time&gt;\\\\S+?) (?P&lt;stream&gt;stdout|stderr) (?P&lt;level&gt;\\\\S+?) (?P&lt;content&gt;.*)$&quot;</span>
          <span class="token punctuation">-</span> <span class="token key atrule">labels</span><span class="token punctuation">:</span>
              <span class="token key atrule">stream</span><span class="token punctuation">:</span>
              <span class="token key atrule">level</span><span class="token punctuation">:</span>
              <span class="token key atrule">content</span><span class="token punctuation">:</span>
          <span class="token punctuation">-</span> <span class="token key atrule">timestamp</span><span class="token punctuation">:</span>
              <span class="token key atrule">source</span><span class="token punctuation">:</span> time
              <span class="token key atrule">format</span><span class="token punctuation">:</span> RFC3339Nano
          <span class="token punctuation">-</span> <span class="token key atrule">output</span><span class="token punctuation">:</span>
              <span class="token key atrule">source</span><span class="token punctuation">:</span> content

<span class="token punctuation">-</span> <span class="token key atrule">job_name</span><span class="token punctuation">:</span> error
  <span class="token key atrule">static_configs</span><span class="token punctuation">:</span>
  <span class="token punctuation">-</span> <span class="token key atrule">targets</span><span class="token punctuation">:</span>
      <span class="token punctuation">-</span> localhost
    <span class="token key atrule">labels</span><span class="token punctuation">:</span>
      <span class="token key atrule">job</span><span class="token punctuation">:</span> error
      <span class="token key atrule">__path__</span><span class="token punctuation">:</span> /kwin/kwin<span class="token punctuation">-</span>cloud<span class="token punctuation">-</span>bloc/logs/error/<span class="token important">*log</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="grafana配置" tabindex="-1"><a class="header-anchor" href="#grafana配置"><span>Grafana配置</span></a></h3><div class="language-ini line-numbers-mode" data-ext="ini" data-title="ini"><pre class="language-ini"><code><span class="token comment"># 配置位于	grafana-10.1.0/conf/defaults.ini 保持默认就行</span>

<span class="token section"><span class="token punctuation">[</span><span class="token section-name selector">server</span><span class="token punctuation">]</span></span>
<span class="token comment"># Protocol (http, https, h2, socket)</span>
<span class="token key attr-name">protocol</span> <span class="token punctuation">=</span> <span class="token value attr-value">http</span>

<span class="token comment"># Minimum TLS version allowed. By default, this value is empty. Accepted values are: TLS1.2, TLS1.3. If nothing is set TLS1.2 would be taken</span>
<span class="token key attr-name">min_tls_version</span> <span class="token punctuation">=</span> <span class="token value attr-value">&quot;&quot;</span>

<span class="token comment"># The ip address to bind to, empty will bind to all interfaces</span>
<span class="token key attr-name">http_addr</span> <span class="token punctuation">=</span>

<span class="token comment"># The http port to use</span>
<span class="token key attr-name">http_port</span> <span class="token punctuation">=</span> <span class="token value attr-value">3000	#最后的访问端口地址</span>

<span class="token comment"># The public facing domain name used to access grafana from a browser</span>
<span class="token key attr-name">domain</span> <span class="token punctuation">=</span> <span class="token value attr-value">localhost</span>

<span class="token comment"># Redirect to correct domain if host header does not match domain</span>
<span class="token comment"># Prevents DNS rebinding attacks</span>
<span class="token key attr-name">enforce_domain</span> <span class="token punctuation">=</span> <span class="token value attr-value">false</span>

<span class="token comment"># The full public facing url</span>
<span class="token key attr-name">root_url</span> <span class="token punctuation">=</span> <span class="token value attr-value">%(protocol)s://%(domain)s:%(http_port)s/</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="启动命令" tabindex="-1"><a class="header-anchor" href="#启动命令"><span>启动命令</span></a></h3><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token comment"># Loki</span>
<span class="token comment"># 方式1：后台启动，输出日志到指定目录</span>
<span class="token function">nohup</span> ./loki-linux-amd64 <span class="token parameter variable">-config.file</span><span class="token operator">=</span>loki-local-config.yaml <span class="token operator">&gt;</span> loki.log <span class="token operator"><span class="token file-descriptor important">2</span>&gt;</span><span class="token file-descriptor important">&amp;1</span> <span class="token operator">&amp;</span>
<span class="token comment"># 方式2：后台启动，输出日志到nohup默认文件地址，当前目录下nohup.out文件。</span>
<span class="token function">nohup</span> ./loki-linux-amd64 <span class="token parameter variable">-config.file</span><span class="token operator">=</span>loki-local-config.yaml <span class="token operator">&amp;</span>

<span class="token comment"># promtail</span>
<span class="token function">nohup</span> ./promtail-linux-amd64 <span class="token parameter variable">-config.file</span><span class="token operator">=</span>promtail-local-config.yaml <span class="token operator">&gt;</span> promtail.log <span class="token operator"><span class="token file-descriptor important">2</span>&gt;</span><span class="token file-descriptor important">&amp;1</span> <span class="token operator">&amp;</span>
<span class="token function">nohup</span> ./promtail-linux-amd64 <span class="token parameter variable">-config.file</span><span class="token operator">=</span>promtail-local-config.yaml <span class="token operator">&amp;</span>

<span class="token comment"># grafana</span>
<span class="token function">nohup</span> ./grafana-server <span class="token operator">&amp;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="启动脚本" tabindex="-1"><a class="header-anchor" href="#启动脚本"><span>启动脚本</span></a></h3><h4 id="loki-sh" tabindex="-1"><a class="header-anchor" href="#loki-sh"><span><strong>loki.sh</strong></span></a></h4><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token shebang important">#!/bin/bash</span>

<span class="token assign-left variable">LOKI_PATH</span><span class="token operator">=</span><span class="token string">&quot;/usr/local/lpg/loki&quot;</span>

<span class="token function-name function">stop_loki</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token builtin class-name">echo</span> <span class="token string">&quot;Stopping loki&quot;</span>
    <span class="token function">ps</span> <span class="token parameter variable">-ef</span> <span class="token operator">|</span> <span class="token function">grep</span> <span class="token string">&quot;<span class="token variable">$LOKI_PATH</span>/loki-linux-amd64&quot;</span> <span class="token operator">|</span> <span class="token function">grep</span> <span class="token parameter variable">-v</span> <span class="token function">grep</span> <span class="token operator">|</span> <span class="token function">awk</span> <span class="token string">&#39;{print $2}&#39;</span> <span class="token operator">|</span> <span class="token function">xargs</span> <span class="token function">kill</span> <span class="token parameter variable">-9</span>
<span class="token punctuation">}</span>

<span class="token function-name function">start_loki</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token builtin class-name">echo</span> <span class="token string">&quot;Starting loki&quot;</span>
    <span class="token function">nohup</span> <span class="token string">&quot;<span class="token variable">$LOKI_PATH</span>/loki-linux-amd64&quot;</span> <span class="token parameter variable">--config.file</span><span class="token operator">=</span><span class="token string">&quot;<span class="token variable">$LOKI_PATH</span>/loki-local-config.yaml&quot;</span> <span class="token operator">&amp;</span>
<span class="token punctuation">}</span>

<span class="token function-name function">restart_loki</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    stop_loki
    <span class="token function">sleep</span> <span class="token number">1</span>
    start_loki
<span class="token punctuation">}</span>

<span class="token keyword">case</span> <span class="token string">&quot;<span class="token variable">$1</span>&quot;</span> <span class="token keyword">in</span>
    start<span class="token punctuation">)</span>
        start_loki
        <span class="token punctuation">;</span><span class="token punctuation">;</span>
    stop<span class="token punctuation">)</span>
        stop_loki
        <span class="token punctuation">;</span><span class="token punctuation">;</span>
    restart<span class="token punctuation">)</span>
        restart_loki
        <span class="token punctuation">;</span><span class="token punctuation">;</span>
    *<span class="token punctuation">)</span>
        <span class="token builtin class-name">echo</span> <span class="token string">&quot;Usage: <span class="token variable">$0</span> {start|stop|restart}&quot;</span>
        <span class="token builtin class-name">exit</span> <span class="token number">1</span>
        <span class="token punctuation">;</span><span class="token punctuation">;</span>
<span class="token keyword">esac</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h4 id="promtail-sh" tabindex="-1"><a class="header-anchor" href="#promtail-sh"><span>promtail.sh</span></a></h4><div class="language-bash line-numbers-mode" data-ext="sh" data-title="sh"><pre class="language-bash"><code><span class="token shebang important">#!/bin/bash</span>

<span class="token assign-left variable">PROMTAIL_PATH</span><span class="token operator">=</span><span class="token string">&quot;/usr/local/lpg/promtail&quot;</span>
<span class="token assign-left variable">CONFIG_FILE</span><span class="token operator">=</span><span class="token string">&quot;<span class="token variable">$PROMTAIL_PATH</span>/promtail-local-config.yaml&quot;</span>
<span class="token assign-left variable">PROMTAIL_BINARY</span><span class="token operator">=</span><span class="token string">&quot;<span class="token variable">$PROMTAIL_PATH</span>/promtail-linux-amd64&quot;</span>

<span class="token function-name function">start_promtail</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token builtin class-name">echo</span> <span class="token string">&quot;Starting promtail&quot;</span>
    <span class="token function">nohup</span> <span class="token string">&quot;<span class="token variable">$PROMTAIL_BINARY</span>&quot;</span> <span class="token parameter variable">-config.file</span><span class="token operator">=</span><span class="token string">&quot;<span class="token variable">$CONFIG_FILE</span>&quot;</span> <span class="token operator">&amp;</span>
<span class="token punctuation">}</span>

<span class="token function-name function">stop_promtail</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    <span class="token builtin class-name">echo</span> <span class="token string">&quot;Stopping promtail&quot;</span>
    <span class="token function">ps</span> <span class="token parameter variable">-ef</span> <span class="token operator">|</span> <span class="token function">grep</span> <span class="token string">&quot;<span class="token variable">$PROMTAIL_BINARY</span>&quot;</span> <span class="token operator">|</span> <span class="token function">grep</span> <span class="token parameter variable">-v</span> <span class="token function">grep</span> <span class="token operator">|</span> <span class="token function">awk</span> <span class="token string">&#39;{print $2}&#39;</span> <span class="token operator">|</span> <span class="token function">xargs</span> <span class="token function">kill</span> <span class="token parameter variable">-9</span>
<span class="token punctuation">}</span>

<span class="token function-name function">restart_promtail</span><span class="token punctuation">(</span><span class="token punctuation">)</span> <span class="token punctuation">{</span>
    stop_promtail
    <span class="token function">sleep</span> <span class="token number">1</span>
    start_promtail
<span class="token punctuation">}</span>

<span class="token keyword">case</span> <span class="token string">&quot;<span class="token variable">$1</span>&quot;</span> <span class="token keyword">in</span>
    start<span class="token punctuation">)</span>
        start_promtail
        <span class="token punctuation">;</span><span class="token punctuation">;</span>
    stop<span class="token punctuation">)</span>
        stop_promtail
        <span class="token punctuation">;</span><span class="token punctuation">;</span>
    restart<span class="token punctuation">)</span>
        restart_promtail
        <span class="token punctuation">;</span><span class="token punctuation">;</span>
    *<span class="token punctuation">)</span>
        <span class="token builtin class-name">echo</span> <span class="token string">&quot;Usage: <span class="token variable">$0</span> {start|stop|restart}&quot;</span>
        <span class="token builtin class-name">exit</span> <span class="token number">1</span>
        <span class="token punctuation">;</span><span class="token punctuation">;</span>
<span class="token keyword">esac</span>

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="访问-数据源配置" tabindex="-1"><a class="header-anchor" href="#访问-数据源配置"><span>访问，数据源配置</span></a></h2><ul><li>通过 http://ip:3000 访问 （grafana 的defaults.ini 文件配置）</li><li>默认账户是admin/admin</li><li>进入页面配置数据源，datesource选择 loki</li></ul>`,20);function x(q,L){const s=i("ExternalLinkIcon");return p(),o("div",null,[u,n("blockquote",null,[r,n("p",null,[n("a",d,[a("Releases · grafana/loki (github.com)"),e(s)])])]),k,m,n("blockquote",null,[v,n("p",null,[n("a",b,[a("Releases · grafana/loki (github.com)"),e(s)])])]),h,g,n("blockquote",null,[f,n("p",null,[n("a",y,[a("Download Grafana | Grafana Labs"),e(s)])])]),_])}const T=l(c,[["render",x],["__file","lpg_deploy.html.vue"]]),P=JSON.parse('{"path":"/deploy/lpg_deploy.html","title":"LPG 日志收集部署","lang":"zh-CN","frontmatter":{"order":6,"star":true,"date":"2024-04-01T00:00:00.000Z","copyright":false,"footer":true,"category":["deploy"],"tag":["deploy","日志"]},"headers":[{"level":2,"title":"下载安装","slug":"下载安装","link":"#下载安装","children":[{"level":3,"title":"Loki","slug":"loki","link":"#loki","children":[]},{"level":3,"title":"Promtail","slug":"promtail","link":"#promtail","children":[]},{"level":3,"title":"Grafana","slug":"grafana","link":"#grafana","children":[]}]},{"level":2,"title":"配置启动","slug":"配置启动","link":"#配置启动","children":[{"level":3,"title":"Loki配置","slug":"loki配置","link":"#loki配置","children":[]},{"level":3,"title":"Promtail配置","slug":"promtail配置","link":"#promtail配置","children":[]},{"level":3,"title":"Grafana配置","slug":"grafana配置","link":"#grafana配置","children":[]},{"level":3,"title":"启动命令","slug":"启动命令","link":"#启动命令","children":[]},{"level":3,"title":"启动脚本","slug":"启动脚本","link":"#启动脚本","children":[]}]},{"level":2,"title":"访问，数据源配置","slug":"访问-数据源配置","link":"#访问-数据源配置","children":[]}],"git":{"createdTime":1712219267000,"updatedTime":1713321832000,"contributors":[{"name":"mxoop","email":"1592013653@qq.com","commits":3}]},"readingTime":{"minutes":3.81,"words":1144},"filePathRelative":"deploy/lpg_deploy.md","localizedDate":"2024年4月1日","excerpt":"\\n<hr>\\n<h2>下载安装</h2>\\n<h3>Loki</h3>\\n<blockquote>\\n<p>官网地址：</p>\\n<p><a href=\\"https://github.com/grafana/loki/releases/\\" target=\\"_blank\\" rel=\\"noopener noreferrer\\">Releases · grafana/loki (github.com)</a></p>\\n</blockquote>\\n<ul>\\n<li>Linux下载：loki-linux-amd64.zip</li>\\n</ul>\\n<h3>Promtail</h3>\\n<blockquote>\\n<p>官网地址：</p>\\n<p><a href=\\"https://github.com/grafana/loki/releases/\\" target=\\"_blank\\" rel=\\"noopener noreferrer\\">Releases · grafana/loki (github.com)</a></p>\\n</blockquote>"}');export{T as comp,P as data};
