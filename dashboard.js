// 仪表板JavaScript
let materialChart, windChart, navigationChart, progressChart, efficiencyChart;
let environmentChart, productionChart, qualityChart, alertChart;
let logUpdateInterval, dataUpdateInterval;
let dataManager;

// 初始化仪表板
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
    initializeDataManager();
    createCharts();
    startRealTimeUpdates();
    setupEventListeners();
});

// 初始化仪表板
function initializeDashboard() {
    updateDashboardTime();
    animateDashboardElements();
}

// 初始化数据管理器
function initializeDataManager() {
    // 等待数据管理器加载完成
    setTimeout(() => {
        if (window.dataManager) {
            dataManager = window.dataManager;

            // 订阅数据更新
            dataManager.subscribe('environmentData', updateEnvironmentCharts);
            dataManager.subscribe('equipmentData', updateEquipmentCharts);
            dataManager.subscribe('productionData', updateProductionCharts);
            dataManager.subscribe('alertData', updateAlertDisplay);

            // 启动实时数据更新
            dataManager.startRealTimeUpdates(2000); // 每2秒更新一次

            console.log('数据管理器初始化完成');
        }
    }, 1000);
}

// 更新仪表板时间
function updateDashboardTime() {
    const now = new Date();
    const timeString = now.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    document.getElementById('dashboard-time').textContent = timeString;
}

// 创建图表
function createCharts() {
    // 检查Chart.js是否已加载
    if (typeof Chart === 'undefined') {
        console.error('Chart.js 未加载，延迟重试...');
        setTimeout(createCharts, 1000);
        return;
    }

    console.log('开始创建图表...');

    try {
        createMaterialChart();
        createWindChart();
        createNavigationChart();
        createProgressChart();
        createEfficiencyChart();

        // 创建新的动态图表
        setTimeout(() => {
            createEnvironmentChart();
            createProductionChart();
            createQualityChart();
            createAlertChart();
        }, 500);

        console.log('所有图表创建完成');
    } catch (error) {
        console.error('图表创建失败:', error);
    }
}

// 创建草方格材料库存图表
function createMaterialChart() {
    console.log('创建材料库存图表...');
    const ctx = document.getElementById('materialChart');
    if (!ctx) {
        console.error('找不到materialChart元素');
        return;
    }
    const context = ctx.getContext('2d');
    materialChart = new Chart(context, {
        type: 'bar',
        data: {
            labels: ['麦草', '稻草', '芦苇', '固定桩', '铁丝网'],
            datasets: [{
                label: '库存 (吨)',
                data: [85, 120, 65, 200, 45],
                backgroundColor: [
                    'rgba(139, 69, 19, 0.8)',    // 棕色 - 麦草
                    'rgba(255, 215, 0, 0.8)',    // 金色 - 稻草
                    'rgba(34, 139, 34, 0.8)',    // 绿色 - 芦苇
                    'rgba(105, 105, 105, 0.8)',  // 灰色 - 固定桩
                    'rgba(70, 130, 180, 0.8)'    // 钢蓝色 - 铁丝网
                ],
                borderColor: [
                    '#8B4513',
                    '#FFD700',
                    '#228B22',
                    '#696969',
                    '#4682B4'
                ],
                borderWidth: 2,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 212, 255, 0.2)'
                    },
                    ticks: {
                        color: '#a0c4ff'
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(0, 212, 255, 0.2)'
                    },
                    ticks: {
                        color: '#a0c4ff'
                    }
                }
            }
        }
    });
}

// 创建风速监测图表
function createWindChart() {
    const ctx = document.getElementById('windChart').getContext('2d');
    const timeLabels = [];
    const windData = [];
    
    // 生成过去24小时的数据
    for (let i = 23; i >= 0; i--) {
        const time = new Date();
        time.setHours(time.getHours() - i);
        timeLabels.push(time.getHours() + ':00');
        windData.push(Math.random() * 15 + 5); // 5-20 km/h
    }
    
    windChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: timeLabels,
            datasets: [{
                label: '风速 (km/h)',
                data: windData,
                borderColor: '#00d4ff',
                backgroundColor: 'rgba(0, 212, 255, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#00d4ff',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 25,
                    grid: {
                        color: 'rgba(0, 212, 255, 0.2)'
                    },
                    ticks: {
                        color: '#a0c4ff'
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(0, 212, 255, 0.2)'
                    },
                    ticks: {
                        color: '#a0c4ff',
                        maxTicksLimit: 8
                    }
                }
            }
        }
    });
}

