---
# title:
order: 6
star: true
date: 2024-04-01
copyright: false
footer: true
category:
  - deploy
tag:
  - deploy
  - 日志
---

# LPG 日志收集部署

---

## 下载安装

### Loki

> 官网地址：
>
> [Releases · grafana/loki (github.com)](https://github.com/grafana/loki/releases/)

- Linux下载：loki-linux-amd64.zip

### Promtail

> 官网地址：
>
> [Releases · grafana/loki (github.com)](https://github.com/grafana/loki/releases/)

- Linux下载：promtail-linux-amd64.zip

### Grafana

> 官网地址：开源版
>
> [Download Grafana | Grafana Labs](https://grafana.com/grafana/download?platform=linux&edition=oss)

- Linux下载：grafana-10.3.3.linux-amd64.tar.gz

~~~
zip：使用 unzip your_file -d path

tar.gz：使用 tar -zxvf your_file -C path
~~~



## 配置启动

### Loki配置

>https://grafana.com/docs/loki/latest/configure/

~~~yaml
auth_enabled: false

server:
  http_listen_port: 3100
  grpc_listen_port: 9096

common:
  instance_addr: 127.0.0.1
  path_prefix: /mydata/loki/tmp/loki
  storage:
    filesystem:
      chunks_directory: /mydata/loki/tmp/loki/chunks
      rules_directory: /mydata/loki/tmp/loki/rules
  replication_factor: 1
  ring:
    kvstore:
      store: inmemory

schema_config:
  configs:
    - from: 2020-10-24
      store: boltdb-shipper
      object_store: filesystem
      schema: v11
      index:
        prefix: index_
        period: 24h

storage_config:      # 为索引和块配置存储方式
  boltdb_shipper:
    active_index_directory: /mydata/loki/index
    cache_location: /mydata/loki/index_cache
    cache_ttl: 24h         
    shared_store: filesystem
  filesystem:
    directory: /mydata/loki/chunks

limits_config:  #设置全局和每租户限制
  reject_old_samples: true #是否拒绝旧样本。默认值为 true
  reject_old_samples_max_age: 1w #拒绝旧样本的最大年龄。默认值为 1w（1周）。
  max_streams_per_user: 5000 #每个用户的最大活动流数。默认值为 0（禁用）。
  ingestion_rate_mb: 32
  ingestion_burst_size_mb: 64

table_manager:
  retention_deletes_enabled: true  #允许删除数据库表中的过期数据。
  retention_period: 168h #设置数据保留的时间段，超过此时间的表将被删除。

ingester:
  chunk_idle_period: 30m  #块在没有更新的情况下在内存中停留的持续时间，如果它们没有达到最大块大小，则会被刷新。这意味着即使是半空的块也会在一定时间后被刷新，只要它们不再收到活动，默认为30分钟。
  chunk_block_size: 262144 #块的目标未压缩大小，当超过此阈值时，头块将被剪切并在块内压缩，默认为262144字节。
  chunk_retain_period: 1m  #刷新后内存中保留块的持续时间，默认为0秒。
  max_transfer_retries: 0  #在降级到刷新之前尝试传输块的次数。如果设置为0或负值，则禁用传输，默认为0。
  lifecycler:       #配置ingester的生命周期，以及在哪里注册以进行发现
    ring:
      kvstore:
        store: inmemory      # 用于ring的后端存储，支持consul、etcd、inmemory
      replication_factor: 1  # 写入和读取的ingester数量，至少为1（为了冗余和弹性，默认情况下为3）

compactor:
  working_directory: /mydata/loki/compactor
  shared_store: filesystem

ruler:
  alertmanager_url: http://localhost:9093

# By default, Loki will send anonymous, but uniquely-identifiable usage and configuration
# analytics to Grafana Labs. These statistics are sent to https://stats.grafana.org/
#
# Statistics help us better understand how Loki is used, and they show us performance
# levels for most users. This helps us prioritize features and documentation.
# For more information on what's sent, look at
# https://github.com/grafana/loki/blob/main/pkg/usagestats/stats.go
# Refer to the buildReport method to see what goes into a report.
#
# If you would like to disable reporting, uncomment the following lines:
analytics:
  reporting_enabled: false

~~~



### Promtail配置

>https://grafana.com/docs/loki/latest/send-data/promtail/configuration/

~~~yaml
server:
  http_listen_port: 9080
  grpc_listen_port: 0

positions:
  filename: /mydata/promtail/tmp/positions.yaml

clients:
  - url: http://localhost:3100/loki/api/v1/push

scrape_configs:
- job_name: debug	#根据需要可定义多个
  static_configs:
  - targets:
      - localhost
    labels:
      job: debug
      __path__: /kwin/kwin-cloud-bloc/logs/debug/*log  #实际的日志文件目录
  pipeline_stages: #可有可无
    - cri: {}
    - match:
        selector: '{job="debug"}'
        stages:
          - regex:
              # 官方提供的正则表达式，但是有问题：解析为流之后就不能读取到之后的标签，所以pipeline_stages这段代码可用可无
              expression: "^(?s)(?P<time>\\S+?) (?P<stream>stdout|stderr) (?P<level>\\S+?) (?P<content>.*)$"
          - labels:
              stream:
              level:
              content:
          - timestamp:
              source: time
              format: RFC3339Nano
          - output:
              source: content

- job_name: error
  static_configs:
  - targets:
      - localhost
    labels:
      job: error
      __path__: /kwin/kwin-cloud-bloc/logs/error/*log

~~~



### Grafana配置

~~~ini
# 配置位于	grafana-10.1.0/conf/defaults.ini 保持默认就行

[server]
# Protocol (http, https, h2, socket)
protocol = http

# Minimum TLS version allowed. By default, this value is empty. Accepted values are: TLS1.2, TLS1.3. If nothing is set TLS1.2 would be taken
min_tls_version = ""

# The ip address to bind to, empty will bind to all interfaces
http_addr =

# The http port to use
http_port = 3000	#最后的访问端口地址

# The public facing domain name used to access grafana from a browser
domain = localhost

# Redirect to correct domain if host header does not match domain
# Prevents DNS rebinding attacks
enforce_domain = false

# The full public facing url
root_url = %(protocol)s://%(domain)s:%(http_port)s/
~~~



### 启动命令

~~~shell
# Loki
# 方式1：后台启动，输出日志到指定目录
nohup ./loki-linux-amd64 -config.file=loki-local-config.yaml > loki.log 2>&1 &
# 方式2：后台启动，输出日志到nohup默认文件地址，当前目录下nohup.out文件。
nohup ./loki-linux-amd64 -config.file=loki-local-config.yaml &

# promtail
nohup ./promtail-linux-amd64 -config.file=promtail-local-config.yaml > promtail.log 2>&1 &
nohup ./promtail-linux-amd64 -config.file=promtail-local-config.yaml &

# grafana
nohup ./grafana-server &
~~~



### 启动脚本

#### **loki.sh**

~~~bash
#!/bin/bash

LOKI_PATH="/usr/local/lpg/loki"

stop_loki() {
    echo "Stopping loki"
    ps -ef | grep "$LOKI_PATH/loki-linux-amd64" | grep -v grep | awk '{print $2}' | xargs kill -9
}

start_loki() {
    echo "Starting loki"
    nohup "$LOKI_PATH/loki-linux-amd64" --config.file="$LOKI_PATH/loki-local-config.yaml" &
}

restart_loki() {
    stop_loki
    sleep 1
    start_loki
}

case "$1" in
    start)
        start_loki
        ;;
    stop)
        stop_loki
        ;;
    restart)
        restart_loki
        ;;
    *)
        echo "Usage: $0 {start|stop|restart}"
        exit 1
        ;;
esac
~~~



#### promtail.sh

~~~bash
#!/bin/bash

PROMTAIL_PATH="/usr/local/lpg/promtail"
CONFIG_FILE="$PROMTAIL_PATH/promtail-local-config.yaml"
PROMTAIL_BINARY="$PROMTAIL_PATH/promtail-linux-amd64"

start_promtail() {
    echo "Starting promtail"
    nohup "$PROMTAIL_BINARY" -config.file="$CONFIG_FILE" &
}

stop_promtail() {
    echo "Stopping promtail"
    ps -ef | grep "$PROMTAIL_BINARY" | grep -v grep | awk '{print $2}' | xargs kill -9
}

restart_promtail() {
    stop_promtail
    sleep 1
    start_promtail
}

case "$1" in
    start)
        start_promtail
        ;;
    stop)
        stop_promtail
        ;;
    restart)
        restart_promtail
        ;;
    *)
        echo "Usage: $0 {start|stop|restart}"
        exit 1
        ;;
esac

~~~



## 访问，数据源配置

- 通过 http://ip:3000 访问 （grafana 的defaults.ini 文件配置）
- 默认账户是admin/admin
- 进入页面配置数据源，datesource选择 loki
