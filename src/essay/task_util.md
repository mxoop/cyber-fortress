---
# title: 
order: 3
star: true
date: 2024-08-07
copyright: false
footer: true
category:
  - 随笔
tag:
  - 随笔
  - 多线程
---

# 高效处理多线程任务的工具类

---

>
>
>在多线程编程中，任务的并行处理和结果的有效聚合是性能优化的关键。`TaskExecutorUtil` 是一个用于简化和优化这些操作的工具类。本文将详细介绍 `TaskExecutorUtil` 的功能、核心方法及接口，并提供实际使用示例，帮助开发者更好地理解和运用该工具类。

## 工具类概述

`TaskExecutorUtil` 旨在帮助开发人员高效地执行大量并行任务。它通过将任务分割成小批次，在自定义线程池中并行处理，并将处理结果聚合到指定类型的集合中，来提高任务处理的效率。这种设计使得 `TaskExecutorUtil` 在处理大规模任务时特别有用，能够适应各种任务和结果集合需求。

~~~java
import java.util.*;
import java.util.concurrent.*;
import java.util.function.*;
import java.util.stream.*;

public class TaskExecutorUtil {

    /**
     * 执行任务，并返回指定类型的集合
     * @param list 原始集合
     * @param task 任务处理方法
     * @param executor 自定义线程池
     * @param partitionCount 分区数量
     * @param partitionSize 每个分区的大小
     * @param description 任务描述
     * @param collectionFactory 集合类型工厂
     * @return 处理结果集合
     */
    public static <T, R, C extends Collection<R>> C executeTasks(
            List<T> list,
            TaskAll<T, R, C> task,
            ThreadPoolTaskExecutor executor,
            Integer partitionCount,
            Integer partitionSize,
            String description,
            Supplier<C> collectionFactory) {

        if (list.isEmpty()) {
            return collectionFactory.get();
        }

        log.info(Optional.ofNullable(description).orElse("") + "任务正在执行！");
        log.info("任务列表大小：{}, 指定分区数量：{}，指定分区大小：{}", list.size(), partitionCount, partitionSize);

        List<List<T>> partitions = partitionList(list, partitionCount, partitionSize);

        List<CompletableFuture<C>> futures = partitions.stream()
                .map(partition -> CompletableFuture.supplyAsync(() -> task.execute(partition), executor)
                        .exceptionally(ex -> {
                            throw new RuntimeException("Exception in task: " + ex.getMessage());
                        }))
                .collect(Collectors.toList());

        CompletableFuture.allOf(futures.toArray(new CompletableFuture[0]))
                .exceptionally(ex -> {
                    throw new RuntimeException("Error in the queue: " + ex.getMessage());
                }).join();

        return futures.stream()
                .flatMap(future -> future.join().stream())
                .collect(Collectors.toCollection(collectionFactory));
    }

    /**
     * 执行异步任务
     * @param task 异步任务
     * @param executor 任务线程池
     * @param description 任务描述
     */
    public static void executeAsyncTask(AsyncTask task, ThreadPoolTaskExecutor executor, String description) {
        log.info(Optional.ofNullable(description).orElse("") + "任务正在执行！");
        CompletableFuture.runAsync(task::execute, executor)
                .exceptionally(ex -> {
                    throw new RuntimeException("Exception in task: " + description +"--"+ ex.getMessage());
                });
    }

    /**
     * 执行异步任务并返回 CompletableFuture
     * @param task 异步任务
     * @param executor 任务线程池
     * @param description 任务描述
     * @return CompletableFuture
     */
    public static CompletableFuture<Void> executeAsyncTaskFuture(AsyncTask task, ThreadPoolTaskExecutor executor, String description) {
        log.info(Optional.ofNullable(description).orElse("") + "任务正在执行！");
        return CompletableFuture.runAsync(task::execute, executor)
                .exceptionally(ex -> {
                    throw new RuntimeException("Exception in task: " + description +"--"+ ex.getMessage());
                });
    }

    private static <T> List<List<T>> partitionList(List<T> list, Integer partitionCount, Integer partitionSize) {
        if (partitionCount == null && partitionSize == null) {
            return dynamicPartition(list);
        } else if (partitionCount != null) {
            return partition(list, partitionCount);
        } else if (partitionSize != null) {
            return CollUtil.split(list, partitionSize);
        }
        throw new IllegalArgumentException("Either partitionCount or partitionSize must be specified.");
    }

    private static <T> List<List<T>> dynamicPartition(List<T> list) {
        int listSize = list.size();
        int partitionCount = calculatePartitionCount(listSize);
        log.info("---------------partition task size:" + partitionCount);
        return partition(list, partitionCount);
    }

    private static <T> List<List<T>> partition(List<T> list, int partitionCount) {
        List<List<T>> partitions = new ArrayList<>();
        int listSize = list.size();
        int batchSize = listSize / partitionCount;
        int remainingElements = listSize % partitionCount;
        int index = 0;
        for (int i = 0; i < partitionCount; i++) {
            int size = batchSize + (remainingElements-- > 0 ? 1 : 0);
            partitions.add(list.subList(index, Math.min(index + size, listSize)));
            index += size;
        }
        return partitions;
    }

    private static int calculatePartitionCount(int listSize) {
        int availableProcessors = Runtime.getRuntime().availableProcessors() * 4;
        return Math.max(1, Math.min(listSize, availableProcessors));
    }

    @FunctionalInterface
    public interface TaskAll<T, R, C extends Collection<R>> {
        C execute(List<T> partition);
    }

    @FunctionalInterface
    public interface AsyncTask {
        void execute();
    }
}
~~~



## 核心方法