// 创建导航图表
function createNavigationChart() {
    const ctx = document.getElementById('navigationChart').getContext('2d');
    navigationChart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: '设备位置',
                data: [
                    {x: 10, y: 20},
                    {x: 30, y: 40},
                    {x: 50, y: 15},
                    {x: 70, y: 35}
                ],
                backgroundColor: [
                    '#00ff88',
                    '#ffaa00',
                    '#00ff88',
                    '#ff4444'
                ],
                borderColor: '#ffffff',
                borderWidth: 2,
                pointRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom',
                    min: 0,
                    max: 100,
                    grid: {
                        color: 'rgba(0, 212, 255, 0.2)'
                    },
                    ticks: {
                        color: '#a0c4ff'
                    }
                },
                y: {
                    min: 0,
                    max: 50,
                    grid: {
                        color: 'rgba(0, 212, 255, 0.2)'
                    },
                    ticks: {
                        color: '#a0c4ff'
                    }
                }
            }
        }
    });
}

// 创建草方格铺设进度图表
function createProgressChart() {
    const ctx = document.getElementById('progressChart').getContext('2d');
    
    // 生成过去7天的进度数据
    const labels = [];
    const progressData = [];
    const targetData = [];
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        labels.push(date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }));
        
        // 模拟累积进度数据
        const baseProgress = 50 + i * 3;
        progressData.push(baseProgress + Math.random() * 5);
        targetData.push(baseProgress + 5); // 目标进度稍高
    }
    
    progressChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: '实际进度 (%)',
                data: progressData,
                borderColor: '#00ff88',
                backgroundColor: 'rgba(0, 255, 136, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#00ff88',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 5
            }, {
                label: '计划进度 (%)',
                data: targetData,
                borderColor: '#ffaa00',
                backgroundColor: 'rgba(255, 170, 0, 0.1)',
                borderWidth: 2,
                borderDash: [5, 5],
                fill: false,
                tension: 0.4,
                pointBackgroundColor: '#ffaa00',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        color: '#a0c4ff'
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    grid: {
                        color: 'rgba(0, 212, 255, 0.2)'
                    },
                    ticks: {
                        color: '#a0c4ff',
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(0, 212, 255, 0.2)'
                    },
                    ticks: {
                        color: '#a0c4ff'
                    }
                }
            }
        }
    });
}

// 创建设备效率分析图表
function createEfficiencyChart() {
    const ctx = document.getElementById('efficiencyChart').getContext('2d');
    
    efficiencyChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['草料铺设机', '材料运输车', '方格制作机', '压实机', '监控车', '洒水车'],
            datasets: [{
                label: '工作效率 (%)',
                data: [92, 88, 95, 85, 98, 90],
                backgroundColor: 'rgba(0, 212, 255, 0.2)',
                borderColor: '#00d4ff',
                borderWidth: 2,
                pointBackgroundColor: '#00d4ff',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 5
            }, {
                label: '设备利用率 (%)',
                data: [85, 92, 88, 78, 95, 87],
                backgroundColor: 'rgba(0, 255, 136, 0.2)',
                borderColor: '#00ff88',
                borderWidth: 2,
                pointBackgroundColor: '#00ff88',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        color: '#a0c4ff'
                    }
                }
            },
            scales: {
                r: {
                    beginAtZero: true,
                    max: 100,
                    grid: {
                        color: 'rgba(0, 212, 255, 0.2)'
                    },
                    angleLines: {
                        color: 'rgba(0, 212, 255, 0.2)'
                    },
                    pointLabels: {
                        color: '#a0c4ff',
                        font: {
                            size: 11
                        }
                    },
                    ticks: {
                        color: '#a0c4ff',
                        backdropColor: 'transparent',
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            }
        }
    });
}

