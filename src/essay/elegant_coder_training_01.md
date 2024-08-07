---
# title: 
order: 2
star: true
date: 2024-08-07
copyright: false
footer: true
category:
  - 随笔
tag:
  - 随笔
  - 优雅的coder养成系列
---

# 优雅的coder养成系列丨BiFunction使用

---

>
>
>`BiFunction` 是 Java 8 引入的一个函数式接口，它表示接受两个输入参数并生成一个结果的函数。它是 `java.util.function` 包中的一部分，非常适合在需要将两个输入映射到一个输出的场景中使用。`BiFunction` 可以用来简化代码，使其更具可读性和可维护性。

## 基本概念

`BiFunction` 接口的定义如下：

```java
@FunctionalInterface
public interface BiFunction<T, U, R> {
    R apply(T t, U u);
}
```

- `T` 和 `U` 是输入参数的类型。

- `R` 是返回结果的类型。

- `apply(T t, U u)` 方法用于处理两个输入并返回结果。



## 使用场景

`BiFunction` 常用于以下场景：

- 当你需要将两个不同类型的参数传递到一个方法中，并根据这两个参数的值返回结果时。
- 当你想要传递一个方法引用或 lambda 表达式作为参数，以便在方法中执行相同的操作。



## 示例

以下是一个示例，展示如何使用 `BiFunction` 来简化代码。

假设我们有一个业务需求，基于不同的 `shipmentType` 从不同的数据源（如工厂、门店、经销商）中获取扫描标签信息。为了避免重复代码，我们可以使用 `BiFunction` 将具体的查询逻辑传递给一个通用的方法。



~~~java
import java.util.List;
import java.util.function.BiFunction;
import java.util.stream.Collectors;

// 示例 DTO 和 VO 类
class DealerScanLabelDTO {
    private Long outStId;
    private Long productId;
    private ShipmentType flag;

    // getters and setters
}

class DealerScanLabelVO {
    private String traceCode;
    private String epc;
    private String tid;
    private Boolean isMix;

    // getters and setters
}

class DealerScanProductInfoVO {
    private String traceCode;
    private String epc;
    private String tid;
    private Boolean isMix;

    // getters and setters
}

// 枚举类型
enum ShipmentType {
    FACTORY, STORE, DEALER
}

// 示例 Mapper 类
interface DealerInStorageMapper {
    List<DealerScanProductInfoVO> selectScanProductInfo(Long outStId, Long productId);
    List<DealerScanProductInfoVO> selectScanProductInfoFromStores(Long outStId, Long productId);
    List<DealerScanProductInfoVO> selectScanProductInfoFromDealer(Long outStId, Long productId);
}

// 示例服务类
public class DealerScanService {

    private DealerInStorageMapper dealerInStorageMapper;

    public DealerScanService(DealerInStorageMapper dealerInStorageMapper) {
        this.dealerInStorageMapper = dealerInStorageMapper;
    }

    public List<DealerScanLabelVO> getScanLabelInfo(DealerScanLabelDTO dto) {
        List<DealerScanLabelVO> labelVO;

        ShipmentType shipmentType = dto.getFlag();
        switch (shipmentType) {
            case FACTORY:
                // 从工厂获取
                labelVO = getLabel(dto, dealerInStorageMapper::selectScanProductInfo);
                break;
            case STORE:
                // 从门店获取
                labelVO = getLabel(dto, dealerInStorageMapper::selectScanProductInfoFromStores);
                break;
            case DEALER:
                // 从经销商获取
                labelVO = getLabel(dto, dealerInStorageMapper::selectScanProductInfoFromDealer);
                break;
            default:
                throw new IllegalArgumentException("Unsupported shipment type: " + shipmentType);
        }
        return labelVO;
    }

    private List<DealerScanLabelVO> getLabel(DealerScanLabelDTO dto,
                                             BiFunction<Long, Long, List<DealerScanProductInfoVO>> selectScanProductInfoFunction) {
        List<DealerScanProductInfoVO> labels = selectScanProductInfoFunction.apply(dto.getOutStId(), dto.getProductId());

        return labels.stream().map(label -> {
            DealerScanLabelVO vo = new DealerScanLabelVO();
            vo.setTraceCode(label.getTraceCode());
            vo.setEpc(label.getEpc());
            vo.setTid(label.getTid());
            vo.setIsMix(label.getIsMix());
            return vo;
        }).collect(Collectors.toList());
    }
}

~~~



## 解释

- **`BiFunction` 使用**：在 `getScanLabelInfo` 方法中，我们根据 `shipmentType` 使用不同的查询方法。这些查询方法都是 `BiFunction<Long, Long, List<DealerScanProductInfoVO>>` 类型的函数。我们将这些方法作为参数传递给 `getLabel` 方法来获取扫描标签信息。

- **代码简化**：通过使用 `BiFunction`，我们将查询逻辑与标签转换逻辑分开，避免了重复代码，使代码更加简洁和易于维护。



## 总结

`BiFunction` 是一个强大的工具，它允许你将两个输入映射到一个输出，并在需要处理多个参数的场景中提供灵活性。通过合理使用 `BiFunction`，可以显著简化代码并提高可读性。