// 我的工作区页面
// 依赖：request函数、Ant Design样式、现有用户角色判断逻辑

// 页面入口
function loadWorkspacePage() {
    setActiveNav('我的工作区');
    const mainContent = document.getElementById('mainContent');
    mainContent.innerHTML = `
        <div class="ant-card ant-card-bordered mb-4" style="border-radius:8px;box-shadow:0 2px 8px #f0f1f2;">
            <div class="ant-card-body">
                <div id="workspaceRoleInfo" class="mb-3"></div>
                <div id="workspaceCards" class="row g-3 mb-4"></div>
                <div id="workspaceDashboard" class="mt-2"></div>
            </div>
        </div>
    `;
    renderWorkspaceContent();
}

// 渲染工作区内容
async function renderWorkspaceContent() {
    // 获取当前用户信息
    const userInfo = await request('/auth/currentUser');
    const roleType = userInfo.roleType;
    const username = userInfo.username;
    // 顶部角色信息
    document.getElementById('workspaceRoleInfo').innerHTML = `
        <div class="d-flex align-items-center gap-3">
            <span class="ant-tag ant-tag-blue">角色：${roleType}</span>
            <span class="ant-tag ant-tag-green">用户：${username}</span>
        </div>
    `;
    // 管理员
    if (isSystemAdmin(userInfo)) {
        const stations = await getAdminStations(userInfo); // 根据驻点权限过滤
        await renderAdminWorkspace(stations);
    } else if (isMediator(userInfo)) {
        await renderMediatorWorkspace(username);
    }
}

// 根据管理员角色驻点权限获取可展示的驻点列表
async function getAdminStations(userInfo) {
    // 参考 index.html 中的 loadUserStationAndControlMenu 逻辑
    try {
        if (!userInfo.roleId) {
            return []; // 无角色ID无法判定
        }
        const role = await request(`/role/${userInfo.roleId}`);
        const station = role.station; // 可能为 "总部"、"九堡彭埠"、"本部"、"笕桥" 或其他
        const allStations = ['九堡','彭埠','本部','笕桥'];
        if (!station || station === '总部') {
            // 总部管理员显示全部驻点
            return allStations;
        }
        if (station === '九堡彭埠') {
            // 合并驻点需要拆分成两个展示块
            return ['九堡','彭埠'];
        }
        // 如果是单一驻点且在允许列表中
        if (allStations.includes(station)) {
            return [station];
        }
        // 兜底：未知驻点不展示
        return [];
    } catch (e) {
        console.error('获取管理员驻点权限失败:', e);
        return [];
    }
}

// 管理员工作区卡片（合并一行展示，统一样式）
async function renderAdminWorkspace(stations) {
    if (!stations || stations.length === 0) {
        document.getElementById('workspaceCards').innerHTML = `
            <div class="alert alert-warning mb-0">未匹配到可展示的驻点，或当前角色无驻点权限。</div>
        `;
        return;
    }
    // 统计数据，支持九堡+彭埠合并为一行显示
    const stats = [];
    const hasJiubao = stations.includes('九堡');
    const hasPengbu = stations.includes('彭埠');
    if (hasJiubao && hasPengbu) {
        // 汇总九堡与彭埠
        const jbReturn = await getCaseCountByStatus('九堡', '退回');
        const pbReturn = await getCaseCountByStatus('彭埠', '退回');
        const jbClose = await getCaseCountByStatus('九堡', '待结案');
        const pbClose = await getCaseCountByStatus('彭埠', '待结案');
        stats.push({station: '九堡彭埠', returnCount: jbReturn + pbReturn, closeCount: jbClose + pbClose});
    }
    // 其它驻点（排除已合并的）
    for (const station of stations) {
        if ((station === '九堡' || station === '彭埠') && hasJiubao && hasPengbu) {
            continue; // 已合并跳过单项
        }
        const returnCount = await getCaseCountByStatus(station, '退回');
        const closeCount = await getCaseCountByStatus(station, '待结案');
        stats.push({station, returnCount, closeCount});
    }
    // 合并展示区块
    document.getElementById('workspaceCards').innerHTML = `
        <div class="ant-card mb-4" style="border-radius:10px;box-shadow:0 4px 16px #f0f1f2;">
            <div class="ant-card-body">
                <div class="d-flex align-items-center mb-2 gap-3">
                    <i class="fa fa-bar-chart text-primary" style="font-size:1.5rem;"></i>
                    <span class="fw-bold" style="font-size:1.2rem;">各驻点案件统计</span>
                </div>
                <table class="table table-bordered table-sm text-center mb-0" style="border-radius:6px;overflow:hidden;">
                    <thead class="table-light">
                        <tr>
                            <th style="width:20%">驻点</th>
                            <th style="width:40%"><i class="fa fa-undo text-danger me-1"></i>退回案件</th>
                            <th style="width:40%"><i class="fa fa-hourglass-half text-warning me-1"></i>待结案案件</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${stats.map(r=>`
                            <tr>
                                <td class="align-middle">${r.station}</td>
                                <td class="align-middle">
                                    <button class="ant-btn ant-btn-link fw-bold text-danger px-2 py-1" style="font-size:0.95rem;border-radius:16px;" onclick="jumpToCasePage('${r.station}','退回')" title="点击查看退回案件">
                                        ${r.returnCount}件 <i class='fa fa-arrow-right ms-1'></i>
                                    </button>
                                </td>
                                <td class="align-middle">
                                    <button class="ant-btn ant-btn-link fw-bold text-warning px-2 py-1" style="font-size:0.95rem;border-radius:16px;" onclick="jumpToCasePage('${r.station}','待结案')" title="点击查看待结案">
                                        ${r.closeCount}件 <i class='fa fa-arrow-right ms-1'></i>
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
    // 渲染管理员大盘
    renderAdminDashboard(stations);
}

