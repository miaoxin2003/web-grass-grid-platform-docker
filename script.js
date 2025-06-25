// 全局变量
let scene, camera, renderer, terrain, controls;
let animationId;
let currentTime = new Date();

// 初始化应用
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    init3DTerrain();
    startRealTimeUpdates();
    setupEventListeners();
});

// 初始化应用
function initializeApp() {
    updateDateTime();
    animateElements();
    generateMockData();
}

// 更新日期时间
function updateDateTime() {
    const now = new Date();
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    };
    
    const timeString = now.toLocaleDateString('zh-CN', options);
    document.getElementById('current-time').textContent = timeString;
}

// 初始化3D地形
function init3DTerrain() {
    console.log('开始初始化3D地形...');
    
    const container = document.getElementById('terrain-3d');
    if (!container) {
        console.error('找不到3D容器元素');
        return;
    }
    
    const width = container.clientWidth;
    const height = container.clientHeight;
    console.log('容器尺寸:', width, 'x', height);

    // 创建场景
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB);
    console.log('场景创建成功');

    // 创建相机
    camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(0, 80, 120);
    console.log('相机创建成功，位置:', camera.position);

    // 创建渲染器
    try {
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(width, height);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        container.appendChild(renderer.domElement);
        console.log('渲染器创建成功');
    } catch (error) {
        console.error('渲染器创建失败:', error);
        return;
    }

    // 暂时禁用OrbitControls，使用固定视角
    controls = null;
    console.log('使用固定视角模式');

    // 创建地形
    createTerrain();
    
    // 添加设备标记
    addEquipmentMarkers();
    
    // 添加光照
    addLighting();
    
    // 开始渲染循环
    animate3D();
    
    console.log('3D场景初始化完成');
}

// 创建地形 - 适合草方格铺设的平坦沙漠地形
function createTerrain() {
    const geometry = new THREE.PlaneGeometry(300, 300, 100, 100);
    
    // 创建相对平坦的沙漠地形，适合草方格铺设
    const vertices = geometry.attributes.position.array;
    for (let i = 0; i < vertices.length; i += 3) {
        const x = vertices[i];
        const y = vertices[i + 1];
        // 创建微小的起伏，模拟沙丘但保持相对平坦
        vertices[i + 2] = Math.sin(x * 0.02) * Math.cos(y * 0.02) * 2 + 
                         Math.random() * 1.5 - 0.75; // 高度变化控制在±2米内
    }
    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();

    // 创建沙漠材质
    const material = new THREE.MeshLambertMaterial({
        color: 0xF4E4BC, // 沙漠色
        wireframe: false
    });

    terrain = new THREE.Mesh(geometry, material);
    terrain.rotation.x = -Math.PI / 2;
    terrain.receiveShadow = true;
    scene.add(terrain);

    // 添加草方格网格
    createGrassGrids();
}

// 创建草方格网格
function createGrassGrids() {
    const gridSize = 1; // 1m x 1m 草方格
    const gridCount = 50; // 50x50 网格
    const startX = -gridCount * gridSize / 2;
    const startZ = -gridCount * gridSize / 2;

    // 创建网格线材质
    const lineMaterial = new THREE.LineBasicMaterial({
        color: 0x8B4513, // 草料颜色
        opacity: 0.6,
        transparent: true
    });

    // 创建水平线
    for (let i = 0; i <= gridCount; i++) {
        const geometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(startX, 0.1, startZ + i * gridSize),
            new THREE.Vector3(startX + gridCount * gridSize, 0.1, startZ + i * gridSize)
        ]);
        const line = new THREE.Line(geometry, lineMaterial);
        scene.add(line);
    }

    // 创建垂直线
    for (let i = 0; i <= gridCount; i++) {
        const geometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(startX + i * gridSize, 0.1, startZ),
            new THREE.Vector3(startX + i * gridSize, 0.1, startZ + gridCount * gridSize)
        ]);
        const line = new THREE.Line(geometry, lineMaterial);
        scene.add(line);
    }

    // 添加一些已完成的草方格区域
    createCompletedGridAreas();
}

// 创建已完成的草方格区域
function createCompletedGridAreas() {
    const completedAreas = [
        { x: -20, z: -20, width: 10, height: 10 },
        { x: 10, z: -15, width: 8, height: 12 },
        { x: -10, z: 15, width: 15, height: 8 }
    ];

    completedAreas.forEach(area => {
        const geometry = new THREE.PlaneGeometry(area.width, area.height);
        const material = new THREE.MeshLambertMaterial({
            color: 0x90EE90, // 浅绿色，表示已完成区域
            opacity: 0.7,
            transparent: true
        });
        
        const plane = new THREE.Mesh(geometry, material);
        plane.rotation.x = -Math.PI / 2;
        plane.position.set(area.x, 0.2, area.z);
        scene.add(plane);
    });
}

// 添加多功能治沙机设备标记
function addEquipmentMarkers() {
    const equipmentPosition = { 
        x: 0, 
        z: 0, 
        type: 'multi_sand_control', 
        name: '多功能治沙机', 
        status: 'working' 
    };

    // 创建多功能治沙机模型
    const equipment = createEquipmentModel(equipmentPosition.type, equipmentPosition.status);
    equipment.position.set(equipmentPosition.x, 3, equipmentPosition.z);
    equipment.userData = { 
        type: equipmentPosition.type, 
        id: 0, 
        name: equipmentPosition.name,
        status: equipmentPosition.status 
    };
    
    // 添加点击事件
    equipment.callback = () => showEquipmentDetails(equipmentPosition.type, 0, equipmentPosition.name, equipmentPosition.status);
    
    scene.add(equipment);

    // 添加设备标签
    createEquipmentLabel(equipmentPosition.x, equipmentPosition.z, equipmentPosition.name);

    // 添加工作轨迹
    createWorkTrail(equipmentPosition.x, equipmentPosition.z, equipmentPosition.type);
}

