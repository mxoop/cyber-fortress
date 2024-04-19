---
# title: 
order: 1
star: true
date: 2024-04-017
copyright: false
footer: true
category:
  - 随笔
tag:
  - 随笔
  - mysql
---

# Mysql优化中，你不知道的秘密！



***前言：*** 本文记录的是一次从开发到测试环境上线的接口调优之MySQL调优手段。

---



## 1、如何优化Mysql?

最好是按照以下顺序优化：

1.  SQL 语句及索引的优化 
2. 数据库表结构的优化 
3. 系统配置的优化 
4. 硬件的优化



## 2、如何加索引？

在加索引之前我们首先要知道MySQL索引一共有哪些类型以及它们的区别，对数据库有哪些影响。所以在加索引之前要考虑以下几点：

- 索引有哪些类型？主键、唯一索引、联合索引、普通索引
- 每种的索引的应用场景是什么？
- 建立索引的原则？
- 什么情况不应该建立索引？
- 什么情况索引会失效？
- 对数据库带来的影响？

"*本章节类容对索引不作详细讨论*"



## 3、场景回顾



*背景：项目准备上线，计划首先部署在测服务器，执行流程测试，观测核心业务在并发测试下的性能如何，并在这期间调整服务器相关配置。当前要测试的核心业务接口简要说明一下：根据上传的EPC去五张大表和4张中间表中查询它的五级关联关系，五张大表分别对应不同类型的EPC，通过查询结果往不同的表入库（更新/新增）的过程。*



使用`jmeter`测试时发现在并发量比较低时并没有报错，当并发量上去问题就出来了。

### a.  获取数据库连接超时

数据库连接超时可能有多种原因，包括但不限于以下几点：

- **网络问题：**

   - 网络不稳定或者延迟高可能导致连接超时。这可能是因为网络拥塞、防火墙配置问题、或者数据库服务器故障等原因造成的。
- **数据库服务器负载过高：**
   - 数据库服务器的负载过高可能导致无法及时处理新的连接请求，从而造成连接超时。
- **数据库配置问题：**

   - 数据库连接池配置不合理，连接池中的连接数量不足，或者连接超时设置过短等都可能导致连接超时。
- **数据库服务器配置问题：**
   - 数据库服务器配置不当，例如内存不足、磁盘空间不足等，可能会影响数据库的正常运行，进而导致连接超时。
- **长时间运行的查询或事务：**
   - 如果有长时间运行的查询或者事务占用了数据库资源，可能会影响到其他连接的正常使用，导致连接超时。
- **数据库死锁：**
   - 数据库中出现死锁情况时，会导致某些连接无法获取所需资源而超时。
- **数据库连接池泄漏：**

   - 如果应用程序中存在数据库连接池泄漏，即获取了连接但未释放，会导致连接池中的连接被耗尽，进而造成连接超时。

   

### b. Mysql 语句执行超时

1. **Lock Wait Timeout**
2. **Deadlock**

`MySQL lock wait timeout`和`deadlock`是两种不同的数据库并发控制问题，具有不同的原因和解决方法。

- **Lock Wait Timeout**:
  - 当一个事务在等待另一个事务持有的锁超过了指定的时间时，就会发生`MySQL lock wait timeout`。这种情况通常发生在一个事务试图获取一个被另一个事务持有的锁时，但由于另一个事务未释放锁，导致当前事务一直处于等待状态。
  - 原因可能是锁竞争，或者某些事务长时间占用锁导致其他事务等待超时。解决方法通常是优化查询、合理设计事务逻辑、增加数据库连接池等。
  - 这种情况下，通常不会出现死锁，因为没有循环等待的情况。
- **Deadlock**:
  - `Deadlock`是指两个或多个事务相互等待对方持有的锁，导致所有事务都无法继续执行的情况。例如，事务A持有锁1并等待锁2，而事务B持有锁2并等待锁1，这样就形成了死锁。
  - 发生死锁时，MySQL会检测到并中断其中一个事务（通常是后发生的事务），释放其持有的锁以解除死锁。被中断的事务会收到一个错误信息，可以在应用程序中捕获并处理。
  - 解决死锁的方法包括通过数据库配置、优化查询、调整事务逻辑、尽量减少事务持有锁的时间等手段来减少死锁的发生概率。

