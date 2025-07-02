# 🌾 草方格铺设设备云平台

一个专业的沙漠草方格铺设设备监控和管理云平台，基于草方格防沙治沙技术，提供实时设备监控、3D地形展示、数据可视化等功能。

## 🎯 项目背景

草方格铺设是一种重要的沙漠治理技术，通过在沙地上用麦草、稻草等材料扎成1m×1m的方格状结构，有效防风固沙。本平台专为草方格铺设作业设计，提供全方位的设备监控和数据管理。

## 🌟 核心功能

### 🏗️ 3D可视化系统
- **平坦沙漠地形**: 适合草方格铺设的相对平坦地形模拟
- **草方格网格**: 1m×1m标准草方格网格可视化
- **专业设备模型**: 6种草方格铺设专用设备3D模型
- **工作轨迹**: 设备工作路径和作业区域显示
- **动态特效**: 风沙效果、工作粒子、光束扫描

### 📊 数据监控分析
- **实时统计**: 草方格完成数量、铺设面积、项目进度
- **材料管理**: 麦草、稻草、芦苇等材料库存监控
- **环境监测**: 风速、湿度、温度、能见度等参数
- **设备状态**: 6台专业设备的实时状态监控
- **效率分析**: 设备工作效率和利用率分析

### 🎛️ 设备控制系统
- **草料铺设机**: 启动铺设、调整密度、更换草料
- **材料运输车**: 运输控制、卸载管理、路径规划
- **方格制作机**: 制网控制、规格调整、精度设置
- **压实机**: 压实控制、压力调整、位置移动
- **监控车**: 监控管理、数据同步、报告生成
- **洒水车**: 喷洒控制、水压调整、水源补充

### 📈 专业图表展示
- **材料库存图表**: 各类草料和辅助材料库存状态
- **铺设进度图表**: 实际进度与计划进度对比
- **设备效率雷达图**: 多维度设备性能分析
- **环境监测曲线**: 24小时环境参数变化趋势

## 🎨 界面特色

- **专业科技UI**: 深蓝色渐变背景，霓虹蓝色主题
- **增强动态效果**: 多层粒子系统、流畅动画过渡
- **草方格主题**: 专业的沙漠治理设备界面设计
- **响应式交互**: 点击、悬停、键盘快捷键全面支持

## 📁 文件结构

```
草方格铺设设备云平台/
├── 📄 主要页面
│   ├── index.html              # 主页面 - 3D地形和设备展示
│   └── dashboard.html          # 数据监控面板 - 图表分析
├── 🎨 样式文件
│   ├── styles.css              # 主样式文件 - 全局样式
│   ├── dashboard.css           # 仪表板样式 - 专用样式
│   └── icons.css               # 图标样式 - 自定义图标
├── ⚙️ 脚本文件
│   ├── script.js               # 主JavaScript - 3D渲染和交互
│   └── dashboard.js            # 仪表板JavaScript - 图表和数据
├── 📊 数据管理
│   ├── data/
│   │   └── monitoring-data.json # 模拟数据库
│   └── js/
│       └── data-manager.js     # 数据管理器
├── 🐳 Docker部署
│   ├── Dockerfile              # Docker镜像构建文件
│   ├── Dockerfile.fixed        # 修复版本Dockerfile
│   ├── nginx-simple.conf       # Nginx配置文件
│   ├── docker-compose.yml      # Docker Compose配置
│   └── DOCKER_USAGE.md         # Docker使用说明
└── 📚 文档
    ├── README.md               # 项目说明文档
    ├── CHANGELOG.md            # 更新日志
    └── 启动服务器.bat           # 本地启动脚本
```

## 🛠️ 技术栈

### 前端技术
- **前端框架**: 原生HTML5 + CSS3 + JavaScript ES6+
- **3D图形引擎**: Three.js r128 - 3D地形渲染和设备模型
- **图表可视化**: Chart.js 3.9.1 - 专业数据图表
- **图标库**: Font Awesome 6.0 - 丰富的图标资源
- **音频处理**: Web Audio API - 交互音效反馈
- **样式特性**: CSS Grid, Flexbox, CSS3动画, 渐变效果
- **响应式设计**: 媒体查询, 弹性布局

### 部署技术
- **容器化**: Docker + Docker Compose
- **Web服务器**: Nginx (生产环境)
- **镜像仓库**: Docker Hub
- **部署平台**: 支持各种云平台和容器编排系统

## 🚀 快速开始

### 1. 部署方式

#### 🐳 Docker部署（推荐）
```bash
# 方式1：直接运行
docker run -d -p 8080:80 --name grass-grid-platform baishui2003/grass-grid-platform:latest

# 方式2：使用docker-compose
docker-compose up -d

# 访问应用
# 浏览器打开: http://localhost:8080
```