// 创建环境监测图表
function createEnvironmentChart() {
    const ctx = document.getElementById('environmentChart');
    if (!ctx) return;

    environmentChart = new Chart(ctx.getContext('2d'), {
        type: 'line',
        data: {
            labels: ['温度', '湿度', '风速', '沙密度', '能见度'],
            datasets: [{
                label: '当前值',
                data: [28.5, 45.2, 12.3, 1.85, 8.5],
                borderColor: '#ff6b6b',
                backgroundColor: 'rgba(255, 107, 107, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#ff6b6b',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 6
            }, {
                label: '平均值',
                data: [27.8, 44.5, 11.8, 1.82, 8.2],
                borderColor: '#4ecdc4',
                backgroundColor: 'rgba(78, 205, 196, 0.1)',
                borderWidth: 2,
                borderDash: [5, 5],
                fill: false,
                tension: 0.4,
                pointBackgroundColor: '#4ecdc4',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        color: '#a0c4ff'
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 212, 255, 0.2)'
                    },
                    ticks: {
                        color: '#a0c4ff'
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(0, 212, 255, 0.2)'
                    },
                    ticks: {
                        color: '#a0c4ff'
                    }
                }
            }
        }
    });
}

// 创建生产数据图表
function createProductionChart() {
    const ctx = document.getElementById('productionChart');
    if (!ctx) return;

    productionChart = new Chart(ctx.getContext('2d'), {
        type: 'bar',
        data: {
            labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
            datasets: [{
                label: '草方格数量',
                data: [45, 52, 48, 65, 58, 72, 85],
                backgroundColor: 'rgba(255, 193, 7, 0.8)',
                borderColor: '#ffc107',
                borderWidth: 2,
                borderRadius: 8
            }, {
                label: '铺设面积 (m²)',
                data: [450, 520, 480, 650, 580, 720, 850],
                backgroundColor: 'rgba(40, 167, 69, 0.8)',
                borderColor: '#28a745',
                borderWidth: 2,
                borderRadius: 8,
                yAxisID: 'y1'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        color: '#a0c4ff'
                    }
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 212, 255, 0.2)'
                    },
                    ticks: {
                        color: '#a0c4ff'
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    beginAtZero: true,
                    grid: {
                        drawOnChartArea: false,
                    },
                    ticks: {
                        color: '#a0c4ff'
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(0, 212, 255, 0.2)'
                    },
                    ticks: {
                        color: '#a0c4ff'
                    }
                }
            }
        }
    });
}

// 创建质量指标图表
function createQualityChart() {
    const ctx = document.getElementById('qualityChart');
    if (!ctx) return;

    qualityChart = new Chart(ctx.getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: ['固沙效果', '网格均匀性', '材料利用率', '耐久性'],
            datasets: [{
                data: [95, 88, 92, 87],
                backgroundColor: [
                    'rgba(40, 167, 69, 0.8)',   // 绿色
                    'rgba(255, 193, 7, 0.8)',   // 黄色
                    'rgba(0, 123, 255, 0.8)',   // 蓝色
                    'rgba(220, 53, 69, 0.8)'    // 红色
                ],
                borderColor: [
                    '#28a745',
                    '#ffc107',
                    '#007bff',
                    '#dc3545'
                ],
                borderWidth: 3,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        color: '#a0c4ff',
                        padding: 20,
                        usePointStyle: true
                    }
                }
            }
        }
    });
}

// 创建警报统计图表
function createAlertChart() {
    const ctx = document.getElementById('alertChart');
    if (!ctx) return;

    alertChart = new Chart(ctx.getContext('2d'), {
        type: 'pie',
        data: {
            labels: ['正常', '警告', '严重'],
            datasets: [{
                data: [75, 20, 5],
                backgroundColor: [
                    'rgba(40, 167, 69, 0.8)',   // 绿色 - 正常
                    'rgba(255, 193, 7, 0.8)',   // 黄色 - 警告
                    'rgba(220, 53, 69, 0.8)'    // 红色 - 严重
                ],
                borderColor: [
                    '#28a745',
                    '#ffc107',
                    '#dc3545'
                ],
                borderWidth: 3,
                hoverOffset: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'right',
                    labels: {
                        color: '#a0c4ff',
                        padding: 15,
                        usePointStyle: true
                    }
                }
            }
        }
    });
}