总的来说，`MySQL lock wait timeout`是一个事务在等待锁超时的情况，而`deadlock`是多个事务相互等待对方持有的锁而无法继续执行的情况。两者的处理方式和原因略有不同，但都是数据库并发控制中需要关注和解决的问题。



### c. OpenFeign 超时

`OpenFeign`超时通常是于网络延迟、目标服务响应时间长或者请求量大导致的。要解决`OpenFeign`超时问题，可以考虑以下几个方面：

- **调整超时时间**：可以通过配置`OpenFeign`的连接超时时间和读取超时时间来适应不同的网络环境和服务响应时间。通过增加超时时间来容忍更长的响应时间，或者减少超时时间来更快地失败并重试。
- **优化目标服务**：如果目标服务响应时间过长，可以考虑对目标服务进行优化，包括优化数据库查询、提高服务性能、减少网络延迟等，以缩短响应时间。
- **限流和熔断**：通过限流和熔断等机制控制请求流量，避免因请求过多导致服务响应变慢。可以使用类似`Hystrix`等熔断器来在目标服务不可用时快速失败，而不是无限等待。
- **并发调用**：如果`OpenFeign`客户端需要大量并发调用目标服务，可以考虑使用连接池来管理HTTP连接，以减少建立连接的开销，并提高请求的并发性能。
- **重试机制**：在`OpenFeign`客户端配置重试机制，可以在请求超时或失败时进行重试，以增加请求成功的概率。
- **日志记录**：记录`OpenFeign`请求和响应的日志，以便及时发现问题并进行排查。



### d. 应用程序 OOM

- 出现该超时也是意料之中，因为当前业务大量的利用内存去实现，而`VM`参数又没有调整。

### e. nacos OOM

- 默认单机启动的`VM`参数500M左右，并发一高根本不够用，参考官方文档 `nacos2.x `的配置即可

### f. Mysql 关联查询语句执行缓慢

- 语句执行慢可能是因为没有加索引导致出现间隙锁甚至锁表
- 大表关联查询数据量越大执行越慢
- sql 参数传递过多

### g. redis 获取连接超时

- 不要使用默认连接池，使用`jedis`连接池。



## 4、解决办法

 

#### 数据库

##### 重新配置druid数据源

~~~yml
    druid:
      # 初始连接数
      initial-size: 5
      # 最小连接池数量
      min-idle: 10
      # 最大连接池数量
      max-active: 40
      # 配置获取连接等待超时的时间
      max-wait: 60000
      # 配置间隔多久才进行一次检测，检测需要关闭的空闲连接，单位是毫秒
      time-between-eviction-runs-millis: 60000
      # 配置一个连接在池中最小生存的时间，单位是毫秒
      min-evictable-idle-time-millis: 300000
      # 配置一个连接在池中最大生存的时间，单位是毫秒
      max-evictable-idle-time-millis: 900000
      # 配置检测连接是否有效
      validation-query: SELECT 1 FROM DUAL
      # 申请连接的时候检测，如果空闲时间大于timeBetweenEvictionRunsMillis，执行validationQuery检测连接是否有效。
      test-while-idle: true
      # 申请连接时会执行validationQuery检测连接是否有效,开启会降低性能,默认为true
      test-on-borrow: false
      # 归还连接时会执行validationQuery检测连接是否有效,开启会降低性能,默认为true
      test-on-return: false
      # 配置监拉统计挡成的filters. stat: 监控统计、Log4j:日志记录、waLL: 防御sqL注入
      filters: stat, slf4j
      # 是否缓存preparedStatement
      pool-prepared-statements: true
      # 连接超时时间，指的是连接数据库时等待数据库的响应时间。如果在指定的时间内没有建立连接，连接就会失败
      connect-timeout: 60000
      # Socket超时时间，指的是已经建立连接后，发送请求后等待数据库响应的时间。如果在指定的时间内没有接收到响应，连接将被关闭。
      socket-timeout: 60000
      # 是否启用TCP连接的Keep-Alive机制。Keep-Alive机制是一种保持长连接的机制，它允许在一段时间内没有数据交换时保持连接处于打开状态，而不被服务器关闭。设置为true表示启用Keep-Alive机制。
      keep-alive: true
