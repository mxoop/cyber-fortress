---
order: 8
star: true
date: 2024-10-12
copyright: false
footer: true
category:
  - deploy
tag:
  - deploy
  - dockr
---

# 使用Maven插件打包 Docker镜像到 Docker Desktop



## **Dokcer 开启远程访问**

- 在`Docker Desktop` 程序中，设置-General-勾选 “Expose daemon on tcp://localhost:2375 without TLS”

- 本地IP与`2375`端口代理配置

  如果用的网线就使用以太网的IP，用的是WIFI就使用无线局域网IP地址。

  ~~~shell
  # 使用cmd管理员命令执行，%EXPOSE_IP% 替换为上面获取的IP
  netsh interface portproxy add v4tov4 listenport=2375 listenaddress=%EXPOSE_IP% connectaddress=127.0.0.1 connectport=2375
  ~~~

- 验证当前配置

  ~~~shell
  # 使用该命令查询端口代理配置
  netsh interface portproxy show all
  
  # 测试
  Test-NetConnection -ComputerName %EXPOSE_IP% -Port 2375
  ~~~



## **Maven插件配置**

- 其中docker 的远程地址即是上面获取的IP: `%EXPOSE_IP% `
- SpringBoot项目所需的环境地址比如：mysql、redis，它们的IP也需要替换为：`%EXPOSE_IP% `
- 插件中配置的暴露的端口号，也是项目的端口号，也是在启动镜像时需要配置的向外暴露的端口号

~~~xml
<plugin>
    <groupId>io.fabric8</groupId>
    <artifactId>docker-maven-plugin</artifactId>
    <version>${docker.maven.plugin.version}</version>
    <executions>
        <!--如果想在项目打包时构建镜像添加-->
        <execution>
            <id>build-image</id>
            <phase>package</phase>
            <goals>
                <goal>build</goal>
            </goals>
        </execution>
    </executions>
    <configuration>
        <!-- Docker 远程管理地址-->
        <dockerHost>${docker.host}</dockerHost>
        <images>
            <image>
                <!--定义镜像名称-->
                <name>fortress/${project.name}:${project.version}</name>
                <!--定义镜像构建行为-->
                <build>
                    <!--定义基础镜像-->
                    <from>java:openjdk-8u111</from>
                    <args>
                        <JAR_FILE>${project.build.finalName}.jar</JAR_FILE>
                    </args>
                    <!--定义哪些文件拷贝到容器中-->
                    <assembly>
                        <!--定义拷贝到容器的目录-->
                        <targetDir>/</targetDir>
                        <!--只拷贝生成的jar包-->
                        <descriptorRef>artifact</descriptorRef>
                    </assembly>
                    <!-- 暴露的端口号 -->
                    <ports>
                        <port>8081</port>
                    </ports>
                    <!--定义容器启动命令-->
                    <entryPoint>["java","-jar","/${project.build.finalName}.jar"]</entryPoint>
                    <!--定义维护者-->
                    <maintainer>mxoop</maintainer>
                </build>
            </image>
        </images>
    </configuration>
</plugin>
~~~

