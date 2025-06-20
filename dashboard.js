// 仪表板JavaScript
let materialChart, windChart, navigationChart;
let logUpdateInterval, dataUpdateInterval;

// 初始化仪表板
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
    createCharts();
    startRealTimeUpdates();
    setupEventListeners();
});

// 初始化仪表板
function initializeDashboard() {
    updateDashboardTime();
    animateDashboardElements();
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
    createMaterialChart();
    createWindChart();
    createNavigationChart();
}

// 创建原料余量图表
function createMaterialChart() {
    const ctx = document.getElementById('materialChart').getContext('2d');
    materialChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['沙子', '水泥', '石料', '添加剂', '水'],
            datasets: [{
                label: '余量 (吨)',
                data: [120, 85, 95, 45, 200],
                backgroundColor: [
                    'rgba(0, 212, 255, 0.8)',
                    'rgba(0, 255, 136, 0.8)',
                    'rgba(255, 170, 0, 0.8)',
                    'rgba(255, 68, 68, 0.8)',
                    'rgba(138, 43, 226, 0.8)'
                ],
                borderColor: [
                    '#00d4ff',
                    '#00ff88',
                    '#ffaa00',
                    '#ff4444',
                    '#8a2be2'
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
        const currentValue = parseInt(metric.textContent);
        let newValue;
        
        switch(index) {
            case 0: // 设备总数
                newValue = currentValue + (Math.random() > 0.9 ? 1 : 0);
                break;
            case 1: // 运行设备
                newValue = Math.max(0, currentValue + (Math.random() > 0.7 ? 1 : -1));
                break;
            case 2: // 告警数量
                newValue = Math.max(0, currentValue + (Math.random() > 0.8 ? 1 : -1));
                break;
            case 3: // 工作效率
                newValue = Math.min(100, Math.max(0, currentValue + (Math.random() - 0.5) * 2));
                break;
        }
        
        if (newValue !== currentValue) {
            metric.textContent = index === 3 ? newValue + '%' : newValue;
            metric.style.transform = 'scale(1.1)';
            setTimeout(() => {
                metric.style.transform = '';
            }, 300);
        }
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

// 清理资源
window.addEventListener('beforeunload', function() {
    if (dataUpdateInterval) clearInterval(dataUpdateInterval);
    if (logUpdateInterval) clearInterval(logUpdateInterval);
});
