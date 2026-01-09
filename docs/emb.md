# EmbedPDF Snippet - 完整 API 参考手册

> **版本**: 2.1.1  
> **更新日期**: 2026-01-08

---

## 📚 目录

- [1. 初始化 API](#1-初始化-api)
- [2. 容器 API](#2-容器-api)
- [3. 插件系统](#3-插件系统)
- [4. 文档管理](#4-文档管理)
- [5. 视图控制](#5-视图控制)
- [6. 注释功能](#6-注释功能)
- [7. 搜索功能](#7-搜索功能)
- [8. 编辑功能](#8-编辑功能)
- [9. UI 定制](#9-ui-定制)
- [10. 主题系统](#10-主题系统)
- [11. 图标系统](#11-图标系统)
- [12. 国际化](#12-国际化)
- [13. 命令系统](#13-命令系统)
- [14. 事件系统](#14-事件系统)
- [15. 错误处理](#15-错误处理)

---

## 1. 初始化 API

### `EmbedPDF.init(config)`

初始化 PDF 查看器。

#### 参数

```typescript
interface ContainerConfig {
  type: 'container';
  target: Element;                    // 必填：挂载的 DOM 容器
  
  // === 文档源 ===
  src?: string;                       // PDF URL 或路径
  
  // === 引擎选项 ===
  worker?: boolean;                   // 是否使用 Web Worker，默认: true
  wasmUrl?: string;                   // 自定义 WASM 文件 URL
  log?: boolean;                      // 启用调试日志，默认: false
  
  // === 外观 ===
  theme?: ThemeConfig;                // 主题配置
  icons?: IconsConfig;                // 自定义图标
  tabBar?: TabBarVisibility;          // 标签栏显示：'always' | 'multiple' | 'never'
  
  // === 功能禁用 ===
  disabledCategories?: string[];      // 禁用的功能分类
  
  // === 插件配置（所有可选）===
  documentManager?: Partial<DocumentManagerPluginConfig>;
  commands?: Partial<CommandsPluginConfig>;
  i18n?: Partial<I18nPluginConfig>;
  ui?: Partial<UIPluginConfig>;
  viewport?: Partial<ViewportPluginConfig>;
  scroll?: Partial<ScrollPluginConfig>;
  zoom?: Partial<ZoomPluginConfig>;
  spread?: Partial<SpreadPluginConfig>;
  rotation?: Partial<RotatePluginConfig>;
  pan?: Partial<PanPluginConfig>;
  render?: Partial<RenderPluginConfig>;
  tiling?: Partial<TilingPluginConfig>;
  thumbnails?: Partial<ThumbnailPluginConfig>;
  annotations?: Partial<AnnotationPluginConfig>;
  search?: Partial<SearchPluginConfig>;
  selection?: Partial<SelectionPluginConfig>;
  capture?: Partial<CapturePluginConfig>;
  redaction?: Partial<RedactionPluginConfig>;
  print?: Partial<PrintPluginConfig>;
  export?: Partial<ExportPluginConfig>;
  fullscreen?: Partial<FullscreenPluginConfig>;
  bookmark?: Partial<BookmarkPluginConfig>;
  attachment?: Partial<AttachmentPluginConfig>;
  history?: Partial<HistoryPluginConfig>;
  interactionManager?: Partial<InteractionManagerPluginConfig>;
}
```

#### 返回值

```typescript
EmbedPdfContainer
```

#### 示例

```javascript
// 基础用法
const viewer = EmbedPDF.init({
  type: 'container',
  target: document.getElementById('pdf-viewer'),
  src: 'https://example.com/document.pdf'
});

// 完整配置
const viewer = EmbedPDF.init({
  type: 'container',
  target: document.getElementById('pdf-viewer'),
  src: '/document.pdf',
  worker: true,
  log: true,
  
  theme: {
    preference: 'system'
  },
  
  zoom: {
    defaultLevel: 'fit-width',
    minZoom: 0.5,
    maxZoom: 5
  },
  
  scroll: {
    strategy: 'vertical',
    pageGap: 20
  },
  
  annotations: {
    autoCommit: false,
    annotationAuthor: 'John Doe'
  },
  
  disabledCategories: ['redaction']
});
```

---

## 2. 容器 API

### `viewer.registry`

获取插件注册表的 Promise。

```typescript
readonly registry: Promise<PluginRegistry>
```

#### 示例

```javascript
const registry = await viewer.registry;
const zoomPlugin = registry.getPlugin(ZoomPlugin);
```

### `viewer.setTheme(theme)`

运行时更改主题。

```typescript
setTheme(theme: ThemeConfig | ThemePreference): void
```

#### 参数

- `theme`: 主题配置对象或简单偏好 ('light' | 'dark' | 'system')

#### 示例

```javascript
// 简单切换
viewer.setTheme('dark');

// 详细配置
viewer.setTheme({
  preference: 'light',
  light: {
    primary: '#0066cc'
  }
});
```

### `viewer.activeTheme`

获取当前激活的主题对象。

```typescript
readonly activeTheme: Theme
```

### `viewer.activeColorScheme`

获取当前色彩方案。

```typescript
readonly activeColorScheme: 'light' | 'dark'
```

### `viewer.themePreference`

获取主题偏好设置。

```typescript
readonly themePreference: ThemePreference  // 'light' | 'dark' | 'system'
```

### `viewer.registerIcon(name, config)`

注册单个自定义图标。

```typescript
registerIcon(name: string, config: IconConfig): void
```

#### 示例

```javascript
viewer.registerIcon('custom-arrow', {
  path: 'M5 12h14M12 5l7 7-7 7',
  stroke: 'primary'
});
```

### `viewer.registerIcons(icons)`

批量注册图标。

```typescript
registerIcons(icons: IconsConfig): void
```

#### 示例

```javascript
viewer.registerIcons({
  'icon1': { path: 'M...', fill: 'primary' },
  'icon2': { path: 'M...', stroke: 'secondary' }
});
```

### 事件：`themechange`

主题变化时触发。

#### 示例

```javascript
viewer.addEventListener('themechange', (e) => {
  console.log('新主题:', e.detail.colorScheme);
  console.log('主题对象:', e.detail.theme);
  console.log('偏好:', e.detail.preference);
});
```

---

## 3. 插件系统

### `registry.getPlugin(PluginClass)`

获取插件实例。

```typescript
getPlugin<T extends BasePlugin>(pluginClass: { id: string }): T
```

#### 示例

```javascript
const registry = await viewer.registry;

// 获取各种插件
const docManager = registry.getPlugin(DocumentManagerPlugin);
const zoom = registry.getPlugin(ZoomPlugin);
const annotation = registry.getPlugin(AnnotationPlugin);
const search = registry.getPlugin(SearchPlugin);
```

---

## 4. 文档管理

通过 `DocumentManagerPlugin` 管理文档。

### 获取插件

```javascript
const docManager = registry.getPlugin(DocumentManagerPlugin);
```

### 4.1 打开文档

#### `openDocumentUrl(options)`

通过 URL 打开 PDF。

```typescript
openDocumentUrl(options: LoadDocumentUrlOptions): Task<OpenDocumentResponse, PdfErrorReason>

interface LoadDocumentUrlOptions {
  url: string;                        // PDF URL
  documentId?: string;                // 自定义文档 ID
  name?: string;                      // 显示名称
  password?: string;                  // 密码保护的 PDF
  mode?: 'auto' | 'range-request' | 'full-fetch';
  requestOptions?: PdfRequestOptions;
  scale?: number;
  rotation?: Rotation;
  autoActivate?: boolean;             // 默认: true
}

interface OpenDocumentResponse {
  documentId: string;
  task: Task<PdfDocumentObject, PdfErrorReason>;
}
```

#### 示例

```javascript
const response = await docManager.openDocumentUrl({
  url: 'https://example.com/doc.pdf',
  name: 'My Document',
  autoActivate: true
});

console.log('文档 ID:', response.documentId);
```

#### `openDocumentBuffer(options)`

通过 ArrayBuffer 打开 PDF（适合本地文件）。

```typescript
openDocumentBuffer(options: LoadDocumentBufferOptions): Task<OpenDocumentResponse, PdfErrorReason>

interface LoadDocumentBufferOptions {
  buffer: ArrayBuffer;                // PDF 文件内容
  name: string;                       // 必填：显示名称
  documentId?: string;
  password?: string;
  scale?: number;
  rotation?: Rotation;
  autoActivate?: boolean;
}
```

#### 示例

```javascript
// 读取本地文件
const fileInput = document.querySelector('input[type="file"]');
const file = fileInput.files[0];
const buffer = await file.arrayBuffer();

const response = await docManager.openDocumentBuffer({
  buffer: buffer,
  name: file.name,
  autoActivate: true
});
```

#### `openFileDialog(options)`

打开文件选择对话框。

```typescript
openFileDialog(options?: OpenFileDialogOptions): Task<OpenDocumentResponse, PdfErrorReason>

interface OpenFileDialogOptions {
  documentId?: string;
  scale?: number;
  rotation?: Rotation;
  autoActivate?: boolean;
}
```

#### 示例

```javascript
const response = await docManager.openFileDialog({
  autoActivate: true
});
```

### 4.2 关闭文档

#### `closeDocument(documentId)`

关闭指定文档。

```typescript
closeDocument(documentId: string): Task<void, PdfErrorReason>
```

#### `closeAllDocuments()`

关闭所有文档。

```typescript
closeAllDocuments(): Task<void[], PdfErrorReason>
```

### 4.3 文档查询

#### `getActiveDocumentId()`

获取当前激活的文档 ID。

```typescript
getActiveDocumentId(): string | null
```

#### `getActiveDocument()`

获取当前激活的文档对象。

```typescript
getActiveDocument(): PdfDocumentObject | null
```

#### `getDocument(documentId)`

获取指定文档对象。

```typescript
getDocument(documentId: string): PdfDocumentObject | null
```

#### `getOpenDocuments()`

获取所有打开的文档状态。

```typescript
getOpenDocuments(): DocumentState[]
```

#### `isDocumentOpen(documentId)`

检查文档是否打开。

```typescript
isDocumentOpen(documentId: string): boolean
```

#### `getDocumentCount()`

获取打开的文档数量。

```typescript
getDocumentCount(): number
```

### 4.4 文档激活与排序

#### `setActiveDocument(documentId)`

设置激活的文档。

```typescript
setActiveDocument(documentId: string): void
```

#### `getDocumentOrder()`

获取文档顺序。

```typescript
getDocumentOrder(): string[]
```

#### `moveDocument(documentId, toIndex)`

移动文档位置。

```typescript
moveDocument(documentId: string, toIndex: number): void
```

#### `swapDocuments(documentId1, documentId2)`

交换两个文档的位置。

```typescript
swapDocuments(documentId1: string, documentId2: string): void
```

### 4.5 事件

```typescript
// 文档打开
docManager.onDocumentOpened.listen((state: DocumentState) => {
  console.log('文档已打开:', state.documentId);
});

// 文档关闭
docManager.onDocumentClosed.listen((documentId: string) => {
  console.log('文档已关闭:', documentId);
});

// 激活文档变化
docManager.onActiveDocumentChanged.listen((event: DocumentChangeEvent) => {
  console.log('从', event.previousDocumentId, '切换到', event.currentDocumentId);
});

// 文档错误
docManager.onDocumentError.listen((event: DocumentErrorEvent) => {
  console.error('文档错误:', event.message);
});

// 文档顺序变化
docManager.onDocumentOrderChanged.listen((event: DocumentOrderChangeEvent) => {
  console.log('新顺序:', event.order);
});
```

---

## 5. 视图控制

### 5.1 缩放控制 (ZoomPlugin)

```javascript
const zoom = registry.getPlugin(ZoomPlugin);
```

#### 方法

```typescript
// 请求特定缩放级别
requestZoom(level: ZoomLevel, center?: Point): void

// 相对缩放
requestZoomBy(delta: number, center?: Point): void

// 放大
zoomIn(): void

// 缩小
zoomOut(): void

// 缩放到指定区域
zoomToArea(pageIndex: number, rect: Rect): void

// 框选缩放模式
enableMarqueeZoom(): void
disableMarqueeZoom(): void
toggleMarqueeZoom(): void
isMarqueeZoomActive(): boolean

// 获取状态
getState(): ZoomDocumentState

// 获取预设值
getPresets(): ZoomPreset[]
```

#### ZoomLevel 类型

```typescript
type ZoomLevel = ZoomMode | number

enum ZoomMode {
  Automatic = 'automatic',
  FitPage = 'fit-page',
  FitWidth = 'fit-width',
}
```

#### 示例

```javascript
// 设置缩放级别
zoom.requestZoom(1.5);
zoom.requestZoom('fit-width');
zoom.requestZoom('fit-page');

// 缩放操作
zoom.zoomIn();
zoom.zoomOut();
zoom.requestZoomBy(0.1);  // 增加 10%

// 缩放到指定区域
zoom.zoomToArea(0, { x: 100, y: 100, width: 200, height: 200 });

// 启用框选缩放
zoom.enableMarqueeZoom();
```

#### 事件

```javascript
zoom.onZoomChange.listen((event) => {
  console.log('缩放从', event.oldZoom, '变为', event.newZoom);
  console.log('级别:', event.level);
});
```

### 5.2 滚动控制 (ScrollPlugin)

```javascript
const scroll = registry.getPlugin(ScrollPlugin);
```

#### 方法

```typescript
// 跳转到页面
jumpToPage(pageIndex: number, options?: ScrollOptions): void

// 下一页/上一页
nextPage(): void
previousPage(): void

// 滚动距离
scrollBy(dx: number, dy: number): void
scrollTo(x: number, y: number): void

// 滚动到元素可见
scrollIntoView(element: HTMLElement, options?: ScrollIntoViewOptions): void

// 获取状态
getCurrentPage(): number
getMetrics(): ScrollMetrics
```

#### 示例

```javascript
// 跳转到第 5 页
scroll.jumpToPage(4);  // 0-based

// 翻页
scroll.nextPage();
scroll.previousPage();

// 滚动
scroll.scrollBy(0, 100);  // 向下滚动 100px
```

#### 事件

```javascript
// 页面变化
scroll.onPageChange.listen((event) => {
  console.log('当前页:', event.pageIndex);
});

// 滚动事件
scroll.onScroll.listen((event) => {
  console.log('滚动位置:', event.scrollLeft, event.scrollTop);
});
```

### 5.3 旋转控制 (RotatePlugin)

```javascript
const rotate = registry.getPlugin(RotatePlugin);
```

#### 方法

```typescript
// 旋转整个文档
rotateDocument(rotation: Rotation): void

// 旋转特定页面
rotatePage(pageIndex: number, rotation: Rotation): void

// 顺时针/逆时针
rotateClockwise(): void
rotateCounterClockwise(): void

// 获取旋转角度
getDocumentRotation(): Rotation
getPageRotation(pageIndex: number): Rotation
```

#### Rotation 枚举

```typescript
enum Rotation {
  Rotate0 = 0,
  Rotate90 = 90,
  Rotate180 = 180,
  Rotate270 = 270,
}
```

#### 示例

```javascript
// 旋转文档
rotate.rotateClockwise();
rotate.rotateDocument(Rotation.Rotate90);

// 旋转单页
rotate.rotatePage(0, Rotation.Rotate180);
```

### 5.4 展开模式 (SpreadPlugin)

```javascript
const spread = registry.getPlugin(SpreadPlugin);
```

#### 方法

```typescript
// 设置展开模式
setSpreadMode(mode: SpreadMode): void

// 获取当前模式
getSpreadMode(): SpreadMode
```

#### SpreadMode 枚举

```typescript
enum SpreadMode {
  None = 'none',          // 单页
  Odd = 'odd',            // 奇数页开始
  Even = 'even',          // 偶数页开始
}
```

#### 示例

```javascript
spread.setSpreadMode(SpreadMode.Odd);
```

### 5.5 平移模式 (PanPlugin)

```javascript
const pan = registry.getPlugin(PanPlugin);
```

#### 方法

```typescript
// 启用/禁用平移模式
enablePan(): void
disablePan(): void
togglePan(): void
isPanActive(): boolean
```

---

## 6. 注释功能

### 获取插件

```javascript
const annotation = registry.getPlugin(AnnotationPlugin);
```

### 6.1 工具管理

#### 获取工具

```typescript
// 获取所有工具
getTools(): AnnotationTool[]

// 获取特定工具
getTool<T extends AnnotationTool>(toolId: string): T | undefined

// 查找注释对应的工具
findToolForAnnotation(annotation: PdfAnnotationObject): AnnotationTool | null
```

#### 激活工具

```typescript
// 设置激活工具
setActiveTool(toolId: string | null): void

// 获取激活工具
getActiveTool(): AnnotationTool | null
```

#### 添加自定义工具

```typescript
addTool<T extends AnnotationTool>(tool: T): void
```

#### 设置工具默认值

```typescript
setToolDefaults(toolId: string, patch: Partial<any>): void
```

#### 示例

```javascript
// 激活高亮工具
annotation.setActiveTool('highlight');

// 获取所有工具
const tools = annotation.getTools();
console.log('可用工具:', tools.map(t => t.id));

// 设置工具默认颜色
annotation.setToolDefaults('highlight', {
  color: '#ffff00'
});
```

### 6.2 创建注释

```typescript
createAnnotation<A extends PdfAnnotationObject>(
  pageIndex: number,
  annotation: A,
  context?: AnnotationCreateContext<A>
): void
```

#### 示例

```javascript
// 创建文本高亮
annotation.createAnnotation(0, {
  type: 'Highlight',
  rect: { x: 100, y: 100, width: 200, height: 20 },
  color: '#ffff00',
  quads: [/* ... */]
});

// 创建注释
annotation.createAnnotation(0, {
  type: 'Text',
  rect: { x: 100, y: 100, width: 20, height: 20 },
  contents: '这是一条注释',
  color: '#ff0000'
});
```

### 6.3 更新/删除注释

```typescript
// 更新注释
updateAnnotation(
  pageIndex: number,
  annotationId: string,
  patch: Partial<PdfAnnotationObject>
): void

// 删除注释
deleteAnnotation(pageIndex: number, annotationId: string): void
```

#### 示例

```javascript
// 更新注释内容
annotation.updateAnnotation(0, 'annotation-id', {
  contents: '更新的内容',
  color: '#00ff00'
});

// 删除注释
annotation.deleteAnnotation(0, 'annotation-id');
```

### 6.4 查询注释

```typescript
// 获取页面注释
getPageAnnotations(options: GetPageAnnotationsOptions): Task<PdfAnnotationObject[], PdfErrorReason>

// 通过 ID 获取
getAnnotationById(id: string): TrackedAnnotation | null

// 获取选中的注释
getSelectedAnnotation(): TrackedAnnotation | null
```

#### 示例

```javascript
// 获取第一页的所有注释
const annotations = await annotation.getPageAnnotations({
  pageIndex: 0,
  includeTypes: ['Highlight', 'Text']
});

console.log('注释数量:', annotations.length);
```

### 6.5 选择注释

```typescript
// 选择注释
selectAnnotation(pageIndex: number, annotationId: string): void

// 取消选择
deselectAnnotation(): void
```

### 6.6 导入/导出

```typescript
// 导入注释
importAnnotations(items: ImportAnnotationItem<PdfAnnotationObject>[]): void

// 提交更改
commit(): Task<boolean, PdfErrorReason>

// 渲染注释为图片
renderAnnotation(options: RenderAnnotationOptions): Task<Blob, PdfErrorReason>
```

#### 示例

```javascript
// 提交所有未保存的注释
const success = await annotation.commit();
console.log('提交成功:', success);
```

### 6.7 颜色预设

```typescript
// 获取颜色预设
getColorPresets(): string[]

// 添加颜色预设
addColorPreset(color: string): void
```

### 6.8 事件

```javascript
// 注释状态变化
annotation.onStateChange.listen((state) => {
  console.log('注释状态:', state);
});

// 注释事件（创建/更新/删除）
annotation.onAnnotationEvent.listen((event) => {
  if (event.type === 'create') {
    console.log('创建了注释:', event.annotation);
  }
});

// 工具变化
annotation.onActiveToolChange.listen((tool) => {
  console.log('激活工具:', tool?.id);
});
```

---

## 7. 搜索功能

### 获取插件

```javascript
const search = registry.getPlugin(SearchPlugin);
```

### 7.1 搜索操作

```typescript
// 搜索文本
search(query: string, flags?: MatchFlag[]): Task<SearchAllPagesResult, PdfErrorReason>

// 停止搜索
stopSearch(): void

// 清除结果
clearResults(): void
```

#### MatchFlag 枚举

```typescript
enum MatchFlag {
  CaseSensitive = 'case-sensitive',
  WholeWord = 'whole-word',
  ConsecutiveChars = 'consecutive-chars'
}
```

#### 示例

```javascript
// 基础搜索
const results = await search.search('关键词');
console.log('找到', results.total, '个结果');

// 大小写敏感搜索
const results = await search.search('PDF', [MatchFlag.CaseSensitive]);

// 完整单词匹配
const results = await search.search('word', [MatchFlag.WholeWord]);
```

### 7.2 结果导航

```typescript
// 下一个/上一个结果
nextResult(): void
previousResult(): void

// 跳转到特定结果
goToResult(index: number): void

// 获取当前结果索引
getActiveResultIndex(): number
```

#### 示例

```javascript
// 搜索并遍历结果
await search.search('text');

search.nextResult();      // 下一个
search.previousResult();  // 上一个
search.goToResult(5);     // 跳到第 6 个结果
```

### 7.3 配置

```typescript
// 设置搜索标志
setFlags(flags: MatchFlag[]): void

// 显示所有结果或仅当前结果
setShowAllResults(show: boolean): void
```

### 7.4 查询状态

```typescript
// 获取当前状态
getState(): SearchDocumentState

// 获取结果数量
getResultCount(): number
```

### 7.5 事件

```javascript
// 搜索开始
search.onSearchStart.listen((event) => {
  console.log('开始搜索');
});

// 搜索完成
search.onSearchResult.listen((event) => {
  console.log('找到', event.results.total, '个结果');
});

// 活动结果变化
search.onActiveResultChange.listen((event) => {
  console.log('当前结果索引:', event.index);
});
```

---

## 8. 编辑功能

### 8.1 文本选择 (SelectionPlugin)

```javascript
const selection = registry.getPlugin(SelectionPlugin);
```

#### 方法

```typescript
// 获取当前选择
getSelection(): PdfTextSelection | null

// 清除选择
clearSelection(): void

// 复制选中文本
copySelection(): void

// 选择文本
selectText(pageIndex: number, startIndex: number, endIndex: number): void
```

#### 示例

```javascript
const sel = selection.getSelection();
if (sel) {
  console.log('选中文本:', sel.text);
  console.log('页码:', sel.pageIndex);
}

// 复制
selection.copySelection();

// 清除
selection.clearSelection();
```

#### 事件

```javascript
selection.onSelectionChange.listen((selection) => {
  if (selection) {
    console.log('选中:', selection.text);
  }
});
```

### 8.2 截图功能 (CapturePlugin)

```javascript
const capture = registry.getPlugin(CapturePlugin);
```

#### 方法

```typescript
// 截取指定区域
captureArea(pageIndex: number, rect: Rect): void

// 启用框选截图模式
enableMarqueeCapture(): void
disableMarqueeCapture(): void
toggleMarqueeCapture(): void
isMarqueeCaptureActive(): boolean
```

#### 示例

```javascript
// 截取区域
capture.captureArea(0, {
  x: 100,
  y: 100,
  width: 300,
  height: 200
});

// 启用框选模式
capture.enableMarqueeCapture();
```

#### 事件

```javascript
capture.onCaptureArea.listen((event) => {
  console.log('截图完成:', event.blob);
  console.log('页码:', event.pageIndex);
  
  // 下载截图
  const url = URL.createObjectURL(event.blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'screenshot.png';
  a.click();
});
```

### 8.3 编辑功能 (RedactionPlugin)

```javascript
const redaction = registry.getPlugin(RedactionPlugin);
```

#### 方法

```typescript
// 添加待编辑项
addPending(items: RedactionItem[]): void

// 移除待编辑项
removePending(page: number, id: string): void

// 清除所有待编辑
clearPending(): void

// 提交编辑
commitAllPending(): Task<boolean, PdfErrorReason>
commitPending(page: number, id: string): Task<boolean, PdfErrorReason>

// 编辑模式
enableMarqueeRedact(): void
toggleMarqueeRedact(): void
isMarqueeRedactActive(): boolean

// 编辑选中文本
enableRedactSelection(): void
toggleRedactSelection(): void
isRedactSelectionActive(): boolean

// 将当前选择加入待编辑
queueCurrentSelectionAsPending(): Task<boolean, PdfErrorReason>
```

#### RedactionMode 枚举

```typescript
enum RedactionMode {
  MarqueeRedact = 'marqueeRedact',      // 框选编辑
  RedactSelection = 'redactSelection',  // 编辑选中文本
}
```

#### 示例

```javascript
// 启用编辑选中文本模式
redaction.enableRedactSelection();

// 将当前选择加入待编辑
await redaction.queueCurrentSelectionAsPending();

// 提交所有编辑
const success = await redaction.commitAllPending();
console.log('编辑成功:', success);
```

#### 事件

```javascript
redaction.onRedactionEvent.listen((event) => {
  if (event.type === 'add') {
    console.log('添加了编辑项:', event.items);
  } else if (event.type === 'commit') {
    console.log('编辑提交:', event.success);
  }
});
```

---

## 9. UI 定制

### 获取插件

```javascript
const ui = registry.getPlugin(UIPlugin);
```

### 9.1 UI Schema

可以通过配置自定义整个 UI 结构。

#### 工具栏定制

```typescript
interface ToolbarSchema {
  position?: ToolbarPosition;  // 'top' | 'bottom'
  id?: string;
  items: ToolbarItem[];
  responsive?: ResponsiveRules;
}

type ToolbarItem = 
  | CommandButtonItem    // 命令按钮
  | GroupItem           // 按钮组
  | DividerItem         // 分隔符
  | SpacerItem          // 空白
  | TabGroupItem        // 标签组
  | CustomComponentItem; // 自定义组件
```

#### 侧边栏定制

```typescript
interface SidebarSchema {
  position: SidebarPosition;  // 'left' | 'right'
  id?: string;
  content: PanelContent;
  width?: number;
  resizable?: boolean;
  collapsible?: boolean;
}
```

#### 示例配置

```javascript
const viewer = EmbedPDF.init({
  type: 'container',
  target: element,
  src: 'doc.pdf',
  
  ui: {
    schema: {
      toolbars: [
        {
          position: 'top',
          items: [
            { type: 'command-button', commandId: 'zoom-in' },
            { type: 'command-button', commandId: 'zoom-out' },
            { type: 'divider' },
            { type: 'command-button', commandId: 'print' }
          ]
        }
      ],
      
      sidebars: [
        {
          position: 'left',
          width: 250,
          content: {
            type: 'tabs',
            tabs: [
              {
                id: 'thumbnails',
                icon: 'thumbnails',
                label: '缩略图',
                component: 'thumbnails-sidebar'
              }
            ]
          }
        }
      ]
    }
  }
});
```

### 9.2 禁用功能分类

```javascript
const viewer = EmbedPDF.init({
  type: 'container',
  target: element,
  src: 'doc.pdf',
  
  // 全局禁用
  disabledCategories: [
    'annotation',           // 禁用所有注释
    'annotation-highlight', // 仅禁用高亮
    'redaction',           // 禁用编辑
    'document-print'       // 禁用打印
  ]
});
```

---

## 10. 主题系统

### 10.1 主题配置

```typescript
interface ThemeConfig {
  preference?: ThemePreference;  // 'light' | 'dark' | 'system'
  light?: Partial<ThemeColors>;  // 浅色主题自定义
  dark?: Partial<ThemeColors>;   // 深色主题自定义
}

interface ThemeColors {
  // 主色调
  primary: string;
  primaryHover: string;
  primaryActive: string;
  
  // 次要色
  secondary: string;
  secondaryHover: string;
  
  // 背景色
  bgApp: string;
  bgSurface: string;
  bgElevated: string;
  
  // 文本色
  textPrimary: string;
  textSecondary: string;
  textDisabled: string;
  
  // 边框
  border: string;
  borderHover: string;
  
  // 状态色
  success: string;
  warning: string;
  error: string;
  info: string;
  
  // 其他...
}
```

### 10.2 使用示例

```javascript
const viewer = EmbedPDF.init({
  type: 'container',
  target: element,
  src: 'doc.pdf',
  
  theme: {
    preference: 'dark',
    dark: {
      primary: '#00d4ff',
      bgApp: '#1a1a1a',
      bgSurface: '#2a2a2a',
      textPrimary: '#ffffff'
    }
  }
});

// 运行时切换
viewer.setTheme({
  preference: 'light',
  light: {
    primary: '#0066cc'
  }
});
```

### 10.3 预设主题

```javascript
import { lightTheme, darkTheme, createTheme } from '@embedpdf/snippet';

// 使用预设
const viewer = EmbedPDF.init({
  theme: { preference: 'dark' }
});

// 创建自定义主题
const customTheme = createTheme({
  primary: '#ff6600',
  bgApp: '#f5f5f5'
}, lightTheme);
```

---

## 11. 图标系统

### 11.1 图标配置

```typescript
interface IconConfig {
  path: string;              // SVG path
  viewBox?: string;          // 默认: '0 0 24 24'
  fill?: IconColor;          // 填充色
  stroke?: IconColor;        // 描边色
  strokeWidth?: number;
}

type IconColor = 'primary' | 'secondary' | 'currentColor' | string;
```

### 11.2 注册图标

```javascript
// 初始化时注册
const viewer = EmbedPDF.init({
  type: 'container',
  target: element,
  src: 'doc.pdf',
  
  icons: {
    'custom-save': {
      path: 'M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z',
      fill: 'primary'
    },
    'custom-arrow': {
      path: 'M5 12h14M12 5l7 7-7 7',
      stroke: 'primary',
      strokeWidth: 2
    }
  }
});

// 运行时注册
viewer.registerIcon('my-icon', {
  path: 'M...',
  fill: 'currentColor'
});
```

---

## 12. 国际化

### 获取插件

```javascript
const i18n = registry.getPlugin(I18nPlugin);
```

### 12.1 方法

```typescript
// 设置语言
setLocale(locale: Locale): void

// 获取当前语言
getLocale(): Locale

// 翻译
translate(key: TranslationKey, params?: Record<string, string | number>): string

// 添加翻译
addTranslations(locale: Locale, translations: Record<string, string>): void
```

### 12.2 支持的语言

```typescript
type Locale = 'en' | 'nl' | 'de' | 'fr' | 'es' | 'zh-CN';
```

### 12.3 示例

```javascript
// 设置语言
i18n.setLocale('zh-CN');

// 翻译文本
const text = i18n.translate('toolbar.zoom-in');
console.log(text);  // "放大"

// 带参数的翻译
const msg = i18n.translate('document.page-count', { count: 10 });

// 添加自定义翻译
i18n.addTranslations('zh-CN', {
  'custom.message': '自定义消息'
});
```

### 12.4 事件

```javascript
i18n.onLocaleChange.listen((event) => {
  console.log('语言变更为:', event.locale);
});
```

---

## 13. 命令系统

### 获取插件

```javascript
const commands = registry.getPlugin(CommandsPlugin);
```

### 13.1 执行命令

```typescript
// 执行命令
execute(commandId: string, documentId?: string): void

// 解析命令
resolve(commandId: string, documentId: string): ResolvedCommand | null
```

#### 示例

```javascript
// 执行命令
commands.execute('zoom-in');
commands.execute('annotation-highlight');

// 解析命令获取详细信息
const cmd = commands.resolve('zoom-in', documentId);
if (cmd) {
  console.log('命令标签:', cmd.label);
  console.log('是否禁用:', cmd.disabled);
  console.log('快捷键:', cmd.shortcuts);
}
```

### 13.2 查询命令

```typescript
// 获取所有命令
getCommands(): Command[]

// 获取特定命令
getCommand(commandId: string): Command | null

// 按分类过滤
getCommandsByCategory(category: string): Command[]
```

### 13.3 注册命令

```typescript
// 注册单个命令
registerCommand(command: Command): void

// 批量注册
registerCommands(commands: Record<string, Command>): void
```

#### 示例

```javascript
// 注册自定义命令
commands.registerCommand({
  id: 'custom-action',
  labelKey: 'custom.action',
  icon: 'custom-icon',
  action: ({ registry, state, documentId }) => {
    console.log('执行自定义操作');
    // 执行逻辑...
  },
  shortcuts: ['Ctrl+Shift+X'],
  categories: ['custom']
});
```

### 13.4 禁用分类

```typescript
// 禁用分类
disableCategories(categories: string[]): void

// 启用分类
enableCategories(categories: string[]): void

// 获取禁用的分类
getDisabledCategories(): string[]

// 检查分类是否禁用
isCategoryDisabled(category: string): boolean
```

### 13.5 快捷键

```typescript
// 获取命令的快捷键
getShortcuts(commandId: string): string[] | undefined

// 查找快捷键对应的命令
findCommandByShortcut(shortcut: string): Command | null
```

### 13.6 事件

```javascript
// 命令执行
commands.onCommandExecuted.listen((event) => {
  console.log('命令执行:', event.commandId);
  console.log('来源:', event.source);  // 'keyboard' | 'ui' | 'api'
});

// 快捷键执行
commands.onShortcutExecuted.listen((event) => {
  console.log('快捷键:', event.shortcut);
  console.log('命令:', event.commandId);
});

// 分类变化
commands.onCategoryChanged.listen((event) => {
  console.log('禁用分类:', event.disabledCategories);
});
```

---

## 14. 事件系统

### 14.1 事件订阅模式

所有插件事件都使用 `EventHook` 模式：

```typescript
interface EventHook<T> {
  listen(listener: (event: T) => void): Unsubscribe;
}

type Unsubscribe = () => void;
```

### 14.2 使用示例

```javascript
// 订阅事件
const unsubscribe = plugin.onSomeEvent.listen((event) => {
  console.log('事件触发:', event);
});

// 取消订阅
unsubscribe();
```

### 14.3 常用事件汇总

#### 文档事件

```javascript
// DocumentManagerPlugin
docManager.onDocumentOpened.listen(state => {});
docManager.onDocumentClosed.listen(documentId => {});
docManager.onActiveDocumentChanged.listen(event => {});
docManager.onDocumentError.listen(event => {});
docManager.onDocumentOrderChanged.listen(event => {});
```

#### 视图事件

```javascript
// ZoomPlugin
zoom.onZoomChange.listen(event => {});
zoom.onStateChange.listen(state => {});

// ScrollPlugin
scroll.onPageChange.listen(event => {});
scroll.onScroll.listen(event => {});
scroll.onLayoutChange.listen(event => {});
```

#### 注释事件

```javascript
// AnnotationPlugin
annotation.onAnnotationEvent.listen(event => {});
annotation.onStateChange.listen(state => {});
annotation.onActiveToolChange.listen(tool => {});
```

#### 搜索事件

```javascript
// SearchPlugin
search.onSearchStart.listen(event => {});
search.onSearchResult.listen(event => {});
search.onActiveResultChange.listen(event => {});
search.onSearchStop.listen(event => {});
```

#### 选择事件

```javascript
// SelectionPlugin
selection.onSelectionChange.listen(selection => {});
```

#### 编辑事件

```javascript
// RedactionPlugin
redaction.onRedactionEvent.listen(event => {});
redaction.onPendingChange.listen(pending => {});
redaction.onStateChange.listen(state => {});
```

#### 截图事件

```javascript
// CapturePlugin
capture.onCaptureArea.listen(event => {});
capture.onStateChange.listen(state => {});
```

#### 国际化事件

```javascript
// I18nPlugin
i18n.onLocaleChange.listen(event => {});
```

#### 命令事件

```javascript
// CommandsPlugin
commands.onCommandExecuted.listen(event => {});
commands.onShortcutExecuted.listen(event => {});
commands.onCategoryChanged.listen(event => {});
```

---

## 15. 错误处理

### 15.1 错误代码 (PdfErrorCode)

所有 PDF 操作都可能返回错误。错误通过 `PdfErrorReason` 接口传递：

```typescript
interface PdfErrorReason {
  code: PdfErrorCode;      // 错误代码
  message: string;         // 错误消息
}
```

### 15.2 错误代码列表

#### PDFium 引擎错误（0-8）

这些错误代码直接映射到 PDFium 底层引擎，**不能修改顺序**：

| 代码 | 名称 | 说明 |
|-----|------|------|
| 0 | `Ok` | 成功，无错误 |
| 1 | `Unknown` | 未知错误 |
| 2 | `NotFound` | 文件未找到 |
| **3** | **`WrongFormat`** | **文件格式错误（非有效的 PDF 文件）** |
| 4 | `Password` | 需要密码或密码错误 |
| 5 | `Security` | 安全性错误 |
| 6 | `PageError` | 页面错误 |
| 7 | `XFALoad` | XFA 表单加载错误 |
| 8 | `XFALayout` | XFA 表单布局错误 |

#### 自定义错误代码（9+）

应用层自定义错误：

| 代码 | 名称 | 说明 |
|-----|------|------|
| 9 | `Cancelled` | 操作被取消 |
| 10 | `Initialization` | 初始化失败 |
| 11 | `NotReady` | 引擎未就绪 |
| 12 | `NotSupport` | 功能不支持 |
| 13 | `LoadDoc` | 文档加载失败 |
| 14 | `DocNotOpen` | 文档未打开 |
| 15 | `CantCloseDoc` | 无法关闭文档 |
| 16 | `CantCreateNewDoc` | 无法创建新文档 |
| 17 | `CantImportPages` | 无法导入页面 |
| 18 | `CantCreateAnnot` | 无法创建注释 |
| 19 | `CantSetAnnotRect` | 无法设置注释矩形 |
| 20 | `CantSetAnnotContent` | 无法设置注释内容 |
| 21 | `CantRemoveInkList` | 无法移除墨迹列表 |
| 22 | `CantAddInkStoke` | 无法添加墨迹笔画 |
| 23 | `CantReadAttachmentSize` | 无法读取附件大小 |
| 24 | `CantReadAttachmentContent` | 无法读取附件内容 |
| 25 | `CantFocusAnnot` | 无法聚焦注释 |
| 26 | `CantSelectText` | 无法选择文本 |
| 27 | `CantSelectOption` | 无法选择选项 |
| 28 | `CantCheckField` | 无法检查字段 |
| 29 | `CantSetAnnotString` | 无法设置注释字符串 |

### 15.3 错误代码 3 详解

你遇到的错误：

```
Error loading document
FPDF LoadMemDocument failed
Error Code: 3
```

**错误原因**: `PdfErrorCode.WrongFormat` (代码 3)

**含义**: 文件格式错误，表示传入的数据不是有效的 PDF 文件。

**常见原因**:
1. ❌ 文件不是 PDF 格式（可能是 HTML、图片或损坏的文件）
2. ❌ PDF 文件已损坏或不完整
3. ❌ 传入的 `ArrayBuffer` 数据不正确
4. ❌ 网络传输过程中文件损坏
5. ❌ 文件被截断（下载未完成）

**解决方法**:

```javascript
// 方法 1: 捕获错误并处理
try {
  const response = await docManager.openDocumentUrl({
    url: 'document.pdf',
    name: 'My Document'
  });
  
  // 等待文档加载
  const doc = await response.task;
  console.log('文档加载成功');
  
} catch (error) {
  if (error.code === 3) {
    console.error('文件格式错误，请确保文件是有效的 PDF');
    // 提示用户重新上传
  } else if (error.code === 4) {
    console.error('需要密码');
    // 提示用户输入密码
  } else {
    console.error('加载失败:', error.message);
  }
}

// 方法 2: 使用 Task 的 onError
const response = await docManager.openDocumentUrl({
  url: 'document.pdf'
});

response.task.onError((error) => {
  switch (error.code) {
    case 3:  // WrongFormat
      alert('文件格式错误！请确保文件是有效的 PDF 文档。');
      break;
    case 4:  // Password
      alert('此文件需要密码');
      break;
    case 2:  // NotFound
      alert('文件未找到');
      break;
    default:
      alert(`加载失败: ${error.message}`);
  }
});

// 方法 3: 验证文件后再加载
async function loadPdfWithValidation(file: File) {
  // 检查文件扩展名
  if (!file.name.toLowerCase().endsWith('.pdf')) {
    alert('请选择 PDF 文件');
    return;
  }
  
  // 检查文件头（PDF 文件以 "%PDF-" 开始）
  const buffer = await file.arrayBuffer();
  const header = new Uint8Array(buffer.slice(0, 5));
  const headerStr = String.fromCharCode(...header);
  
  if (headerStr !== '%PDF-') {
    alert('文件格式错误，不是有效的 PDF 文件');
    return;
  }
  
  // 加载文档
  try {
    const response = await docManager.openDocumentBuffer({
      buffer: buffer,
      name: file.name
    });
    
    await response.task;
    console.log('PDF 加载成功');
  } catch (error) {
    console.error('加载失败:', error);
  }
}
```

### 15.4 监听文档错误

```javascript
const docManager = registry.getPlugin(DocumentManagerPlugin);

// 监听所有文档错误
docManager.onDocumentError.listen((event) => {
  console.error('文档错误:', {
    documentId: event.documentId,
    code: event.code,
    message: event.message,
    reason: event.reason
  });
  
  // 根据错误代码处理
  switch (event.reason?.code) {
    case 3:  // WrongFormat
      showNotification('错误', '文件格式不正确');
      break;
    case 4:  // Password
      promptForPassword(event.documentId);
      break;
    case 2:  // NotFound
      showNotification('错误', '文件未找到');
      break;
  }
});
```

### 15.5 常见错误处理模式

#### 处理密码保护的 PDF

```javascript
async function openProtectedPdf(url: string, password?: string) {
  try {
    const response = await docManager.openDocumentUrl({
      url: url,
      password: password
    });
    
    await response.task;
    console.log('打开成功');
    
  } catch (error) {
    if (error.code === 4) {  // Password error
      // 提示用户输入密码
      const userPassword = prompt('请输入 PDF 密码:');
      if (userPassword) {
        // 重试
        return openProtectedPdf(url, userPassword);
      }
    }
    throw error;
  }
}
```

#### 处理网络错误

```javascript
async function openPdfWithRetry(url: string, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await docManager.openDocumentUrl({ url });
      await response.task;
      return;
      
    } catch (error) {
      if (error.code === 2) {  // NotFound
        console.log(`重试 ${i + 1}/${maxRetries}...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else {
        throw error;  // 其他错误直接抛出
      }
    }
  }
  throw new Error('达到最大重试次数');
}
```

#### 批量处理错误

```javascript
async function openMultiplePdfs(urls: string[]) {
  const results = await Promise.allSettled(
    urls.map(url => docManager.openDocumentUrl({ url }))
  );
  
  const succeeded = [];
  const failed = [];
  
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      succeeded.push({ url: urls[index], response: result.value });
    } else {
      const error = result.reason;
      failed.push({ 
        url: urls[index], 
        code: error.code,
        message: error.message 
      });
    }
  });
  
  console.log(`成功: ${succeeded.length}, 失败: ${failed.length}`);
  
  // 显示失败详情
  failed.forEach(({ url, code, message }) => {
    console.error(`${url}: [${code}] ${message}`);
  });
  
  return { succeeded, failed };
}
```

### 15.6 错误代码枚举导入

```typescript
import EmbedPDF, { PdfErrorCode } from '@embedpdf/snippet';

// 使用错误代码
if (error.code === PdfErrorCode.WrongFormat) {
  console.error('格式错误');
}

if (error.code === PdfErrorCode.Password) {
  console.error('需要密码');
}
```

---

## 16. 其他实用 API

### 15.1 打印 (PrintPlugin)

```javascript
const print = registry.getPlugin(PrintPlugin);

// 打印当前文档
print.print();

// 打印特定页面范围
print.printPages({
  from: 1,
  to: 10
});
```

### 15.2 全屏 (FullscreenPlugin)

```javascript
const fullscreen = registry.getPlugin(FullscreenPlugin);

// 进入全屏
fullscreen.enter();

// 退出全屏
fullscreen.exit();

// 切换全屏
fullscreen.toggle();

// 检查是否全屏
const isFullscreen = fullscreen.isFullscreen();
```

### 15.3 书签 (BookmarkPlugin)

```javascript
const bookmark = registry.getPlugin(BookmarkPlugin);

// 获取书签
const bookmarks = bookmark.getBookmarks();

// 跳转到书签
bookmark.goToBookmark(bookmarkId);
```

### 15.4 导出 (ExportPlugin)

```javascript
const exportPlugin = registry.getPlugin(ExportPlugin);

// 下载 PDF
exportPlugin.download();

// 导出为 Blob
const blob = await exportPlugin.export();
```

### 15.5 历史记录 (HistoryPlugin)

```javascript
const history = registry.getPlugin(HistoryPlugin);

// 撤销
history.undo();

// 重做
history.redo();

// 检查是否可撤销/重做
const canUndo = history.canUndo();
const canRedo = history.canRedo();
```

---

## 17. TypeScript 类型支持

### 16.1 导入类型

```typescript
import EmbedPDF, {
  // 核心类型
  EmbedPdfContainer,
  PDFViewerConfig,
  PluginRegistry,
  
  // 插件类
  DocumentManagerPlugin,
  ZoomPlugin,
  AnnotationPlugin,
  SearchPlugin,
  // ... 其他插件
  
  // 能力类型
  DocumentManagerCapability,
  ZoomCapability,
  AnnotationCapability,
  // ... 其他能力
  
  // 配置类型
  DocumentManagerPluginConfig,
  ZoomPluginConfig,
  AnnotationPluginConfig,
  // ... 其他配置
  
  // 枚举
  ZoomMode,
  SpreadMode,
  RedactionMode,
  Rotation,
  PdfErrorCode,
  
  // 主题
  Theme,
  ThemeConfig,
  ThemePreference,
  lightTheme,
  darkTheme,
  
  // 图标
  IconConfig,
  IconsConfig,
  
  // UI Schema
  UISchema,
  ToolbarSchema,
  SidebarSchema,
  // ... 其他 UI 类型
} from '@embedpdf/snippet';
```

### 16.2 类型示例

```typescript
import EmbedPDF, {
  EmbedPdfContainer,
  PDFViewerConfig,
  PluginRegistry,
  ZoomPlugin,
  ZoomMode
} from '@embedpdf/snippet';

// 配置类型
const config: PDFViewerConfig = {
  src: 'document.pdf',
  zoom: {
    defaultLevel: 'fit-width',
    minZoom: 0.5,
    maxZoom: 5
  }
};

// 初始化
const viewer: EmbedPdfContainer = EmbedPDF.init({
  type: 'container',
  target: document.getElementById('viewer')!,
  ...config
})!;

// 使用插件
async function setupZoom() {
  const registry: PluginRegistry = await viewer.registry;
  const zoom = registry.getPlugin(ZoomPlugin);
  
  zoom.requestZoom(ZoomMode.FitWidth);
  zoom.zoomIn();
}
```

---

## 18. 完整示例

### 17.1 基础查看器

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>PDF Viewer</title>
  <style>
    #pdf-viewer { height: 100vh; }
  </style>
</head>
<body>
  <div id="pdf-viewer"></div>
  
  <script type="module">
    import EmbedPDF from 'https://cdn.jsdelivr.net/npm/@embedpdf/snippet@2/dist/embedpdf.js';

    const viewer = EmbedPDF.init({
      type: 'container',
      target: document.getElementById('pdf-viewer'),
      src: 'https://example.com/document.pdf',
      theme: { preference: 'system' }
    });
  </script>
</body>
</html>
```

### 17.2 高级示例：带自定义操作

```javascript
import EmbedPDF, {
  DocumentManagerPlugin,
  ZoomPlugin,
  AnnotationPlugin,
  SearchPlugin
} from '@embedpdf/snippet';

// 初始化
const viewer = EmbedPDF.init({
  type: 'container',
  target: document.getElementById('viewer'),
  
  theme: {
    preference: 'dark',
    dark: {
      primary: '#00d4ff'
    }
  },
  
  zoom: {
    defaultLevel: 'fit-width'
  },
  
  annotations: {
    autoCommit: true,
    annotationAuthor: 'John Doe'
  }
});

// 获取插件
const registry = await viewer.registry;
const docManager = registry.getPlugin(DocumentManagerPlugin);
const zoom = registry.getPlugin(ZoomPlugin);
const annotation = registry.getPlugin(AnnotationPlugin);
const search = registry.getPlugin(SearchPlugin);

// 打开文档
const response = await docManager.openDocumentUrl({
  url: 'document.pdf',
  name: 'My Document'
});

// 设置缩放
zoom.requestZoom('fit-width');

// 搜索文本
const results = await search.search('keyword');
console.log(`找到 ${results.total} 个结果`);

// 激活高亮工具
annotation.setActiveTool('highlight');

// 监听注释创建
annotation.onAnnotationEvent.listen((event) => {
  if (event.type === 'create') {
    console.log('创建了注释:', event.annotation);
  }
});

// 监听缩放变化
zoom.onZoomChange.listen((event) => {
  console.log(`缩放从 ${event.oldZoom} 变为 ${event.newZoom}`);
});

// 主题切换
document.getElementById('toggle-theme').onclick = () => {
  const current = viewer.activeColorScheme;
  viewer.setTheme(current === 'dark' ? 'light' : 'dark');
};
```

### 17.3 多文档管理

```javascript
import EmbedPDF, { DocumentManagerPlugin } from '@embedpdf/snippet';

const viewer = EmbedPDF.init({
  type: 'container',
  target: document.getElementById('viewer'),
  tabBar: 'always',  // 始终显示标签栏
  
  documentManager: {
    maxDocuments: 5,  // 最多打开 5 个文档
    initialDocuments: [
      { url: 'doc1.pdf', name: '文档 1' },
      { url: 'doc2.pdf', name: '文档 2' }
    ]
  }
});

const registry = await viewer.registry;
const docManager = registry.getPlugin(DocumentManagerPlugin);

// 打开更多文档
await docManager.openDocumentUrl({
  url: 'doc3.pdf',
  name: '文档 3'
});

// 切换文档
const docs = docManager.getOpenDocuments();
docManager.setActiveDocument(docs[1].documentId);

// 监听文档切换
docManager.onActiveDocumentChanged.listen((event) => {
  console.log(`从 ${event.previousDocumentId} 切换到 ${event.currentDocumentId}`);
});

// 关闭文档
await docManager.closeDocument(docs[0].documentId);
```

---

## 19. 常见问题

### Q: 如何禁用某些功能？

```javascript
const viewer = EmbedPDF.init({
  type: 'container',
  target: element,
  src: 'doc.pdf',
  disabledCategories: [
    'annotation',      // 禁用所有注释
    'redaction',       // 禁用编辑
    'document-print'   // 禁用打印
  ]
});
```

### Q: 如何自定义工具栏？

通过 `ui.schema` 配置自定义 UI 结构（参见第 9 节）。

### Q: 如何获取当前页码？

```javascript
const scroll = registry.getPlugin(ScrollPlugin);
const currentPage = scroll.getCurrentPage();
console.log('当前页:', currentPage + 1);  // +1 因为是 0-based
```

### Q: 如何监听所有事件？

每个插件都有自己的事件，需要分别订阅（参见第 14 节）。

### Q: 如何实现文档加密？

```javascript
await docManager.openDocumentUrl({
  url: 'encrypted.pdf',
  password: 'your-password'
});
```

---

## 20. 版本信息

```javascript
import EmbedPDF from '@embedpdf/snippet';

console.log('EmbedPDF 版本:', EmbedPDF.version);
```

---

## 21. 许可证

MIT License - 详见 [LICENSE](https://github.com/embedpdf/embed-pdf-viewer/blob/main/LICENSE)

---

**完整文档**: https://www.embedpdf.com/docs/snippet/introduction  
**在线演示**: https://snippet.embedpdf.com/  
**GitHub**: https://github.com/embedpdf/embed-pdf-viewer