// 设置事件监听器
function setupEventListeners() {
    // 时间段控制按钮
    document.querySelectorAll('.control-btn[data-period]').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.control-btn[data-period]').forEach(b => 
                b.classList.remove('active'));
            this.classList.add('active');
            updateChartPeriod(this.dataset.period);
        });
    });

    // 设备项点击
    document.querySelectorAll('.device-item').forEach(item => {
        item.addEventListener('click', function() {
            showDeviceDetails(this.dataset.device);
        });
    });

    // 刷新按钮
    document.querySelector('.refresh-btn').addEventListener('click', function() {
        this.style.transform = 'rotate(360deg)';
        setTimeout(() => {
            this.style.transform = '';
            refreshDeviceData();
        }, 500);
    });

    // 导航按钮
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const action = this.textContent.trim();
            handleNavigationAction(action);
        });
    });

    // 日志级别筛选
    document.getElementById('logLevel').addEventListener('change', function() {
        filterLogs(this.value);
    });

    // 清空日志
    document.querySelector('.clear-logs-btn').addEventListener('click', function() {
        clearLogs();
    });
}

// 开始实时更新
function startRealTimeUpdates() {
    // 每秒更新时间
    setInterval(updateDashboardTime, 1000);
    
    // 每5秒更新数据
    dataUpdateInterval = setInterval(updateRealTimeData, 5000);
    
    // 每3秒添加新日志
    logUpdateInterval = setInterval(addRandomLog, 3000);
}

// 更新实时数据
function updateRealTimeData() {
    // 更新指标卡片
    updateMetricCards();
    
    // 更新图表数据
    updateChartData();
    
    // 更新设备状态
    updateDeviceStatus();
}

// 更新指标卡片
function updateMetricCards() {
    const metrics = document.querySelectorAll('.metric-value');
    metrics.forEach((metric, index) => {
        const currentValue = parseFloat(metric.textContent.replace(/[^\d.]/g, ''));
        let newValue;
        let suffix = '';
        
        switch(index) {
            case 0: // 草方格完成
                newValue = Math.min(2000, currentValue + Math.random() * 3);
                metric.textContent = Math.floor(newValue);
                break;
            case 1: // 设备运行
                // 保持6/6不变，偶尔变化
                if (Math.random() > 0.95) {
                    const running = Math.floor(Math.random() * 2) + 5; // 5-6
                    metric.textContent = `${running}/6`;
                } else {
                    metric.textContent = '6/6';
                }
                break;
            case 2: // 铺设面积
                newValue = Math.min(2000, currentValue + Math.random() * 3);
                metric.textContent = Math.floor(newValue);
                break;
            case 3: // 项目进度
                newValue = Math.min(100, currentValue + Math.random() * 0.3);
                metric.textContent = Math.floor(newValue) + '%';
                break;
            case 4: // 草料消耗
                newValue = currentValue + Math.random() * 0.05;
                metric.textContent = newValue.toFixed(1);
                break;
            case 5: // 固沙效果
                newValue = Math.min(100, Math.max(90, currentValue + (Math.random() - 0.5) * 1));
                metric.textContent = Math.floor(newValue) + '%';
                break;
        }
        
        // 添加动画效果
        metric.style.transform = 'scale(1.05)';
        metric.style.color = '#00ff88';
        setTimeout(() => {
            metric.style.transform = '';
            metric.style.color = '';
        }, 500);
    });
}

// 更新图表数据
function updateChartData() {
    // 更新风速图表
    if (windChart) {
        const newWindSpeed = Math.random() * 15 + 5;
        windChart.data.datasets[0].data.shift();
        windChart.data.datasets[0].data.push(newWindSpeed);
        
        const now = new Date();
        windChart.data.labels.shift();
        windChart.data.labels.push(now.getHours() + ':' + 
            String(now.getMinutes()).padStart(2, '0'));
        
        windChart.update('none');
    }
    
    // 更新导航图表中的设备位置
    if (navigationChart) {
        navigationChart.data.datasets[0].data.forEach(point => {
            point.x += (Math.random() - 0.5) * 2;
            point.y += (Math.random() - 0.5) * 2;
            point.x = Math.max(0, Math.min(100, point.x));
            point.y = Math.max(0, Math.min(50, point.y));
        });
        navigationChart.update('none');
    }
}

// 更新设备状态
function updateDeviceStatus() {
    const deviceItems = document.querySelectorAll('.device-item');
    deviceItems.forEach(item => {
        const indicator = item.querySelector('.device-indicator');
        const stats = item.querySelectorAll('.device-stats span');
        
        // 随机更新电量和温度
        if (stats.length >= 2) {
            const battery = Math.floor(Math.random() * 100);
            const temp = Math.floor(Math.random() * 20 + 20);
            
            stats[0].textContent = `电量: ${battery}%`;
            stats[1].textContent = `温度: ${temp}°C`;
            
            // 根据电量更新指示器状态
            indicator.className = 'device-indicator';
            if (battery > 50) {
                indicator.classList.add('online');
            } else if (battery > 20) {
                indicator.classList.add('warning');
            } else {
                indicator.classList.add('offline');
            }
        }
    });
}

