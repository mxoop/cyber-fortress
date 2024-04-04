---
# title:
order: 3
star: true
date: 2024-04-01
copyright: false
footer: true
category:
  - deploy
tag:
  - deploy
  - docker
---


# Linux监控之netdata部署

---


>官网地址：[Install Netdata with Docker | Learn Netdata](https://learn.netdata.cloud/docs/netdata-agent/installation/docker#recommended-way)



### docker

~~~shell
docker run -d --name=netdata \
  --pid=host \
  --network=host \
  -v /mydata/netdata/netdataconfig:/etc/netdata \
  -v /mydata/netdata/netdatalib:/var/lib/netdata \
  -v /mydata/netdata/netdatacache:/var/cache/netdata \
  -v /etc/passwd:/host/etc/passwd:ro \
  -v /etc/group:/host/etc/group:ro \
  -v /etc/localtime:/etc/localtime:ro \
  -v /proc:/host/proc:ro \
  -v /sys:/host/sys:ro \
  -v /etc/os-release:/host/etc/os-release:ro \
  -v /var/log:/host/var/log:ro \
  -v /var/run/docker.sock:/var/run/docker.sock:ro \
  --restart unless-stopped \
  --cap-add SYS_PTRACE \
  --cap-add SYS_ADMIN \
  --security-opt apparmor=unconfined \
  netdata/netdata

~~~



- #### 启动

~~~shell
#开启防火墙19999
firewall-cmd --zone=public --add-port=19999/tcp --permanent

firewall-cmd --reload

firewall-cmd --zone=public --list-ports

#访问
http://IP:19999
~~~

