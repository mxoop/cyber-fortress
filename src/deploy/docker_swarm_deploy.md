---
# title:
order: 4
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


# Docker集群➕Docker Registry搭建

---

> 环境介绍，四台虚拟机均使用桥接网络搭建

| hostname        | 用途                 | ip            |
| --------------- | -------------------- | ------------- |
| docker-registry | 搭建docker仓库       | 192.168.0.100 |
| docker-master   | docker集群主节点     | 192.168.0.101 |
| docker-worker1  | docker集群worker节点 | 192.168.0.102 |
| docker-worker2  | docker集群worker节点 | 192.168.0.103 |

**思路：**

- 搭建docker-registry节点，在节点中搭建docker环境，搭建registry2
- 克隆docker-registry，修改对应的主机名以及ip地址
- 验证其他节点能否拉取docker-registry节点的镜像
- 使用docker swarm搭建docker集群



> 会使用到命令

~~~shell
#修改主机名
sudo hostnamectl set-hostname 新主机名

#设置静态IP地址
vim /etc/sysconfig/network-scripts/ifcfg-ens33

#重启网卡生效
systemctl restart network.service
~~~

~~~shell
TYPE=Ethernet
PROXY_METHOD=none
BROWSER_ONLY=no
BOOTPROTO=static
DEFROUTE=yes
IPV4_FAILURE_FATAL=no
IPV6INIT=yes
IPV6_AUTOCONF=yes
IPV6_DEFROUTE=yes
IPV6_FAILURE_FATAL=no
IPV6_ADDR_GEN_MODE=stable-privacy
NAME=ens33
UUID=824ec4bd-a9ae-4410-8346-17ce7f3dd111
DEVICE=ens33
ONBOOT=yes
IPADDR=192.168.0.100
NETMASK=255.255.255.0
GATEWAY=192.168.0.1
DNS1=8.8.8.8
~~~

---



## docker-registry节点搭建

### docker环境搭建

>参考官网地址：[Install Docker Engine on CentOS | Docker Documentation](https://docs.docker.com/engine/install/centos/)

- 配置镜像加速

```shell
vim /etc/docker/daemon.json

{
 "registry-mirrors": ["http://hub-mirror.c.163.com"]
}

systemctl daemon-reload
systemctl restart docker.service
```



### docker registry搭建

~~~shell
docker run -d -p 5000:5000 --restart=always -v /mydata/registry:/var/lib/registry --name registry2 registry:2.8
~~~



- 配置docker http注册表

>参考官网：
>
>[测试不安全的注册表 |码头工人文档 (docker.com)](https://docs.docker.com/registry/insecure/)
>
>[为 Docker 守护程序配置远程访问 |码头工人文档](https://docs.docker.com/config/daemon/remote-access/)

~~~shell
echo '{ "insecure-registries":["192.168.0.100:5000"] }' > /etc/docker/daemon.json
~~~

- 每台虚拟机都配置docker-registry的地址，这样其他docker客户端就能拉取docker-registry的镜像了

- 修改配置后需要使用如下命令使配置生效

~~~shell
systemctl daemon-reload
~~~

- 重新启动Docker服务

~~~shell
systemctl restart docker
~~~

---



## 克隆虚拟机

- 克隆docker-registry节点，修改对应主机名及IP地址



### 测试效果

- 首先下载一个测试用的镜像`busybox`

~~~
docker pull busybox
~~~

- 给镜像`busybox`打上私有仓库的标签，并设置版本为`v1.0`

~~~
docker tag busybox 192.168.0.100:5000/busybox:v1.0
~~~

- 之后推送到私有镜像仓库去

~~~
docker push 192.168.0.100:5000/busybox:v1.0
~~~

- 在master节点拉取registry节点的镜像

~~~
docker pull 192.168.0.100:5000/busybox:v1.0
~~~

到这里，docker私有仓库搭建告一段落。后续在docker集群搭建完后，配置docker-registry远程api访问，以及TLS

---

## docker swarm 搭建集群

>官网地址：
>
>[群模式入门 |码头工人文档 (docker.com)](https://docs.docker.com/engine/swarm/swarm-tutorial/)



### 环境准备

- 在集群的每个节点都开放这三个端口

~~~shell
# 开放 2377/tcp 端口
sudo firewall-cmd --add-port=2377/tcp --permanent
# 开放 7946/tcp 和 7946/udp 端口
sudo firewall-cmd --add-port=7946/tcp --permanent
sudo firewall-cmd --add-port=7946/udp --permanent
# 开放 4789/udp 端口
sudo firewall-cmd --add-port=4789/udp --permanent
# 重新加载防火墙规则使其生效
sudo firewall-cmd --reload
~~~



### 创建集群

```shell
#在主节点执行
#docker swarm init --advertise-addr <MANAGER-IP>
docker swarm init --advertise-addr 192.168.0.101
Swarm initialized: current node (dxn1zf6l61qsb1josjja83ngz) is now a manager.

To add a worker to this swarm, run the following command:

    docker swarm join \
    --token SWMTKN-1-49nj1cmql0jkz5s954yi3oex3nedyz0fb0xx14ie39trti4wxv-8vxv8rssmk743ojnwacrr2e7c \
    192.168.0.101:2377

To add a manager to this swarm, run 'docker swarm join-token manager' and follow the instructions.
```

- 将节点添加到群中

```shell
 #在子节点执行上面生成的命令
 docker swarm join \
    --token SWMTKN-1-49nj1cmql0jkz5s954yi3oex3nedyz0fb0xx14ie39trti4wxv-8vxv8rssmk743ojnwacrr2e7c \
    192.168.0.101:2377
```

- 查看集群节点状态

```shell
[root@docker-master ~]# docker node ls
ID                            HOSTNAME         STATUS    AVAILABILITY   MANAGER STATUS   ENGINE VERSION
ep8anhf9h4uox6j00k81ixsbc *   docker-master    Ready     Active         Leader           24.0.5
xblpc7gpoztrwmg7k05d77b52     docker-worker1   Ready     Active                          24.0.5
og5uwjm5d50g5cv1avt525af1     docker-worker2   Ready     Active                          24.0.5
```



### 部署服务

```shell
[root@docker-registry ~]# docker pull nginx:1.25

[root@docker-registry ~]# docker tag nginx:1.25 192.168.0.100:5000/ngnix:v1.0

[root@docker-registry ~]# docker push 192.168.0.100:5000/ngnix:v1.0

[root@docker-master ~]# docker pull 192.168.0.100:5000/ngnix:v1.0

[root@docker-master ~]# docker service create --name mynginx --replicas 3 -p 8080:80 192.168.0.100:5000/ngnix:v1.0 
```



## 常用命令

- 查看运行的服务列表

```shell
docker service ls
```

- 查看服务详细信息

~~~shell
docker service inspect --pretty mynginx
~~~

- 查看服务在哪些节点正在运行

~~~shell
docker service ps mynginx
~~~

- 移除服务

```
docker service rm mynginx
```

- 移除节点

```shell
docker swarm leave
#如果是主节点
docker swarm leave --force
#节点离开群后，您可以在主节点：从节点列表中删除节点。
docker node rm <hostname>
```

