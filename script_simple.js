// 简化版3D脚本 - 不依赖OrbitControls
let scene, camera, renderer, terrain;
let animationId;
let currentTime = new Date();

// 初始化应用
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM加载完成，开始初始化...');
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
    const timeElement = document.getElementById('current-time');
    if (timeElement) {
        timeElement.textContent = timeString;
    }
}

// 初始化3D地形 - 简化版
function init3DTerrain() {
    console.log('开始初始化3D地形...');
    
    const container = document.getElementById('terrain-3d');
    if (!container) {
        console.error('找不到3D容器元素');
        return;
    }
    
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;
    console.log('容器尺寸:', width, 'x', height);

    // 创建场景
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB);
    console.log('场景创建成功');

    // 创建相机
    camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(0, 80, 120);
    camera.lookAt(0, 0, 0);
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
    console.log('创建地形...');
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
    console.log('地形创建完成');
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
    console.log('添加设备标记...');
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
    console.log('设备标记添加完成');
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

    return group;
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

// 添加光照
function addLighting() {
    console.log('添加光照...');
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
    console.log('光照添加完成');
}

// 3D动画循环
function animate3D() {
    animationId = requestAnimationFrame(animate3D);
    
    // 固定相机位置
    camera.position.set(0, 80, 120);
    camera.lookAt(0, 0, 0);
    
    renderer.render(scene, camera);
}

// 其他必要的函数
function setupEventListeners() {
    // 基本事件监听器
    console.log('设置事件监听器...');
}

function startRealTimeUpdates() {
    // 每秒更新时间
    setInterval(updateDateTime, 1000);
    console.log('启动实时更新...');
}

function animateElements() {
    // 基本动画
    console.log('启动元素动画...');
}

function generateMockData() {
    // 生成模拟数据
    console.log('生成模拟数据...');
}

function showEquipmentDetails(type, id, name, status) {
    alert(`设备详情：${name}\n状态：${status}\n类型：${type}`);
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
    }
}

window.addEventListener('resize', onWindowResize);

console.log('简化版3D脚本加载完成');