// 创建多功能治沙机模型
function createEquipmentModel(type, status) {
    const group = new THREE.Group();
    
    // 多功能治沙机颜色配置
    const mainColor = 0x00FF00; // 绿色 - 工作中
    const accentColor = 0x00AA00;
    const metalColor = 0x666666; // 金属色
    const yellowColor = 0xFFD700; // 黄色

    // 主体底盘 - 更大更稳固
    const chassisGeometry = new THREE.BoxGeometry(12, 3, 16);
    const chassisMaterial = new THREE.MeshLambertMaterial({ color: mainColor });
    const chassis = new THREE.Mesh(chassisGeometry, chassisMaterial);
    chassis.position.y = 1.5;
    chassis.castShadow = true;
    group.add(chassis);

    // 驾驶室 - 前置
    const cabGeometry = new THREE.BoxGeometry(6, 4, 5);
    const cabMaterial = new THREE.MeshLambertMaterial({ color: accentColor });
    const cab = new THREE.Mesh(cabGeometry, cabMaterial);
    cab.position.set(0, 5.5, -5.5);
    cab.castShadow = true;
    group.add(cab);

    // 多功能作业臂 - 左侧草料铺设
    const strawArmGeometry = new THREE.BoxGeometry(2, 1, 8);
    const strawArmMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
    const strawArm = new THREE.Mesh(strawArmGeometry, strawArmMaterial);
    strawArm.position.set(-7, 4, 2);
    strawArm.rotation.z = -Math.PI / 6;
    group.add(strawArm);

    // 压实滚筒 - 右侧
    const rollerGeometry = new THREE.CylinderGeometry(1.5, 1.5, 6);
    const rollerMaterial = new THREE.MeshLambertMaterial({ color: metalColor });
    const roller = new THREE.Mesh(rollerGeometry, rollerMaterial);
    roller.position.set(7, 2, 0);
    roller.rotation.z = Math.PI / 2;
    group.add(roller);

    // 材料储存箱 - 后部
    const storageGeometry = new THREE.BoxGeometry(8, 4, 6);
    const storageMaterial = new THREE.MeshLambertMaterial({ color: yellowColor });
    const storage = new THREE.Mesh(storageGeometry, storageMaterial);
    storage.position.set(0, 5, 6);
    group.add(storage);

    // 网格制作器 - 底部
    const gridMakerGeometry = new THREE.BoxGeometry(10, 1, 4);
    const gridMakerMaterial = new THREE.MeshLambertMaterial({ color: metalColor });
    const gridMaker = new THREE.Mesh(gridMakerGeometry, gridMakerMaterial);
    gridMaker.position.set(0, 0.5, 8);
    group.add(gridMaker);

    // 洒水装置 - 顶部
    const waterSystemGeometry = new THREE.CylinderGeometry(0.3, 0.3, 8);
    const waterSystemMaterial = new THREE.MeshLambertMaterial({ color: 0x0080FF });
    const waterSystem = new THREE.Mesh(waterSystemGeometry, waterSystemMaterial);
    waterSystem.position.set(0, 7, 0);
    waterSystem.rotation.z = Math.PI / 2;
    group.add(waterSystem);

    // 履带 - 左右两侧
    for (let side = -1; side <= 1; side += 2) {
        const trackGeometry = new THREE.BoxGeometry(2, 2, 14);
        const trackMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 });
        const track = new THREE.Mesh(trackGeometry, trackMaterial);
        track.position.set(side * 7, 1, 0);
        group.add(track);
    }

    // 状态指示灯 - 多个位置
    const lightPositions = [
        { x: 0, y: 8, z: -5 },  // 驾驶室顶部
        { x: -4, y: 6, z: 6 },  // 储存箱左侧
        { x: 4, y: 6, z: 6 }    // 储存箱右侧
    ];

    lightPositions.forEach(pos => {
        const lightGeometry = new THREE.SphereGeometry(0.3);
        const lightMaterial = new THREE.MeshBasicMaterial({ 
            color: mainColor,
            emissive: mainColor,
            emissiveIntensity: 0.5
        });
        const light = new THREE.Mesh(lightGeometry, lightMaterial);
        light.position.set(pos.x, pos.y, pos.z);
        group.add(light);
    });

    // 添加天线
    const antennaGeometry = new THREE.CylinderGeometry(0.1, 0.1, 3);
    const antennaMaterial = new THREE.MeshLambertMaterial({ color: metalColor });
    const antenna = new THREE.Mesh(antennaGeometry, antennaMaterial);
    antenna.position.set(2, 9, -5);
    group.add(antenna);

    return group;
}

// 创建工作轨迹
function createWorkTrail(x, z, type) {
    const points = [];
    const trailLength = 20;
    
    for (let i = 0; i < trailLength; i++) {
        const angle = (i / trailLength) * Math.PI * 2;
        const radius = 15;
        points.push(new THREE.Vector3(
            x + Math.cos(angle) * radius,
            0.3,
            z + Math.sin(angle) * radius
        ));
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
        color: 0x00D4FF,
        opacity: 0.5,
        transparent: true
    });
    
    const trail = new THREE.Line(geometry, material);
    scene.add(trail);
}

// 创建设备标签
function createEquipmentLabel(x, z, text) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 128;
    canvas.height = 64;
    
    context.fillStyle = 'rgba(0, 212, 255, 0.8)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = 'white';
    context.font = '16px Arial';
    context.textAlign = 'center';
    context.fillText(text, canvas.width / 2, canvas.height / 2 + 6);

    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(material);
    sprite.position.set(x, 20, z);
    sprite.scale.set(20, 10, 1);
    
    scene.add(sprite);
}

// 添加光照
function addLighting() {
    // 环境光
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    // 方向光
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 100, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);
}

// 3D动画循环
function animate3D() {
    animationId = requestAnimationFrame(animate3D);
    
    // 更新控制器（必须在每一帧调用）
    if (controls) {
        controls.update();
    } else {
        // 备用方案：固定相机位置
        camera.position.set(0, 80, 120);
        camera.lookAt(0, 0, 0);
    }
    
    renderer.render(scene, camera);
}

// 设置事件监听器
function setupEventListeners() {
    // 工作流程按钮
    document.querySelectorAll('.workflow-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.workflow-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            updateWorkflowData(this.textContent);
        });
    });

    // 缩略图点击
    document.querySelectorAll('.thumbnail').forEach(thumb => {
        thumb.addEventListener('click', function() {
            document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            loadThumbnailData();
        });
    });

    // 操作按钮
    document.querySelectorAll('.op-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            // 清理文本内容，去除图标和多余空格
            const cleanText = this.textContent.trim().replace(/^\s*\S+\s*/, '').trim();
            const buttonText = cleanText || this.textContent.trim();

            // 特殊处理数据监控面板按钮
            if (this.classList.contains('dashboard-btn') || buttonText.includes('数据监控面板')) {
                handleOperationClick('数据监控面板');
            } else {
                handleOperationClick(buttonText);
            }
        });
    });

    // 模态窗口关闭
    document.querySelector('.modal-close').addEventListener('click', closeModal);
    document.getElementById('modal-overlay').addEventListener('click', function(e) {
        if (e.target === this) closeModal();
    });

    // 窗口大小调整
    window.addEventListener('resize', onWindowResize);
}

// 窗口大小调整处理
function onWindowResize() {
    if (camera && renderer) {
        const container = document.getElementById('terrain-3d');
        const width = container.clientWidth;
        const height = container.clientHeight;
        
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
        
        // 更新控制器
        if (controls) {
            controls.handleResize();
        }
    }
}

// 开始实时更新
function startRealTimeUpdates() {
    // 每秒更新时间
    setInterval(updateDateTime, 1000);
    
    // 每5秒更新数据
    setInterval(updateRealTimeData, 5000);
    
    // 每2秒更新状态
    setInterval(updateSystemStatus, 2000);
}

