
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
    - **快速模式**：支持“拍照+状态+备注”极速完成。新增“现场即时整改”功能，勾选后记录直接以“已复查”状态归档，自动生成整改日志。
    - **高级模式**：基于预置模板，支持逐项打分，每一项均可独立关联多张照片和备注。
- **详情与整改闭环**：
    - **业务时间轴**：清晰记录“发现异常 -> 多次整改追加 -> 自检确认”的完整生命周期。
    - **上下文操作**：根据当前状态动态提供“开始整改”、“追加进展”或“复查通过”按钮。
- **语音集成**：集成 Web Speech API，支持在备注、整改说明等关键输入框使用语音转文字，降低井下录入成本。

---

## 三、 Android Studio 深度集成方案

除了传统的纯原生重构，您还可以通过以下两种方式在 Android Studio 中充分利用现有 Web UI：

### 1. 混合集成方案 (Compose + WebView) —— **推荐方案**
这种方式能够最大限度保留 Web 端开发的高效率，同时通过原生壳子调用硬件能力。

#### A. 实现原理
在 Jetpack Compose 中使用 `AndroidView` 嵌入 `WebView`，并建立 **JavaScriptInterface (JS Bridge)** 实现双向通信。

#### B. 关键代码示例 (Kotlin)
```kotlin
// 在 Compose 中加载 Web 界面
@Composable
fun InspectionWebView(url: String, onPhotoTaken: (String) -> Unit) {
    AndroidView(factory = { context ->
        WebView(context).apply {
            settings.javaScriptEnabled = true
            settings.domStorageEnabled = true
            // 注入 JS 桥接对象
            addJavascriptInterface(object {
                @JavascriptInterface
                fun openNativeCamera() {
                    // 调用 Android 原生 CameraX 拍照
                    onPhotoTaken("base64_data")
                }
            }, "AndroidBridge")
            loadUrl(url)
        }
    }, modifier = Modifier.fillMaxSize())
}
```

#### C. 优势
- **UI 一致性**：直接复用 React 编写的高保真工业风界面。
- **动态更新**：Web 端资源更新后，App 无需重新发版（若使用远程加载）。
- **原生增强**：在 WebView 上层覆盖原生 Compose 按钮或加载动画。

---

### 2. 原生重构指南 (Jetpack Compose)
若要获得极致性能与系统级离线语音包支持，请参考以下映射：

#### A. 技术栈映射
| 模块 | Web 实现 | Android 原生实现 (Compose) |
| :--- | :--- | :--- |
| **UI 框架** | React + Tailwind | **Jetpack Compose (Material 3)** |
| **状态管理** | `useState` / `useEffect` | `ViewModel` + `StateFlow` |
| **本地存储** | 内存 / LocalStorage | **Room Persistence Library** |
| **语音识别** | Web Speech API | **SpeechRecognizer (支持离线语音包)** |

#### B. 核心功能原生实现
- **离线 STT**：使用 `RecognizerIntent.EXTRA_PREFER_OFFLINE` 调用系统离线模型。
- **UI 风格迁移**：将 Tailwind 的大圆角 (`rounded-[2rem]`) 映射为 `RoundedCornerShape(32.dp)`。
- **数据持久化**：针对“现场即时整改”，在 `ViewModel` 保存逻辑中直接根据布尔值设置 `status = REVIEWED` 并插入整改记录。

---

## 四、 优化与扩展方向 (未来规划)

### 1. 硬件增强
- **NFC/扫码巡检**：强制巡检员到达物理位置点后解锁模板，杜绝“空巡”。
- **传感器联动**：通过蓝牙集成便携式检测仪，自动填充瓦斯/一氧化碳数值。

### 2. AI 智能化
- **缺陷识别**：利用 Gemini Multimodal 接口分析现场照片，识别皮带跑偏、漏油等异常。
- **智能排班**：根据巡检频次和隐患等级自动推荐巡检优先级。

---

> **智巡工业终端安全管控引擎** - 致力于打造最懂煤矿工人的数字化工具。