#### 💻 本地部署
```bash
# 克隆或下载文件到本地
# 使用任意HTTP服务器运行，例如：

# Python 3
python -m http.server 8000

# Node.js (需要安装http-server)
npx http-server

# Windows快速启动
双击运行 启动服务器.bat
```

#### ☁️ 在线部署
- 上传到任意Web服务器
- 支持GitHub Pages、Netlify、Vercel等静态托管平台
- 支持各种云服务器和容器平台

### 2. 访问页面

- **主页面**: `index.html` - 3D地形和设备监控
- **数据面板**: `dashboard.html` - 详细图表分析
- **Docker使用**: 查看 `DOCKER_USAGE.md` 了解详细部署说明

## 📖 使用指南

### 🎮 交互操作

#### 主页面 (index.html)
1. **3D场景交互**
   - 点击设备模型查看详细信息
   - 鼠标悬停设备显示高亮效果
   - 自动旋转相机观察全景

2. **工作流程控制**
   - 地形平整 → 网格划分 → 草料铺设 → 压实固化
   - 点击左侧按钮切换不同工作阶段

3. **实时数据监控**
   - 草方格完成数量实时更新
   - 材料消耗动态统计
   - 环境参数持续监测

#### 数据面板 (dashboard.html)
1. **关键指标卡片**
   - 6个核心指标实时显示
   - 数据变化动画效果
   - 趋势分析和对比

2. **专业图表分析**
   - 材料库存柱状图
   - 环境风速折线图
   - 铺设进度对比图
   - 设备效率雷达图

3. **设备状态监控**
   - 6台设备实时状态
   - 详细参数显示
   - 一键刷新功能

### ⌨️ 快捷键操作

- `F1` - 显示帮助信息
- `F5` - 刷新页面
- `Ctrl + D` - 打开数据监控面板
- `Esc` - 关闭模态窗口

### 🎯 专业功能

#### 设备控制
- **草料铺设机**: 启动/停止铺设、调整密度、更换草料
- **材料运输车**: 运输控制、卸载管理、路径规划
- **方格制作机**: 制网控制、规格调整、精度设置
- **压实机**: 压实控制、压力调整、位置移动
- **监控车**: 监控管理、数据同步、报告生成
- **洒水车**: 喷洒控制、水压调整、水源补充

#### 数据分析
- **实时监控**: 设备状态、工作效率、环境参数
- **历史数据**: 性能记录、维护日志、告警历史
- **趋势分析**: 进度对比、效率变化、材料消耗
- **报告生成**: 数据导出、图表保存、统计报告

### 3. 浏览器兼容性

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 🐳 Docker部署详情

### Docker Hub镜像
- **镜像地址**: `baishui2003/grass-grid-platform:latest`
- **镜像大小**: 约 50MB
- **基础镜像**: nginx:latest

### 快速部署命令
```bash
# 拉取并运行
docker pull baishui2003/grass-grid-platform:latest
docker run -d -p 8080:80 --name grass-grid-platform baishui2003/grass-grid-platform:latest

# 访问应用
http://localhost:8080
```

### 管理命令
```bash
# 查看容器状态
docker ps

# 查看日志
docker logs grass-grid-platform

# 停止/重启容器
docker stop grass-grid-platform
docker restart grass-grid-platform
```

详细的Docker使用说明请查看 `DOCKER_USAGE.md` 文件。

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

## 📦 项目特色

### 🌟 技术亮点
- **专业性强**: 针对草方格铺设的专业解决方案
- **技术先进**: 现代Web技术栈，3D可视化效果出色
- **容器化部署**: 支持Docker一键部署，便于扩展和维护
- **数据丰富**: 多维度数据监控，信息全面
- **用户友好**: 直观的界面设计，操作简单

### 🚀 部署优势
- **快速部署**: Docker一键部署，几分钟即可上线
- **跨平台**: 支持Windows、Linux、macOS等多种平台
- **易于扩展**: 容器化架构，便于水平扩展
- **高可用**: 支持负载均衡和集群部署

## 📞 支持与反馈

### Docker Hub
- **镜像地址**: https://hub.docker.com/r/baishui2003/grass-grid-platform
- **标签说明**:
  - `latest` - 最新稳定版本
  - `fixed` - 修复版本
  - `v1.0` - 版本1.0

### 使用帮助
- 查看 `DOCKER_USAGE.md` 了解详细的Docker部署说明
- 查看 `数据检测功能说明.md` 了解数据监控功能
- 查看 `数据面板跳转功能说明.md` 了解页面跳转功能

## 📄 许可证

本项目采用 MIT 许可证。

---

**注意**: 这是一个演示项目，展示了现代Web技术在工业物联网领域的应用。实际部署时请根据具体需求进行调整和优化。
