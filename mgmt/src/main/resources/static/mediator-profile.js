/**
 * 调解员画像管理模块
 * 展示调解员六维能力雷达图及统计分析
 */

// 加载调解员画像页面
function loadMediatorProfilePage() {
    const mainContent = document.getElementById('mainContent');
    mainContent.innerHTML = `
        <div class="container-fluid">
            <!-- 页面标题 -->
            <div class="row mb-4">
                <div class="col-12">
                    <h4 class="mb-3">
                        <i class="fa fa-user-circle text-primary me-2"></i>调解员能力画像
                    </h4>
                    <p class="text-muted">基于历史案件数据，多维度分析调解员综合能力</p>
                </div>
            </div>

            <!-- 筛选栏 -->
            <div class="row mb-4">
                <div class="col-md-12">
                    <div class="ant-card">
                        <div class="ant-card-body">
                            <div class="row align-items-center">
                                <div class="col-md-4">
                                    <label class="form-label">调解员（默认显示排名第一）</label>
                                    <select id="profileMediatorFilter" class="form-select ant-input">
                                    </select>
                                </div>
                                <div class="col-md-4">
                                    <label class="form-label">&nbsp;</label>
                                    <div>
                                        <button class="ant-btn ant-btn-primary" onclick="loadMediatorProfiles()">
                                            <i class="fa fa-search me-1"></i>查询
                                        </button>
                                        <button class="ant-btn ant-btn-default" onclick="resetProfileFilter()">
                                            <i class="fa fa-refresh me-1"></i>重置
                                        </button>
                                    </div>
                                </div>
                                <div class="col-md-4 text-end">
                                    <label class="form-label">&nbsp;</label>
                                    <div>
                                        <button class="ant-btn ant-btn-primary" onclick="showRankingModal()">
                                            <i class="fa fa-trophy me-1"></i>查看排名
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 统计概览卡片 -->
            <div class="row mb-4" id="profileStatsCards">
                <!-- 动态生成统计卡片 -->
            </div>

            <!-- 雷达图和详细统计 -->
            <div class="row mb-4">
                <!-- 六维雷达图 -->
                <div class="col-md-6">
                    <div class="ant-card">
                        <div class="ant-card-body">
                            <h6 class="mb-3"><i class="fa fa-radar me-2"></i>六维能力雷达图</h6>
                            <div id="radarChart" style="width: 100%; height: 400px;"></div>
                        </div>
                    </div>
                </div>
                <!-- 能力维度说明 -->
                <div class="col-md-6">
                    <div class="ant-card">
                        <div class="ant-card-body">
                            <h6 class="mb-3"><i class="fa fa-info-circle me-2"></i>能力维度说明</h6>
                            <div class="table-responsive">
                                <table class="table table-borderless">
                                    <tbody>
                                        <tr>
                                            <td width="120"><span class="badge bg-primary">调解成功率</span></td>
                                            <td>成功结案数占总处理案件数的比例</td>
                                        </tr>
                                        <tr>
                                            <td><span class="badge bg-success">调解效率</span></td>
                                            <td>平均调解天数，天数越少得分越高</td>
                                        </tr>
                                        <tr>
                                            <td><span class="badge bg-warning">复杂度适应力</span></td>
                                            <td>处理大额/超大额案件的能力</td>
                                        </tr>
                                        <tr>
                                            <td><span class="badge bg-info">案件覆盖度</span></td>
                                            <td>处理案由类型的多样性</td>
                                        </tr>
                                        <tr>
                                            <td><span class="badge bg-secondary">创收能力</span></td>
                                            <td>平均调解费水平</td>
                                        </tr>
                                        <tr>
                                            <td><span class="badge bg-dark">抗失败能力</span></td>
                                            <td>不可控失败原因占比越低得分越高</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 标的额分布和案由统计 -->
            <div class="row mb-4">
                <div class="col-md-6">
                    <div class="ant-card">
                        <div class="ant-card-body">
                            <h6 class="mb-3"><i class="fa fa-pie-chart me-2"></i>标的额区间分布</h6>
                            <div id="amountRangeChart" style="width: 100%; height: 300px;"></div>
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="ant-card">
                        <div class="ant-card-body">
                            <h6 class="mb-3"><i class="fa fa-bar-chart me-2"></i>案由分类TOP10</h6>
                            <div id="caseTypeChart" style="width: 100%; height: 300px;"></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 失败原因分析 -->
            <div class="row mb-4">
                <div class="col-md-12">
                    <div class="ant-card">
                        <div class="ant-card-body">
                            <h6 class="mb-3"><i class="fa fa-exclamation-triangle me-2"></i>失败原因分析</h6>
                            <div id="failureReasonChart" style="width: 100%; height: 300px;"></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 详细数据表格 -->
            <div class="row">
                <div class="col-md-12">
                    <div class="ant-card">
                        <div class="ant-card-body">
                            <h6 class="mb-3"><i class="fa fa-table me-2"></i>调解员列表</h6>
                            <div class="table-responsive">
                                <table class="table table-hover">
                                    <thead class="table-light">
                                        <tr>
                                            <th>排名</th>
                                            <th>调解员</th>
                                            <th>总案件数</th>
                                            <th>结案数</th>
                                            <th>成功率</th>
                                            <th>平均天数</th>
                                            <th>总调解费</th>
                                            <th>综合得分</th>
                                            <th>操作</th>
                                        </tr>
                                    </thead>
                                    <tbody id="mediatorProfileTableBody">
                                        <!-- 动态生成 -->
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // 初始化页面数据
    initProfilePage();
}

// 初始化页面数据
async function initProfilePage() {
    await loadMediatorProfiles();
}

// 加载调解员画像列表
async function loadMediatorProfiles() {
    try {
        const data = await request('/mediator-profile/list');

        // 更新调解员下拉选项
        updateMediatorOptions(data);

        // 渲染统计卡片
        renderProfileStatsCards(data);

        // 渲染表格
        renderProfileTable(data);

        // 渲染当前选中调解员的详细画像
        const selectedId = document.getElementById('profileMediatorFilter')?.value;
        if (selectedId) {
            const mediator = data.find(m => m.userId == selectedId);
            if (mediator) {
                renderMediatorDetail(mediator);
            }
        }
    } catch (e) {
        console.error('加载调解员画像失败:', e);
        alert('加载调解员画像失败: ' + e.message);
    }
}

// 更新调解员下拉选项
function updateMediatorOptions(mediators) {
    const select = document.getElementById('profileMediatorFilter');
    if (!select) return;

    const currentValue = select.value;
    select.innerHTML = mediators.map(m => `<option value="${m.userId}">${m.username}</option>`).join('');

    // 如果有数据，默认选择第一个（排名第一的调解员）
    if (mediators.length > 0) {
        if (currentValue) {
            // 保持之前的选择
            select.value = currentValue;
        } else {
            // 默认选择第一个
            select.value = mediators[0].userId;
        }
    }

    // 添加变更事件监听
    select.onchange = function() {
        const selectedId = this.value;
        if (selectedId) {
            loadMediatorDetail(selectedId);
        }
    };
}

// 加载单个调解员详情
async function loadMediatorDetail(userId) {
    try {
        const data = await request(`/mediator-profile/${userId}`);
        if (data) {
            renderMediatorDetail(data);
        }
    } catch (e) {
        console.error('加载调解员详情失败:', e);
    }
}

// 渲染统计卡片
function renderProfileStatsCards(mediators) {
    const container = document.getElementById('profileStatsCards');
    if (!container || !mediators) return;

    const totalMediators = mediators.length;
    const totalCases = mediators.reduce((sum, m) => sum + (m.totalCases || 0), 0);
    const totalCompleted = mediators.reduce((sum, m) => sum + (m.completedCases || 0), 0);
    const avgSuccessRate = totalCases > 0 ? (totalCompleted / totalCases * 100).toFixed(2) : '0.00';

    container.innerHTML = `
        <div class="col-md-3">
            <div class="ant-card">
                <div class="ant-card-body">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <p class="text-muted mb-1">调解员总数</p>
                            <h3 class="mb-0">${totalMediators}</h3>
                        </div>
                        <div class="bg-primary bg-opacity-10 p-3 rounded">
                            <i class="fa fa-users text-primary fa-2x"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-md-3">
            <div class="ant-card">
                <div class="ant-card-body">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <p class="text-muted mb-1">累计处理案件</p>
                            <h3 class="mb-0">${totalCases}</h3>
                        </div>
                        <div class="bg-success bg-opacity-10 p-3 rounded">
                            <i class="fa fa-briefcase text-success fa-2x"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-md-3">
            <div class="ant-card">
                <div class="ant-card-body">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <p class="text-muted mb-1">累计结案数</p>
                            <h3 class="mb-0">${totalCompleted}</h3>
                        </div>
                        <div class="bg-info bg-opacity-10 p-3 rounded">
                            <i class="fa fa-check-circle text-info fa-2x"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-md-3">
            <div class="ant-card">
                <div class="ant-card-body">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <p class="text-muted mb-1">平均成功率</p>
                            <h3 class="mb-0">${avgSuccessRate}%</h3>
                        </div>
                        <div class="bg-warning bg-opacity-10 p-3 rounded">
                            <i class="fa fa-percent text-warning fa-2x"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// 渲染调解员详细画像
function renderMediatorDetail(mediator) {
    if (!mediator) return;

    // 渲染雷达图
    renderRadarChart(mediator.radarData);

    // 渲染标的额分布图
    renderAmountRangeChart(mediator.amountRangeStats);

    // 渲染案由统计图
    renderCaseTypeChart(mediator.caseTypeStats);

    // 渲染失败原因分析图
    renderFailureReasonChart(mediator.failureReasonStats);
}

// 渲染雷达图
function renderRadarChart(radarData) {
    if (!radarData) return;

    const chartDom = document.getElementById('radarChart');
    if (!chartDom) return;

    const myChart = echarts.init(chartDom);

    const option = {
        tooltip: {
            trigger: 'item'
        },
        radar: {
            indicator: [
                { name: '调解成功率', max: 100 },
                { name: '调解效率', max: 100 },
                { name: '复杂度适应力', max: 100 },
                { name: '案件覆盖度', max: 100 },
                { name: '创收能力', max: 100 },
                { name: '抗失败能力', max: 100 }
            ],
            radius: '65%',
            splitNumber: 4,
            axisName: {
                color: '#666',
                fontSize: 12
            },
            splitLine: {
                lineStyle: {
                    color: [
                        'rgba(238, 197, 102, 0.1)', 'rgba(238, 197, 102, 0.2)',
                        'rgba(238, 197, 102, 0.4)', 'rgba(238, 197, 102, 0.6)'
                    ].reverse()
                }
            },
            splitArea: {
                show: false
            },
            axisLine: {
                lineStyle: {
                    color: 'rgba(238, 197, 102, 0.5)'
                }
            }
        },
        series: [{
            name: '能力维度',
            type: 'radar',
            data: [
                {
                    value: [
                        radarData.successRateScore || 0,
                        radarData.efficiencyScore || 0,
                        radarData.complexityScore || 0,
                        radarData.coverageScore || 0,
                        radarData.revenueScore || 0,
                        radarData.failureResistScore || 0
                    ],
                    name: '当前调解员',
                    areaStyle: {
                        color: new echarts.graphic.RadialGradient(0.1, 0.6, 1, [
                            { color: 'rgba(22, 119, 255, 0.1)', offset: 0 },
                            { color: 'rgba(22, 119, 255, 0.5)', offset: 1 }
                        ])
                    },
                    lineStyle: {
                        color: '#1677ff',
                        width: 2
                    },
                    itemStyle: {
                        color: '#1677ff'
                    }
                }
            ]
        }]
    };

    myChart.setOption(option);

    // 响应式
    window.addEventListener('resize', () => {
        myChart.resize();
    });
}

// 渲染标的额分布图
function renderAmountRangeChart(amountRangeStats) {
    if (!amountRangeStats || amountRangeStats.length === 0) return;

    const chartDom = document.getElementById('amountRangeChart');
    if (!chartDom) return;

    const myChart = echarts.init(chartDom);

    const option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'cross' }
        },
        legend: {
            data: ['案件数', '成功数', '成功率'],
            bottom: 0
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '15%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: amountRangeStats.map(s => s.rangeName),
            axisLabel: {
                rotate: 30
            }
        },
        yAxis: [
            {
                type: 'value',
                name: '案件数',
                position: 'left'
            },
            {
                type: 'value',
                name: '成功率(%)',
                position: 'right',
                max: 100,
                axisLabel: {
                    formatter: '{value}%'
                }
            }
        ],
        series: [
            {
                name: '案件数',
                type: 'bar',
                data: amountRangeStats.map(s => s.caseCount),
                itemStyle: { color: '#1677ff' }
            },
            {
                name: '成功数',
                type: 'bar',
                data: amountRangeStats.map(s => s.successCount),
                itemStyle: { color: '#52c41a' }
            },
            {
                name: '成功率',
                type: 'line',
                yAxisIndex: 1,
                data: amountRangeStats.map(s => (s.successRate || 0).toFixed(1)),
                itemStyle: { color: '#faad14' },
                lineStyle: {
                    width: 3,
                    type: 'solid'
                },
                symbol: 'circle',
                symbolSize: 8,
                label: {
                    show: true,
                    formatter: '{c}%',
                    position: 'top',
                    color: '#faad14',
                    fontWeight: 'bold'
                }
            }
        ]
    };

    myChart.setOption(option);

    window.addEventListener('resize', () => {
        myChart.resize();
    });
}

