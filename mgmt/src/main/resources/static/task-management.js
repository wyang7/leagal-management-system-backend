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
                        <th>状态</th>
                        <th>领取人</th>
                        <th>操作</th>
                    </tr>
                </thead>
                <tbody id="taskTableBody">
                    <!-- 任务数据将通过JavaScript动态加载 -->
                    <tr>
                        <td colspan="6" class="text-center">加载中...</td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;

    // 创建任务模态框容器
    createTaskModalContainer();
    // 加载任务列表（分页）
    loadTasks(1, 10);
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
async function loadTasks(pageNum = 1, pageSize = 10) {

    try {
        const response = await request(`/task/page?pageNum=${pageNum}&pageSize=${pageSize}`);
        renderTaskTable(response.records);
        renderTaskPagination({
            total: response.total,
            pageNum: response.pageNum,
            pageSize: response.pageSize
        });
    } catch (error) {
        document.getElementById('taskTableBody').innerHTML = `
            <tr><td colspan="6" class="text-center text-danger">加载任务失败</td></tr>
        `;
    }
}

/**
 * 渲染任务表格
 */
function renderTaskTable(tasks) {
    const tableBody = document.getElementById('taskTableBody');

    if (!tasks || tasks.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" class="text-center">没有找到任务数据</td></tr>`;
        return;
    }

    let html = '';
    tasks.forEach(task => {
        // 状态样式
        let statusClass = task.status === '待领取' ? 'text-warning' : 'text-success';

        html += `
        <tr>
            <td>${task.taskId}</td>
            <td>${task.taskName}</td>
            <td>${task.createdTime ? new Date(task.createdTime).toLocaleString() : ''}</td>
            <td>${task.caseCount || 0}</td>
            <td><span class="${statusClass}">${task.status}</span></td>
            <td>${task.ownerName || '-'}</td>
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
                <button class="btn btn-sm btn-secondary" onclick="showAssignTaskToUserModal(${task.taskId})">
                    <i class="fa fa-user"></i> 分派
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
 * 显示分派案件包给用户的模态框
 */
function showAssignTaskToUserModal(taskId) {
    const modalContainer = document.getElementById('taskModalContainer');

    // 先加载用户列表数据
    loadUsersForDropdown();

    const modalHtml = `
    <div class="modal fade" id="assignTaskModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">分派案件包给用户</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <form id="assignTaskForm">
                        <input type="hidden" id="assignTaskId" value="${taskId}">
                        <div class="form-group">
                            <label for="assignUserId">选择用户</label>
                            <select id="assignUserId" class="form-select" required>
                                <option value="">加载用户中...</option>
                            </select>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                    <button type="button" class="btn btn-primary" onclick="confirmAssignTask()">确认分派</button>
                </div>
            </div>
        </div>
    </div>
    `;

    modalContainer.innerHTML = modalHtml;
    const assignModal = new bootstrap.Modal(document.getElementById('assignTaskModal'));
    assignModal.show();
}

/**
 * 加载用户列表到下拉框
 */
async function loadUsersForDropdown() {
    try {
        // 假设后端提供获取用户列表的接口
        const users = await request('/user');
        const userSelect = document.getElementById('assignUserId');

        // 清空现有选项
        userSelect.innerHTML = '';

        // 添加默认选项
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = '请选择用户';
        userSelect.appendChild(defaultOption);

        // 添加用户选项
        if (users && users.length > 0) {
            users.forEach(user => {
                const option = document.createElement('option');
                option.value = user.userId; // 提交时使用用户ID
                option.textContent = user.username; // 显示用户名
                userSelect.appendChild(option);
            });
        } else {
            const noUserOption = document.createElement('option');
            noUserOption.value = '';
            noUserOption.textContent = '没有可用用户';
            noUserOption.disabled = true;
            userSelect.appendChild(noUserOption);
        }
    } catch (error) {
        console.error('加载用户列表失败:', error);
        const userSelect = document.getElementById('assignUserId');
        userSelect.innerHTML = '<option value="">加载用户失败</option>';
    }
}


/**
 * 确认分派案件包
 */
async function confirmAssignTask() {
    const taskId = document.getElementById('assignTaskId').value;
    const userId = document.getElementById('assignUserId').value.trim();

    if (!userId) {
        alert('请输入用户ID');
        return;
    }

    try {
        await request('/task/assign', 'POST', {
            taskId: taskId,
            userId: userId
        });

        // 关闭模态框并刷新列表
        const assignModal = bootstrap.Modal.getInstance(document.getElementById('assignTaskModal'));
        assignModal.hide();
        loadTasks();
        alert('案件包分派成功');
    } catch (error) {
        alert('分派失败：' + (error.message || '未知错误'));
    }
}

// 添加分页渲染函数
function renderTaskPagination(pageInfo) {
    const { total, pageNum, pageSize } = pageInfo;
    const pages = Math.ceil(total / pageSize);
    // 分页渲染逻辑类似案件管理页面的分页实现
    // 省略具体实现，可参考case-management.js中的renderPagination方法
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
 * 显示关联案件到案件包的模态框
 */
function showAssignCasesToTaskModal(taskId) {
    const modalContainer = document.getElementById('taskModalContainer');

    // 创建模态框并加载数据
    function createAndLoadModal() {
        const modalHtml = `
        <div class="modal fade" id="assignCasesModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-xl">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">关联案件到案件包</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <input type="hidden" id="currentTaskId" value="${taskId}">
                        <div class="row">
                            <!-- 左侧：可选案件 -->
                            <div class="col-md-6">
                                <h6>可选案件</h6>
                                <div class="input-group mb-3">
                                    <input type="text" id="availableCasesSearch" class="form-control" placeholder="搜索案由...">
                                    <button class="btn btn-primary" onclick="searchAvailableCases(${taskId})">搜索</button>
                                </div>
                                <div class="overflow-auto" style="max-height: 400px;">
                                    <table class="table table-striped">
                                        <thead>
                                            <tr>
                                                <th><input type="checkbox" id="selectAllAvailable"></th>
                                                <th>案件号</th>
                                                <th>案由</th>
                                            </tr>
                                        </thead>
                                        <tbody id="availableCasesTableBody">
                                            <!-- 加载中 -->
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            
                            <!-- 右侧：已关联案件 -->
                            <div class="col-md-6">
                                <h6>已关联案件</h6>
                                <div class="overflow-auto" style="max-height: 400px;">
                                    <table class="table table-striped">
                                        <thead>
                                            <tr>
                                                <th><input type="checkbox" id="selectAllAssigned"></th>
                                                <th>案件号</th>
                                                <th>案由</th>
                                            </tr>
                                        </thead>
                                        <tbody id="assignedCasesTableBody">
                                            <!-- 加载中 -->
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">关闭</button>
                        <button type="button" class="btn btn-primary" onclick="confirmAssignCasesToTask()">确认关联</button>
                        <button type="button" class="btn btn-danger" onclick="removeAssignedCases()">移除选中</button>
                    </div>
                </div>
            </div>
        </div>
        `;

        modalContainer.innerHTML = modalHtml;

        // 加载案件数据
        loadAvailableCases(taskId);
        loadAssignedCases(taskId);

        // 全选功能
        document.getElementById('selectAllAvailable').addEventListener('change', function() {
            const checkboxes = document.querySelectorAll('#availableCasesTableBody input[type="checkbox"]');
            checkboxes.forEach(checkbox => checkbox.checked = this.checked);
        });

        document.getElementById('selectAllAssigned').addEventListener('change', function() {
            const checkboxes = document.querySelectorAll('#assignedCasesTableBody input[type="checkbox"]');
            checkboxes.forEach(checkbox => checkbox.checked = this.checked);
        });
    }

    // 检查模态框是否已存在
    const existingModal = document.getElementById('assignCasesModal');
    if (existingModal) {
        // 关闭现有模态框并重新创建
        const modalInstance = bootstrap.Modal.getInstance(existingModal);
        modalInstance.hide();
        // 等待模态框关闭后再重新创建
        setTimeout(() => {
            createAndLoadModal();
            const newModal = new bootstrap.Modal(document.getElementById('assignCasesModal'));
            newModal.show();
        }, 300);
    } else {
        createAndLoadModal();
        const modal = new bootstrap.Modal(document.getElementById('assignCasesModal'));
        modal.show();
    }
}

/**
 * 加载可选案件（未关联到当前任务的案件）
 */
async function loadAvailableCases(taskId) {
    try {
        const searchTerm = document.getElementById('availableCasesSearch')?.value.trim() || '';
        // 获取所有案件
        const cases = await request(`/case/filter-by-status?statusList=待领取&statusList=已完成&taskId=${taskId}&caseName=${encodeURIComponent(searchTerm)}`);
        const unassignedCases = cases.filter(c => !c.taskId);
        const tableBody = document.getElementById('availableCasesTableBody');

        if (!unassignedCases || unassignedCases.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="4" class="text-center">没有可关联的案件</td></tr>';
            return;
        }

        let html = '';
        unassignedCases.forEach(caseInfo => {
            html += `
            <tr>
                <td><input type="checkbox" class="case-checkbox" value="${caseInfo.caseId}"></td>
                <td>${caseInfo.caseNumber}</td>
                <td>${caseInfo.caseName}</td>
            </tr>
            `;
        });
        tableBody.innerHTML = html;
    } catch (error) {
        document.getElementById('availableCasesTableBody').innerHTML =
            '<tr><td colspan="4" class="text-center text-danger">加载失败</td></tr>';
    }
}


/**
 * 加载已关联案件
 */
async function loadAssignedCases(taskId) {
    try {
        const cases = await request(`/case/filter-by-status?statusList=待领取&statusList=已完成&taskId=${taskId}`);
        const assignedCases = cases.filter(c => {
            console.log("taskId"+c.taskId);
           return  c.taskId === taskId
        });
        const tableBody = document.getElementById('assignedCasesTableBody');
        if (!assignedCases || assignedCases.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="4" class="text-center">暂无关联案件</td></tr>';
            return;
        }

        let html = '';
        assignedCases.forEach(caseInfo => {
            html += `
            <tr>
                <td><input type="checkbox" class="assigned-case-checkbox" value="${caseInfo.caseId}"></td>
                <td>${caseInfo.caseNumber}</td>
                <td>${caseInfo.caseName}</td>
            </tr>
            `;
        });
        tableBody.innerHTML = html;
    } catch (error) {
        document.getElementById('assignedCasesTableBody').innerHTML =
            '<tr><td colspan="4" class="text-center text-danger">加载失败</td></tr>';
    }
}

/**
 * 搜索可选案件
 */
function searchAvailableCases(taskId) {
    loadAvailableCases(taskId);
}


/**
 * 确认关联案件到案件包
 */
async function confirmAssignCasesToTask() {
    const taskId = parseInt(document.getElementById('currentTaskId').value);
    const checkboxes = document.querySelectorAll('#availableCasesTableBody input[type="checkbox"]:checked');

    if (checkboxes.length === 0) {
        alert('请选择要关联的案件');
        return;
    }

    const caseIds = Array.from(checkboxes).map(cb => parseInt(cb.value));

    try {
        // 使用Promise.all等待所有关联操作完成
        await Promise.all(
            caseIds.map(caseId => assignCaseToTask(caseId, taskId))
        );

        // 所有关联操作完成后再刷新数据
        await loadAvailableCases(taskId);
        await loadAssignedCases(taskId);

        // 显示成功提示
        alert('案件关联成功');
    } catch (error) {
        alert('关联失败：' + (error.message || '未知错误'));
    }
}

/**
 * 移除已关联的案件
 */
async function removeAssignedCases() {
    const taskId = parseInt(document.getElementById('currentTaskId').value);
    const checkboxes = document.querySelectorAll('#assignedCasesTableBody input[type="checkbox"]:checked');

    if (checkboxes.length === 0) {
        alert('请选择要移除的案件');
        return;
    }

    const caseIds = Array.from(checkboxes).map(cb => parseInt(cb.value));

    try {
        // 使用Promise.all等待所有移除操作完成
        await Promise.all(
            caseIds.map(caseId => unassignCaseFromTask(caseId))
        );

        // 所有移除操作完成后再刷新数据
        await loadAvailableCases(taskId);
        await loadAssignedCases(taskId);

        // 显示成功提示
        alert('案件移除成功');
    } catch (error) {
        alert('移除失败：' + (error.message || '未知错误'));
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
        return await request('/case', 'PUT', caseInfo);
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
        return await request('/case/remove-task', 'PUT', caseInfo);
    } catch (error) {
        // 错误处理已在request函数中完成
    }
}
    