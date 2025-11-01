/**
 * 加载案件包领取页面
 */
function loadTaskReceivePage() {
    setActiveNav('领取案件');
    const mainContent = document.getElementById('mainContent');
    mainContent.innerHTML = `
        <div class="ant-card ant-card-bordered mb-4" style="border-radius:8px;box-shadow:0 2px 8px #f0f1f2;">
            <div class="ant-card-body">
                <div class="row g-3 align-items-center">
                    <div class="col-md-6">
                        <div class="input-group">
                            <span class="input-group-text bg-light px-2" style="border-radius:4px 0 0 4px;">
                                <i class="fa fa-briefcase text-secondary"></i>
                            </span>
                            <input type="text" id="receiveTaskSearchInput" class="form-control ant-input" placeholder="案件包名称" style="border-radius:0 4px 4px 0;">
                        </div>
                    </div>
                    <div class="col-md-2 d-flex align-items-end">
                        <button class="ant-btn ant-btn-primary w-100" style="border-radius:4px;" onclick="searchReceiveTasks()">
                            <i class="fa fa-search me-1"></i> 查询
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <div class="ant-card ant-card-bordered mb-3" style="border-radius:8px;">
            <div class="ant-card-body" id="receiveTaskTableContainer">
                <div class="table-responsive">
                    <table class="ant-table table table-hover table-bordered" style="border-radius:6px;overflow:hidden;">
                        <thead class="ant-table-thead table-light">
                            <tr>
                                <th style="white-space:nowrap;">任务ID</th>
                                <th style="white-space:nowrap;">任务名</th>
                                <th style="white-space:nowrap;">创建时间</th>
                                <th style="white-space:nowrap;">关联案件数</th>
                                <th style="white-space:nowrap;">操作</th>
                            </tr>
                        </thead>
                        <tbody id="receiveTaskTableBody">
                            <tr>
                                <td colspan="5" class="text-center">加载中...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    // 创建领取确认模态框容器（修复ID不一致问题）
    createReceiveTaskModalContainer();
    // 加载待领取案件包列表
    loadReceiveTasks(1, 10);
}

/**
 * 渲染待领取案件包表格
 */
function renderReceiveTaskTable(tasks) {
    const tableBody = document.getElementById('receiveTaskTableBody');

    if (!tasks || tasks.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" class="text-center">没有找到待领取的案件包</td></tr>`;
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
                <button class="ant-btn ant-btn-primary btn btn-sm btn-primary" onclick="showReceiveTaskConfirmModal(${task.taskId})">
                    <i class="fa fa-handshake-o"></i> 领取案件包
                </button>
            </td>
        </tr>
        `;
    });

    tableBody.innerHTML = html;
}

/**
 * 显示领取案件包确认模态框
 */
function showReceiveTaskConfirmModal(taskId) {
    // 修复容器ID不一致问题（与create函数保持一致）
    const modalContainer = document.getElementById('taskReceiveModalContainer');

    // 检查容器是否存在
    if (!modalContainer) {
        console.error('模态框容器不存在，正在创建...');
        createReceiveTaskModalContainer();
        modalContainer = document.getElementById('taskReceiveModalContainer');
        if (!modalContainer) {
            alert('创建模态框失败，请刷新页面重试');
            return;
        }
    }

    const modalHtml = `
    <div class="modal fade" id="receiveTaskModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">确认领取案件包</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <p>您确定要领取此案件包吗？领取后案件包下的所有案件将分配给您处理。</p>
                    <input type="hidden" id="receiveTaskId" value="${taskId}">
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                    <button type="button" class="btn btn-primary" onclick="confirmReceiveTask()">确认领取</button>
                </div>
            </div>
        </div>
    </div>
    `;

    modalContainer.innerHTML = modalHtml;
    const receiveModal = new bootstrap.Modal(document.getElementById('receiveTaskModal'));
    receiveModal.show();
}

/**
 * 确认领取案件包
 */
async function confirmReceiveTask() {
    const taskId = document.getElementById('receiveTaskId').value;
    try {
        // 获取当前用户ID
        const userId = await getCurrentUserId();
        if (!userId) {
            alert('获取用户信息失败，请重新登录');
            return;
        }

        // 调用后端领取接口
        await request('/task/receive', 'POST', {
            taskId: taskId,
            userId: userId
        });

        // 关闭模态框并刷新列表
        const receiveModal = bootstrap.Modal.getInstance(document.getElementById('receiveTaskModal'));
        receiveModal.hide();
        loadReceiveTasks();
        alert('案件包领取成功');
    } catch (error) {
        alert('案件包领取失败：' + (error.message || '未知错误'));
    }
}

/**
 * 创建领取任务模态框容器
 * 确保DOM中存在用于存放领取任务相关模态框的容器
 */
function createReceiveTaskModalContainer() {
    // 检查容器是否已存在，不存在则创建（修复ID命名一致性）
    if (!document.getElementById('taskReceiveModalContainer')) {
        const container = document.createElement('div');
        container.id = 'taskReceiveModalContainer';
        document.body.appendChild(container);
    }
}

/**
 * 渲染领取任务分页组件
 * @param {Object} pageInfo 分页信息对象，包含total、pageNum、pageSize等字段
 */
function renderReceiveTaskPagination(pageInfo) {
    const { total, pageNum, pageSize } = pageInfo;
    const totalPages = Math.ceil(total / pageSize);

    // 移除旧分页容器（如果存在）
    const oldPagination = document.getElementById('receiveTaskPaginationContainer');
    if (oldPagination) {
        oldPagination.remove();
    }

    // 只有一页时不显示分页
    if (totalPages <= 1) {
        return;
    }

    // 创建新分页容器
    const paginationContainer = document.createElement('div');
    paginationContainer.id = 'receiveTaskPaginationContainer';
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
    <nav aria-label="领取任务分页">
        <ul class="pagination">
            <li class="page-item ${pageNum === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="loadReceiveTasks(${pageNum - 1}, ${pageSize})" aria-label="上一页">
                    <span aria-hidden="true">&laquo;</span>
                </a>
            </li>
    `;

    // 添加第一页按钮（当前页不在前5页时）
    if (startPage > 1) {
        paginationHtml += `
            <li class="page-item"><a class="page-link" href="#" onclick="loadReceiveTasks(1, ${pageSize})">1</a></li>
            ${startPage > 2 ? '<li class="page-item disabled"><span class="page-link">...</span></li>' : ''}
        `;
    }

    // 添加中间页码
    for (let i = startPage; i <= endPage; i++) {
        paginationHtml += `
            <li class="page-item ${i === pageNum ? 'active' : ''}">
                <a class="page-link" href="#" onclick="loadReceiveTasks(${i}, ${pageSize})">${i}</a>
            </li>
        `;
    }

    // 添加最后一页按钮（当前页不在后5页时）
    if (endPage < totalPages) {
        paginationHtml += `
            ${endPage < totalPages - 1 ? '<li class="page-item disabled"><span class="page-link">...</span></li>' : ''}
            <li class="page-item"><a class="page-link" href="#" onclick="loadReceiveTasks(${totalPages}, ${pageSize})">${totalPages}</a></li>
        `;
    }

    // 下一页按钮
    paginationHtml += `
            <li class="page-item ${pageNum === totalPages ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="loadReceiveTasks(${pageNum + 1}, ${pageSize})" aria-label="下一页">
                    <span aria-hidden="true">&raquo;</span>
                </a>
            </li>
        </ul>
    </nav>
    `;

    paginationContainer.innerHTML = paginationHtml;
    // 将分页容器添加到表格下方（确保容器存在）
    const tableContainer = document.getElementById('receiveTaskTableContainer');
    if (tableContainer) {
        tableContainer.querySelector('.table-responsive').after(paginationContainer);
    } else {
        console.error('表格容器不存在，无法添加分页');
    }
}

