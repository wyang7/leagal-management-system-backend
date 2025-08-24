/**
 * 加载案件包页面
 */
function loadTaskManagementPage() {
    setActiveNav('案件包');
    const mainContent = document.getElementById('mainContent');
    mainContent.innerHTML = `
        <div class="page-title">
            <h1>案件包</h1>
        </div>
        
        <!-- 新增案件包按钮 -->
        <div class="row mb-3">
            <div class="col-md-12 text-end">
                <button class="btn btn-success" onclick="showAddTaskModal()">
                    <i class="fa fa-plus"></i> 新增案件包
                </button>
            </div>
        </div>
        
        <!-- 任务表格 -->
        <div class="table-responsive">
            <table class="table table-striped table-hover">
                <thead class="table-dark">
                    <tr>
                        <th>任务ID</th>
                        <th>任务名</th>
                        <th>创建时间</th>
                        <th>关联案件数</th>
                        <th>操作</th>
                    </tr>
                </thead>
                <tbody id="taskTableBody">
                    <!-- 任务数据将通过JavaScript动态加载 -->
                    <tr>
                        <td colspan="5" class="text-center">加载中...</td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;
    
    // 创建任务模态框容器
    createTaskModalContainer();
    // 加载任务列表
    loadTasks();
}

/**
 * 创建任务模态框容器
 */
function createTaskModalContainer() {
    if (!document.getElementById('taskModalContainer')) {
        const container = document.createElement('div');
        container.id = 'taskModalContainer';
        document.body.appendChild(container);
    }
}

/**
 * 加载任务列表
 */
async function loadTasks() {
    try {
        const tasks = await request('/task');
        renderTaskTable(tasks);
    } catch (error) {
        document.getElementById('taskTableBody').innerHTML = `
            <tr><td colspan="5" class="text-center text-danger">加载任务失败</td></tr>
        `;
    }
}

/**
 * 渲染任务表格
 * @param {Array} tasks 任务数组
 */
function renderTaskTable(tasks) {
    const tableBody = document.getElementById('taskTableBody');
    
    if (!tasks || tasks.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" class="text-center">没有找到任务数据</td></tr>`;
        return;
    }
    
    let html = '';
    tasks.forEach(task => {
        html += `
        <tr>
            <td>${task.taskId}</td>
            <td>${task.taskName}</td>
            <td>${task.createdTime ? new Date(task.createdTime).toLocaleString() : ''}</td>
            <td>${task.caseCount || 0}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="showEditTaskModal(${task.taskId})">
                    <i class="fa fa-edit"></i> 编辑
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteTask(${task.taskId})">
                    <i class="fa fa-trash"></i> 删除
                </button>
                <button class="btn btn-sm btn-info" onclick="showAssignCasesToTaskModal(${task.taskId})">
                    <i class="fa fa-gavel"></i> 关联案件
                </button>
            </td>
        </tr>
        `;
    });
    
    tableBody.innerHTML = html;
}

/**
 * 创建任务表单模态框
 */
function createTaskModal() {
    const modalContainer = document.getElementById('taskModalContainer');
    
    // 检查模态框是否已存在，如果不存在则创建
    if (!document.getElementById('taskModal')) {
        const modalHtml = `
        <!-- 任务表单模态框 -->
        <div class="modal fade" id="taskModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="taskModalTitle">新增案件包</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form id="taskForm">
                            <input type="hidden" id="taskId">
                            <div class="form-group">
                                <label for="taskName">任务名</label>
                                <input type="text" id="taskName" class="form-control" required>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                        <button type="button" class="btn btn-primary" onclick="saveTask()">保存</button>
                    </div>
                </div>
            </div>
        </div>
        `;
        
        modalContainer.innerHTML = modalHtml;
    }
}

/**
 * 显示新增案件包模态框
 */
function showAddTaskModal() {
    createTaskModal();
    
    // 重置表单
    document.getElementById('taskForm').reset();
    document.getElementById('taskId').value = '';
    document.getElementById('taskModalTitle').textContent = '新增案件包';
    
    // 显示模态框
    const taskModal = new bootstrap.Modal(document.getElementById('taskModal'));
    taskModal.show();
}

/**
 * 显示编辑任务模态框
 * @param {number} taskId 任务ID
 */
async function showEditTaskModal(taskId) {
    createTaskModal();
    
    try {
        const task = await request(`/task/${taskId}`);
        
        // 填充表单数据
        document.getElementById('taskId').value = task.taskId;
        document.getElementById('taskName').value = task.taskName;
        document.getElementById('taskModalTitle').textContent = '编辑任务';
        
        // 显示模态框
        const taskModal = new bootstrap.Modal(document.getElementById('taskModal'));
        taskModal.show();
    } catch (error) {
        // 错误处理已在request函数中完成
    }
}

/**
 * 保存任务（新增或编辑）
 */
async function saveTask() {
    // 获取表单数据
    const taskId = document.getElementById('taskId').value;
    const taskName = document.getElementById('taskName').value.trim();
    
    // 简单验证
    if (!taskName) {
        alert('请输入任务名');
        return;
    }
    
    const taskData = {
        taskName: taskName
    };
    
    try {
        if (taskId) {
            // 编辑案件包
            taskData.taskId = parseInt(taskId);
            await request('/task', 'PUT', taskData);
        } else {
            // 新增案件包
            await request('/task', 'POST', taskData);
        }
        
        // 关闭模态框
        const taskModal = bootstrap.Modal.getInstance(document.getElementById('taskModal'));
        taskModal.hide();
        
        // 重新加载任务列表
        loadTasks();
        
        alert(taskId ? '任务更新成功' : '任务新增成功');
    } catch (error) {
        // 错误处理已在request函数中完成
    }
}