### `executeTasks` 方法

~~~java
public static <T, R, C extends Collection<R>> C executeTasks(
        List<T> list,
        TaskAll<T, R, C> task,
        ThreadPoolTaskExecutor executor,
        Integer partitionCount,
        Integer partitionSize,
        String description,
        Supplier<C> collectionFactory) {
    // 方法实现
}
~~~

- 方法参数

  - **`list`**: 需要处理的任务列表。

  - **`task`**: 任务处理逻辑，定义了如何处理每个任务分区。

  - **`executor`**: 自定义线程池，用于异步执行任务。
  - **`partitionCount`**: 分区数量，指定将任务列表分成多少个批次。优先级高于 `partitionSize`。

  - **`partitionSize`**: 每个分区的大小，指定每个批次包含多少任务。
  - **`description`**: 任务的描述，用于日志记录。
  - **`collectionFactory`**: 创建结果集合的工厂方法。

- 方法功能

`executeTasks` 方法的主要功能是将任务列表分割成多个批次，并使用指定的线程池并行处理这些批次。处理完成后，将结果聚合到由 `collectionFactory` 提供的集合实例中。这种设计允许用户自定义任务处理的分区方式和结果集合的类型，从而灵活适应不同的任务处理需求。

- 处理步骤

1. **任务分区**: 根据 `partitionCount` 和 `partitionSize`，将任务列表分割成多个批次。如果两者都未提供，则动态计算分区数。
2. **异步处理**: 使用 `CompletableFuture` 和指定的线程池并行处理每个任务分区。
3. **结果聚合**: 将所有任务分区的处理结果聚合到指定类型的集合中。



### `executeAsyncTask` 方法

~~~java
public static void executeAsyncTask(AsyncTask task, ThreadPoolTaskExecutor executor, String description) {
    // 方法实现
}
~~~

- 方法参数

  - **`task`**: 要执行的异步任务。

  - **`executor`**: 自定义的线程池，用于异步执行任务。

  - **`description`**: 任务的描述，用于日志记录。

- 方法功能

`executeAsyncTask` 方法用于异步执行单个任务。这种方法适用于那些需要在后台线程中执行的任务，例如耗时的计算或网络请求。



### `executeAsyncTaskFuture` 方法

~~~java
public static CompletableFuture<Void> executeAsyncTaskFuture(AsyncTask task, ThreadPoolTaskExecutor executor, String description) {
    // 方法实现
}

~~~

- 方法参数

  - **`task`**: 要执行的异步任务。

  - **`executor`**: 自定义的线程池，用于异步执行任务。

  - **`description`**: 任务的描述，用于日志记录。

- 方法功能

`executeAsyncTaskFuture` 方法与 `executeAsyncTask` 类似，但返回一个 `CompletableFuture` 对象。这个 `CompletableFuture` 允许调用者在任务完成后进行进一步操作，如处理结果或捕获异常。



## 关键接口

### `TaskAll` 接口

~~~java
@FunctionalInterface
public interface TaskAll<T, R, C extends Collection<R>> {
    C execute(List<T> partition);
}
~~~

- 泛型说明

  - **`T`**: 输入数据的类型，表示任务处理的单个数据项。

  - **`R`**: 任务处理后的结果类型。

  - **`C`**: 结果集合类型，必须是 `Collection<R>` 的子类，例如 `List<R>` 或 `Set<R>`。

- 方法功能

`TaskAll` 接口用于定义任务的处理逻辑。`execute` 方法接收一个任务分区并返回处理结果集合。通过实现这个接口，用户可以自定义任务处理逻辑，并指定结果集合的类型。



### `AsyncTask` 接口

~~~java
@FunctionalInterface
public interface AsyncTask {
    void execute();
}
~~~

- 方法功能

`AsyncTask` 接口用于定义异步任务的执行逻辑。通过实现这个接口，可以将任务提交到线程池中进行异步处理。



## 使用示例

### 使用 `executeTasks` 方法

假设我们有一个任务列表，每个任务是一个字符串，我们希望将每个字符串处理后收集到一个 `List` 中：

~~~java
public class TaskExample {
    public static void main(String[] args) {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.initialize();

        List<String> tasks = Arrays.asList("task1", "task2", "task3");

        // 实现 TaskAll 接口
        TaskAll<String, String, List<String>> task = partition -> partition.stream()
                .map(task -> task + "-processed")
                .collect(Collectors.toList());

        List<String> results = TaskExecutorUtil.executeTasks(
                tasks,
                task,
                executor,
                null,
                2,
                "Processing Tasks",
                ArrayList::new
        );

        System.out.println(results); // 输出处理后的任务结果
    }
}
~~~





### 使用 `executeAsyncTaskFuture`

```java
public class AsyncTaskFutureExample {
    public static void main(String[] args) {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.initialize();

        AsyncTask task = () -> {
            // 异步任务逻辑
            System.out.println("Async task executed");
        };

        CompletableFuture<Void> future = TaskExecutorUtil.executeAsyncTaskFuture(task, executor, "Example Async Task Future");
        future.thenRun(() -> System.out.println("Task completed"))
              .exceptionally(ex -> {
                  System.err.println("Task failed: " + ex.getMessage());
                  return null;
              });
    }
}
```



## 总结

`TaskExecutorUtil` 是一个功能强大的工具类，用于简化和优化多线程任务的处理。通过灵活的接口设计和泛型支持，它允许开发者在自定义线程池中并行处理任务，并将结果聚合到不同类型的集合中。掌握这一工具类的使用可以帮助开发者更高效地处理并发任务，提升应用性能。希望这篇指南能帮助你全面理解和运用 `TaskExecutorUtil`。
