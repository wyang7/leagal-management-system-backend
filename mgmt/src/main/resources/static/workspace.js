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
                <div id="workspaceCards" class="row g-3"></div>
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
    const stationList = userInfo.stationList || ['九堡','彭埠','本部','笕桥'];
    // 顶部角色信息
    document.getElementById('workspaceRoleInfo').innerHTML = `
        <div class="d-flex align-items-center gap-3">
            <span class="ant-tag ant-tag-blue">角色：${roleType}</span>
            <span class="ant-tag ant-tag-green">用户：${username}</span>
        </div>
    `;
    // 管理员
    if (isSystemAdmin(userInfo)) {
        await renderAdminWorkspace(stationList);
    } else if (isMediator(userInfo)) {
        await renderMediatorWorkspace(username);
    }
}

// 管理员工作区卡片（合并一行展示，统一样式）
async function renderAdminWorkspace(stationList) {
    // 统计数据
    const stats = [];
    for (const station of stationList) {
        const returnCount = await getCaseCountByStatus(station, '退回');
        const closeCount = await getCaseCountByStatus(station, '待结案');
        stats.push({station, returnCount, closeCount});
    }
    // 合并展示区块
    let block = `
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
                                    <span class="badge bg-danger clickable-badge" style="font-size:1.1rem;cursor:pointer;padding:8px 18px;border-radius:20px;box-shadow:0 2px 8px #ffe7e7;font-weight:500;" onclick="jumpToCasePage('${r.station}','退回')" title="点击查看退回案件">${r.returnCount}件 <i class='fa fa-arrow-right ms-1'></i></span>
                                </td>
                                <td class="align-middle">
                                    <span class="badge bg-warning text-dark clickable-badge" style="font-size:1.1rem;cursor:pointer;padding:8px 18px;border-radius:20px;box-shadow:0 2px 8px #fffbe6;font-weight:500;" onclick="jumpToCasePage('${r.station}','待结案')" title="点击查看待结案">${r.closeCount}件 <i class='fa fa-arrow-right ms-1'></i></span>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
    document.getElementById('workspaceCards').innerHTML = block;
}

// 调解员工作区卡片（统一样式）
async function renderMediatorWorkspace(username) {
    // 待处理案件数（已领取/反馈/延期）
    const todoCount = await getMyCaseCount(username, );
    // 即将超时案件数
    const timeoutCount = await getMyTimeoutCaseCount(username);
    document.getElementById('workspaceCards').innerHTML = `
        <div class="row g-3">
            <div class="col-md-6">
                <div class="ant-card ant-card-hoverable" style="border-radius:10px;box-shadow:0 4px 16px #e6f7ff;cursor:pointer;">
                    <div class="ant-card-body text-center">
                        <div class="fw-bold mb-1"><i class="fa fa-tasks text-primary me-1"></i>待处理案件</div>
                        <span class="badge bg-primary clickable-badge" style="font-size:1.3rem;cursor:pointer;padding:10px 24px;border-radius:20px;box-shadow:0 2px 8px #bae7ff;font-weight:500;" onclick="jumpToMyCasesPage()" title="点击查看待处理案件">${todoCount}件 <i class='fa fa-arrow-right ms-1'></i></span>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="ant-card ant-card-hoverable" style="border-radius:10px;box-shadow:0 4px 16px #fffbe6;cursor:pointer;">
                    <div class="ant-card-body text-center">
                        <div class="fw-bold mb-1"><i class="fa fa-clock-o text-warning me-1"></i>即将超时案件</div>
                        <span class="badge bg-warning text-dark clickable-badge" style="font-size:1.3rem;cursor:pointer;padding:10px 24px;border-radius:20px;box-shadow:0 2px 8px #fffbe6;font-weight:500;" onclick="jumpToMyCasesPage()" title="点击查看即将超时案件">${timeoutCount}件 <i class='fa fa-arrow-right ms-1'></i></span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// 跳转案件管理页面并自动筛选
function jumpToCasePage(station, status) {
    loadCaseManagementPage(station, status);
}
// 跳转我的案件页面
function jumpToMyCasesPage() {
    loadMyCasesPage();
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
    const resp = await request(`/case/page?${params.toString()}`);
    return resp.total || 0;
}
// 获取调解员即将超时案件数（参考现有超时逻辑）
async function getMyTimeoutCaseCount(username) {
    // 这里假设后端有超时标记字段，或前端可根据receiveTime判断
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
    return userInfo.roleType === '管理员';
}
function isMediator(userInfo) {
    return userInfo.roleType === '调解员';
}
