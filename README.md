# 沙漠铺设设备云平台

一个专业的沙漠铺设设备监控和管理云平台，提供实时设备监控、3D地形展示、数据可视化等功能。

## 功能特性

### 🌟 主要功能

- **3D地形展示**: 使用Three.js创建的交互式3D沙漠地形，实时显示设备位置
- **实时监控**: 设备状态、电量、温度等参数的实时监控
- **数据可视化**: 原料余量、风速监测、设备导航等多种图表展示
- **智能告警**: 设备异常状态自动告警提醒
- **响应式设计**: 支持桌面端和移动端访问

### 🎨 界面特色

- **科技感UI**: 深蓝色渐变背景，霓虹蓝色主题
- **动态效果**: 粒子背景、动画过渡、悬停效果
- **专业布局**: 仪表板式布局，信息层次清晰
- **交互体验**: 点击、悬停、键盘快捷键支持

## 文件结构

```
web/
├── index.html          # 主页面
├── dashboard.html      # 数据监控面板
├── styles.css          # 主样式文件
├── dashboard.css       # 仪表板样式
├── script.js           # 主JavaScript文件
├── dashboard.js        # 仪表板JavaScript
└── README.md          # 说明文档
```

## 技术栈

- **前端框架**: 原生HTML5 + CSS3 + JavaScript ES6+
- **3D图形**: Three.js
- **图表库**: Chart.js
- **图标库**: Font Awesome 6
- **样式特性**: CSS Grid, Flexbox, CSS动画

## 快速开始

### 1. 部署方式

#### 本地部署
```bash
# 克隆或下载文件到本地
# 使用任意HTTP服务器运行，例如：

# Python 3
python -m http.server 8000

# Node.js (需要安装http-server)
npx http-server

# 然后访问 http://localhost:8000
```

#### Web服务器部署
将所有文件上传到Web服务器根目录即可直接访问。

### 2. 浏览器兼容性

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 使用指南

### 主页面功能

#### 左侧控制面板
- **工作流程**: 切换不同的预设工作方案
- **数据管理**: 浏览历史数据缩略图

#### 中央3D显示区
- **地形展示**: 3D沙漠地形模型
- **设备标记**: 点击设备标记查看详情
- **相机控制**: 自动旋转视角

#### 右侧信息面板
- **产品详情**: 实时显示原料统计数据
- **操作平台**: 设备控制、数据监测、人员配置

#### 底部状态栏
- **连接状态**: 系统连接状态
- **设备电量**: 整体设备电量状态
- **环境温度**: 当前环境温度

### 数据监控面板

#### 关键指标
- 设备总数、运行设备数量
- 告警数量、工作效率统计

#### 图表分析
- **原料余量**: 柱状图显示各类原料库存
- **风速监测**: 实时风速变化曲线
- **设备导航**: 散点图显示设备位置分布

#### 设备状态
- 实时设备列表，显示运行状态
- 电量、温度等关键参数监控

#### 系统日志
- 实时系统日志显示
- 支持日志级别筛选
- 自动滚动更新

### 快捷键

| 快捷键 | 功能 |
|--------|------|
| F1 | 显示帮助信息 |
| F5 | 刷新页面 |
| Ctrl+D | 打开数据监控面板 |
| Esc | 关闭模态窗口 |

## 自定义配置

### 修改主题颜色

在 `styles.css` 中修改CSS变量：

```css
:root {
    --primary-color: #00d4ff;    /* 主色调 */
    --secondary-color: #0099cc;  /* 辅助色 */
    --success-color: #00ff88;    /* 成功色 */
    --warning-color: #ffaa00;    /* 警告色 */
    --error-color: #ff4444;      /* 错误色 */
}
```

### 添加新的设备类型

在 `script.js` 中的 `addEquipmentMarkers` 函数中添加新设备：

```javascript
const equipmentPositions = [
    { x: -50, z: -30, type: 'excavator' },
    { x: 20, z: 40, type: 'truck' },
    // 添加新设备
    { x: 0, z: 0, type: 'new_device' }
];
```

### 修改数据更新频率

在相应的JavaScript文件中修改定时器间隔：

```javascript
// 每5秒更新数据
setInterval(updateRealTimeData, 5000);

// 每3秒添加新日志
setInterval(addRandomLog, 3000);
```

## 性能优化

### 建议的优化措施

1. **图片优化**: 使用WebP格式图片
2. **代码压缩**: 使用工具压缩CSS和JavaScript
3. **CDN加速**: 使用CDN加载第三方库
4. **缓存策略**: 设置适当的浏览器缓存

### 监控性能

使用浏览器开发者工具监控：
- 页面加载时间
- JavaScript执行性能
- 内存使用情况
- 网络请求状态

## 故障排除

### 常见问题

1. **3D场景不显示**
   - 检查浏览器是否支持WebGL
   - 确认Three.js库正确加载

2. **图表不显示**
   - 检查Chart.js库是否正确加载
   - 确认canvas元素存在

3. **样式异常**
   - 检查CSS文件路径是否正确
   - 确认浏览器兼容性

4. **数据不更新**
   - 检查JavaScript控制台错误
   - 确认定时器正常运行

## 扩展开发

### 添加新功能模块

1. 在HTML中添加新的DOM结构
2. 在CSS中添加对应样式
3. 在JavaScript中实现功能逻辑
4. 更新事件监听器

### 集成后端API

```javascript
// 示例：获取实时数据
async function fetchRealTimeData() {
    try {
        const response = await fetch('/api/devices');
        const data = await response.json();
        updateDeviceData(data);
    } catch (error) {
        console.error('数据获取失败:', error);
    }
}
```

## 许可证

本项目采用 MIT 许可证。

## 联系方式

如有问题或建议，请联系开发团队。

---

**注意**: 这是一个演示项目，实际部署时请根据具体需求进行调整和优化。