// 添加随机日志
function addRandomLog() {
    const logTypes = ['info', 'warning', 'error'];
    const messages = [
        '设备状态检查完成',
        '数据同步成功',
        '系统性能正常',
        '设备电量低警告',
        '网络连接不稳定',
        '传感器数据异常',
        '设备通信中断',
        '系统错误',
        '数据库连接失败'
    ];
    
    const logType = logTypes[Math.floor(Math.random() * logTypes.length)];
    const message = messages[Math.floor(Math.random() * messages.length)];
    const now = new Date();
    const timeString = now.toTimeString().substr(0, 8);
    
    const logEntry = document.createElement('div');
    logEntry.className = `log-entry ${logType}`;
    logEntry.innerHTML = `
        <span class="log-time">${timeString}</span>
        <span class="log-level">${logType.toUpperCase()}</span>
        <span class="log-message">${message}</span>
    `;
    
    const logsContainer = document.getElementById('logsContainer');
    logsContainer.insertBefore(logEntry, logsContainer.firstChild);
    
    // 限制日志数量
    if (logsContainer.children.length > 50) {
        logsContainer.removeChild(logsContainer.lastChild);
    }
    
    // 添加新日志动画
    logEntry.style.opacity = '0';
    logEntry.style.transform = 'translateX(-20px)';
    setTimeout(() => {
        logEntry.style.transition = 'all 0.3s ease';
        logEntry.style.opacity = '1';
        logEntry.style.transform = 'translateX(0)';
    }, 100);
}

// 动画仪表板元素
function animateDashboardElements() {
    const elements = document.querySelectorAll('.metric-card, .chart-panel, .status-panel, .navigation-panel, .logs-panel');
    elements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        setTimeout(() => {
            element.style.transition = 'all 0.5s ease';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, index * 100);
    });
}

// 更新图表时间段
function updateChartPeriod(period) {
    console.log(`Updating chart period to: ${period}`);
    // 这里可以添加根据时间段更新图表数据的逻辑
}

// 显示设备详情
function showDeviceDetails(deviceId) {
    showNotification(`查看设备 ${deviceId} 详情`, 'info');
}

// 刷新设备数据
function refreshDeviceData() {
    showNotification('设备数据已刷新', 'success');
    updateDeviceStatus();
}

// 处理导航操作
function handleNavigationAction(action) {
    showNotification(`执行操作: ${action}`, 'info');
}

// 筛选日志
function filterLogs(level) {
    const logEntries = document.querySelectorAll('.log-entry');
    logEntries.forEach(entry => {
        if (level === 'all' || entry.classList.contains(level)) {
            entry.style.display = 'flex';
        } else {
            entry.style.display = 'none';
        }
    });
}

// 清空日志
function clearLogs() {
    document.getElementById('logsContainer').innerHTML = '';
    showNotification('日志已清空', 'success');
}

