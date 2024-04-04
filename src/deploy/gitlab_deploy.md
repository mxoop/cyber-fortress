---
# title:
order: 5
star: true
date: 2024-04-01
copyright: false
footer: true
category:
  - deploy
tag:
  - deploy
  - git
---

# Gitlab 安装部署

---

>安装Gitlab 参考官网及博客链接
>
>官网：[Download and install GitLab | GitLab](https://about.gitlab.com/install/#ubuntu)
>
>博客：[Ubuntu16.04搭建GitLab服务器教程-腾讯云开发者社区-腾讯云 (tencent.com)](https://cloud.tencent.com/developer/article/1486766)
>
>社区版：[GitLab-ce](https://packages.gitlab.com/gitlab/gitlab-ce)



## Gitlab配置

### 更换gitlab ip地址

~~~shell
#打开gitlab.rb 文件
cd /etc/gitlab
vim gitlab.rb

#设置访问链接，搜索关键词external_url，修改url为你本地的IP
external_url 'http://{你的IP}'
~~~



### 修改端口

~~~shell
#由于GitLab默认在80端口，可能和本地服务冲突，可以选择其他端口号替代。
#搜索关键词nginx['listen_port']，修改端口为指定端口10001
nginx['listen_port'] = 8099
	
#修改端口后为了保持统一，需要将访问链接修改成加上端口号的url
external_url 'http://{你的IP}:{你的端口号}'
~~~



- 以上配置，需要执行以下命令才能生效。

  ~~~shell
  sudo gitlab-ctl reconfigure
  sudo gitlab-ctl restart
  ~~~



### 常用命令

| 命令                                   | 作用                              |
| :------------------------------------- | :-------------------------------- |
| gitlab-ctl reconfigure                 | 修改gitlab.rb文件之后重新加载配置 |
| gitlab-ctl status                      | 查看 GitLab 状态                  |
| gitlab-ctl start                       | 启动 GitLab                       |
| gitlab-ctl stop                        | 停止 GitLab                       |
| gitlab-ctl restart                     | 重启 GitLab                       |
| gitlab-ctl tail                        | 查看所有日志                      |
| gitlab-ctl tail nginx/gitlab_acces.log | 查看 nginx 访问日志               |
| gitlab-ctl tail postgresql             | 查看 postgresql 日志              |



### 备份Gitlab

#### 创建备份文件

- 使用下列命令创建GitLab备份

```javascript
sudo gitlab-rake gitlab:backup:create
```



- 然后便会在 `/var/opt/gitlab/backups`目录下创建一个类似于*15504156082019021711.5.1gitlabbackup.tar*的文件. 其中开头部分是创建的日期.

#### 修改备份目录

- 首先打开gitlab.rb文件

```javascript
cd /etc/gitlab
vim gitlab.rb
```

- 找到下列命令

```javascript
gitlab_rails['backup_path'] = "/var/opt/gitlab/backups"
```

- 然后修改后面的地址即可. 修改完成之后重启配置文件生效.

```javascript
sudo gitlab-ctl reconfigure
```

#### 设置自动备份机制

手动备份过于麻烦, 所以通过crontab设置自动备份. crontab文件之中, 每一行表示一项任务, 每行的每个字段表示一项设置. crontab共6个字段, 其中前5个字段设置执行的时间段, 第6个字段设置命令.

```javascript
m h dom mon dow user user command
```

其中

> m： 表示分钟，可以是从0到59之间的任何整数。 h：表示小时，可以是从0到23之间的任何整数。 dom：表示日期，可以是从1到31之间的任何整数。 mon：表示月份，可以是从1到12之间的任何整数。 dow：表示星期几，可以是从0到7之间的任何整数，这里的0或7代表星期日。 user : 表示执行的用户。 command：要执行的命令，可以是系统命令，也可以是自己编写的脚本文件(如shell文件)。

- 现在我们来实现每天23点自动备份GitLab文件, crontab命令如下

```javascript
sudo vim /etc/crontab

0 23 * * * /opt/gitlab/bin/gitlab-rake gitlab:backup:create CRON=1
```



- 为保证安全, 使用**双备份机制**. 所以再加一个crontab任务, 设置每天23点1分, 将生成的gitlab文件放到外置硬盘之中, crontab命令如下

```javascript
1 23 * * * cp -rf /var/opt/gitlab/backups/* /media/cciip/新加卷1/gitlab_backup/
```



- 编辑完/etc/crontab文件之后, 需要重新启动crontab服务, 命令如下

```javascript
# 重新加载cron配置文件
sudo service cron reload
# 重启cron服务
sudo service cron restart
```



至此, 便能进行自动备份, 而且是双备份机制.

#### 设置备份过期时间

GitLab每天在备份, 文件会一直增大, 所以最好设置个过期时间, 比如7天.

- 首先打开/etc/gitlab/gitlab.rb文件

```javascript
cd /etc/gitlab
sudo vim gitlab.rb
```



- 找到下列命令

```javascript
# gitlab_rails['backup_keep_time'] = 604800
```



- 修改为

```javascript
# 604800 = 60*60*24*7
gitlab_rails['backup_keep_time'] = 604800
```



- 最后重启GitLab配置文件即可.

```javascript
sudo gitlab-ctl reconfigure
```



#### 恢复备份文件

- 如果想要将GitLab服务器迁移到其他主机上, 首先确保新服务器GitLab版本和老服务器GitLab版本相同.

然后copy备份文件到新服务器上. 比如此时我把192.168.1.25服务器上的备份文件拷贝到192.168.1.24上面, 可以通过如下命令进行.

```javascript
scp /var/opt/gitlab/backups/1550415608_2019_02_17_11.5.1_gitlab_backup.tar root@192.168.1.24:/var/opt/gitlab/backups
```



- 然后在192.168.1.24服务器上进行如下操作
  - 将备份文件权限改为777

```javascript
chmod 777 1550415608_2019_02_17_11.5.1_gitlab_backup.tar
```



- 执行命令停止相关数据连接服务

```javascript
gitlab-ctl stop unicorn
gitlab-ctl stop sidekiq
```



- 执行命令从备份文件中恢复GitLab

```javascript
gitlab-rake gitlab:backup:restore BACKUP=1550415608_2019_02_17_11.5.1_gitlab_backup.tar
```



- 最后启动GitLab服务器即可

```javascript
sudo gitlab-ctl start
```