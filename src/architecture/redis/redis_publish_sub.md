---
order: 1
star: true
date: 2024-07-02
copyright: false
footer: true
category:
  - 架构
tag:
  - redis
---



# Redis 发布订阅的进阶使用



## **介绍**

​		Redis的发布订阅（Pub/Sub）模式是一种消息通信模式，其中消息发布者（Publisher）将消息发送到一个或多个频道（Channels），而消息订阅者（Subscriber）可以订阅这些频道，以接收发布到该频道的消息。这种模式适用于实时消息传递、通知系统、聊天系统等场景。以下是对Redis发布订阅模式的详细介绍：

**关键概念**

1. **频道（Channel）**：频道是一个命名的消息通道，发布者发布消息到频道，订阅者订阅频道以接收消息。
2. **发布者（Publisher）**：发布者是发送消息的一方，将消息发布到一个或多个频道。
3. **订阅者（Subscriber）**：订阅者是接收消息的一方，订阅一个或多个频道以接收发布到这些频道的消息。

**工作流程**

1. **订阅频道**：订阅者通过`SUBSCRIBE`命令订阅一个或多个频道。例如，`SUBSCRIBE channel1 channel2`。
2. **发布消息**：发布者通过`PUBLISH`命令将消息发布到指定的频道。例如，`PUBLISH channel1 "Hello, World!"`。
3. **接收消息**：所有订阅了该频道的订阅者都会接收到发布者发布的消息。



### **优点**

1. **实时消息传递**：消息可以实时传递给订阅者，适用于即时通信系统。

2. **简单易用**：使用简单的命令即可实现消息发布和订阅。

### **缺点**

1. **不可持久化**：Redis的发布订阅模式不提供消息持久化，消息一旦发送，如果没有订阅者在线将丢失。

2. **扩展性**：在大型分布式系统中，单个Redis实例的发布订阅模式可能无法满足需求，需要借助其他消息队列系统（如Kafka、RabbitMQ）来实现更高的扩展性和可靠性。



## **使用**

### **单主题模式**

**配置类**

~~~java
@Configuration
public class RedisConfig {

	// 省略其他配置

    @Autowired
    private List<AbstractMessageSubscriber> subscribers;

    @Bean
    public MessageListenerAdapter messageListenerAdapter() {
        return new MessageListenerAdapter(new Object() {
            public void handleMessage(String messageContent) {
                for (AbstractMessageSubscriber subscriber : subscribers) {
                    subscriber.handleMessage(messageContent);
                }
            }
        }, "handleMessage");
    }

    @Bean
    public RedisMessageListenerContainer redisContainer(RedisConnectionFactory connectionFactory,
                                                        MessageListenerAdapter messageListenerAdapter) {
        RedisMessageListenerContainer container = new RedisMessageListenerContainer();
        container.setConnectionFactory(connectionFactory);
        container.addMessageListener(messageListenerAdapter, new PatternTopic("chat*"));
        return container;
    }
}
~~~



**抽象层**

~~~java
public abstract class AbstractMessageSubscriber {
    public abstract void handleMessage(Object message);

}
~~~



**订阅端**

~~~java
@Component
public class ClientA extends AbstractMessageSubscriber {

    @Override
    public void handleMessage(Object message) {
        System.out.println("ClientA received message: " + message);
    }
}
~~~



**发布端**

~~~java
@Service
@RequiredArgsConstructor
public class MessagePublisher {

    private final StringRedisTemplate redisTemplate;

    public void publishMessage(Message message) {
        redisTemplate.convertAndSend("chat2222", JSONUtil.toJsonStr(message));
    }

}
~~~



### **多主题模式**

为了实现可订阅多个主题，可以在单主题模式的基础之上增加监听适配器

**配置类**

~~~java
@Configuration
public class RedisConfig {

    @Autowired
    private List<AbstractMessageSubscriber> subscribers;

    @Bean
    public MessageListenerAdapter messageListenerAdapter() {
        return new MessageListenerAdapter(new Object() {
            public void handleMessage(String messageContent) {
                for (AbstractMessageSubscriber subscriber : subscribers) {
                    subscriber.handleMessage(messageContent);
                }
            }
        }, "handleMessage");
    }

    @Bean
    public MessageListenerAdapter otherMessageListenerAdapter() {
        return new MessageListenerAdapter(new Object() {
            public void handleMessage(String messageContent) {
                for (AbstractMessageSubscriber subscriber : subscribers) {
                    subscriber.otherHandleMessage(messageContent);
                }
            }
        }, "handleMessage");
    }

    @Bean
    public RedisMessageListenerContainer redisContainer(RedisConnectionFactory connectionFactory,
                                                        MessageListenerAdapter messageListenerAdapter,
                                                        MessageListenerAdapter otherMessageListenerAdapter) {
        RedisMessageListenerContainer container = new RedisMessageListenerContainer();
        container.setConnectionFactory(connectionFactory);
        container.addMessageListener(messageListenerAdapter, new PatternTopic("chat*"));
        container.addMessageListener(otherMessageListenerAdapter, new PatternTopic("otherChat*")); // 例如添加另一个频道监听器
        return container;
    }
}


~~~



**抽象层**

~~~java
public abstract class AbstractMessageSubscriber {
    public abstract void handleMessage(Object message);
    public void otherHandleMessage(Object message) {
        // 子类可选实现
    }
}
~~~



**订阅端**

~~~

@Component
public class ClientA extends AbstractMessageSubscriber {

    @Override
    public void handleMessage(Object message) {
        System.out.println("ClientA received message: " + message);
    }

    @Override
    public void otherHandleMessage(Object message) {
        System.out.println("ClientA received other topic's message: " + message);
    }
}
~~~