// 显示通知
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type} show`;
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// 更新环境图表数据
function updateEnvironmentCharts(environmentData) {
    if (!environmentChart || !environmentData) return;

    const currentValues = [
        environmentData.temperature?.current || 0,
        environmentData.humidity?.current || 0,
        environmentData.windSpeed?.current || 0,
        environmentData.sandDensity?.current || 0,
        environmentData.visibility?.current || 0
    ];

    // 计算平均值
    const avgValues = currentValues.map(val => val * (0.95 + Math.random() * 0.1));

    environmentChart.data.datasets[0].data = currentValues;
    environmentChart.data.datasets[1].data = avgValues;
    environmentChart.update('none');

    // 同时更新风速图表
    if (windChart && environmentData.windSpeed) {
        const newWindSpeed = environmentData.windSpeed.current;
        windChart.data.datasets[0].data.shift();
        windChart.data.datasets[0].data.push(newWindSpeed);

        const now = new Date();
        windChart.data.labels.shift();
        windChart.data.labels.push(now.getHours() + ':' +
            String(now.getMinutes()).padStart(2, '0'));

        windChart.update('none');
    }
}

// 更新设备图表数据
function updateEquipmentCharts(equipmentData) {
    if (!efficiencyChart || !equipmentData) return;

    const equipmentNames = Object.keys(equipmentData);
    const efficiencyValues = equipmentNames.map(name =>
        equipmentData[name].efficiency || 0);
    const utilizationValues = equipmentNames.map(name =>
        (equipmentData[name].batteryLevel || equipmentData[name].fuelLevel || 0));

    if (efficiencyChart.data.datasets[0]) {
        efficiencyChart.data.datasets[0].data = efficiencyValues;
    }
    if (efficiencyChart.data.datasets[1]) {
        efficiencyChart.data.datasets[1].data = utilizationValues;
    }

    efficiencyChart.update('none');

    // 更新导航图表中的设备位置
    if (navigationChart) {
        const positions = equipmentNames.slice(0, 4).map(name => {
            const coords = equipmentData[name].coordinates || [108.2, 39.1];
            return {
                x: (coords[0] - 108.0) * 100, // 转换为图表坐标
                y: (coords[1] - 38.9) * 125   // 转换为图表坐标
            };
        });

        navigationChart.data.datasets[0].data = positions;
        navigationChart.update('none');
    }
}

// 更新生产图表数据
function updateProductionCharts(productionData) {
    if (!productionChart || !productionData) return;

    if (productionData.dailyProgress) {
        const grassData = productionData.dailyProgress.grassSquares || [];
        const areaData = productionData.dailyProgress.area || [];

        if (productionChart.data.datasets[0]) {
            productionChart.data.datasets[0].data = grassData;
        }
        if (productionChart.data.datasets[1]) {
            productionChart.data.datasets[1].data = areaData;
        }

        productionChart.update('none');
    }

    // 更新质量图表
    if (qualityChart && productionData.qualityMetrics) {
        const qualityValues = [
            productionData.qualityMetrics.sandFixingEffect || 0,
            productionData.qualityMetrics.gridUniformity || 0,
            productionData.qualityMetrics.materialUtilization || 0,
            productionData.qualityMetrics.durability || 0
        ];

        qualityChart.data.datasets[0].data = qualityValues;
        qualityChart.update('none');
    }
}

// 更新警报显示
function updateAlertDisplay(alertData) {
    if (!alertChart || !alertData) return;

    const criticalCount = alertData.critical?.length || 0;
    const warningCount = alertData.warnings?.length || 0;
    const totalAlerts = criticalCount + warningCount;
    const normalCount = Math.max(0, 100 - totalAlerts);

    alertChart.data.datasets[0].data = [normalCount, warningCount, criticalCount];
    alertChart.update('none');

    // 更新日志显示
    const allAlerts = [
        ...(alertData.critical || []),
        ...(alertData.warnings || []),
        ...(alertData.info || [])
    ];

    // 显示最新的警报作为日志
    if (allAlerts.length > 0) {
        const latestAlert = allAlerts[allAlerts.length - 1];
        if (latestAlert && latestAlert.timestamp) {
            const alertTime = new Date(latestAlert.timestamp);
            const timeString = alertTime.toTimeString().substr(0, 8);

            const logEntry = document.createElement('div');
            const logLevel = latestAlert.severity === 'high' ? 'error' :
                           latestAlert.severity === 'medium' ? 'warning' : 'info';

            logEntry.className = `log-entry ${logLevel}`;
            logEntry.innerHTML = `
                <span class="log-time">${timeString}</span>
                <span class="log-level">${logLevel.toUpperCase()}</span>
                <span class="log-message">${latestAlert.message}</span>
            `;

            const logsContainer = document.getElementById('logsContainer');
            if (logsContainer && !logsContainer.querySelector(`[data-alert-id="${latestAlert.id}"]`)) {
                logEntry.setAttribute('data-alert-id', latestAlert.id);
                logsContainer.insertBefore(logEntry, logsContainer.firstChild);

                // 限制日志数量
                if (logsContainer.children.length > 50) {
                    logsContainer.removeChild(logsContainer.lastChild);
                }
            }
        }
    }
}

// 清理资源
window.addEventListener('beforeunload', function() {
    if (dataUpdateInterval) clearInterval(dataUpdateInterval);
    if (logUpdateInterval) clearInterval(logUpdateInterval);
    if (dataManager) {
        dataManager.stopRealTimeUpdates();
    }
});
