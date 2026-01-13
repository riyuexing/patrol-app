# 智巡煤矿 (Smart Inspection System)

## 一、 项目概述
本应用是一款专为煤矿生产现场设计的**工业级安全巡检系统**。采用“离线优先”设计理念，旨在解决井下无信号环境下的数据记录难题。应用通过高保真的 UI 交互和严谨的业务闭环，确保每一项隐患都能“发现-整改-销号”。

---

## 二、 当前开发及实现功能总结

### 1. 核心交互流程
- **Splash & 登录**：具备品牌感的启动动画，支持本地多用户账户管理，班组信息记忆。
- **巡检列表 (首页)**：
    - **折叠筛选**：时间、状态筛选默认折叠，节省空间；支持自定义日期范围。
    - **极速操作**：支持长按多选批量删除，以及向左滑动单条快速删除。
    - **轻量统计**：顶部展示个人巡检记录、发现异常数、待整改数。
- **新建巡检**：
    - **快速模式**：针对现场紧急情况，仅需“拍照+状态+备注”即可完成。
    - **高级模式**：基于预置模板，支持逐项打分，每一项均可独立关联多张照片和备注。
- **详情与整改闭环**：
    - **业务时间轴**：清晰记录“发现异常 -> 多次整改追加 -> 自检确认”的完整生命周期。
    - **上下文操作**：根据当前状态动态提供“开始整改”、“追加进展”或“复查通过”按钮。

### 2. 技术亮点
- **离线驱动**：前端模拟 DB 架构，所有状态变更即时生效，无需等待网络响应。
- **工业级 UI/UX**：
    - 适配单手操作（按钮高度 >= 48dp）。
    - 强对比度色值（Red-600, Blue-600）提升辨识度。
    - 符合人体工学的圆角卡片（2rem）与平滑动效。

---

## 三、 优化与扩展方向

### 1. 硬件集成 (Near Future)
- **NFC/扫码巡检**：集成硬件扫描，强制巡检员到达物理位置点后方可解锁模板，杜绝“空巡”。
- **传感器联动**：通过蓝牙集成便携式瓦斯检测仪，自动填充检测数值。

### 2. AI 智能化 (Medium Term)
- **缺陷自动识别**：利用 Gemini Multimodal 接口，实时分析拍摄照片，识别皮带跑偏、支架漏液等常见隐患。
- **语音输入辅助**：针对井下打字不便，集成 STT 语音转文字录入备注。

### 3. 数据与管理 (Long Term)
- **中心端同步**：建立增量同步机制，在升井检测到信号时自动上传数据，清理本地缓存。
- **角色权限**：增加“安监员”与“区队长”角色，实现多级审批流。

---

## 四、 Android Studio (Jetpack Compose) 原生实现指南

若要将本项目迁移至 Android 原生开发，请参考以下设计架构：

### 1. 技术栈推荐
- **UI 框架**：Jetpack Compose (Material 3)
- **架构模式**：MVVM (Model-View-ViewModel)
- **本地存储**：Room Persistence Library (替代当前的 `db.ts`)
- **图片处理**：Coil (加载 base64 或本地文件)
- **导航**：Compose Navigation

### 2. 关键组件映射
| Web 功能 (本项目) | Compose 对应实现 |
| :--- | :--- |
| `Layout.tsx` | `Scaffold` + `BottomAppBar` + `ModalNavigationDrawer` |
| 列表展示 | `LazyColumn` |
| 侧滑删除 | `SwipeToDismissBox` (Material 3 官方组件) |
| 长按选择 | `Modifier.combinedClickable` |
| 状态管理 | `ViewModel` + `StateFlow` (实现响应式 UI 刷新) |
| 动画效果 | `AnimatedVisibility` & `rememberInfiniteTransition` |

### 3. 核心代码设计建议 (Kotlin)
- **数据实体 (Room)**：
  ```kotlin
  @Entity(tableName = "inspections")
  data class InspectionEntity(
      @PrimaryKey val id: String,
      val location: String,
      val status: String,
      val timestamp: Long
  )
  ```
- **ViewModel 逻辑**：
  ```kotlin
  class InspectionViewModel : ViewModel() {
      private val _records = MutableStateFlow<List<InspectionRecord>>(emptyList())
      val records = _records.asStateFlow()
      
      fun deleteSelected() { /* 调用 Repository 删除数据 */ }
  }
  ```
- **列表项 UI**：
  ```kotlin
  @Composable
  fun InspectionItem(record: InspectionRecord, isSelected: Boolean) {
      Card(
          shape = RoundedCornerShape(24.dp),
          modifier = Modifier.padding(8.dp).fillMaxWidth()
      ) {
          // 使用 Row 和 Column 复刻当前的 Flex 布局
      }
  }
  ```