/**
 * 删除任务
 * @param {number} taskId 任务ID
 */
async function deleteTask(taskId) {
    if (!confirm('确定要删除这个任务吗？关联的案件将不再属于任何任务！')) {
        return;
    }
    
    try {
        await request(`/task/${taskId}`, 'DELETE');
        // 重新加载任务列表
        loadTasks();
        alert('任务删除成功');
    } catch (error) {
        // 错误处理已在request函数中完成
    }
}

/**
 * 显示关联案件给任务的模态框
 * @param {number} taskId 任务ID
 */
async function showAssignCasesToTaskModal(taskId) {
    try {
        // 获取所有案件
        const cases = await request('/case');
        // 获取当前任务信息
        const task = await request(`/task/${taskId}`);
        
        // 分离已关联和未关联的案件
        const assignedCases = cases.filter(c => c.taskId === taskId);
        const unassignedCases = cases.filter(c => !c.taskId || c.taskId !== taskId);
        
        // 创建案件列表HTML
        let casesHtml = `
        <div class="row">
            <div class="col-md-6">
                <h6>未关联案件</h6>
                <div class="list-group" style="max-height: 300px; overflow-y: auto;">
        `;
        
        if (unassignedCases.length > 0) {
            unassignedCases.forEach(caseInfo => {
                casesHtml += `
                <div class="list-group-item d-flex justify-content-between align-items-center">
                     (ID: ${caseInfo.caseId}) ${caseInfo.caseName} (标的额: ${caseInfo.amount})
                    <button class="btn btn-sm btn-primary" onclick="assignCaseToTask(${caseInfo.caseId}, ${taskId})">
                        <i class="fa fa-plus"></i>
                    </button>
                </div>
                `;
            });
        } else {
            casesHtml += `<div class="list-group-item text-muted">没有可关联的案件</div>`;
        }
        
        casesHtml += `
                </div>
            </div>
            <div class="col-md-6">
                <h6>已关联案件</h6>
                <div class="list-group" style="max-height: 300px; overflow-y: auto;">
        `;
        
        if (assignedCases.length > 0) {
            assignedCases.forEach(caseInfo => {
                casesHtml += `
                <div class="list-group-item d-flex justify-content-between align-items-center">
                    (ID: ${caseInfo.caseId}) ${caseInfo.caseName} (标的额: ${caseInfo.amount})
                    <button class="btn btn-sm btn-danger" onclick="unassignCaseFromTask(${caseInfo.caseId})">
                        <i class="fa fa-minus"></i>
                    </button>
                </div>
                `;
            });
        } else {
            casesHtml += `<div class="list-group-item text-muted">该任务暂无关联案件</div>`;
        }
        
        casesHtml += `
                </div>
            </div>
        </div>
        `;
        
        // 创建模态框
        const modalHtml = `
        <div class="modal fade" id="assignCasesToTaskModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">关联案件 - ${task.taskName}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <input type="hidden" id="currentTaskId" value="${taskId}">
                        ${casesHtml}
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">关闭</button>
                    </div>
                </div>
            </div>
        </div>
        `;
        
        // 添加到页面并显示
        const tempContainer = document.createElement('div');
        tempContainer.innerHTML = modalHtml;
        document.body.appendChild(tempContainer);
        
        const assignModal = new bootstrap.Modal(document.getElementById('assignCasesToTaskModal'));
        assignModal.show();
        
        // 模态框关闭后移除元素
        document.getElementById('assignCasesToTaskModal').addEventListener('hidden.bs.modal', function() {
            tempContainer.remove();
        });
    } catch (error) {
        alert('加载案件列表失败');
    }
}

/**
 * 将案件关联到任务
 * @param {number} caseId 案件ID
 * @param {number} taskId 任务ID
 */
async function assignCaseToTask(caseId, taskId) {
    try {
        // 获取案件信息
        const caseInfo = await request(`/case/${caseId}`);
        // 更新案件的任务ID
        caseInfo.taskId = taskId;
        await request('/case', 'PUT', caseInfo);
        
        // 刷新关联列表
        const modal = bootstrap.Modal.getInstance(document.getElementById('assignCasesToTaskModal'));
        modal.hide();
        loadTasks();
        
        alert('案件关联成功');
    } catch (error) {
        // 错误处理已在request函数中完成
    }
}

/**
 * 解除案件与任务的关联
 * @param {number} caseId 案件ID
 */
async function unassignCaseFromTask(caseId) {
    try {
        // 获取案件信息
        const caseInfo = await request(`/case/${caseId}`);
        // 移除任务ID
        caseInfo.taskId = null;
        await request('/case/remove-task', 'PUT', caseInfo);
        
        // 刷新关联列表
        const modal = bootstrap.Modal.getInstance(document.getElementById('assignCasesToTaskModal'));
        modal.hide();
        loadTasks();
        alert('案件已解除关联');
    } catch (error) {
        // 错误处理已在request函数中完成
    }
}
    