// 更新实时数据
function updateRealTimeData() {
    // 更新草方格铺设统计
    const statValues = document.querySelectorAll('.stat-value');
    const statLabels = document.querySelectorAll('.stat-label');
    
    statValues.forEach((stat, index) => {
        const label = statLabels[index]?.textContent;
        let currentValue = parseFloat(stat.textContent);
        let newValue;
        
        switch(label) {
            case '已完成面积':
                // 面积逐渐增加
                newValue = Math.min(2000, currentValue + Math.random() * 5);
                stat.textContent = Math.floor(newValue);
                break;
            case '草料消耗':
                // 草料消耗逐渐增加
                newValue = currentValue + Math.random() * 0.1;
                stat.textContent = newValue.toFixed(1);
                break;
            case '网格数量':
                // 网格数量与面积同步
                const area = parseInt(statValues[0].textContent);
                stat.textContent = area;
                break;
            case '完成进度':
                // 进度逐渐增加
                newValue = Math.min(100, currentValue + Math.random() * 0.5);
                stat.textContent = Math.floor(newValue);
                break;
            default:
                newValue = currentValue + (Math.random() - 0.5) * 0.2;
                stat.textContent = newValue.toFixed(1);
        }
        
        // 添加闪烁效果
        stat.classList.add('pulse');
        setTimeout(() => stat.classList.remove('pulse'), 1000);
    });

    // 更新3D场景中的完成区域
    updateCompletedAreas();
}

// 更新系统状态
function updateSystemStatus() {
    const statusItems = document.querySelectorAll('.status-item span');
    const statuses = [
        '连接状态: 正常',
        `设备电量: ${Math.floor(Math.random() * 20 + 80)}%`,
        `环境温度: ${Math.floor(Math.random() * 15 + 20)}°C`,
        `风速: ${Math.floor(Math.random() * 10 + 8)} km/h`,
        `湿度: ${Math.floor(Math.random() * 20 + 25)}%`,
        `能见度: ${['优秀', '良好', '一般'][Math.floor(Math.random() * 3)]}`
    ];
    
    statusItems.forEach((item, index) => {
        if (index < statuses.length) {
            item.textContent = statuses[index];
            
            // 添加状态变化动画
            item.parentElement.classList.add('glow');
            setTimeout(() => {
                item.parentElement.classList.remove('glow');
            }, 2000);
        }
    });
}

// 动画元素
function animateElements() {
    // 为面板添加滑入动画
    document.querySelectorAll('.left-panel, .right-panel').forEach((panel, index) => {
        panel.style.animationDelay = `${index * 0.2}s`;
        panel.classList.add('slide-in');
    });
}

// 生成模拟数据
function generateMockData() {
    // 这里可以添加更多模拟数据生成逻辑
    console.log('Mock data generated');
}

// 更新工作流程数据
function updateWorkflowData(workflow) {
    console.log(`Switching to workflow: ${workflow}`);
    // 这里可以添加切换工作流程的逻辑
}

// 加载缩略图数据
function loadThumbnailData() {
    console.log('Loading thumbnail data');
    // 这里可以添加加载缩略图数据的逻辑
}

// 处理操作按钮点击
function handleOperationClick(operation) {
    switch(operation) {
        case '设备控制':
            showModal('设备控制', createDeviceControlContent());
            break;
        case '数据监测':
        case '数据监控面板':
            // 跳转到数据监控面板
            console.log('跳转到数据监控面板...');
            window.open('dashboard.html', '_blank');
            break;
        case '人员配置':
            showModal('人员配置', createPersonnelContent());
            break;
    }
}

// 显示设备详情
function showEquipmentDetails(type, id, name, status) {
    const statusText = {
        'working': '工作中',
        'moving': '移动中',
        'standby': '待机',
        'monitoring': '监控中'
    };

    // 多功能治沙机的详细参数
    const multiSandControlDetails = {
        strawLayerEfficiency: Math.floor(Math.random() * 15 + 85),
        strawUsage: (Math.random() * 30 + 120).toFixed(1),
        gridPrecision: (Math.random() * 3 + 97).toFixed(1),
        compactionPressure: Math.floor(Math.random() * 50 + 150),
        waterLevel: Math.floor(Math.random() * 30 + 70),
        waterPressure: Math.floor(Math.random() * 20 + 60),
        materialCapacity: Math.floor(Math.random() * 20 + 80),
        overallEfficiency: Math.floor(Math.random() * 10 + 90)
    };

    const battery = Math.floor(Math.random() * 20 + 80);
    const temp = Math.floor(Math.random() * 10 + 25);
    const workHours = (Math.random() * 6 + 4).toFixed(1);

    const specificInfo = `
        <div class="multi-function-params">
            <h6><i class="fas fa-seedling"></i> 草料铺设模块</h6>
            <p><i class="fas fa-chart-line"></i> 铺设效率: ${multiSandControlDetails.strawLayerEfficiency}%</p>
            <p><i class="fas fa-weight"></i> 草料用量: ${multiSandControlDetails.strawUsage} kg/h</p>
            
            <h6><i class="fas fa-th"></i> 网格制作模块</h6>
            <p><i class="fas fa-crosshairs"></i> 制作精度: ${multiSandControlDetails.gridPrecision}%</p>
            <p><i class="fas fa-ruler"></i> 网格规格: 1m × 1m</p>
            
            <h6><i class="fas fa-compress-arrows-alt"></i> 压实模块</h6>
            <p><i class="fas fa-gauge"></i> 压实压力: ${multiSandControlDetails.compactionPressure} kPa</p>
            <p><i class="fas fa-cube"></i> 压实深度: 15-20 cm</p>
            
            <h6><i class="fas fa-tint"></i> 洒水模块</h6>
            <p><i class="fas fa-water"></i> 水箱水位: ${multiSandControlDetails.waterLevel}%</p>
            <p><i class="fas fa-compress"></i> 喷洒压力: ${multiSandControlDetails.waterPressure} bar</p>
            
            <h6><i class="fas fa-box"></i> 材料储存</h6>
            <p><i class="fas fa-warehouse"></i> 储存容量: ${multiSandControlDetails.materialCapacity}%</p>
            <p><i class="fas fa-star"></i> 综合效率: ${multiSandControlDetails.overallEfficiency}%</p>
        </div>
    `;

    const content = `
        <div class="equipment-details">
            <h4><i class="fas fa-cogs"></i> ${name}</h4>
            <div class="status-badge status-${status}">${statusText[status] || '未知'}</div>
            
            <div class="detail-section">
                <h5>基本信息</h5>
                <p><i class="fas fa-id-card"></i> 设备编号: MSC-${String(id + 1).padStart(3, '0')}</p>
                <p><i class="fas fa-clock"></i> 连续工作: ${workHours} 小时</p>
                <p><i class="fas fa-battery-three-quarters"></i> 电量状态: ${battery}%</p>
                <p><i class="fas fa-thermometer-half"></i> 机体温度: ${temp}°C</p>
                <p><i class="fas fa-map-marker-alt"></i> 当前位置: 作业区中心</p>
            </div>
            
            <div class="detail-section">
                <h5>多功能模块参数</h5>
                ${specificInfo}
            </div>
            
            <div class="detail-actions">
                <button class="detail-btn" onclick="controlEquipment('${type}', ${id})">
                    <i class="fas fa-sliders-h"></i> 模块控制
                </button>
                <button class="detail-btn" onclick="viewHistory('${type}', ${id})">
                    <i class="fas fa-chart-bar"></i> 性能分析
                </button>
                <button class="detail-btn" onclick="switchMode('${type}', ${id})">
                    <i class="fas fa-exchange-alt"></i> 切换模式
                </button>
            </div>
        </div>
    `;
    showModal('设备详情', content);
}