// 渲染案由统计图
function renderCaseTypeChart(caseTypeStats) {
    if (!caseTypeStats || caseTypeStats.length === 0) return;

    const chartDom = document.getElementById('caseTypeChart');
    if (!chartDom) return;

    const myChart = echarts.init(chartDom);

    // 只取前10个
    const top10 = caseTypeStats.slice(0, 10);

    const option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: { type: 'shadow' }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'value'
        },
        yAxis: {
            type: 'category',
            data: top10.map(s => s.caseName).reverse(),
            axisLabel: {
                width: 100,
                overflow: 'truncate'
            }
        },
        series: [{
            name: '案件数',
            type: 'bar',
            data: top10.map(s => s.caseCount).reverse(),
            itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                    { offset: 0, color: '#83bff6' },
                    { offset: 0.5, color: '#188df0' },
                    { offset: 1, color: '#188df0' }
                ])
            }
        }]
    };

    myChart.setOption(option);

    window.addEventListener('resize', () => {
        myChart.resize();
    });
}

// 渲染失败原因分析图
function renderFailureReasonChart(failureReasonStats) {
    const chartDom = document.getElementById('failureReasonChart');
    if (!chartDom) return;

    const myChart = echarts.init(chartDom);

    // 如果没有失败数据，显示空状态
    if (!failureReasonStats || failureReasonStats.length === 0) {
        myChart.setOption({
            title: {
                text: '暂无失败记录',
                left: 'center',
                top: 'center',
                textStyle: {
                    color: '#999',
                    fontSize: 14
                }
            }
        });
        return;
    }

    const option = {
        tooltip: {
            trigger: 'item',
            formatter: '{b}: {c} ({d}%)'
        },
        legend: {
            orient: 'vertical',
            left: 'left',
            top: 'center'
        },
        series: [{
            name: '失败原因',
            type: 'pie',
            radius: ['40%', '70%'],
            center: ['60%', '50%'],
            avoidLabelOverlap: false,
            itemStyle: {
                borderRadius: 10,
                borderColor: '#fff',
                borderWidth: 2
            },
            label: {
                show: false,
                position: 'center'
            },
            emphasis: {
                label: {
                    show: true,
                    fontSize: 16,
                    fontWeight: 'bold'
                }
            },
            labelLine: {
                show: false
            },
            data: failureReasonStats.map(s => ({
                name: s.reason,
                value: s.count,
                itemStyle: {
                    color: s.controllable ? '#ff4d4f' : '#faad14'
                }
            }))
        }]
    };

    myChart.setOption(option);

    window.addEventListener('resize', () => {
        myChart.resize();
    });
}