~~~

##### 调整mysql 服务配置

- 设置max_connections和connect_timeout

~~~sql
# 查询语句
show VARIABLES like '%timeout%'
show VARIABLES like '%connection%'

# 配置语句，重启则失效。
SET GLOBAL connect_timeout = 60;
SET GLOBAL max_connections = 5000;

# 可选配置调整
mysqlx_read_timeout 默认30 和 mysqlx_write_timeout 默认60
~~~

- 锁等待超时时间

~~~sql
# innodb_lock_wait_timeout
是MySQL InnoDB存储引擎的一个参数，用于指定事务等待锁释放的超时时间，单位为秒。具体来说，如果一个事务请求获取一个被其他事务持有的锁，那么它会等待一段时间（由innodb_lock_wait_timeout指定），如果在这段时间内锁没有被释放，该事务将抛出一个超时错误。
~~~

##### 升级CPU和内存

- 升级CPU的同时需要调整druid连接池的最大连接池数量`max-active`

~~~yml
max-active 参数默认为8，一般可配置为：CPU核数 x 3 + 1；
配置越大，执行可能越慢，cpu也会升高；
配置低了可能导致高并发时获取不到连接。
~~~

- 需要注意的是CPU升级的同时，需要考虑数据库并发事务带来的影响。



#### Redis

在高并发时，发现redis经常会出现获取不到连接或者超时。查阅相关资料得出结论并验证后解决办法：

- 指定`jedis`为`redistemplate`连接池

~~~xml
# 在redis starter中排除掉依赖并引入jedis包即可

<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
    <exclusions>
        <exclusion>
            <groupId>io.lettuce</groupId>
            <artifactId>lettuce-core</artifactId>
        </exclusion>
    </exclusions>
</dependency>

<dependency>
    <groupId>redis.clients</groupId>
    <artifactId>jedis</artifactId>
    <version>3.9.0</version>
</dependency>
~~~



#### OpenFeign

##### 配置连接池

- POM 引入相关依赖

~~~xml
<!-- openFeign 依赖包-->
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-openfeign</artifactId>
</dependency>

<dependency>
    <groupId>io.github.openfeign</groupId>
    <artifactId>feign-okhttp</artifactId>
</dependency>
~~~

- 在yml中配置启用

~~~yml
feign:
  okhttp:
    enabled: true
  client:
    config:
      default:
        connectTimeout: 5000
        readTimeout: 5000
        loggerLevel: basic
~~~



##### 配置超时时间

- 全局配置

~~~yml
client:
    config:
      default:
        connectTimeout: 5000
        readTimeout: 5000
        loggerLevel: basic
~~~

- 为单个服务设置超时时间

~~~yml
#对单个服务设置超时，会覆盖默认的超时
feign.client.config.springboot-mybatis.connectTimeout=2000
feign.client.config.springboot-mybatis.readTimeout=11000
~~~

- 为单个接口设置超时时间

~~~
# thinking...
~~~



##### 配置重试次数

- 如果不配置，openfeign默认是不重试的，看FeignClientsConfiguration中的代码：

~~~java
@Bean
@ConditionalOnMissingBean
public Retryer feignRetryer() {
  return Retryer.NEVER_RETRY;
}
~~~

- 重试的配置

~~~java
@Configuration
public class FeignConfigure {

    @Bean
    public Retryer feignRetryer() {
        // 使用默认的重试策略，最大重试次数为5，初始间隔为100毫秒，最大间隔为1秒，间隔乘数为2
        return new Retryer.Default();
    }
}
~~~

- 自定义重试策略
  - 实现Retryer接口，自定义重试策略

~~~java
import feign.RetryableException;
import feign.Retryer;

import java.util.concurrent.TimeUnit;

public class CustomRetryer implements Retryer {

    private final int maxAttempts;
    private final long period;
    private final long maxPeriod;
    private int attempt;

    public CustomRetryer() {
        this(5, 100, 1000);
    }

    public CustomRetryer(int maxAttempts, long period, long maxPeriod) {
        this.maxAttempts = maxAttempts;
        this.period = period;
        this.maxPeriod = maxPeriod;
        this.attempt = 1;
    }