**发布端**

~~~java
@Service
@RequiredArgsConstructor
public class MessagePublisher {

    private final StringRedisTemplate redisTemplate;

    public void publishMessage(Message message) {
        redisTemplate.convertAndSend("chat2222", JSONUtil.toJsonStr(message));
    }

    public void publishOtherMessage(Message message) {
        redisTemplate.convertAndSend("otherChat33333", JSONUtil.toJsonStr(message));
    }

}
~~~



### **多主题优化**

多主题模式下使用的是模板方法设计模式来订阅多个主题，有个明显的缺陷：即使不是客户端的目标消费主题，也会被动消费。

那么如果想实现各个客户端只消费自己的主题该怎么实现呢？

1. **使用不同的接口来区分不同的主题**：
   - 为每个主题定义单独的接口。
   - 客户端可以选择实现哪些接口，从而订阅特定的主题。
2. **使用注解来标记订阅的方法**：
   - 定义注解来标记哪些方法是处理特定主题的。
   - 在消息处理器中，通过反射机制识别并调用标记的方法。



### **基于注解的动态订阅注册**

以下提供使用自定义注解实现动态注册消息处理器：

**自定义注解**

~~~java
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface MessageListener {
    String topic();
}

~~~



**订阅注册器**

~~~java
@Component
public class SubscriberRegistry {

    private final Map<String, List<MethodInvoker>> topicSubscriberMap = new HashMap<>();

    @Autowired
    public SubscriberRegistry(List<AbstractMessageSubscriber> subscribers) {
        for (AbstractMessageSubscriber subscriber : subscribers) {
            for (Method method : subscriber.getClass().getMethods()) {
                if (method.isAnnotationPresent(MessageListener.class)) {
                    MessageListener listener = method.getAnnotation(MessageListener.class);
                    String topic = listener.topic();
                    topicSubscriberMap.computeIfAbsent(topic, k -> new ArrayList<>())
                                      .add(new MethodInvoker(subscriber, method));
                }
            }
        }
        System.out.println("SubscriberRegistry initialized with topics: " + topicSubscriberMap.keySet());
    }

    public void invokeListenerMethod(String topic, String message) {
        List<MethodInvoker> invokers = topicSubscriberMap.get(topic);
        if (invokers != null) {
            for (MethodInvoker invoker : invokers) {
                try {
                    invoker.method.invoke(invoker.subscriber, message);
                } catch (IllegalAccessException | InvocationTargetException e) {
                    e.printStackTrace();
                }
            }
        } else {
            System.out.println("No subscribers found for topic: " + topic);
        }
    }

    private static class MethodInvoker {
        final Object subscriber;
        final Method method;

        MethodInvoker(Object subscriber, Method method) {
            this.subscriber = subscriber;
            this.method = method;
        }
    }

    @Bean
    public RedisMessageListenerContainer redisContainer(RedisConnectionFactory connectionFactory) {
        RedisMessageListenerContainer container = new RedisMessageListenerContainer();
        container.setConnectionFactory(connectionFactory);

        for (String topic : topicSubscriberMap.keySet()) {
            MessageListenerAdapter adapter = new MessageListenerAdapter(new Object() {
                public void handleMessage(String message) {
                    invokeListenerMethod(topic, message);
                }
            }, "handleMessage");
            // 重要
            adapter.afterPropertiesSet();
            container.addMessageListener(adapter, new PatternTopic(topic));
        }

        return container;
    }
}
~~~



**抽象层**

抽象层可以提供公共的默认方法供子类调用，比如：消息幂等性检查

~~~java
public abstract class AbstractMessageSubscriber {

    protected RedisTemplate<String, Object> redisTemplate;


    public AbstractMessageSubscriber(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public void handleMessage(Object message) {
        // 子类可选实现
        System.out.println("otherHandleMessage default logic.");
    }

    /**
     * 幂等性校验
     * @return boolean
     */
    public boolean ideCheck(String prefix, String uniqueId) {
        String key = prefix + ":" + uniqueId;
        Boolean isNewMessage = redisTemplate.opsForValue().setIfAbsent(key, "1", 1, TimeUnit.DAYS);
        return isNewMessage != null && isNewMessage;
    }

}
~~~



**订阅端**

~~~java
@Component
public class ClientA extends AbstractMessageSubscriber {

    @Lazy
    public ClientA(RedisTemplate<String, Object> redisTemplate) {
        super(redisTemplate);
    }

    @MessageListener(topic = "topicA")
    public void handleTopicAMessage(String message) {
        Message bean = JSONUtil.toBean(message, Message.class);
        System.out.println("message from :" + bean.getFrom());
        String uniqueId = bean.getUniqueId();
        if (ideCheck("topicA", uniqueId)) {
            System.out.println("ClientA received TopicA message: " + JSONUtil.toJsonStr(bean));
            // 处理消息的其他逻辑
        } else {
            System.out.println("Duplicate message detected, ignoring: " + uniqueId);
        }
    }

    @MessageListener(topic = "topicB")
    public void handleTopicBMessage(String message) {
        // Default implementation or empty
        Message bean = JSONUtil.toBean(message, Message.class);
        System.out.println("message from :" + bean.getFrom());
        System.out.println("ClientB received TopicB message: " + JSONUtil.toJsonStr(bean));
    }

    @MessageListener(topic = "topicB")
    public void handleTopicBMessage2(String message) {
        // Default implementation or empty
        Message bean = JSONUtil.toBean(message, Message.class);
        System.out.println("2 message from :" + bean.getFrom());
        System.out.println("2 ClientB received TopicB message: " + JSONUtil.toJsonStr(bean));
    }
}
~~~