// 渲染调解员列表表格
function renderProfileTable(mediators) {
    const tbody = document.getElementById('mediatorProfileTableBody');
    if (!tbody || !mediators) return;

    tbody.innerHTML = mediators.map((m, index) => {
        const compositeScore = calculateCompositeScore(m.radarData);
        return `
            <tr>
                <td><span class="badge bg-${index < 3 ? 'warning' : 'light'} text-${index < 3 ? 'dark' : 'dark'}">${index + 1}</span></td>
                <td>${m.username || '-'}</td>
                <td>${m.totalCases || 0}</td>
                <td>${m.completedCases || 0}</td>
                <td>
                    <div class="progress" style="height: 20px;">
                        <div class="progress-bar ${(m.successRate || 0) >= 70 ? 'bg-success' : (m.successRate || 0) >= 50 ? 'bg-warning' : 'bg-danger'}"
                             role="progressbar"
                             style="width: ${m.successRate || 0}%">
                            ${(m.successRate || 0).toFixed(1)}%
                        </div>
                    </div>
                </td>
                <td>${m.avgResolutionDays || 0}天</td>
                <td>¥${(m.totalMediationFee || 0).toFixed(2)}</td>
                <td><span class="badge bg-primary">${compositeScore.toFixed(1)}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="viewMediatorDetail(${m.userId})">
                        <i class="fa fa-eye"></i> 查看
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// 计算综合得分
function calculateCompositeScore(radarData) {
    if (!radarData) return 0;
    const scores = [
        radarData.successRateScore || 0,
        radarData.efficiencyScore || 0,
        radarData.complexityScore || 0,
        radarData.coverageScore || 0,
        radarData.revenueScore || 0,
        radarData.failureResistScore || 0
    ];
    return scores.reduce((a, b) => a + b, 0) / scores.length;
}

// 查看调解员详情（表格行点击）
function viewMediatorDetail(userId) {
    const select = document.getElementById('profileMediatorFilter');
    if (select) {
        select.value = userId;
        loadMediatorDetail(userId);
        // 滚动到顶部
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// 重置筛选
function resetProfileFilter() {
    const mediatorSelect = document.getElementById('profileMediatorFilter');
    if (mediatorSelect) {
        // 清除当前选择，让 loadMediatorProfiles 重新选择第一个
        mediatorSelect.value = '';
    }
    loadMediatorProfiles();
}

// 显示排名弹窗
async function showRankingModal() {
    try {
        const data = await request('/mediator-profile/top?limit=10');

        // 创建弹窗
        const modalHtml = `
            <div class="modal fade" id="rankingModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">
                                <i class="fa fa-trophy text-warning me-2"></i>调解员综合能力排名 TOP10
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="table-responsive">
                                <table class="table table-hover">
                                    <thead class="table-light">
                                        <tr>
                                            <th width="60">排名</th>
                                            <th>调解员</th>
                                            <th>成功率</th>
                                            <th>效率</th>
                                            <th>复杂度</th>
                                            <th>覆盖度</th>
                                            <th>创收</th>
                                            <th>抗失败</th>
                                            <th>综合得分</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${data.map((m, index) => {
                                            const r = m.radarData || {};
                                            const score = calculateCompositeScore(r);
                                            const medal = index < 3 ? ['🥇', '🥈', '🥉'][index] : (index + 1);
                                            return `
                                                <tr class="${index < 3 ? 'table-warning' : ''}">
                                                    <td class="text-center fw-bold">${medal}</td>
                                                    <td>${m.username}</td>
                                                    <td>${(r.successRateScore || 0).toFixed(1)}</td>
                                                    <td>${(r.efficiencyScore || 0).toFixed(1)}</td>
                                                    <td>${(r.complexityScore || 0).toFixed(1)}</td>
                                                    <td>${(r.coverageScore || 0).toFixed(1)}</td>
                                                    <td>${(r.revenueScore || 0).toFixed(1)}</td>
                                                    <td>${(r.failureResistScore || 0).toFixed(1)}</td>
                                                    <td><span class="badge bg-primary">${score.toFixed(1)}</span></td>
                                                </tr>
                                            `;
                                        }).join('')}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // 移除已存在的弹窗
        const existingModal = document.getElementById('rankingModal');
        if (existingModal) {
            existingModal.remove();
        }

        // 添加新弹窗到body
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHtml;
        document.body.appendChild(modalContainer);

        // 显示弹窗
        const modal = new bootstrap.Modal(document.getElementById('rankingModal'));
        modal.show();
    } catch (e) {
        console.error('加载排名失败:', e);
        alert('加载排名失败: ' + e.message);
    }
}
