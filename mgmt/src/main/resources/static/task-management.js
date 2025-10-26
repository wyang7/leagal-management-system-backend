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
            <div class="col-md-6">
                <div class="input-group">
                    <input type="text" id="taskSearchInput" class="form-control" placeholder="输入案件包名称搜索">
                    <button class="btn btn-primary" onclick="searchTasks()">
                        <i class="fa fa-search"></i> 搜索
                    </button>
                    <button class="btn btn-primary ms-2" onclick="batchPublishTasks()">
                        <i class="fa fa-paper-plane"></i> 批量发布
                    </button>
                </div>
            </div>
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
                        <th><input type="checkbox" id="selectAllTasks" onclick="toggleSelectAllTasks()"></th>
                        <th>任务ID</th>
                        <th>任务名</th>
                        <th>案件包归属</th>
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

function searchTasks() {
    const taskName = document.getElementById('taskSearchInput').value.trim();
    loadTasks(1, taskPageSize, taskName);
}

/**
 * 全选/取消全选任务
 */
function toggleSelectAllTasks() {
    const selectAll = document.getElementById('selectAllTasks');
    const checkboxes = document.querySelectorAll('input[name="taskCheckbox"]');

    checkboxes.forEach(checkbox => {
        checkbox.checked = selectAll.checked;
    });
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
async function loadTasks(pageNum = 1, pageSize = 10, taskName = '') {

    try {
        currentTaskPage = pageNum; // 保存当前页码
        let url = `/task/page?pageNum=${pageNum}&pageSize=${pageSize}`;
        if (taskName) {
            url += `&taskName=${encodeURIComponent(taskName)}`;
        }
        const response = await request(url);
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
        let statusClass = '';
        if (task.status === '待领取') {
            statusClass = 'text-warning';
        } else if (task.status === '已领取') {
            statusClass = 'text-success';
        } else if (task.status === '待发布') {
            statusClass = 'text-info';
        }

        html += `
        <tr>
            <td><input type="checkbox" name="taskCheckbox" value="${task.taskId}" ${task.status !== '待发布' ? 'disabled' : ''}></td>
            <td>${task.taskId}</td>
            <td>${task.taskName}</td>
            <td>${task.station || '-'}</td>
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
                ${task.status === '待发布' ? `
                <button class="btn btn-sm btn-warning" onclick="publishTask(${task.taskId})">
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
 * 单个发布案件包
 */
async function publishTask(taskId) {
    if (confirm('确定要发布此案件包吗？发布后状态将变为待领取')) {
        try {
            await request(`/task/publish`, 'POST', { taskIds: [taskId] });
            alert('发布成功');
            loadTasks(currentTaskPage, taskPageSize); // 刷新列表
        } catch (error) {
            alert('发布失败: ' + (error.message || '未知错误'));
        }
    }
}

/**
 * 批量发布案件包
 */
async function batchPublishTasks() {
    const checkedBoxes = document.querySelectorAll('input[name="taskCheckbox"]:checked');

    if (checkedBoxes.length === 0) {
        alert('请选择要发布的案件包');
        return;
    }

    if (confirm(`确定要发布选中的 ${checkedBoxes.length} 个案件包吗？发布后状态将变为待领取`)) {
        const taskIds = Array.from(checkedBoxes).map(checkbox => parseInt(checkbox.value));

        try {
            await request(`/task/publish`, 'POST', { taskIds: taskIds });
            alert(`成功发布 ${checkedBoxes.length} 个案件包`);
            loadTasks(currentTaskPage, taskPageSize); // 刷新列表
            document.getElementById('selectAllTasks').checked = false; // 取消全选状态
        } catch (error) {
            alert('批量发布失败: ' + (error.message || '未知错误'));
        }
    }
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
                            <div class="form-group">
                                <label for="taskStation">案件包归属地</label>
                                <select id="taskStation" class="form-control" required>
                                    <option value="">请选择归属地</option>
                                    <option value="九堡彭埠">九堡彭埠</option>
                                    <option value="本部">本部</option>
                                    <option value="笕桥">笕桥</option>
                                    <option value="总部">总部</option>
                                </select>
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
        document.getElementById('taskStation').value = task.station || '';
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
        loadTasks(currentTaskPage, taskPageSize);
        alert('案件包分派成功');
    } catch (error) {
        alert('分派失败：' + (error.message || '未知错误'));
    }
}

// 添加分页渲染函数
function renderTaskPagination(pageInfo) {
    const { total, pageNum, pageSize } = pageInfo;
    const totalPages = Math.ceil(total / pageSize);

    // 移除旧分页容器（如果存在）
    const oldPagination = document.getElementById('taskPaginationContainer');
    if (oldPagination) {
        oldPagination.remove();
    }

    // 只有一页时不显示分页
    if (totalPages <= 1) {
        return;
    }

    // 创建新分页容器
    const paginationContainer = document.createElement('div');
    paginationContainer.id = 'taskPaginationContainer';
    paginationContainer.className = 'd-flex justify-content-center mt-4';

    // 计算显示的页码范围
    let startPage = Math.max(1, pageNum - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    if (endPage - startPage < 4) {
        startPage = Math.max(1, endPage - 4);
    }

    let paginationHtml = `
    <div class="d-flex justify-content-center mb-2 text-secondary">
        共 ${total} 条记录，当前第 ${pageNum}/${totalPages} 页
    </div>
    <nav aria-label="任务分页">
        <ul class="pagination">
            <li class="page-item ${pageNum === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="loadTasks(${pageNum - 1}, ${pageSize})" aria-label="上一页">
                    <span aria-hidden="true">&laquo;</span>
                </a>
            </li>
    `;

    // 添加第一页按钮（当前页不在前5页时）
    if (startPage > 1) {
        paginationHtml += `
            <li class="page-item"><a class="page-link" href="#" onclick="loadTasks(1, ${pageSize})">1</a></li>
            ${startPage > 2 ? '<li class="page-item disabled"><span class="page-link">...</span></li>' : ''}
        `;
    }

    // 添加中间页码
    for (let i = startPage; i <= endPage; i++) {
        paginationHtml += `
            <li class="page-item ${i === pageNum ? 'active' : ''}">
                <a class="page-link" href="#" onclick="loadTasks(${i}, ${pageSize})">${i}</a>
            </li>
        `;
    }

    // 添加最后一页按钮（当前页不在后5页时）
    if (endPage < totalPages) {
        paginationHtml += `
            ${endPage < totalPages - 1 ? '<li class="page-item disabled"><span class="page-link">...</span></li>' : ''}
            <li class="page-item"><a class="page-link" href="#" onclick="loadTasks(${totalPages}, ${pageSize})">${totalPages}</a></li>
        `;
    }

    // 下一页按钮
    paginationHtml += `
            <li class="page-item ${pageNum === totalPages ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="loadTasks(${pageNum + 1}, ${pageSize})" aria-label="下一页">
                    <span aria-hidden="true">&raquo;</span>
                </a>
            </li>
        </ul>
    </nav>
    `;

    paginationContainer.innerHTML = paginationHtml;
    // 将分页容器添加到表格下方
    const tableContainer = document.querySelector('.table-responsive');
    if (tableContainer) {
        tableContainer.after(paginationContainer);
    } else {
        console.error('表格容器不存在，无法添加分页');
    }
}

// 修改loadTasks函数，添加分页参数保存和搜索支持
let currentTaskPage = 1;
const taskPageSize = 10; // 改为10条每页，方便分页展示

/**
 * 保存任务（新增或编辑）
 */
async function saveTask() {
    // 获取表单数据
    const taskId = document.getElementById('taskId').value;
    const taskName = document.getElementById('taskName').value.trim();
    const station = document.getElementById('taskStation').value;
    
    // 简单验证
    if (!taskName) {
        alert('请输入任务名');
        return;
    }
    if (!station) {
        alert('请选择驻点');
        return;
    }
    
    const taskData = {
        taskName: taskName,
        station: station
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
        loadTasks(currentTaskPage, taskPageSize);
        
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
        loadTasks(currentTaskPage, taskPageSize);
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
    