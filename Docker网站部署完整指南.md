# 🐳 Docker网站部署完整指南

> 基于草方格铺设设备云平台的实际部署经验总结

## 📋 目录

- [项目准备](#项目准备)
- [Docker化过程](#docker化过程)
- [网络问题解决](#网络问题解决)
- [1Panel部署](#1panel部署)
- [故障排除](#故障排除)
- [最佳实践](#最佳实践)

## 🎯 项目准备

### 项目结构整理

在Docker化之前，确保项目结构清晰：

```
项目根目录/
├── 📄 核心文件
│   ├── index.html              # 主页面
│   ├── dashboard.html          # 数据面板
│   ├── styles.css              # 样式文件
│   └── script.js               # 脚本文件
├── 📊 数据文件
│   └── data/
│       └── monitoring-data.json
├── 🐳 Docker文件
│   ├── Dockerfile              # 主要构建文件
│   ├── nginx.conf              # Web服务器配置
│   ├── .dockerignore           # 忽略文件配置
│   └── docker-compose.yml      # 编排配置
└── 📚 文档
    └── README.md
```

### 清理不必要文件

删除测试文件和临时文件：
- 测试页面（demo.html, test_*.html）
- 备选Dockerfile（Dockerfile.alternative, Dockerfile.python等）
- 临时脚本（deploy.sh, deploy.bat）

## 🐳 Docker化过程

### 1. 创建Dockerfile

```dockerfile
# 使用官方nginx镜像作为基础镜像
FROM nginx:latest

# 设置维护者信息
LABEL maintainer="your-email@example.com"
LABEL description="项目描述"
LABEL version="1.0"

# 删除nginx默认配置和内容
RUN rm -rf /usr/share/nginx/html/*
RUN rm /etc/nginx/conf.d/default.conf

# 复制项目文件到nginx默认目录
COPY . /usr/share/nginx/html/

# 复制nginx配置文件
COPY nginx-simple.conf /etc/nginx/conf.d/default.conf

# 设置文件权限
RUN chmod -R 755 /usr/share/nginx/html

# 创建日志目录
RUN mkdir -p /var/log/nginx

# 暴露80端口
EXPOSE 80

# 启动nginx
CMD ["nginx", "-g", "daemon off;"]
```

### 2. 创建nginx配置文件

```nginx
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    
    server_name _;
    root /usr/share/nginx/html;
    index index.html index.htm;

    # 允许大文件上传
    client_max_body_size 100M;

    # 基本位置配置
    location / {
        try_files $uri $uri/ /index.html;
        
        # 添加CORS头（如果需要跨域访问）
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods 'GET, POST, OPTIONS';
        add_header Access-Control-Allow-Headers 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range';
    }

    # 静态文件缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # JSON文件
    location ~* \.json$ {
        add_header Content-Type "application/json; charset=utf-8";
        expires 1h;
    }

    # HTML文件不缓存
    location ~* \.html$ {
        expires -1;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
    }

    # 健康检查端点
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }

    # 错误页面
    error_page 404 /index.html;
    error_page 500 502 503 504 /index.html;

    # 日志配置
    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;
}
```

### 3. 创建.dockerignore文件

```dockerignore
# Git相关文件
.git
.gitignore
.gitattributes

# Docker相关文件
Dockerfile
.dockerignore
docker-compose.yml

# 开发工具文件
.vscode/
.idea/
*.swp
*.swo
*~

# 系统文件
.DS_Store
Thumbs.db
desktop.ini

# 日志文件
*.log
logs/

# 临时文件
*.tmp
*.temp
temp/
tmp/

# 备份文件
*.bak
*.backup

# 压缩文件
*.zip
*.tar
*.tar.gz
*.rar

# Windows批处理文件（在容器中不需要）
*.bat
*.cmd

# Node.js相关（如果有的话）
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# 其他不需要的文件
.env
.env.local
.env.development
.env.test
.env.production
```

### 4. 创建docker-compose.yml

```yaml
version: '3.8'

services:
  web-app:
    build: .
    container_name: my-web-app
    ports:
      - "8080:80"
    restart: unless-stopped
    environment:
      - NGINX_HOST=localhost
      - NGINX_PORT=80
    networks:
      - web-network

networks:
  web-network:
    driver: bridge
```

## 🌐 网络问题解决

### 常见网络问题

#### 1. Docker Hub连接超时

**问题现象**：
```bash
ERROR: failed to solve: nginx:alpine: failed to resolve source metadata
```

**解决方案**：

1. **配置Docker镜像源**（推荐）

在Docker Desktop设置中配置：
```json
{
  "builder": {
    "gc": {
      "defaultKeepStorage": "20GB",
      "enabled": true
    }
  },
  "experimental": false,
  "registry-mirrors": [
    "https://docker.mirrors.ustc.edu.cn",
    "https://hub-mirror.c.163.com",
    "https://mirror.baidubce.com",
    "https://ccr.ccs.tencentyun.com"
  ]
}
```

2. **重启Docker Desktop**

3. **重新构建镜像**

#### 2. 镜像版本不存在

**问题现象**：
```bash
nginx:1.25-alpine: not found
```

**解决方案**：
- 使用 `nginx:latest` 或 `nginx:alpine`
- 先搜索可用版本：`docker search nginx`

### 构建和测试

```bash
# 1. 构建镜像
docker build -t your-username/your-app:latest .

# 2. 本地测试
docker run -d -p 8080:80 --name test-app your-username/your-app:latest

# 3. 测试访问
curl http://localhost:8080

# 4. 查看日志
docker logs test-app

# 5. 清理测试容器
docker stop test-app && docker rm test-app
```

## 📤 推送到Docker Hub

### 1. 登录Docker Hub

```bash
docker login
```

### 2. 标记镜像

```bash
# 给镜像打标签
docker tag your-username/your-app:latest your-username/your-app:v1.0
docker tag your-username/your-app:latest your-username/your-app:stable
```

### 3. 推送镜像

```bash
# 推送所有标签
docker push your-username/your-app:latest
docker push your-username/your-app:v1.0
docker push your-username/your-app:stable
```

### 4. 验证推送

访问 `https://hub.docker.com/r/your-username/your-app` 确认镜像已上传。

## 🎛️ 1Panel部署

### 1Panel简介

1Panel是一个现代化的Linux服务器运维管理面板，支持Docker容器管理。

### 部署步骤

#### 1. 创建容器

在1Panel界面中：

1. **进入容器管理**
   - 点击左侧菜单"容器"
   - 点击"创建容器"

2. **基本配置**
   - **容器名称**：`my-web-app`
   - **镜像**：`your-username/your-app:latest`
   - **重启策略**：选择 `unless-stopped`

3. **网络配置**
   - **网络模式**：选择 `bridge`
   - **端口映射**：
     - 主机端口：`3120`（或你想要的端口）
     - 容器端口：`80`
     - 协议：`TCP`

4. **高级配置**（可选）
   - **环境变量**：根据需要添加
   - **挂载卷**：通常静态网站不需要
   - **资源限制**：根据服务器配置设置

#### 2. 配置示例

**正确的1Panel配置**：
- 容器名称：`grass-grid-platform`
- 镜像：`baishui2003/grass-grid-platform:latest`
- 端口映射：`3120:80`
- 网络：`bridge`
- 重启策略：`unless-stopped`

#### 3. 创建并启动

1. 点击"确认创建"
2. 等待容器创建完成
3. 检查容器状态是否为"运行中"

### 管理容器

#### 查看容器状态
- 在1Panel容器列表中查看运行状态
- 绿色表示正常运行

#### 查看日志
- 点击容器名称
- 选择"日志"选项卡
- 查看实时日志输出

#### 重启容器
- 点击容器操作按钮
- 选择"重启"

## 🔧 故障排除

### 1. 容器无法启动

**检查步骤**：
```bash
# 查看容器状态
docker ps -a

# 查看容器日志
docker logs container-name

# 检查镜像是否存在
docker images
```

**常见原因**：
- 端口被占用
- 镜像拉取失败
- 配置文件错误

### 2. 网页无法访问

**检查清单**：

1. **容器状态**
   ```bash
   docker ps
   ```

2. **端口映射**
   ```bash
   netstat -tlnp | grep 3120
   ```

3. **防火墙设置**
   ```bash
   # Ubuntu/Debian
   sudo ufw status
   sudo ufw allow 3120

   # CentOS/RHEL
   sudo firewall-cmd --list-all
   sudo firewall-cmd --permanent --add-port=3120/tcp
   sudo firewall-cmd --reload
   ```

4. **云服务器安全组**
   - 登录云服务商控制台
   - 配置安全组入站规则
   - 开放对应端口（如3120）

### 3. 本地访问正常，公网访问失败

**最常见原因**：云服务器安全组未配置

**解决步骤**：

#### 阿里云ECS
1. 登录阿里云控制台
2. 进入ECS实例管理
3. 点击"安全组" → "配置规则"
4. 添加入方向规则：
   - 协议类型：TCP
   - 端口范围：3120/3120
   - 授权对象：0.0.0.0/0

#### 腾讯云CVM
1. 登录腾讯云控制台
2. 进入云服务器管理
3. 点击"安全组" → "编辑规则"
4. 添加入站规则：
   - 类型：自定义
   - 协议：TCP
   - 端口：3120
   - 来源：0.0.0.0/0

#### AWS EC2
1. 进入EC2控制台
2. 选择Security Groups
3. 编辑Inbound rules
4. 添加规则：
   - Type: Custom TCP
   - Port: 3120
   - Source: 0.0.0.0/0

### 4. nginx配置问题

**常见问题**：
- `server_name` 配置过于严格
- 端口监听配置错误
- 文件路径配置错误

**解决方案**：
使用通用配置 `server_name _;` 允许所有域名访问

## 🎯 最佳实践

### 1. 镜像优化

- 使用多阶段构建减小镜像大小
- 选择合适的基础镜像（alpine版本更小）
- 清理不必要的文件和缓存

### 2. 安全配置

- 不要在镜像中包含敏感信息
- 使用非root用户运行容器
- 定期更新基础镜像

### 3. 监控和日志

- 配置健康检查端点
- 设置合适的日志级别
- 使用日志轮转避免磁盘空间问题

### 4. 版本管理

- 使用语义化版本标签
- 保留多个版本以便回滚
- 定期清理旧版本镜像

### 5. 部署策略

- 先在测试环境验证
- 使用蓝绿部署或滚动更新
- 准备回滚方案

## 📝 部署检查清单

### 部署前检查
- [ ] 项目文件结构整理完成
- [ ] Dockerfile配置正确
- [ ] nginx配置文件准备就绪
- [ ] .dockerignore文件配置完成
- [ ] 本地构建测试通过

### 部署过程检查
- [ ] 镜像构建成功
- [ ] 镜像推送到Docker Hub成功
- [ ] 容器创建成功
- [ ] 端口映射配置正确
- [ ] 容器状态为运行中

### 部署后检查
- [ ] 本地访问正常（http://localhost:端口）
- [ ] 公网访问正常（http://服务器IP:端口）
- [ ] 所有页面功能正常
- [ ] 静态资源加载正常
- [ ] 容器日志无错误

### 安全检查
- [ ] 防火墙规则配置正确
- [ ] 云服务器安全组配置正确
- [ ] 不必要的端口已关闭
- [ ] 容器权限配置合理

## 🚀 总结

通过以上步骤，你可以成功将Web项目Docker化并部署到服务器上。关键要点：

1. **准备充分**：整理项目结构，创建必要的Docker文件
2. **解决网络问题**：配置镜像源，处理连接超时
3. **正确配置**：nginx配置要通用，端口映射要正确
4. **安全组配置**：这是公网访问的关键，经常被忽略
5. **测试验证**：每个步骤都要验证，确保功能正常

记住：**云服务器安全组配置是公网访问的关键**，这是最容易被忽略但最重要的步骤！
```
