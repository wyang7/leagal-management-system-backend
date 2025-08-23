/**
 * 加载案件管理页面
 */
function loadCaseManagementPage() {
    setActiveNav('案件管理');
    const mainContent = document.getElementById('mainContent');
    mainContent.innerHTML = `
        <div class="page-title">
            <h1>案件管理</h1>
        </div>
        
        <!-- 搜索和新增区域 -->
        <div class="row mb-3">
            <div class="col-md-6">
                <div class="input-group">
                    <input type="text" id="caseSearchInput" class="form-control" placeholder="输入案由搜索">
                    <button class="btn btn-primary" onclick="searchCases()">
                        <i class="fa fa-search"></i> 搜索
                    </button>
                </div>
            </div>
            <div class="col-md-6 text-end">
                <button class="btn btn-success" onclick="showAddCaseModal()">
                    <i class="fa fa-plus"></i> 新增案件
                </button>
            </div>
        </div>
        
        <!-- 案件状态筛选 -->
        <div class="row mb-3">
            <div class="col-md-12">
                <div class="btn-group" role="group">
                    <button class="btn btn-outline-primary" onclick="filterCases('all')">全部</button>
                    <button class="btn btn-outline-primary" onclick="filterCases('待发布')">待发布</button>
                    <button class="btn btn-outline-primary" onclick="filterCases('待领取')">待领取</button>
                    <button class="btn btn-outline-primary" onclick="filterCases('已领取')">已领取</button>
                    <button class="btn btn-outline-primary" onclick="filterCases('已完成')">已完成</button>
                </div>
            </div>
        </div>
        
        <!-- 案件表格 -->
        <div class="table-responsive">
            <table class="table table-striped table-hover">
                <thead class="table-dark">
                    <tr>
                        <th>案件ID</th>
                        <th>案件号</th>
                        <th>案由</th>
                        <th>标的额</th>
                        <th>案件归属地</th>
                        <th>法院收案时间</th>
                        <th>原告</th>
                        <th>被告</th>
                        <th>案件助理</th>
                        <th>关联案件包</th>
                        <th>状态</th>
                        <th>处理人</th>
                        <th>创建时间</th>
                        <th>操作</th>
                    </tr>
                </thead>
                <tbody id="caseTableBody">
                    <!-- 案件数据将通过JavaScript动态加载 -->
                    <tr>
                        <td colspan="8" class="text-center">加载中...</td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;
    
    // 创建案件模态框容器
    createCaseModalContainer();
    // 加载案件列表
    loadCases();
}

/**
 * 创建案件模态框容器
 */
function createCaseModalContainer() {
    if (!document.getElementById('caseModalContainer')) {
        const container = document.createElement('div');
        container.id = 'caseModalContainer';
        document.body.appendChild(container);
    }
}

/**
 * 加载案件列表
 */
async function loadCases() {
    try {
        const cases = await request('/case');
        renderCaseTable(cases);
    } catch (error) {
        document.getElementById('caseTableBody').innerHTML = `
            <tr><td colspan="8" class="text-center text-danger">加载案件失败</td></tr>
        `;
    }
}

/**
 * 根据案由搜索案件
 */
async function searchCases() {
    const caseName = document.getElementById('caseSearchInput').value.trim();
    try {
        let cases;
        if (caseName) {
            cases = await request(`/case/search?name=${encodeURIComponent(caseName)}`);
        } else {
            cases = await request('/case');
        }
        renderCaseTable(cases);
    } catch (error) {
        // 错误处理已在request函数中完成
    }
}

/**
 * 根据状态筛选案件
 */
async function filterCases(status) {
    try {
        let cases;
        if (status === 'all') {
            cases = await request('/case');
        } else {
            cases = await request(`/case/status/${status}`);
        }
        renderCaseTable(cases);
        
        // 更新按钮样式
        document.querySelectorAll('.btn-group .btn').forEach(btn => {
            btn.classList.remove('btn-primary');
            btn.classList.add('btn-outline-primary');
        });
        event.currentTarget.classList.remove('btn-outline-primary');
        event.currentTarget.classList.add('btn-primary');
    } catch (error) {
        // 错误处理已在request函数中完成
    }
}

/**
 * 渲染案件表格
 * @param {Array} cases 案件数组
 */
function renderCaseTable(cases) {
    const tableBody = document.getElementById('caseTableBody');
    
    if (!cases || cases.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="9" class="text-center">没有找到案件数据</td></tr>`;
        return;
    }
    
    let html = '';
    cases.forEach(caseInfo => {
        // 状态样式类
        let statusClass = '';
        switch (caseInfo.status) {
            case '待发布':
                statusClass = 'status-pending-release';
                break;
            case '待领取':
                statusClass = 'status-pending-receive';
                break;
            case '已领取':
                statusClass = 'status-received';
                break;
            case '已完成':
                statusClass = 'status-completed';
                break;
        }
        
        html += `
        <tr>
            <td>${caseInfo.caseId}</td>
            <td>${caseInfo.caseNumber}</td>
            <td>${caseInfo.caseName}</td>
            <td>${caseInfo.amount != null ? caseInfo.amount.toFixed(2) : '0.00'}</td>
            <td>${caseInfo.caseLocation || '-'}</td>
            <td>${caseInfo.courtReceiveTime ? new Date(caseInfo.courtReceiveTime).toLocaleString() : '-'}</td>
            <td>${caseInfo.plaintiffName || '-'}</td>
            <td>${caseInfo.defendantName || '-'}</td>
            <td>${caseInfo.assistantName || '-'}</td>
            <td>${caseInfo.taskId || '-'}</td>
            <td><span class="status-badge ${statusClass}">${caseInfo.status}</span></td>
            <td>${caseInfo.username || '-'}</td>
            <td>${caseInfo.createdTime ? new Date(caseInfo.createdTime).toLocaleString() : ''}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="showEditCaseModal(${caseInfo.caseId})">
                    <i class="fa fa-edit"></i> 编辑
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteCase(${caseInfo.caseId})">
                    <i class="fa fa-trash"></i> 删除
                </button>
                ${caseInfo.status === '待领取' ? `
                <button class="btn btn-sm btn-success" onclick="showReceiveCaseModal(${caseInfo.caseId})">
                    <i class="fa fa-handshake-o"></i> 领取
                </button>
                ` : ''}
                ${caseInfo.status === '已领取' ? `
                <button class="btn btn-sm btn-info" onclick="completeCase(${caseInfo.caseId})">
                    <i class="fa fa-check"></i> 完成
                </button>
                ` : ''}
                ${caseInfo.status === '待发布' ? `
                <button class="btn btn-sm btn-warning" onclick="publishCase(${caseInfo.caseId})">
                    <i class="fa fa-paper-plane"></i> 发布
                </button>
                ` : ''}
            </td>
        </tr>
        `;
    });
    
    tableBody.innerHTML = html;
}