// 调解员工作区卡片（统一样式）
async function renderMediatorWorkspace(username) {
    // 待处理案件数（已领取/反馈/延期）
    const todoCount = await getMyCaseCount(username);
    // 即将超时案件数
    const timeoutCount = await getMyTimeoutCaseCount(username);
    document.getElementById('workspaceCards').innerHTML = `
        <div class="row g-3 mb-3">
            <div class="col-md-6">
                <div class="ant-card ant-card-hoverable" style="border-radius:10px;box-shadow:0 4px 16px #e6f7ff;cursor:pointer;">
                    <div class="ant-card-body text-center">
                        <div class="fw-bold mb-1"><i class="fa fa-tasks text-primary me-1"></i>待处理案件</div>
                        <button class="ant-btn ant-btn-link fw-bold text-primary px-2 py-1" style="font-size:0.95rem;border-radius:16px;" onclick="jumpToMyCasesPage()" title="点击查看待处理案件">${todoCount}件 <i class='fa fa-arrow-right ms-1'></i></button>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="ant-card ant-card-hoverable" style="border-radius:10px;box-shadow:0 4px 16px #fffbe6;cursor:pointer;">
                    <div class="ant-card-body text-center">
                        <div class="fw-bold mb-1"><i class="fa fa-clock-o text-warning me-1"></i>即将超时案件</div>
                        <button class="ant-btn ant-btn-link fw-bold text-warning px-2 py-1" style="font-size:0.95rem;border-radius:16px;" onclick="jumpToMyCasesPage(true)" title="点击查看即将超时案件">${timeoutCount}件 <i class='fa fa-arrow-right ms-1'></i></button>
                    </div>
                </div>
            </div>
        </div>`;
    renderMediatorDashboard(username);
}

// 跳转案件管理页面并自动筛选
function jumpToCasePage(station, status) {
    loadCaseManagementPage(station, status);
}
// 跳转我的案件页面
function jumpToMyCasesPage(timeout) {
    loadMyCasesPage(timeout === true);
}

// 获取指定驻点、状态的案件数
async function getCaseCountByStatus(station, status) {
    const params = new URLSearchParams();
    params.append('station', station);
    params.append('status', status);
    params.append('pageNum', 1);
    params.append('pageSize', 1);
    const resp = await request(`/case/page?${params.toString()}`);
    return resp.total || 0;
}
// 获取调解员待处理案件数（修正统计，避免分页限制）
async function getMyCaseCount(username) {
    const params = new URLSearchParams();
    params.append('userName', username);
    params.append('pageNum', 1);
    params.append('pageSize', 1);
    params.append('status', "我的案件");
    const resp = await request(`/case/page?${params.toString()}`);
    return resp.total || 0;
}
// 获取调解员即将超时案件数（参考现有超时逻辑）
async function getMyTimeoutCaseCount(username) {
    const params = new URLSearchParams();
    params.append('userName', username);
    params.append('timeout', 'true');
    params.append('pageNum', 1);
    params.append('pageSize', 1);
    const resp = await request(`/case/page?${params.toString()}`);
    return resp.total || 0;
}