// 创建设备控制内容
function createDeviceControlContent() {
    return `
        <div class="control-grid">
            <button class="control-btn">启动设备</button>
            <button class="control-btn">停止设备</button>
            <button class="control-btn">重置设备</button>
            <button class="control-btn">维护模式</button>
        </div>
        <div class="control-status">
            <p>当前状态: 运行中</p>
            <p>运行时间: 2小时30分钟</p>
        </div>
    `;
}

// 创建数据监测内容
function createDataMonitorContent() {
    return `
        <div class="monitor-data">
            <div class="data-item">
                <span>CPU使用率:</span>
                <span>${Math.floor(Math.random() * 30 + 40)}%</span>
            </div>
            <div class="data-item">
                <span>内存使用:</span>
                <span>${Math.floor(Math.random() * 20 + 60)}%</span>
            </div>
            <div class="data-item">
                <span>网络延迟:</span>
                <span>${Math.floor(Math.random() * 50 + 10)}ms</span>
            </div>
        </div>
    `;
}

// 创建人员配置内容
function createPersonnelContent() {
    return `
        <div class="personnel-list">
            <div class="person-item">
                <span>操作员A</span>
                <span class="status online">在线</span>
            </div>
            <div class="person-item">
                <span>操作员B</span>
                <span class="status offline">离线</span>
            </div>
            <div class="person-item">
                <span>维护员C</span>
                <span class="status online">在线</span>
            </div>
        </div>
    `;
}

// 显示模态窗口
function showModal(title, content) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = content;
    document.getElementById('modal-overlay').style.display = 'block';
}

// 关闭模态窗口
function closeModal() {
    document.getElementById('modal-overlay').style.display = 'none';
}

// 添加键盘快捷键支持
document.addEventListener('keydown', function(e) {
    switch(e.key) {
        case 'F1':
            e.preventDefault();
            showModal('帮助', createHelpContent());
            break;
        case 'F5':
            e.preventDefault();
            location.reload();
            break;
        case 'Escape':
            closeModal();
            break;
        case 'd':
            if (e.ctrlKey) {
                e.preventDefault();
                window.open('dashboard.html', '_blank');
            }
            break;
    }
});

// 创建帮助内容
function createHelpContent() {
    return `
        <div class="help-content">
            <h4>🎮 快捷键操作</h4>
            <ul>
                <li><kbd>F1</kbd> - 显示帮助信息</li>
                <li><kbd>F5</kbd> - 刷新页面</li>
                <li><kbd>Ctrl+D</kbd> - 打开数据监控面板</li>
                <li><kbd>Ctrl+E</kbd> - 导出详细项目数据</li>
                <li><kbd>Ctrl+W</kbd> - 更新天气效果</li>
                <li><kbd>Ctrl+Shift+R</kbd> - 重置所有数据</li>
                <li><kbd>R</kbd> - 重置相机视角</li>
                <li><kbd>Esc</kbd> - 关闭模态窗口</li>
            </ul>
            
            <h4>📷 相机视角控制</h4>
            <ul>
                <li><kbd>1</kbd> - 前视角</li>
                <li><kbd>2</kbd> - 后视角</li>
                <li><kbd>3</kbd> - 左视角</li>
                <li><kbd>4</kbd> - 右视角</li>
                <li><kbd>5</kbd> - 俯视角</li>
                <li><kbd>0</kbd> - 默认视角</li>
            </ul>
            
            <h4>🏗️ 3D场景操作</h4>
            <ul>
                <li><strong>鼠标左键拖拽</strong> - 旋转视角</li>
                <li><strong>鼠标滚轮</strong> - 缩放场景</li>
                <li><strong>鼠标右键拖拽</strong> - 平移场景</li>
                <li><strong>点击设备模型</strong> - 查看详细信息和控制选项</li>
                <li><strong>鼠标悬停设备</strong> - 显示高亮和缩放效果</li>
                <li><strong>数字键1-5,0</strong> - 快速切换预设视角</li>
                <li>观察草方格网格和完成区域</li>
            </ul>
            
            <h4>🎛️ 控制面板</h4>
            <ul>
                <li>左侧工作流程：地形平整 → 网格划分 → 草料铺设 → 压实固化</li>
                <li>右侧统计数据：实时更新草方格完成情况</li>
                <li>底部状态栏：环境监测和设备状态</li>
                <li>设备控制：启停、参数调整、维护管理</li>
            </ul>
            
            <h4>📊 数据功能</h4>
            <ul>
                <li>实时监控：草方格数量、材料消耗、项目进度</li>
                <li>历史数据：性能记录、维护日志、告警历史</li>
                <li>数据导出：JSON格式详细项目数据</li>
                <li>图表分析：材料库存、进度对比、效率分析</li>
            </ul>
            
            <h4>🌟 特色功能</h4>
            <ul>
                <li>动态特效：风沙粒子、工作轨迹、光束扫描</li>
                <li>天气模拟：晴朗、多风、沙尘天气效果</li>
                <li>设备动画：移动轨迹、工作震动、状态指示</li>
                <li>音效反馈：点击音效、操作提示音</li>
            </ul>
        </div>
    `;
}

// 添加增强的粒子效果背景
function createParticleEffect() {
    const particleContainer = document.createElement('div');
    particleContainer.className = 'particle-container';
    particleContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: -1;
        overflow: hidden;
    `;

    // 创建多种类型的粒子
    createFloatingParticles(particleContainer);
    createSandParticles(particleContainer);
    createLightBeams(particleContainer);
    
    document.body.appendChild(particleContainer);
}

// 创建浮动粒子
function createFloatingParticles(container) {
    for (let i = 0; i < 80; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle floating';
        const size = Math.random() * 3 + 1;
        particle.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            background: rgba(0, 212, 255, ${Math.random() * 0.6 + 0.2});
            border-radius: 50%;
            animation: float ${Math.random() * 15 + 10}s infinite linear;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            box-shadow: 0 0 ${size * 2}px rgba(0, 212, 255, 0.3);
        `;
        container.appendChild(particle);
    }
}