/**
 * 加载任务列表（用于案件关联）
 */
async function loadTasksForCaseForm() {
    try {
        const tasks = await request('/task');
        let taskOptions = '<option value="">无（不关联案件包）</option>';
        tasks.forEach(task => {
            taskOptions += `<option value="${task.taskId}">${task.taskName} (ID: ${task.taskId})</option>`;
        });
        return taskOptions;
    } catch (error) {
        console.error('加载任务失败:', error);
        return '<option value="">加载任务失败</option>';
    }
}

/**
 * 创建案件表单模态框
 * @param {string} taskOptions 任务下拉框选项HTML
 * @param {string} assistantOptions 任务下拉框选项HTML
 */
function createCaseModal(taskOptions, assistantOptions) {
    const modalContainer = document.getElementById('caseModalContainer');
    
    if (!document.getElementById('caseModal')) {
        const modalHtml = `
        <!-- 案件表单模态框 -->
        <div class="modal fade" id="caseModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="caseModalTitle">新增案件</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form id="caseForm">
                            <input type="hidden" id="caseId">
                            <div class="form-group">
                                <label for="caseNumber">案件号（可选）</label>
                                <input type="text" id="caseNumber" class="form-control" required>
                            </div>
                            <div class="form-group">
                                <label for="caseName">案由</label>
                                <input type="text" id="caseName" class="form-control" required>
                            </div>
                            <div class="form-group">
                                <label for="caseAmount">标的额</label>
                                <input type="number" id="caseAmount" class="form-control" step="0.01" min="0" 
                                       placeholder="请输入金额，精确到小数点后两位">
                            </div>
                            <div class="form-group">
                                <label for="caseLocation">案件归属地</label>
                                <select id="caseLocation" class="form-control" required>
                                    <option value="">请选择归属地</option>
                                    <option value="九堡">九堡</option>
                                    <option value="彭埠">彭埠</option>
                                    <option value="笕桥">笕桥</option>
                                    <option value="本部">本部</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="courtReceiveTime">法院收案时间</label>
                                <input type="datetime-local" id="courtReceiveTime" class="form-control" required>
                            </div>
                            <div class="form-group">
                                <label for="plaintiffName">原告</label>
                                <input type="text" id="plaintiffName" class="form-control" required placeholder="请输入原告名称">
                            </div>
                            <div class="form-group">
                                <label for="defendantName">被告</label>
                                <input type="text" id="defendantName" class="form-control" required placeholder="请输入被告名称">
                            </div>
                            <div class="form-group">
                                <label for="caseAssistantId">案件助理（可选）</label>
                                <select id="caseAssistantId" class="form-control">
                                    ${assistantOptions}
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="caseTaskId">关联案件包（可选）</label>
                                <select id="caseTaskId" class="form-control">
                                    ${taskOptions}
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="caseStatus">案件状态</label>
                                <select id="caseStatus" class="form-control" required>
                                    <option value="待发布">待发布</option>
                                    <option value="待领取">待领取</option>
                                    <option value="已领取">已领取</option>
                                    <option value="已完成">已完成</option>
                                </select>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                        <button type="button" class="btn btn-primary" onclick="saveCase()">保存</button>
                    </div>
                </div>
            </div>
        </div>
        `;
        
        modalContainer.innerHTML = modalHtml;
    } else {
        // 更新任务下拉框
        document.getElementById('caseTaskId').innerHTML = taskOptions;
        document.getElementById('caseAssistantId').innerHTML = assistantOptions;
    }
}


