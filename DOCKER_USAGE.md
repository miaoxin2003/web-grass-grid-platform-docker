# 草方格铺设设备云平台 - Docker使用说明

## 🐳 Docker镜像信息

- **镜像名称**: `baishui2003/grass-grid-platform:latest`
- **基础镜像**: nginx:latest
- **暴露端口**: 80
- **镜像大小**: 约 50MB

## 🚀 快速开始

### 方式1：直接运行
```bash
docker run -d -p 8080:80 --name grass-grid-platform baishui2003/grass-grid-platform:latest
```

### 方式2：使用docker-compose
创建 `docker-compose.yml` 文件：
```yaml
version: '3.8'
services:
  grass-grid-platform:
    image: baishui2003/grass-grid-platform:latest
    container_name: grass-grid-platform
    ports:
      - "8080:80"
    restart: unless-stopped
```

然后运行：
```bash
docker-compose up -d
```

## 🌐 访问地址

启动后可以通过以下地址访问：

- **主页面**: http://localhost:8080/
- **数据监控面板**: http://localhost:8080/dashboard.html

## 🛠️ 管理命令

### 查看容器状态
```bash
docker ps
```

### 查看日志
```bash
docker logs grass-grid-platform
```

### 停止容器
```bash
docker stop grass-grid-platform
```

### 重启容器
```bash
docker restart grass-grid-platform
```

### 删除容器
```bash
docker rm grass-grid-platform
```

## 🔧 高级配置

### 自定义端口
```bash
docker run -d -p 3000:80 --name grass-grid-platform baishui2003/grass-grid-platform:latest
```

### 挂载自定义配置
```bash
docker run -d -p 8080:80 \
  -v /path/to/your/nginx.conf:/etc/nginx/conf.d/default.conf \
  --name grass-grid-platform \
  baishui2003/grass-grid-platform:latest
```

### 环境变量配置
```bash
docker run -d -p 8080:80 \
  -e NGINX_HOST=localhost \
  -e NGINX_PORT=80 \
  --name grass-grid-platform \
  baishui2003/grass-grid-platform:latest
```

## 📊 功能特性

- ✅ 3D沙漠地形可视化
- ✅ 6种专业设备监控
- ✅ 实时数据更新
- ✅ 动态图表展示
- ✅ 响应式设计
- ✅ 专业科技UI界面

## 🔍 故障排除

### 端口被占用
如果8080端口被占用，可以使用其他端口：
```bash
docker run -d -p 9090:80 --name grass-grid-platform baishui2003/grass-grid-platform:latest
```

### 容器无法启动
检查Docker服务是否正常运行：
```bash
docker info
```

### 网页无法访问
1. 检查容器是否正在运行：`docker ps`
2. 检查端口映射是否正确
3. 检查防火墙设置

## 📝 更新镜像

```bash
# 停止并删除旧容器
docker stop grass-grid-platform
docker rm grass-grid-platform

# 拉取最新镜像
docker pull baishui2003/grass-grid-platform:latest

# 运行新容器
docker run -d -p 8080:80 --name grass-grid-platform baishui2003/grass-grid-platform:latest
```

## 🏷️ 版本标签

- `latest` - 最新版本
- `v1.0` - 稳定版本1.0

## 📞 支持

如有问题，请联系：baishui2003@example.com