// 创建沙粒效果
function createSandParticles(container) {
    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle sand';
        const size = Math.random() * 2 + 0.5;
        particle.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            background: rgba(244, 228, 188, ${Math.random() * 0.4 + 0.3});
            border-radius: 50%;
            animation: sandDrift ${Math.random() * 20 + 15}s infinite linear;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
        `;
        container.appendChild(particle);
    }
}

// 创建光束效果
function createLightBeams(container) {
    for (let i = 0; i < 5; i++) {
        const beam = document.createElement('div');
        beam.className = 'light-beam';
        beam.style.cssText = `
            position: absolute;
            width: 2px;
            height: 100vh;
            background: linear-gradient(to bottom, 
                transparent 0%, 
                rgba(0, 212, 255, 0.1) 30%, 
                rgba(0, 212, 255, 0.2) 50%, 
                rgba(0, 212, 255, 0.1) 70%, 
                transparent 100%);
            left: ${Math.random() * 100}%;
            top: 0;
            animation: lightSweep ${Math.random() * 8 + 12}s infinite ease-in-out;
            transform-origin: top center;
        `;
        container.appendChild(beam);
    }
}

// 添加增强的粒子动画CSS
function addParticleCSS() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes float {
            0% { 
                transform: translateY(0px) translateX(0px) rotate(0deg); 
                opacity: 1; 
            }
            25% { 
                transform: translateY(-25vh) translateX(10px) rotate(90deg); 
                opacity: 0.8; 
            }
            50% { 
                transform: translateY(-50vh) translateX(-5px) rotate(180deg); 
                opacity: 0.6; 
            }
            75% { 
                transform: translateY(-75vh) translateX(15px) rotate(270deg); 
                opacity: 0.4; 
            }
            100% { 
                transform: translateY(-100vh) translateX(0px) rotate(360deg); 
                opacity: 0; 
            }
        }

        @keyframes sandDrift {
            0% { 
                transform: translateX(-10px) translateY(100vh) rotate(0deg); 
                opacity: 0; 
            }
            10% { 
                opacity: 1; 
            }
            90% { 
                opacity: 1; 
            }
            100% { 
                transform: translateX(100vw) translateY(-10px) rotate(180deg); 
                opacity: 0; 
            }
        }

        @keyframes lightSweep {
            0% { 
                transform: translateX(-50px) scaleY(0.8); 
                opacity: 0; 
            }
            50% { 
                transform: translateX(0px) scaleY(1); 
                opacity: 1; 
            }
            100% { 
                transform: translateX(50px) scaleY(0.8); 
                opacity: 0; 
            }
        }

        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }

        @keyframes glow {
            0% { box-shadow: 0 0 5px rgba(0, 212, 255, 0.3); }
            50% { box-shadow: 0 0 20px rgba(0, 212, 255, 0.8); }
            100% { box-shadow: 0 0 5px rgba(0, 212, 255, 0.3); }
        }

        @keyframes slideInLeft {
            0% { transform: translateX(-100%); opacity: 0; }
            100% { transform: translateX(0); opacity: 1; }
        }

        @keyframes slideInRight {
            0% { transform: translateX(100%); opacity: 0; }
            100% { transform: translateX(0); opacity: 1; }
        }

        @keyframes fadeInUp {
            0% { transform: translateY(30px); opacity: 0; }
            100% { transform: translateY(0); opacity: 1; }
        }

        .pulse { animation: pulse 1s ease-in-out; }
        .glow { animation: glow 2s ease-in-out infinite; }
        .slide-in-left { animation: slideInLeft 0.8s ease-out; }
        .slide-in-right { animation: slideInRight 0.8s ease-out; }
        .fade-in-up { animation: fadeInUp 0.6s ease-out; }

        .equipment-details {
            color: #fff;
        }

        .equipment-details h4 {
            color: #00d4ff;
            margin-bottom: 15px;
            font-size: 1.2em;
        }

        .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 0.8em;
            font-weight: bold;
            margin-bottom: 15px;
        }

        .status-working { background: #00ff88; color: #000; }
        .status-moving { background: #0080ff; color: #fff; }
        .status-standby { background: #ffaa00; color: #000; }
        .status-monitoring { background: #ff00ff; color: #fff; }

        .detail-section {
            margin-bottom: 20px;
            padding: 15px;
            background: rgba(0, 212, 255, 0.1);
            border-radius: 8px;
            border-left: 3px solid #00d4ff;
        }

        .detail-section h5 {
            color: #00d4ff;
            margin-bottom: 10px;
            font-size: 1em;
        }

        .detail-section p {
            margin: 8px 0;
            display: flex;
            align-items: center;
        }

        .detail-section i {
            margin-right: 10px;
            width: 20px;
            color: #00d4ff;
        }

        .detail-actions {
            display: flex;
            gap: 10px;
            margin-top: 20px;
        }

        .detail-btn {
            flex: 1;
            padding: 10px;
            background: linear-gradient(45deg, #1e3c72, #2a5298);
            border: 1px solid #00d4ff;
            border-radius: 6px;
            color: #fff;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .detail-btn:hover {
            background: linear-gradient(45deg, #2a5298, #1e3c72);
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 212, 255, 0.3);
        }

        .help-content ul {
            list-style: none;
            padding: 0;
        }

        .help-content li {
            padding: 8px 0;
            border-bottom: 1px solid rgba(0, 212, 255, 0.2);
        }

        .help-content kbd {
            background: rgba(0, 212, 255, 0.2);
            border: 1px solid #00d4ff;
            border-radius: 4px;
            padding: 2px 6px;
            font-family: monospace;
            color: #00d4ff;
        }

        .multi-function-params h6 {
            color: #00d4ff;
            margin: 15px 0 8px 0;
            font-size: 0.9em;
            border-bottom: 1px solid rgba(0, 212, 255, 0.3);
            padding-bottom: 3px;
        }

        .multi-function-params h6:first-child {
            margin-top: 0;
        }

        .mode-switch {
            color: #fff;
        }

        .mode-switch h4 {
            color: #00d4ff;
            margin-bottom: 15px;
        }

        .current-mode {
            color: #00ff88;
            font-weight: bold;
        }

        .mode-list {
            margin: 20px 0;
        }

        .mode-option {
            background: rgba(0, 212, 255, 0.1);
            border: 1px solid rgba(0, 212, 255, 0.3);
            border-radius: 8px;
            padding: 12px;
            margin: 8px 0;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .mode-option:hover {
            background: rgba(0, 212, 255, 0.2);
            border-color: #00d4ff;
        }

        .mode-option h6 {
            color: #00d4ff;
            margin: 0 0 5px 0;
            font-size: 0.9em;
        }

        .mode-option p {
            color: #a0c4ff;
            margin: 0;
            font-size: 0.8em;
        }

        .mode-actions {
            display: flex;
            gap: 10px;
            margin-top: 20px;
        }
    `;
    document.head.appendChild(style);
}

// 添加音效支持
function playSound(type) {
    // 创建音频上下文
    if (typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined') {
        const audioContext = new (AudioContext || webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        switch(type) {
            case 'click':
                oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                break;
            case 'success':
                oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                break;
            case 'error':
                oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                break;
        }

        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.1);
    }
}

// 增强3D场景交互
function enhance3DInteraction() {
    if (renderer && renderer.domElement) {
        const canvas = renderer.domElement;
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        canvas.addEventListener('click', function(event) {
            const rect = canvas.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(scene.children);

            if (intersects.length > 0) {
                const object = intersects[0].object;
                if (object.userData && object.userData.type) {
                    playSound('click');
                    if (object.callback) {
                        object.callback();
                    }
                }
            }
        });

        canvas.addEventListener('mousemove', function(event) {
            const rect = canvas.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(scene.children);

            if (intersects.length > 0) {
                const object = intersects[0].object;
                if (object.userData && object.userData.type) {
                    canvas.style.cursor = 'pointer';
                    // 添加悬停效果
                    object.scale.set(1.2, 1.2, 1.2);
                } else {
                    canvas.style.cursor = 'grab';
                }
            } else {
                canvas.style.cursor = 'grab';
                // 重置所有设备标记的缩放
                scene.children.forEach(child => {
                    if (child.userData && child.userData.type) {
                        child.scale.set(1, 1, 1);
                    }
                });
            }
        });
    }
}