// 加载案件助理（角色为案件助理的用户）
async function loadCaseAssistants() {
    try {
        const assistants = await request('/user/assistants');
        let assistantOptions = '<option value="">请选择案件助理</option>';
        assistants.forEach(assistant => {
            assistantOptions += `<option value="${assistant.userId}">${assistant.username}</option>`;
        });
        return assistantOptions;
    } catch (error) {
        console.error('加载案件助理失败:', error);
        return '<option value="">加载失败</option>';
    }
}

/**
 * 显示新增案件模态框
 */
async function showAddCaseModal() {
    const taskOptions = await loadTasksForCaseForm();
    const assistantOptions = await loadCaseAssistants();
    createCaseModal(taskOptions, assistantOptions);
    await loadCaseAssistants();
    
    // 重置表单
    document.getElementById('caseForm').reset();
    document.getElementById('caseId').value = '';
    document.getElementById('caseModalTitle').textContent = '新增案件';
    
    // 显示模态框
    const caseModal = new bootstrap.Modal(document.getElementById('caseModal'));
    caseModal.show();
}

/**
 * 显示编辑案件模态框
 * @param {number} caseId 案件ID
 */
async function showEditCaseModal(caseId) {
    try {
        const caseInfo = await request(`/case/${caseId}`);
        const taskOptions = await loadTasksForCaseForm();
        const assistantOptions = await loadCaseAssistants();
        createCaseModal(taskOptions,assistantOptions);
        await loadCaseAssistants();
        
        // 填充表单数据
        document.getElementById('handlerId').value = caseInfo.userId;
        document.getElementById('assistantId').value = caseInfo.assistantId;
        document.getElementById('caseId').value = caseInfo.caseId;
        document.getElementById('caseNumber').value = caseInfo.caseNumber;
        document.getElementById('caseName').value = caseInfo.caseName;
        document.getElementById('caseAmount').value = caseInfo.amount;
        document.getElementById('caseTaskId').value = caseInfo.taskId || '';
        document.getElementById('caseAssistantId').value = caseInfo.assistantId || '';
        document.getElementById('caseStatus').value = caseInfo.status;
        document.getElementById('caseUserId').value = caseInfo.userId || '';
        document.getElementById('caseModalTitle').textContent = '编辑案件';
        
        // 显示模态框
        const caseModal = new bootstrap.Modal(document.getElementById('caseModal'));
        caseModal.show();
    } catch (error) {
        // 错误处理已在request函数中完成
    }
}

/**
 * 保存案件（新增或编辑）
 */