// 角色判断（参考index.html逻辑）
function isSystemAdmin(userInfo) {
    return userInfo.roleType === '管理员' || (userInfo.roleType && userInfo.roleType.includes('管理员'));
}
function isMediator(userInfo) {
    return userInfo.roleType === '调解员' || (userInfo.roleType && userInfo.roleType.includes('调解员'));
}

// ===== 图表数据与渲染 =====
// 管理员大盘布局 & 图表初始化
function renderAdminDashboard(stations) {
    const container = document.getElementById('workspaceDashboard');
    if (!container) return;
    const pieRowId = 'adminStationPieRow';
    container.innerHTML = `
        <div class="dashboard-grid" id="adminTopRow">
            <div class="dashboard-item" id="adminTotalCompareBox">
                <div class="dashboard-item-header"><i class="fa fa-bars icon text-primary"></i><span>驻点案件总量对比</span></div>
                <div id="adminTotalCompare" class="chart-container"></div>
            </div>
            <div class="dashboard-item" id="adminReturnTrendBox">
                <div class="dashboard-item-header"><i class="fa fa-line-chart icon text-danger"></i><span>退回案件趋势 (近7天)</span></div>
                <div id="adminReturnTrend" class="chart-container"></div>
            </div>
            <div class="dashboard-item" id="adminCloseEfficiencyBox">
                <div class="dashboard-item-header"><i class="fa fa-hourglass icon text-warning"></i><span>待结案时效对比</span><span class="threshold-legend" id="closeDurationThresholdTip"></span></div>
                <div id="adminCloseEfficiency" class="chart-container"></div>
            </div>
        </div>
        <div class="dashboard-item large mt-3" style="padding:12px;" id="adminStatusDistributionWrapper">
            <div class="dashboard-item-header"><i class="fa fa-pie-chart icon text-success"></i><span>案件状态分布</span></div>
            <div class="station-pies-row" id="${pieRowId}"></div>
        </div>
    `;
    loadAdminChartsData(stations);
}

async function loadAdminChartsData(stations) {
    // 1. 驻点案件总量对比
    const totalCounts = await Promise.all(stations.map(st => fetchCaseTotal(st)));
    ChartUtils.createBarChart('adminTotalCompare',{ horizontal:true, xData:stations, yData: totalCounts, onClick: p => loadCaseManagementPage(p.name) });
    // 2. 退回案件趋势 近7天
    const last7 = getRecentDays(7);
    const seriesReturn = await Promise.all(stations.map(async st => ({ name: st, data: await Promise.all(last7.map(day => fetchDailyStatusCount(st,'退回', day))) })));
    ChartUtils.createMultiLineChart('adminReturnTrend',{ legend: stations, xData: last7, seriesData: seriesReturn });
    // 3. 待结案时效对比（平均处理时长= 当前时间-领取时间 针对 status=待结案 ）
    const avgDurationsRaw = await Promise.all(stations.map(st => computeAvgPendingDuration(st)));
    const threshold = Math.round(avgDurationsRaw.filter(v=>v>0).reduce((a,b)=>a+b,0)/Math.max(1,avgDurationsRaw.filter(v=>v>0).length));
    document.getElementById('closeDurationThresholdTip').innerText = '阈值:'+threshold+'天';
    const barDuration = ChartUtils.createBarChart('adminCloseEfficiency',{ xData:stations, yData:avgDurationsRaw, colors:['#69b1ff'], onClick:p=> loadCaseManagementPage(p.name,'待结案') });
    // 将超过阈值的柱子标红
    if (barDuration) {
        const seriesData = avgDurationsRaw.map(v => ({ value:v, itemStyle: v>threshold? { color:'#ff4d4f'}: {} }));
        barDuration.chart.setOption({ series:[{ type:'bar', data:seriesData, barMaxWidth:42 }] });
    }
    // 4. 各驻点状态分布 (环形饼图：退回/待结案/结案/已领取/延期/反馈)
    const statusList = ['退回','待结案','结案','已领取','延期','反馈'];
    const pieRow = document.getElementById('adminStationPieRow');
    stations.forEach(st => { pieRow.insertAdjacentHTML('beforeend', `<div class="dashboard-item" style="flex:0 0 320px; min-width:300px;">
        <div class="dashboard-item-header" style="margin-bottom:0;">${st}</div><div id="pie_${st}" class="chart-container small"></div></div>`); });
    for (const st of stations) {
        const counts = await Promise.all(statusList.map(s => fetchStatusCount(st,s)));
        const data = statusList.map((s,i)=> ({ name:s, value:counts[i] }));
        ChartUtils.createPieChart('pie_'+st,{ data, ring:true, legendBottom:true, onClick: p => { loadCaseManagementPage(st, p.name); }, onLegendClick: status => loadCaseManagementPage(st, status) });
    }
}