// 添加数据导出功能
function exportData() {
    const data = {
        timestamp: new Date().toISOString(),
        devices: [
            { id: 1, name: '挖掘机-01', status: 'online', battery: 85, temperature: 28 },
            { id: 2, name: '运输车-02', status: 'warning', battery: 45, temperature: 35 },
            { id: 3, name: '铺设机-03', status: 'online', battery: 92, temperature: 26 },
            { id: 4, name: '压实机-04', status: 'offline', battery: 0, temperature: null }
        ],
        materials: {
            sand: 120,
            cement: 85,
            stone: 95,
            additive: 45,
            water: 200
        }
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `equipment_data_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showNotification('数据导出成功', 'success');
}

// 显示通知
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type} show`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(45deg, #1e3c72, #2a5298);
        border: 2px solid #00d4ff;
        border-radius: 10px;
        padding: 15px 20px;
        color: #fff;
        z-index: 1001;
        transform: translateX(400px);
        transition: transform 0.3s ease;
    `;

    if (type === 'success') {
        notification.style.borderColor = '#00ff88';
        playSound('success');
    } else if (type === 'error') {
        notification.style.borderColor = '#ff4444';
        playSound('error');
    }

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);

    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// 初始化增强功能
function initializeEnhancements() {
    createParticleEffect();
    addParticleCSS();
    setTimeout(() => {
        enhance3DInteraction();
    }, 1000);
}

// 修改初始化函数
const originalInitializeApp = initializeApp;
initializeApp = function() {
    originalInitializeApp();
    initializeEnhancements();
    
    // 延迟添加3D动态效果
    setTimeout(() => {
        addDynamicEffects();
    }, 2000);
};

// 设备控制功能
function controlEquipment(type, id) {
    const controls = {
        'straw_layer': ['启动铺设', '停止作业', '调整密度', '更换草料'],
        'material_truck': ['开始运输', '停止运输', '卸载材料', '返回基地'],
        'grid_maker': ['开始制网', '停止制网', '调整规格', '维护检查'],
        'compactor': ['开始压实', '停止压实', '调整压力', '移动位置'],
        'supervisor': ['开始监控', '停止监控', '数据同步', '生成报告'],
        'water_truck': ['开始喷洒', '停止喷洒', '调整水压', '补充水源']
    };

    const equipmentControls = controls[type] || ['启动', '停止', '重置', '维护'];
    
    let controlsHTML = '<div class="control-grid">';
    equipmentControls.forEach(control => {
        controlsHTML += `
            <button class="control-btn" onclick="executeControl('${type}', '${control}')">
                <i class="fas fa-cog"></i> ${control}
            </button>
        `;
    });
    controlsHTML += '</div>';

    const content = `
        <div class="equipment-control">
            <h4>设备控制 - ${type}</h4>
            <p>设备编号: ${String(id + 1).padStart(3, '0')}</p>
            ${controlsHTML}
            <div class="control-status">
                <h5>当前状态</h5>
                <p>运行状态: 正常</p>
                <p>最后操作: ${new Date().toLocaleTimeString()}</p>
            </div>
        </div>
    `;
    
    showModal('设备控制', content);
}

// 执行控制命令
function executeControl(type, command) {
    showNotification(`执行命令: ${command}`, 'success');
    playSound('success');
    
    // 模拟命令执行
    setTimeout(() => {
        showNotification(`${command} 执行完成`, 'info');
    }, 2000);
}

// 查看历史数据
function viewHistory(type, id) {
    const historyData = generateHistoryData(type);
    
    const content = `
        <div class="history-view">
            <h4>历史数据 - 设备${String(id + 1).padStart(3, '0')}</h4>
            <div class="history-tabs">
                <button class="tab-btn active" onclick="showHistoryTab('performance')">性能数据</button>
                <button class="tab-btn" onclick="showHistoryTab('maintenance')">维护记录</button>
                <button class="tab-btn" onclick="showHistoryTab('alerts')">告警历史</button>
            </div>
            <div class="history-content" id="history-content">
                ${historyData.performance}
            </div>
        </div>
    `;
    
    showModal('历史数据', content);
}

// 生成历史数据
function generateHistoryData(type) {
    const now = new Date();
    const performanceData = [];
    const maintenanceData = [];
    const alertsData = [];
    
    // 生成性能数据
    for (let i = 0; i < 10; i++) {
        const date = new Date(now - i * 24 * 60 * 60 * 1000);
        performanceData.push({
            date: date.toLocaleDateString(),
            efficiency: Math.floor(Math.random() * 20 + 80),
            workHours: (Math.random() * 8 + 4).toFixed(1),
            output: Math.floor(Math.random() * 100 + 200)
        });
    }
    
    // 生成维护记录
    for (let i = 0; i < 5; i++) {
        const date = new Date(now - i * 7 * 24 * 60 * 60 * 1000);
        maintenanceData.push({
            date: date.toLocaleDateString(),
            type: ['定期保养', '故障维修', '部件更换', '系统升级'][Math.floor(Math.random() * 4)],
            duration: Math.floor(Math.random() * 4 + 1),
            cost: Math.floor(Math.random() * 5000 + 1000)
        });
    }
    
    // 生成告警历史
    for (let i = 0; i < 8; i++) {
        const date = new Date(now - i * 12 * 60 * 60 * 1000);
        alertsData.push({
            time: date.toLocaleString(),
            level: ['低', '中', '高'][Math.floor(Math.random() * 3)],
            message: ['温度过高', '电量不足', '通信异常', '传感器故障'][Math.floor(Math.random() * 4)],
            status: ['已处理', '处理中', '待处理'][Math.floor(Math.random() * 3)]
        });
    }
    
    return {
        performance: `
            <table class="history-table">
                <thead>
                    <tr>
                        <th>日期</th>
                        <th>效率</th>
                        <th>工作时长</th>
                        <th>产出</th>
                    </tr>
                </thead>
                <tbody>
                    ${performanceData.map(item => `
                        <tr>
                            <td>${item.date}</td>
                            <td>${item.efficiency}%</td>
                            <td>${item.workHours}h</td>
                            <td>${item.output}m²</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `,
        maintenance: `
            <table class="history-table">
                <thead>
                    <tr>
                        <th>日期</th>
                        <th>维护类型</th>
                        <th>耗时</th>
                        <th>费用</th>
                    </tr>
                </thead>
                <tbody>
                    ${maintenanceData.map(item => `
                        <tr>
                            <td>${item.date}</td>
                            <td>${item.type}</td>
                            <td>${item.duration}h</td>
                            <td>¥${item.cost}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `,
        alerts: `
            <table class="history-table">
                <thead>
                    <tr>
                        <th>时间</th>
                        <th>级别</th>
                        <th>告警信息</th>
                        <th>状态</th>
                    </tr>
                </thead>
                <tbody>
                    ${alertsData.map(item => `
                        <tr>
                            <td>${item.time}</td>
                            <td class="alert-${item.level}">${item.level}</td>
                            <td>${item.message}</td>
                            <td>${item.status}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `
    };
}

// 显示历史数据标签页
function showHistoryTab(tab) {
    // 这个函数会在模态窗口中使用
    console.log(`Showing history tab: ${tab}`);
}

// 切换多功能治沙机工作模式
function switchMode(type, id) {
    const modes = [
        { name: '综合作业模式', desc: '同时进行草料铺设、网格制作、压实和洒水' },
        { name: '草料铺设模式', desc: '专注于草料的精确铺设和分布' },
        { name: '网格制作模式', desc: '专注于方格网格的精确制作' },
        { name: '压实作业模式', desc: '专注于地面压实和固化' },
        { name: '洒水养护模式', desc: '专注于草料的湿润和养护' },
        { name: '维护检修模式', desc: '设备自检和维护保养' }
    ];

    let modeOptions = '';
    modes.forEach((mode, index) => {
        modeOptions += `
            <div class="mode-option" onclick="selectMode(${index})">
                <h6>${mode.name}</h6>
                <p>${mode.desc}</p>
            </div>
        `;
    });

    const content = `
        <div class="mode-switch">
            <h4><i class="fas fa-exchange-alt"></i> 工作模式切换</h4>
            <p>当前模式: <span class="current-mode">综合作业模式</span></p>
            
            <div class="mode-list">
                ${modeOptions}
            </div>
            
            <div class="mode-actions">
                <button class="detail-btn" onclick="applyModeChange()">
                    <i class="fas fa-check"></i> 应用更改
                </button>
                <button class="detail-btn" onclick="closeModal()">
                    <i class="fas fa-times"></i> 取消
                </button>
            </div>
        </div>
    `;
    
    showModal('模式切换', content);
}

// 选择工作模式
function selectMode(modeIndex) {
    const modes = [
        '综合作业模式', '草料铺设模式', '网格制作模式', 
        '压实作业模式', '洒水养护模式', '维护检修模式'
    ];
    
    // 更新当前模式显示
    document.querySelector('.current-mode').textContent = modes[modeIndex];
    
    // 高亮选中的模式
    document.querySelectorAll('.mode-option').forEach((option, index) => {
        if (index === modeIndex) {
            option.style.background = 'rgba(0, 212, 255, 0.3)';
            option.style.borderColor = '#00d4ff';
        } else {
            option.style.background = 'rgba(0, 212, 255, 0.1)';
            option.style.borderColor = 'rgba(0, 212, 255, 0.3)';
        }
    });
}

// 应用模式更改
function applyModeChange() {
    const currentMode = document.querySelector('.current-mode').textContent;
    showNotification(`已切换到: ${currentMode}`, 'success');
    closeModal();
}

// 添加3D场景中的动态效果
function addDynamicEffects() {
    // 添加风沙效果
    createWindEffect();
    
    // 添加设备工作粒子
    createWorkingParticles();
    
    // 添加环境光变化
    createLightingEffects();
}

// 创建风沙效果
function createWindEffect() {
    const particleCount = 100;
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount * 3; i++) {
        positions[i] = (Math.random() - 0.5) * 400;
    }
    
    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const material = new THREE.PointsMaterial({
        color: 0xF4E4BC,
        size: 2,
        transparent: true,
        opacity: 0.6
    });
    
    const windParticles = new THREE.Points(particles, material);
    scene.add(windParticles);
    
    // 动画风沙
    function animateWind() {
        const positions = windParticles.geometry.attributes.position.array;
        
        for (let i = 0; i < positions.length; i += 3) {
            positions[i] += 0.5; // X方向移动
            positions[i + 1] += Math.sin(Date.now() * 0.001 + i) * 0.1; // Y方向波动
            
            if (positions[i] > 200) {
                positions[i] = -200;
            }
        }
        
        windParticles.geometry.attributes.position.needsUpdate = true;
        requestAnimationFrame(animateWind);
    }
    
    animateWind();
}

// 创建设备工作粒子
function createWorkingParticles() {
    // 为每个工作中的设备添加粒子效果
    scene.children.forEach(child => {
        if (child.userData && child.userData.status === 'working') {
            const particleGeometry = new THREE.BufferGeometry();
            const particleCount = 20;
            const positions = new Float32Array(particleCount * 3);
            
            for (let i = 0; i < particleCount * 3; i += 3) {
                positions[i] = child.position.x + (Math.random() - 0.5) * 10;
                positions[i + 1] = child.position.y + Math.random() * 5;
                positions[i + 2] = child.position.z + (Math.random() - 0.5) * 10;
            }
            
            particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            
            const particleMaterial = new THREE.PointsMaterial({
                color: 0x00FF00,
                size: 1,
                transparent: true,
                opacity: 0.8
            });
            
            const workParticles = new THREE.Points(particleGeometry, particleMaterial);
            scene.add(workParticles);
        }
    });
}

// 创建光照效果
function createLightingEffects() {
    // 添加动态环境光
    const ambientLight = scene.getObjectByName('ambientLight');
    if (ambientLight) {
        setInterval(() => {
            const intensity = 0.4 + Math.sin(Date.now() * 0.001) * 0.2;
            ambientLight.intensity = intensity;
        }, 100);
    }
}

// 更新完成区域
function updateCompletedAreas() {
    // 随机扩展已完成区域
    if (Math.random() > 0.7) {
        const completedAreas = scene.children.filter(child => 
            child.material && child.material.color && 
            child.material.color.getHex() === 0x90EE90
        );
        
        if (completedAreas.length > 0) {
            const randomArea = completedAreas[Math.floor(Math.random() * completedAreas.length)];
            const currentScale = randomArea.scale.x;
            const newScale = Math.min(2, currentScale + 0.05);
            randomArea.scale.set(newScale, 1, newScale);
        }
    }
}

// 添加天气效果
function addWeatherEffects() {
    // 随机天气变化
    const weatherTypes = ['clear', 'windy', 'dusty'];
    const currentWeather = weatherTypes[Math.floor(Math.random() * weatherTypes.length)];
    
    switch(currentWeather) {
        case 'windy':
            // 增强风沙效果
            scene.children.forEach(child => {
                if (child.type === 'Points' && child.material.color.getHex() === 0xF4E4BC) {
                    child.material.opacity = Math.min(1, child.material.opacity + 0.1);
                }
            });
            break;
        case 'dusty':
            // 降低能见度
            scene.fog = new THREE.Fog(0xF4E4BC, 50, 200);
            setTimeout(() => {
                scene.fog = null;
            }, 10000);
            break;
        case 'clear':
            // 清晰天气
            scene.children.forEach(child => {
                if (child.type === 'Points' && child.material.color.getHex() === 0xF4E4BC) {
                    child.material.opacity = Math.max(0.3, child.material.opacity - 0.1);
                }
            });
            break;
    }
}

// 添加设备移动动画
function animateEquipmentMovement() {
    scene.children.forEach(child => {
        if (child.userData && child.userData.status === 'moving') {
            // 模拟设备移动
            const time = Date.now() * 0.001;
            child.position.x += Math.sin(time + child.userData.id) * 0.5;
            child.position.z += Math.cos(time + child.userData.id) * 0.3;
            
            // 限制移动范围
            child.position.x = Math.max(-100, Math.min(100, child.position.x));
            child.position.z = Math.max(-100, Math.min(100, child.position.z));
        }
        
        if (child.userData && child.userData.status === 'working') {
            // 工作中的设备轻微震动
            const time = Date.now() * 0.01;
            child.position.y = 3 + Math.sin(time) * 0.2;
        }
    });
}

// 添加数据导出功能增强
function exportDetailedData() {
    const timestamp = new Date().toISOString();
    const data = {
        timestamp: timestamp,
        project: {
            name: "草方格铺设项目",
            location: "腾格里沙漠东南缘",
            startDate: "2024-01-15",
            plannedCompletion: "2024-06-30",
            currentProgress: document.querySelector('.stat-value').textContent
        },
        equipment: [
            {
                id: "001",
                name: "草料铺设机",
                type: "straw_layer",
                status: "working",
                location: { x: -60, y: 3, z: -40 },
                parameters: {
                    efficiency: "92%",
                    strawUsage: "185.3 kg/h",
                    gridProgress: "78%",
                    workingHours: "6.5h",
                    fuelLevel: "85%"
                }
            },
            {
                id: "002", 
                name: "材料运输车",
                type: "material_truck",
                status: "moving",
                location: { x: 30, y: 3, z: 50 },
                parameters: {
                    load: "75%",
                    fuel: "68%",
                    trips: "12",
                    speed: "15 km/h",
                    route: "基地-作业区"
                }
            },
            {
                id: "003",
                name: "方格制作机", 
                type: "grid_maker",
                status: "working",
                location: { x: -30, y: 3, z: 70 },
                parameters: {
                    precision: "98.2%",
                    speed: "3.2 m/min",
                    quality: "95%",
                    gridSize: "1m x 1m",
                    depth: "18cm"
                }
            },
            {
                id: "004",
                name: "压实机",
                type: "compactor", 
                status: "standby",
                location: { x: 80, y: 3, z: -30 },
                parameters: {
                    pressure: "150 kPa",
                    density: "1.35 g/cm³",
                    coverage: "85%",
                    temperature: "35°C",
                    maintenanceStatus: "良好"
                }
            },
            {
                id: "005",
                name: "监控车",
                type: "supervisor",
                status: "monitoring", 
                location: { x: 0, y: 3, z: 0 },
                parameters: {
                    coverage: "95%",
                    alerts: "0",
                    dataQuality: "98%",
                    signalStrength: "强",
                    batteryLevel: "92%"
                }
            },
            {
                id: "006",
                name: "洒水车",
                type: "water_truck",
                status: "working",
                location: { x: -80, y: 3, z: 60 },
                parameters: {
                    waterLevel: "80%",
                    pressure: "75 bar",
                    coverage: "88%",
                    sprayPattern: "扇形",
                    flowRate: "120 L/min"
                }
            }
        ],
        materials: {
            straw: {
                wheat: { stock: 85, unit: "吨", dailyUsage: 2.3 },
                rice: { stock: 120, unit: "吨", dailyUsage: 3.1 },
                reed: { stock: 65, unit: "吨", dailyUsage: 1.8 }
            },
            accessories: {
                stakes: { stock: 200, unit: "根", dailyUsage: 15 },
                wire: { stock: 45, unit: "卷", dailyUsage: 2 }
            }
        },
        environment: {
            weather: {
                temperature: "28°C",
                humidity: "35%", 
                windSpeed: "12 km/h",
                windDirection: "西北风",
                visibility: "良好",
                uvIndex: "强"
            },
            soilCondition: {
                moisture: "8%",
                density: "1.2 g/cm³",
                sandType: "细沙",
                stability: "中等"
            }
        },
        performance: {
            dailyProgress: {
                completed: 1250,
                planned: 1200,
                efficiency: "104%"
            },
            qualityMetrics: {
                gridAccuracy: "98.2%",
                materialWaste: "2.1%",
                reworkRate: "0.8%"
            }
        }
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `grass_grid_project_${timestamp.split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showNotification('详细项目数据导出成功', 'success');
}

// 添加键盘快捷键增强
document.addEventListener('keydown', function(e) {
    // 原有快捷键保持不变
    switch(e.key) {
        case 'F1':
            e.preventDefault();
            showModal('帮助', createHelpContent());
            break;
        case 'F5':
            e.preventDefault();
            location.reload();
            break;
        case 'Escape':
            closeModal();
            break;
        case 'd':
            if (e.ctrlKey) {
                e.preventDefault();
                window.open('dashboard.html', '_blank');
            }
            break;
        // 新增快捷键
        case 'e':
            if (e.ctrlKey) {
                e.preventDefault();
                exportDetailedData();
            }
            break;
        case 'w':
            if (e.ctrlKey) {
                e.preventDefault();
                addWeatherEffects();
                showNotification('天气效果已更新', 'info');
            }
            break;
        case 'r':
            if (e.ctrlKey && e.shiftKey) {
                e.preventDefault();
                // 重置所有数据
                location.reload();
            } else if (e.key === 'r') {
                e.preventDefault();
                resetCameraView();
            }
            break;
        // 视角快捷键
        case '1':
            e.preventDefault();
            setCameraView('front');
            break;
        case '2':
            e.preventDefault();
            setCameraView('back');
            break;
        case '3':
            e.preventDefault();
            setCameraView('left');
            break;
        case '4':
            e.preventDefault();
            setCameraView('right');
            break;
        case '5':
            e.preventDefault();
            setCameraView('top');
            break;
        case '0':
            e.preventDefault();
            setCameraView('default');
            break;
    }
});

// 重置相机视角
function resetCameraView() {
    if (controls) {
        // 重置到默认位置
        camera.position.set(0, 80, 120);
        controls.target.set(0, 0, 0);
        controls.update();
        showNotification('相机视角已重置', 'info');
    }
}

// 设置预设相机视角
function setCameraView(viewType) {
    if (!controls) return;
    
    const distance = 120;
    const height = 80;
    
    switch(viewType) {
        case 'front':
            camera.position.set(0, height, distance);
            controls.target.set(0, 0, 0);
            showNotification('切换到前视角', 'info');
            break;
        case 'back':
            camera.position.set(0, height, -distance);
            controls.target.set(0, 0, 0);
            showNotification('切换到后视角', 'info');
            break;
        case 'left':
            camera.position.set(-distance, height, 0);
            controls.target.set(0, 0, 0);
            showNotification('切换到左视角', 'info');
            break;
        case 'right':
            camera.position.set(distance, height, 0);
            controls.target.set(0, 0, 0);
            showNotification('切换到右视角', 'info');
            break;
        case 'top':
            camera.position.set(0, distance * 1.5, 0);
            controls.target.set(0, 0, 0);
            showNotification('切换到俯视角', 'info');
            break;
        case 'default':
            camera.position.set(0, 80, 120);
            controls.target.set(0, 0, 0);
            showNotification('切换到默认视角', 'info');
            break;
    }
    
    controls.update();
}

// 增强初始化函数
const originalInit3DTerrain = init3DTerrain;
init3DTerrain = function() {
    originalInit3DTerrain();
    
    // 添加定期天气效果
    setInterval(addWeatherEffects, 30000); // 每30秒
    
    // 添加设备移动动画
    setInterval(animateEquipmentMovement, 100); // 每100ms
};

// 清理资源
window.addEventListener('beforeunload', function() {
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
});
