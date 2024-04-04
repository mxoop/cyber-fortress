---
# title:
order: 2
star: true
date: 2024-04-01
copyright: false
footer: true
category:
  - deploy
tag:
  - deploy
  - docker
  - 日志
---

# ELK 安装部署

---

- 创建 `es`用户 。

  ```
  adduser es
  ```

  

## Elasticsearch

>**参考文档：**
>
>- *重点*：[Start the Elastic Stack with security enabled automatically | Elasticsearch Guide [8.10\] | Elastic](https://www.elastic.co/guide/en/elasticsearch/reference/8.10/configuring-stack-security.html#_use_the_ca_certificate_5)
>
>
>- *密码设置*：[Set up minimal security for Elasticsearch | Elasticsearch Guide [8.10\] | Elastic](https://www.elastic.co/guide/en/elasticsearch/reference/8.10/security-minimal-setup.html)
>



>**注意事项：**
>
>
>- 新版本`elasticsearch`启动时就默认开启了`ssl`检查
>- 事先为ELK三个组件创建一个es用户，使用`chowdn -R es:es ./${组件目录名} `赋予权限，之后都用`es`用户启动
>- `kibana`与`elastic`使用命令建立关联，而`logstash`需要在配置文件配置http的ca证书和账户密码



- 解压至  `/usr/local` 目录
- 进入解压目录，修改**config/elasticsearch.yml**
- 添加以下几行

```shell
cluster.name: kwin-elk-es
node.name: node-1
path.data: /usr/local/elasticsearch-8.10.1/data
path.logs: /usr/local/elasticsearch-8.10.1/logs
network.host: 0.0.0.0
http.port: 9200
cluster.initial_master_nodes: ["node-1"]
http.cors.enabled: true
http.cors.allow-origin: "*"
```



- 创建对应的`data`、`logs`目录

- 将对应安装目录权限赋予 `es`  用户

  ```shell
   chown -R es /usr/local/elasticsearch
  ```

  

- 切换至 `es` 用户，后台启动。

  ```shell
  su es
  ./bin/elasticsearch -d
  ```

  

## Kibana



- 解压至 `/usr/local/ `目录

- 修改配置

  ```shell
  vim ./config/kibana.yml
  
  # 添加以下几行
  logging.appenders.default:
   type: file
   fileName: /usr/local/kibana-8.10.1/logs/kibana.log
   layout:
    type: json
  server.port: 5601
  server.host: 0.0.0.0
  server.publicBaseUrl: "http://192.168.0.194:5601"    #192.168.0.194为Elastic本机IP
  elasticsearch.hosts: ['https://192.168.0.194:9200']
  i18n.locale: zh-CN
  ```

  

- 文件授权

  ```shell
   chown -R es /usr/local/kibana-8.10.1
  ```

  

- 注册启用安全性`kibana`

  ```shell
  #参考命令
  bin/elasticsearch-create-enrollment-token -s kibana --url "https://192.168.0.194:9200"
  
  bin/kibana-setup --enrollment-token <enrollment-token>
  
  ```

  

- 切换用户并启动

  ```shell
  su es
  ./bin/kibana
  #后台启动
  nohup ./bin/kibana &
  ```



## Logstash



- 解压至 `/usr/local/` 目录

- 修改配置文件

  ```shell
  cp config/logstash-sample.conf config/logstash.conf
  vim config/logstash.conf
  ```

  **logstash.conf**

  ```shell
  # Sample Logstash configuration for creating a simple
  # Beats -> Logstash -> Elasticsearch pipeline.
  
  input {
    tcp {
      mode => "server"
      host => "0.0.0.0"
      port => 4570
      codec => json_lines
      type => "debug"
    }
    tcp {
      mode => "server"
      host => "0.0.0.0"
      port => 4571
      codec => json_lines
      type => "error"
    }
    tcp {
      mode => "server"
      host => "0.0.0.0"
      port => 4572
      codec => json_lines
      type => "business"
    }
    tcp {
      mode => "server"
      host => "0.0.0.0"
      port => 4573
      codec => json_lines
      type => "record"
    }
  }
  filter {
    if [type] == "record" {
      mutate {
        remove_field => ["port", "host", "@version"]
      }
      json {
        source => "message"
        remove_field => ["message"]
      }
      ruby {
        code => 'event.set("parameter", event.get("parameter").to_json)'
      }
      ruby {
        code => 'event.set("result", event.get("result").to_json)'
      }
    }
  }
  
  output {
    elasticsearch {
      hosts => ["https://192.168.0.194:9200"]	#elastic 主机IP地址
      index => "kwin-%{type}-%{+YYYY.MM.dd}" #索引匹配规则
      ssl => true
      cacert => "/usr/local/elasticsearch-8.10.1/config/certs/http_ca.crt" #elastic 默认安全目录
      user => "elastic" #elastic 用户名
      password => "S4dcMP3FsEKEmQWTtWsA" #elastic 用户密码
    }
  }
  
  ```

  

- 启动

  ```shell
   nohup ./bin/logstash -f ./config/logstash.conf &
  ```

  

## 启动脚本

脚本目录：`/etc/init.d`

**elasticsearch**

```bash
#!/bin/sh
# chkconfig: - 85 15
#description: elasticsearch
export ES_HOME=/usr/local/elasticsearch-6.2.3
 
case "$1" in
start)
    su es<<!
    cd $ES_HOME
    ./bin/elasticsearch -d -p pid
!
    echo "elasticsearch startup"
    ;;  
stop)
    kill -9 `cat $ES_HOME/pid`
    echo "elasticsearch stopped"
    ;;  
restart)
    kill -9 `cat $ES_HOME/pid`
    echo "elasticsearch stopped"
    su es<<!
    cd $ES_HOME
    ./bin/elasticsearch -d -p pid
!
    echo "elasticsearch startup"
    ;;  
*)
    echo "start|stop|restart"
    ;;  
esac
exit $?
```



**kibana**

```bash
#!/bin/sh
# chkconfig: - 85 15
# description: kibana
export ES_HOME=/usr/local/kibana-8.10.1
LOG_FILE=$ES_HOME/kibana.log

case "$1" in
start)
    nohup su es -c "cd $ES_HOME && ./bin/kibana -p pid > $LOG_FILE 2>&1 &"
    echo "Kibana started in the background. Check $LOG_FILE for logs."
    ;;
stop)
    kill -9 `cat $ES_HOME/pid`
    echo "Kibana stopped"
    ;;
restart)
    kill -9 `cat $ES_HOME/pid`
    echo "Kibana stopped"
    nohup su es -c "cd $ES_HOME && ./bin/kibana -p pid > $LOG_FILE 2>&1 &"
    echo "Kibana restarted in the background. Check $LOG_FILE for logs."
    ;;
*)
    echo "Usage: $0 {start|stop|restart}"
    ;;
esac
exit $?

```



**logstash**

```bash
#!/bin/sh
# chkconfig: - 85 15
# description: logstash
export ES_HOME=/usr/local/logstash-8.10.1
LOG_FILE=$ES_HOME/logstash.log

case "$1" in
start)
    su es -c "cd $ES_HOME && ./bin/logstash -f ./config/logstash.conf > $LOG_FILE 2>&1 &"
    echo "Logstash started in the background."
    echo "To view the log, run: tail -f $LOG_FILE"
    ;;  
*)
    echo "Usage: $0 {start|stop|restart}"
    ;;  
esac
exit $?

```



## 内存配置



- elasticsearch

~~~shell
#运行时内存在node.options中
-Xms1g
-Xmx1g
~~~

- logstash 运行时内存配置只能在jvm.options中配

- kibana

~~~shell
#运行时内存在node.options中
--max-old-space-size=1024
~~~
