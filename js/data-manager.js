// 数据管理器 - 处理动态数据更新和模拟
class DataManager {
    constructor() {
        this.data = null;
        this.updateInterval = null;
        this.subscribers = new Map();
        this.isRunning = false;
        this.loadData();
    }

    // 加载初始数据
    async loadData() {
        try {
            const response = await fetch('./data/monitoring-data.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.data = await response.json();
            console.log('数据加载成功:', this.data);
        } catch (error) {
            console.error('数据加载失败，使用模拟数据:', error);
            this.generateMockData();
        }
    }

    // 生成模拟数据（如果JSON文件加载失败）
    generateMockData() {
        // 生成历史数据
        const generateHistory = (baseValue, range, count = 12) => {
            const history = [];
            for (let i = 0; i < count; i++) {
                const variation = (range[1] - range[0]) * 0.1;
                const value = baseValue + (Math.random() - 0.5) * variation;
                history.push(Math.max(range[0], Math.min(range[1], value)));
            }
            return history;
        };

        this.data = {
            environmentData: {
                temperature: {
                    current: 28.5,
                    history: generateHistory(28.5, [20, 45]),
                    unit: "°C",
                    range: [20, 45]
                },
                humidity: {
                    current: 45.2,
                    history: generateHistory(45.2, [30, 70]),
                    unit: "%",
                    range: [30, 70]
                },
                windSpeed: {
                    current: 12.3,
                    history: generateHistory(12.3, [0, 25]),
                    unit: "km/h",
                    range: [0, 25]
                },
                sandDensity: {
                    current: 1.85,
                    history: generateHistory(1.85, [1.5, 2.2]),
                    unit: "g/cm³",
                    range: [1.5, 2.2]
                },
                visibility: {
                    current: 8.5,
                    history: generateHistory(8.5, [0, 15]),
                    unit: "km",
                    range: [0, 15]
                }
            },
            equipmentData: {
                grassLayingMachine: {
                    efficiency: 92, batteryLevel: 85, workingHours: 6.5,
                    grassConsumption: 3.2, coverageArea: 1250, status: "working",
                    coordinates: [108.2, 39.1]
                },
                transportVehicle: {
                    efficiency: 88, fuelLevel: 68, loadCapacity: 75,
                    distanceTraveled: 45.2, status: "working",
                    coordinates: [108.3, 39.2]
                },
                gridMaker: {
                    efficiency: 95, precision: 98, speed: 3.2,
                    gridCount: 450, status: "working",
                    coordinates: [108.1, 39.0]
                },
                compactor: {
                    efficiency: 85, pressure: 150, temperature: 35,
                    compactionRate: 88, status: "warning",
                    coordinates: [108.4, 39.3]
                },
                monitoringVehicle: {
                    efficiency: 98, signalStrength: 95, coverage: 95,
                    dataTransmission: 1024, status: "working",
                    coordinates: [108.2, 39.1]
                },
                waterTruck: {
                    efficiency: 90, waterLevel: 80, pressure: 75,
                    sprayRate: 2.5, status: "working",
                    coordinates: [108.0, 38.9]
                }
            },
            productionData: {
                dailyProgress: {
                    grassSquares: [45, 52, 48, 65, 58, 72, 85],
                    area: [450, 520, 480, 650, 580, 720, 850],
                    efficiency: [78, 82, 75, 88, 85, 92, 95]
                },
                qualityMetrics: {
                    sandFixingEffect: 95,
                    gridUniformity: 88,
                    materialUtilization: 92,
                    durability: 87
                }
            },
            alertData: { critical: [], warnings: [], info: [] },
            gpsData: {
                workArea: {
                    center: [108.2, 39.1],
                    bounds: [[108.0, 38.9], [108.4, 39.3]]
                }
            },
            timestamp: new Date().toISOString()
        };

        console.log('模拟数据生成完成');
    }

    // 订阅数据更新
    subscribe(key, callback) {
        if (!this.subscribers.has(key)) {
            this.subscribers.set(key, []);
        }
        this.subscribers.get(key).push(callback);
    }

    // 取消订阅
    unsubscribe(key, callback) {
        if (this.subscribers.has(key)) {
            const callbacks = this.subscribers.get(key);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    // 通知订阅者
    notify(key, data) {
        if (this.subscribers.has(key)) {
            this.subscribers.get(key).forEach(callback => callback(data));
        }
    }

    // 开始实时数据更新
    startRealTimeUpdates(interval = 3000) {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.updateInterval = setInterval(() => {
            this.updateEnvironmentData();
            this.updateEquipmentData();
            this.updateProductionData();
            this.generateRandomAlerts();
            this.updateTimestamp();
        }, interval);
        
        console.log('实时数据更新已启动');
    }

    // 停止实时数据更新
    stopRealTimeUpdates() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
            this.isRunning = false;
            console.log('实时数据更新已停止');
        }
    }

    // 更新环境数据
    updateEnvironmentData() {
        if (!this.data || !this.data.environmentData) return;

        Object.keys(this.data.environmentData).forEach(key => {
            const item = this.data.environmentData[key];
            const [min, max] = item.range;
            const variation = (max - min) * 0.05; // 5%的变化范围
            
            // 生成新的数值（基于当前值的小幅波动）
            const change = (Math.random() - 0.5) * variation;
            let newValue = item.current + change;
            
            // 确保值在合理范围内
            newValue = Math.max(min, Math.min(max, newValue));
            item.current = Math.round(newValue * 100) / 100;
            
            // 更新历史数据
            if (!item.history) item.history = [];
            item.history.push(item.current);
            if (item.history.length > 24) {
                item.history.shift();
            }
        });

        this.notify('environmentData', this.data.environmentData);
    }

    // 更新设备数据
    updateEquipmentData() {
        if (!this.data || !this.data.equipmentData) return;

        Object.keys(this.data.equipmentData).forEach(key => {
            const equipment = this.data.equipmentData[key];
            
            // 更新效率（小幅波动）
            if (equipment.efficiency !== undefined) {
                equipment.efficiency += (Math.random() - 0.5) * 4;
                equipment.efficiency = Math.max(70, Math.min(100, equipment.efficiency));
                equipment.efficiency = Math.round(equipment.efficiency);
            }
            
            // 更新电池/燃油水平（缓慢下降）
            if (equipment.batteryLevel !== undefined) {
                equipment.batteryLevel -= Math.random() * 0.5;
                equipment.batteryLevel = Math.max(0, equipment.batteryLevel);
                equipment.batteryLevel = Math.round(equipment.batteryLevel);
            }
            
            if (equipment.fuelLevel !== undefined) {
                equipment.fuelLevel -= Math.random() * 0.3;
                equipment.fuelLevel = Math.max(0, equipment.fuelLevel);
                equipment.fuelLevel = Math.round(equipment.fuelLevel);
            }
            
            // 更新位置（小幅移动）
            if (equipment.coordinates) {
                equipment.coordinates[0] += (Math.random() - 0.5) * 0.001;
                equipment.coordinates[1] += (Math.random() - 0.5) * 0.001;
            }
            
            // 根据电池/燃油水平更新状态
            const powerLevel = equipment.batteryLevel || equipment.fuelLevel || 100;
            if (powerLevel < 20) {
                equipment.status = 'critical';
            } else if (powerLevel < 50) {
                equipment.status = 'warning';
            } else {
                equipment.status = 'working';
            }
        });

        this.notify('equipmentData', this.data.equipmentData);
    }

    // 更新生产数据
    updateProductionData() {
        if (!this.data || !this.data.productionData) return;

        const production = this.data.productionData;
        
        // 更新日进度
        if (production.dailyProgress) {
            const today = new Date().getDay();
            if (production.dailyProgress.grassSquares) {
                const lastValue = production.dailyProgress.grassSquares[production.dailyProgress.grassSquares.length - 1] || 0;
                const newValue = lastValue + Math.floor(Math.random() * 5);
                production.dailyProgress.grassSquares[today] = newValue;
            }
        }

        this.notify('productionData', this.data.productionData);
    }

    // 生成随机警报
    generateRandomAlerts() {
        if (!this.data || !this.data.alertData) return;

        // 随机生成新警报
        if (Math.random() < 0.1) { // 10%概率生成新警报
            const alertTypes = ['equipment', 'weather', 'battery', 'system'];
            const messages = [
                '设备温度异常',
                '风速超过安全阈值',
                '电量不足警告',
                '通信信号弱',
                '材料库存不足',
                '设备效率下降'
            ];
            
            const type = alertTypes[Math.floor(Math.random() * alertTypes.length)];
            const message = messages[Math.floor(Math.random() * messages.length)];
            const severity = Math.random() < 0.2 ? 'high' : (Math.random() < 0.5 ? 'medium' : 'low');
            
            const alert = {
                id: Date.now(),
                type: type,
                message: message,
                timestamp: new Date().toISOString(),
                severity: severity
            };
            
            if (severity === 'high') {
                this.data.alertData.critical.push(alert);
            } else if (severity === 'medium') {
                this.data.alertData.warnings.push(alert);
            } else {
                this.data.alertData.info.push(alert);
            }
            
            // 限制警报数量
            ['critical', 'warnings', 'info'].forEach(level => {
                if (this.data.alertData[level].length > 10) {
                    this.data.alertData[level].shift();
                }
            });
        }

        this.notify('alertData', this.data.alertData);
    }

    // 更新时间戳
    updateTimestamp() {
        if (this.data) {
            this.data.timestamp = new Date().toISOString();
        }
    }

    // 获取特定类型的数据
    getData(type) {
        return this.data ? this.data[type] : null;
    }

    // 获取所有数据
    getAllData() {
        return this.data;
    }

    // 重置数据到初始状态
    resetData() {
        this.loadData();
    }
}

// 创建全局数据管理器实例
window.dataManager = new DataManager();
