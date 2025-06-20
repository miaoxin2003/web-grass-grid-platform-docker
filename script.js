// 全局变量
let scene, camera, renderer, terrain;
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
    const container = document.getElementById('terrain-3d');
    const width = container.clientWidth;
    const height = container.clientHeight;

    // 创建场景
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB);

    // 创建相机
    camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(0, 50, 100);

    // 创建渲染器
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // 创建地形
    createTerrain();
    
    // 添加设备标记
    addEquipmentMarkers();
    
    // 添加光照
    addLighting();
    
    // 开始渲染循环
    animate3D();
}

// 创建地形
function createTerrain() {
    const geometry = new THREE.PlaneGeometry(200, 200, 50, 50);
    
    // 创建高度图
    const vertices = geometry.attributes.position.array;
    for (let i = 0; i < vertices.length; i += 3) {
        const x = vertices[i];
        const y = vertices[i + 1];
        vertices[i + 2] = Math.sin(x * 0.1) * Math.cos(y * 0.1) * 10 + 
                         Math.random() * 5;
    }
    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();

    // 创建材质
    const material = new THREE.MeshLambertMaterial({
        color: 0xDEB887,
        wireframe: false
    });

    terrain = new THREE.Mesh(geometry, material);
    terrain.rotation.x = -Math.PI / 2;
    terrain.receiveShadow = true;
    scene.add(terrain);
}

// 添加设备标记
function addEquipmentMarkers() {
    const equipmentPositions = [
        { x: -50, z: -30, type: 'excavator' },
        { x: 20, z: 40, type: 'truck' },
        { x: -20, z: 60, type: 'spreader' },
        { x: 60, z: -20, type: 'compactor' }
    ];

    equipmentPositions.forEach((pos, index) => {
        // 创建设备标记
        const geometry = new THREE.BoxGeometry(5, 8, 5);
        const material = new THREE.MeshLambertMaterial({
            color: index % 2 === 0 ? 0x00D4FF : 0xFF6B35
        });
        
        const marker = new THREE.Mesh(geometry, material);
        marker.position.set(pos.x, 10, pos.z);
        marker.castShadow = true;
        marker.userData = { type: pos.type, id: index };
        
        // 添加点击事件
        marker.callback = () => showEquipmentDetails(pos.type, index);
        
        scene.add(marker);

        // 添加标签
        createEquipmentLabel(pos.x, pos.z, `设备${index + 1}`);
    });
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
    
    // 旋转相机
    const time = Date.now() * 0.0005;
    camera.position.x = Math.cos(time) * 150;
    camera.position.z = Math.sin(time) * 150;
    camera.lookAt(scene.position);
    
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
            handleOperationClick(this.textContent);
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
    // 更新产品统计
    const statValues = document.querySelectorAll('.stat-value');
    statValues.forEach(stat => {
        const currentValue = parseFloat(stat.textContent);
        const newValue = (currentValue + (Math.random() - 0.5) * 0.2).toFixed(1);
        stat.textContent = newValue + 't';
        
        // 添加闪烁效果
        stat.classList.add('pulse');
        setTimeout(() => stat.classList.remove('pulse'), 1000);
    });
}

// 更新系统状态
function updateSystemStatus() {
    const statusItems = document.querySelectorAll('.status-item span');
    const statuses = [
        '连接状态: 正常',
        `设备电量: ${Math.floor(Math.random() * 20 + 80)}%`,
        `环境温度: ${Math.floor(Math.random() * 10 + 25)}°C`
    ];
    
    statusItems.forEach((item, index) => {
        if (index < statuses.length) {
            item.textContent = statuses[index];
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
            showModal('数据监测', createDataMonitorContent());
            break;
        case '人员配置':
            showModal('人员配置', createPersonnelContent());
            break;
    }
}

// 显示设备详情
function showEquipmentDetails(type, id) {
    const content = `
        <h4>设备 ${id + 1} - ${type}</h4>
        <p>状态: 运行中</p>
        <p>位置: X: ${Math.floor(Math.random() * 100)}, Y: ${Math.floor(Math.random() * 100)}</p>
        <p>电量: ${Math.floor(Math.random() * 30 + 70)}%</p>
        <p>温度: ${Math.floor(Math.random() * 15 + 20)}°C</p>
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
            <h4>快捷键</h4>
            <ul>
                <li><kbd>F1</kbd> - 显示帮助</li>
                <li><kbd>F5</kbd> - 刷新页面</li>
                <li><kbd>Ctrl+D</kbd> - 打开数据面板</li>
                <li><kbd>Esc</kbd> - 关闭模态窗口</li>
            </ul>
            <h4>操作说明</h4>
            <ul>
                <li>点击3D场景中的设备标记查看详情</li>
                <li>使用左侧工作流程按钮切换预设方案</li>
                <li>右侧操作按钮可进行设备控制</li>
            </ul>
        </div>
    `;
}

// 添加粒子效果背景
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
    `;

    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.cssText = `
            position: absolute;
            width: 2px;
            height: 2px;
            background: rgba(0, 212, 255, 0.6);
            border-radius: 50%;
            animation: float ${Math.random() * 10 + 10}s infinite linear;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
        `;
        particleContainer.appendChild(particle);
    }

    document.body.appendChild(particleContainer);
}

// 添加粒子动画CSS
function addParticleCSS() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes float {
            0% { transform: translateY(0px) rotate(0deg); opacity: 1; }
            100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
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
};

// 清理资源
window.addEventListener('beforeunload', function() {
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
});