// 调解员大盘
function renderMediatorDashboard(username) {
    const container = document.getElementById('workspaceDashboard');
    if (!container) return;
    container.innerHTML = `
        <div class="dashboard-grid" id="mediatorTopRow">
            <div class="dashboard-item" id="mediatorStatusPieBox">
                <div class="dashboard-item-header"><i class="fa fa-pie-chart icon text-primary"></i><span>个人案件状态分布</span></div>
                <div id="mediatorStatusPie" class="chart-container"></div>
            </div>
            <div class="dashboard-item" id="mediatorTimeoutTrendBox">
                <div class="dashboard-item-header"><i class="fa fa-exclamation-triangle icon text-danger"></i><span>即将超时案件预警 (近7天)</span></div>
                <div id="mediatorTimeoutTrend" class="chart-container"></div>
            </div>
            <div class="dashboard-item" id="mediatorEfficiencyTrendBox">
                <div class="dashboard-item-header"><i class="fa fa-bar-chart icon text-success"></i><span>处理效率趋势 (近30天)</span></div>
                <div id="mediatorEfficiencyTrend" class="chart-container"></div>
            </div>
        </div>
    `;
    loadMediatorChartsData(username);
}

async function loadMediatorChartsData(username) {
    // 1. 个人案件状态分布 已领取/反馈/延期/待结案
    const statuses = ['已领取','反馈','延期','待结案'];
    const counts = await Promise.all(statuses.map(s=> fetchStatusCountForUser(username,s)));
    ChartUtils.createPieChart('mediatorStatusPie',{ data: statuses.map((s,i)=> ({ name:s, value:counts[i] })), ring:true, legendBottom:true, onClick:p=> { loadMyCasesPage(); setTimeout(()=> filterMyCases(p.name), 50); } });
    // 2. 即将超时案件预警 近7天 (含案件ID列表 tooltip 展示)
    const days = getRecentDays(7);
    const timeoutDayData = await Promise.all(days.map(day => fetchTimeoutCasesForDay(username, day)));
    const timeoutSeriesCounts = timeoutDayData.map(d=> d.count);
    const line = ChartUtils.createMultiLineChart('mediatorTimeoutTrend',{ legend:['即将超时'], xData:days, seriesData:[{ name:'即将超时', data: timeoutSeriesCounts }] });
    const colored = timeoutSeriesCounts.map((v,idx)=> v>3? { value:v, itemStyle:{ color:'#ff4d4f' }, caseIds: timeoutDayData[idx].ids }: { value:v, caseIds: timeoutDayData[idx].ids });
    line.chart.setOption({
        series:[{ name:'即将超时', type:'line', smooth:true, data: colored, showSymbol:true }],
        tooltip:{
            trigger:'axis',
            formatter: params => {
                return params.map(p=> {
                    const ids = (p.data.caseIds||[]).slice(0,10).join(',');
                    const more = (p.data.caseIds||[]).length>10? ' 等'+p.data.caseIds.length+'件':'';
                    return `${p.marker}${p.axisValue}<br/>${p.seriesName}: ${p.data.value}件` + (ids? `<br/>案件ID: ${ids}${more}`:'');
                }).join('<br/>');
            }
        }
    });
    // 3. 处理效率趋势 近30天每日结案数
    const days30 = getRecentDays(30);
    const closedCounts = await Promise.all(days30.map(day=> fetchClosedCountForDay(username, day)));
    const avg = closedCounts.reduce((a,b)=>a+b,0)/Math.max(1, closedCounts.length);
    ChartUtils.createBarWithAvg('mediatorEfficiencyTrend',{ xData:days30, yData:closedCounts, avg });
}