async function saveCase() {
    // 获取表单数据
    const caseId = document.getElementById('caseId').value;
    const caseNumber = document.getElementById('caseNumber').value.trim();
    const caseName = document.getElementById('caseName').value.trim();
    const amount = parseFloat(document.getElementById('caseAmount').value) || 0;
    const taskId = document.getElementById('caseTaskId').value;
    const caseAssistantId = document.getElementById('caseAssistantId').value;
    const status = document.getElementById('caseStatus').value;
    
    // 简单验证
    if (!caseNumber) {
        alert('请输入案件号');
        return;
    }
    
    if (!caseName) {
        alert('请输入案由');
        return;
    }
    
    if (!status) {
        alert('请选择案件状态');
        return;
    }
    console.log("案件新增1");
    const caseData = {
        caseNumber: caseNumber,
        caseName: caseName,
        amount: amount,
        status: status,
        caseLocation: document.getElementById('caseLocation').value,
        courtReceiveTime: document.getElementById('courtReceiveTime').value,
        plaintiffName: document.getElementById('plaintiffName').value.trim(),
        defendantName: document.getElementById('defendantName').value.trim(),
        assistantId: caseAssistantId
    };
    console.log("案件新增2"+caseData);
    // 可选字段
    if (taskId) {
        caseData.taskId = parseInt(taskId);
    }
    console.log("案件新增3"+caseData);
    try {
        if (caseId) {
            // 编辑案件
            caseData.caseId = parseInt(caseId);
            await request('/case', 'PUT', caseData);
        } else {
            console.log("案件新增4"+caseData);
            // 新增案件
            await request('/case', 'POST', caseData);
        }
        
        // 关闭模态框
        const caseModal = bootstrap.Modal.getInstance(document.getElementById('caseModal'));
        caseModal.hide();
        
        // 重新加载案件列表
        loadCases();
        
        alert(caseId ? '案件更新成功' : '案件新增成功');
    } catch (error) {
        // 错误处理已在request函数中完成
    }
}

/**
 * 删除案件
 * @param {number} caseId 案件ID
 */
async function deleteCase(caseId) {
    if (!confirm('确定要删除这个案件吗？')) {
        return;
    }
    
    try {
        await request(`/case/${caseId}`, 'DELETE');
        // 重新加载案件列表
        loadCases();
        alert('案件删除成功');
    } catch (error) {
        // 错误处理已在request函数中完成
    }
}

/**
 * 显示领取案件模态框
 * @param {number} caseId 案件ID
 */
function showReceiveCaseModal(caseId) {
    // 创建领取案件模态框
    const modalHtml = `
    <div class="modal fade" id="receiveCaseModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">领取案件</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <input type="hidden" id="receiveCaseId" value="${caseId}">
                    <div class="form-group">
                        <label for="receiveUserId">用户ID</label>
                        <input type="number" id="receiveUserId" class="form-control" required placeholder="请输入领取案件的用户ID">
                    </div>
                    <p class="text-muted mt-2">请输入要领取此案件的用户ID，领取后案件状态将变为"已领取"</p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                    <button type="button" class="btn btn-primary" onclick="confirmReceiveCase()">确认领取</button>
                </div>
            </div>
        </div>
    </div>
    `;
    
    // 添加到页面
    const tempContainer = document.createElement('div');
    tempContainer.innerHTML = modalHtml;
    document.body.appendChild(tempContainer);
    
    // 显示模态框
    const receiveModal = new bootstrap.Modal(document.getElementById('receiveCaseModal'));
    receiveModal.show();
    
    // 模态框关闭后移除
    document.getElementById('receiveCaseModal').addEventListener('hidden.bs.modal', function() {
        tempContainer.remove();
    });
}

/**
 * 确认领取案件
 */
async function confirmReceiveCase() {
    const caseId = document.getElementById('receiveCaseId').value;
    const userId = document.getElementById('receiveUserId').value.trim();
    
    if (!userId || isNaN(userId)) {
        alert('请输入有效的用户ID');
        return;
    }
    
    try {
        await request('/case/receive', 'POST', {
            caseId: parseInt(caseId),
            userId: parseInt(userId)
        });
        
        // 关闭模态框
        const receiveModal = bootstrap.Modal.getInstance(document.getElementById('receiveCaseModal'));
        receiveModal.hide();
        
        // 重新加载案件列表
        loadCases();
        alert('案件领取成功');
    } catch (error) {
        // 错误处理已在request函数中完成
    }
}

/**
 * 发布案件（状态从待发布变为待领取）
 * @param {number} caseId 案件ID
 */
async function publishCase(caseId) {
    if (!confirm('确定要发布这个案件吗？发布后状态将变为"待领取"')) {
        return;
    }
    
    try {
        await request('/case/update-status', 'POST', {
            caseId: caseId,
            status: '待领取'
        });
        
        // 重新加载案件列表
        loadCases();
        alert('案件发布成功');
    } catch (error) {
        // 错误处理已在request函数中完成
    }
}

/**
 * 完成案件（状态从已领取变为已完成）
 * @param {number} caseId 案件ID
 */
async function completeCase(caseId) {
    if (!confirm('确定要标记这个案件为已完成吗？')) {
        return;
    }
    
    try {
        await request('/case/update-status', 'POST', {
            caseId: caseId,
            status: '已完成'
        });
        
        // 重新加载案件列表
        loadCases();
        alert('案件已标记为已完成');
    } catch (error) {
        // 错误处理已在request函数中完成
    }
}
    