    @Override
    public void continueOrPropagate(RetryableException e) {
        if (attempt++ >= maxAttempts) {
            throw e;
        }
        long interval = getNextInterval();
        try {
            Thread.sleep(interval);
        } catch (InterruptedException ignored) {
            Thread.currentThread().interrupt();
        }
    }

    @Override
    public Retryer clone() {
        return new CustomRetryer(maxAttempts, period, maxPeriod);
    }

    protected long getNextInterval() {
        long nextInterval = this.period * (long) Math.pow(2, this.attempt - 1);
        return Math.min(nextInterval, this.maxPeriod);
    }
}

~~~

在这个示例中，`CustomRetryer`类实现了`feign.Retryer`接口，并覆盖了其中的两个方法：`continueOrPropagate`和`clone`。`continueOrPropagate`方法定义了重试逻辑，当发生重试时，该方法会决定是否继续重试或者抛出异常。`clone`方法用于克隆一个重试器实例。

你可以根据需要调整`CustomRetryer`类中的重试次数、重试间隔和最大间隔等参数。然后，在配置类中使用自定义的重试器，如下所示：

~~~~java
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FeignConfig {

    @Bean
    public CustomRetryer customRetryer() {
        // 自定义重试策略
        return new CustomRetryer();
    }
}

~~~~

#### JVM启动参数

##### 应用程序

~~~
-Xmx4g
-Xms4g
-XX:+UseG1GC
-XX:MaxGCPauseMillis=50
-XX:ParallelGCThreads=4
-XX:+PrintGCDetails
-XX:+PrintGCDateStamps
-Xloggc:./kwin-dealer/gc.log
-XX:MaxMetaspaceSize=2g
-Xss1m
-XX:+HeapDumpOnOutOfMemoryError
-XX:HeapDumpPath=D:\MyWorkPlace\Kwin\kwin-cloud-bloc\kwin-dealer\
-Dsun.net.client.defaultConnectTimeout=2000
-Dsun.net.client.defaultReadTimeout=2000
-Duser.timezone=GMT+08
-Dfile.encoding=UTF-8
-XX:MaxHeapFreeRatio=40
-XX:+AlwaysPreTouch
~~~



##### nacos

>https://nacos.io/docs/v2/upgrading/200-compatibility/

~~~
JAVA_OPT="${JAVA_OPT} -server -Xms9216m -Xmx9216m  -XX:MaxDirectMemorySize=4096m -XX:NewSize=4096m  -XX:+UnlockDiagnosticVMOptions -XX:+PrintNMTStatistics   -DisPushContent=false -XX:MaxNewSize=4096m -XX:MetaspaceSize=512m -XX:MaxMetaspaceSize=512m -XX:-OmitStackTraceInFastThrow -XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/home/admin/nacos/logs/java_heapdump.hprof -XX:-UseLargePages -Xloggc:/home/admin/nacos/logs/nacos_gc.log -verbose:gc -XX:+PrintGCDetails -XX:+PrintGCDateStamps -XX:+PrintGCTimeStamps -XX:+UseGCLogFileRotation -XX:NumberOfGCLogFiles=10 -XX:GCLogFileSize=100M -DQUERYTIMEOUT=90  -XX:SurvivorRatio=10 -XX:+UseConcMarkSweepGC -XX:+UseCMSCompactAtFullCollection -XX:+CMSClassUnloadingEnabled -XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/home/admin/nacos/logs -XX:+PrintGCDetails -XX:+PrintGCDateStamps -XX:CMSMaxAbortablePrecleanTime=5000 -XX:CMSInitiatingOccupancyFraction=74 -XX:+UseCMSInitiatingOccupancyOnly -XX:ParallelGCThreads=8 -Dnacos.core.auth.enabled=false "
~~~



#### Mysql 慢查询

- 大表关联查询转为储存过程
- 增加索引，避免锁表
- 设置合适的隔离级别
- 缩小事务，避免执行批量语句。批量sql执行效率在高并发时容易造成`lock wait`超时，即使`where`条件是采用主键或者唯一索引依然如此
- 预防死锁