// ===== 数据辅助函数 =====
function getRecentDays(n) { const arr=[]; for (let i=n-1;i>=0;i--) { const d=new Date(Date.now()-i*86400000); arr.push(d.toISOString().slice(5,10)); } return arr; }

async function fetchCaseTotal(station) { return getCaseCountByStationAndNoStatus(station); }
async function fetchStatusCount(station, status) { return getCaseCountByStatus(station, status); }
async function fetchDailyStatusCount(station, status, dayMMDD) {
    // assume court_receive_time format includes yyyy-MM-dd ; filter by receive date substring
    const year = new Date().getFullYear();
    const day = year+'-'+dayMMDD.replace('/','-');
    const params = new URLSearchParams();
    params.append('station', station);
    params.append('status', status);
    params.append('receiveTime', day); // 后端 LIKE %receiveTime%
    params.append('pageNum',1); params.append('pageSize',1);
    const resp = await request(`/case/page?${params.toString()}`);
    return resp?.total || 0;
}
async function computeAvgPendingDuration(station) {
    const params = new URLSearchParams();
    params.append('station', station);
    params.append('status','待结案');
    params.append('pageNum',1); params.append('pageSize',1000);
    const resp = await request(`/case/page?${params.toString()}`);
    const records = resp?.records || [];
    if (!records.length) return 0;
    const now = Date.now();
    let sum = 0, count=0;
    records.forEach(r=> {
        let baseTime = r.receiveTime || r.courtReceiveTime; // 优先领取时间，缺失则使用收案时间
        if (baseTime) {
            const ts = new Date(baseTime).getTime();
            if (!isNaN(ts)) { sum += Math.max(0, Math.floor((now - ts)/86400000)); count++; }
        }
    });
    return count? Math.round(sum/count): 0;
}
async function getCaseCountByStationAndNoStatus(station) {
    const params = new URLSearchParams();
    params.append('station', station);
    params.append('pageNum',1); params.append('pageSize',1);
    const resp = await request(`/case/page?${params.toString()}`); return resp?.total || 0; }

async function fetchStatusCountForUser(username, status) {
    const params = new URLSearchParams();
    params.append('userName', username);
    params.append('status', status);
    params.append('pageNum',1); params.append('pageSize',1);
    const resp = await request(`/case/page?${params.toString()}`); return resp?.total || 0;
}
async function fetchTimeoutCountForDay(username, dayMMDD) {
    // 后端 timeout=true 仅支持当前时间窗口; 无日期过滤, 近似用整体; 这里按领取时间过滤估算
    const year = new Date().getFullYear();
    const day = year+'-'+dayMMDD.replace('/','-');
    const params = new URLSearchParams();
    params.append('userName', username);
    params.append('timeout','true');
    params.append('receiveTime', day);
    params.append('pageNum',1); params.append('pageSize',1);
    const resp = await request(`/case/page?${params.toString()}`); return resp?.total || 0;
}
async function fetchClosedCountForDay(username, dayMMDD) {
    const year = new Date().getFullYear();
    const day = year+'-'+dayMMDD.replace('/','-');
    const params = new URLSearchParams();
    params.append('userName', username);
    params.append('status','结案');
    params.append('receiveTime', day); // 使用 court_receive_time LIKE 过滤
    params.append('pageNum',1); params.append('pageSize',1);
    const resp = await request(`/case/page?${params.toString()}`); return resp?.total || 0;
}
async function fetchTimeoutCasesForDay(username, dayMMDD) {
    const year = new Date().getFullYear();
    const day = year+'-'+dayMMDD.replace('/','-');
    const params = new URLSearchParams();
    params.append('userName', username);
    params.append('timeout','true');
    params.append('receiveTime', day);
    params.append('pageNum',1); params.append('pageSize',500); // 扩大以获取列表
    const resp = await request(`/case/page?${params.toString()}`);
    return { count: resp?.total || 0, ids: (resp?.records||[]).map(r=> r.caseId) };
}