/**
 * 搜索可领取任务
 * 根据任务名称筛选可领取的任务列表
 */
async function searchReceiveTasks() {
    // 获取搜索输入框的值
    const taskName = document.getElementById('receiveTaskSearchInput').value.trim();
    // 重置到第一页
    await loadReceiveTasks(1, 10, taskName);
}

/**
 * 加载可领取任务列表（分页）
 * @param {number} pageNum 页码
 * @param {number} pageSize 每页条数
 * @param {string} taskName 任务名称（可选，用于搜索）
 */
async function loadReceiveTasks(pageNum = 1, pageSize = 10, taskName = '') {
    try {
        // 构建请求URL，包含分页参数和搜索条件
        const url = `/task/page?pageNum=${pageNum}&pageSize=${pageSize}` +
            (taskName ? `&taskName=${encodeURIComponent(taskName)}` : '')+
            (`&taskStatus=待领取`);

        const response = await request(url);

        // 渲染任务表格
        renderReceiveTaskTable(response.records);
        // 渲染分页组件
        renderReceiveTaskPagination({
            total: response.total,
            pageNum: response.pageNum,
            pageSize: response.pageSize
        });
    } catch (error) {
        console.error('加载可领取任务失败:', error);
        document.getElementById('receiveTaskTableBody').innerHTML = `
            <tr><td colspan="5" class="text-center text-danger">加载任务失败，请重试</td></tr>
        `;
    }
}