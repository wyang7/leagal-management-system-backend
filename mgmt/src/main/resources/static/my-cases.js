// 分页参数
let currentMyCasePage = 1;
const currentMyCasePageSize = 10; // 每页显示10条
let currentMyFilterStatus = 'all';

/**
 * 加载我的案件页面
 */
function loadMyCasesPage() {
    setActiveNav('我的案件');
    const mainContent = document.getElementById('mainContent');

    mainContent.innerHTML = `
        <div class="ant-card ant-card-bordered mb-4" style="border-radius:8px;box-shadow:0 2px 8px #f0f1f2;">
            <div class="ant-card-body">
                <div class="row g-3 align-items-center">
                    <div class="col-md-3">
                        <div class="input-group">
                            <span class="input-group-text bg-light px-2" style="border-radius:4px 0 0 4px;">
                                <i class="fa fa-book text-secondary"></i>
                            </span>
                            <input type="text" id="myCaseSearchInput" class="form-control ant-input" placeholder="案由" style="border-radius:0 4px 4px 0;">
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="input-group">
                            <span class="input-group-text bg-light px-2" style="border-radius:4px 0 0 4px;">
                                <i class="fa fa-map-marker text-secondary"></i>
                            </span>
                            <select id="myCaseStationSelect" class="form-select ant-select" style="border-radius:0 4px 4px 0;">
                                <option value="">全部驻点</option>
                                <option value="九堡彭埠">九堡彭埠</option>
                                <option value="本部">本部</option>
                                <option value="笕桥">笕桥</option>
                            </select>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="input-group">
                            <span class="input-group-text bg-light px-2" style="border-radius:4px 0 0 4px;">
                                <i class="fa fa-user text-secondary"></i>
                            </span>
                            <input type="text" id="myCasePlaintiffInput" class="form-control ant-input" placeholder="原告" style="border-radius:0 4px 4px 0;">
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="input-group">
                            <span class="input-group-text bg-light px-2" style="border-radius:4px 0 0 4px;">
                                <i class="fa fa-user-o text-secondary"></i>
                            </span>
                            <input type="text" id="myCaseDefendantInput" class="form-control ant-input" placeholder="被告" style="border-radius:0 4px 4px 0;">
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="input-group">
                            <span class="input-group-text bg-light px-2" style="border-radius:4px 0 0 4px;">
                                <i class="fa fa-user-plus text-secondary"></i>
                            </span>
                            <input type="text" id="myCaseAssistantInput" class="form-control ant-input" placeholder="助理" style="border-radius:0 4px 4px 0;">
                        </div>
                    </div>
                    <div class="col-md-3 d-flex align-items-end">
                        <button class="ant-btn ant-btn-primary w-100" style="border-radius:4px;" onclick="loadMyCases()">
                            <i class="fa fa-search me-1"></i> 查询
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <div class="ant-card ant-card-bordered mb-3" style="border-radius:8px;">
            <div class="ant-card-body">
                <div class="btn-group mb-2" role="group">
                    <button class="ant-btn ant-btn-default btn btn-outline-primary" onclick="filterMyCases('all')">全部</button>
                    <button class="ant-btn ant-btn-default btn btn-outline-primary" onclick="filterMyCases('已领取')">已领取</button>
                    <button class="ant-btn ant-btn-default btn btn-outline-primary" onclick="filterMyCases('反馈')">反馈</button>
                    <button class="ant-btn ant-btn-default btn btn-outline-primary" onclick="filterMyCases('延期')">延期</button>
                    <button class="ant-btn ant-btn-default btn btn-outline-primary" onclick="filterMyCases('已完成')">已完成</button>
                </div>
                <div class="table-responsive">
                    <table class="ant-table table table-hover table-bordered" style="border-radius:6px;overflow:hidden;">
                        <thead class="ant-table-thead table-light">
                            <tr>
                                <th style="white-space:nowrap;">案件号</th>
                                <th style="white-space:nowrap;">案由</th>
                                <th style="white-space:nowrap;">标的额</th>
                                <th style="white-space:nowrap;" title="案件归属地">归属地</th>
                                <th style="white-space:nowrap;">原告</th>
                                <th style="white-space:nowrap;">被告</th>
                                <th style="white-space:nowrap;">法官</th>
                                <th style="white-space:nowrap;">案件助理</th>
                                <th style="white-space:nowrap;">状态</th>
                                <th style="white-space:nowrap;">操作</th>
                            </tr>
                        </thead>
                        <tbody id="myCaseTableBody">
                            <tr>
                                <td colspan="10" class="text-center">加载中...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    // 创建完成案件模态框容器
    createCompleteCaseModalContainer();
    // 创建案件详情模态框容器
    createMyCaseDetailModalContainer();
    // 创建案件历史记录模态框容器
    createCaseHistoryModalContainer();
    // 加载我的案件列表
    loadMyCases(currentMyCasePage,currentMyCasePageSize);

    document.querySelector('.btn-group .btn[onclick="filterMyCases(\'all\')"]').classList.add('active');
}

/**
 * 创建案件详情模态框容器
 */
function createMyCaseDetailModalContainer() {
    if (!document.getElementById('myCaseDetailModalContainer')) {
        const container = document.createElement('div');
        container.id = 'myCaseDetailModalContainer';
        document.body.appendChild(container);
    }
}


/**
 * 显示案件详情模态框
 * @param {number} caseId 案件ID
 */
async function showmyCaseDetailModal(caseId) {
    try {
        const caseInfo = await request(`/case/detail/${caseId}`);
        const modalContainer = document.getElementById('myCaseDetailModalContainer');

        // 格式化日期
        const formatDate = (dateStr) => {
            return dateStr ? new Date(dateStr).toLocaleString() : '-';
        };

        // 创建模态框
        const modalHtml = `
        <div class="modal fade" id="myCaseDetailModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">案件详情</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <strong>案件ID:</strong> ${caseInfo.caseId}
                            </div>
                            <div class="col-md-6">
                                <strong>案件号:</strong> ${caseInfo.caseNumber || '-'}
                            </div>
                        </div>
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <strong>案由:</strong> ${caseInfo.caseName || '-'}
                            </div>
                            <div class="col-md-6">
                                <strong>标的额:</strong> ${caseInfo.amount != null ? caseInfo.amount.toFixed(2) : '0.00'}
                            </div>
                        </div>
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <strong>案件归属地:</strong> ${caseInfo.caseLocation || '-'}
                            </div>
                            <div class="col-md-6">
                                <strong>法官:</strong> ${caseInfo.judge || '-'}
                            </div>
                            <div class="col-md-6">
                                <strong>收案时间:</strong> ${formatDate(caseInfo.courtReceiveTime)}
                            </div>
                        </div>
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <strong>原告:</strong> ${caseInfo.plaintiffName || '-'}
                            </div>
                            <div class="col-md-6">
                                <strong>被告:</strong> ${caseInfo.defendantName || '-'}
                            </div>
                        </div>
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <strong>案件助理:</strong> ${caseInfo.assistantName || '-'}
                            </div>
                            <div class="col-md-6">
                                <strong>关联案件包:</strong> ${caseInfo.taskName || '-'}
                            </div }
                        </div>
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <strong>状态:</strong> ${caseInfo.status || '-'}
                            </div>
                            <div class="col-md-6">
                                <strong>处理人:</strong> ${caseInfo.username || '-'}
                            </div>
                        </div>
                        <div class="row mb-3">
                            <div class="col-md-12">
                                <strong>反馈情况:</strong>
                                <div class="mt-2 p-3 bg-light rounded">
                                    ${caseInfo.preFeedback ? caseInfo.preFeedback.replace(/\n/g, '<br>') : '无'}
                                </div>
                            </div>
                        </div>
                        <div class="row mb-3">
                            <div class="col-md-12">
                                <strong>退回情况:</strong>
                                <div class="mt-2 p-3 bg-light rounded">
                                    ${caseInfo.returnReason ? caseInfo.returnReason.replace(/\n/g, '<br>') : '无'}
                                </div>
                            </div>
                        </div>
                        <div class="row mb-3">
                            <div class="col-md-12">
                                <strong>完成情况:</strong>
                                <div class="mt-2 p-3 bg-light rounded">
                                    ${caseInfo.completionNotes ? caseInfo.completionNotes.replace(/\n/g, '<br>') : '无'}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">关闭</button>
                    </div>
                </div>
            </div>
        </div>
        `;

        modalContainer.innerHTML = modalHtml;

        // 显示模态框
        const detailModal = new bootstrap.Modal(document.getElementById('myCaseDetailModal'));
        detailModal.show();
    } catch (error) {
        console.error('获取案件详情失败:', error);
        alert('获取案件详情失败');
    }
}



/**
 * 获取当前登录用户ID（实际项目中需从登录信息中获取）
 */
async function getCurrentUserId() {
    try {
        // 复用用项目中已有的的获取当前用户信息接口
        const userInfo = await request('/auth/currentUser');
        if (userInfo && userInfo.userId) {
            return userInfo.userId; // 确保返回有效的userId
        }
        // 获取失败时跳转登录页
        window.location.href = 'login.html';
        return null;
    } catch (error) {
        console.error('获取当前用户ID失败:', error);
        window.location.href = 'login.html';
        return null;
    }
}/**
 * 获取当前登录用户ID（实际项目中需从登录信息中获取）
 */
async function getCurrentUserName() {
    try {
        // 复用用项目中已有的的获取当前用户信息接口
        const userInfo = await request('/auth/currentUser');
        if (userInfo && userInfo.username) {
            return userInfo.username; // 确保返回有效的userId
        }
        // 获取失败时跳转登录页
        window.location.href = 'login.html';
        return null;
    } catch (error) {
        console.error('获取当前用户名失败:', error);
        window.location.href = 'login.html';
        return null;
    }
}

/**
 * 加载我的案件列表
 */
async function loadMyCases(pageNum = 1, pageSize = 10) {
    try {
        currentMyCasePage = pageNum;
        const username = await getCurrentUserName();
        if (!username) {
            // 如果userId为空，直接终止（已在getCurrentUserId中处理跳转）
            document.getElementById('myCaseTableBody').innerHTML = `
                <tr><td colspan="7" class="text-center text-danger">未获取到用户信息</td></tr>
            `;
            return;
        }

        // 确保username有效后再发起请求
        // 查询条件
        const caseName = document.getElementById('myCaseSearchInput').value.trim();
        const station = (document.getElementById('myCaseStationSelect') && document.getElementById('myCaseStationSelect').value)
                        ? document.getElementById('myCaseStationSelect').value.trim() : '';
        const plaintiff = document.getElementById('myCasePlaintiffInput') ? document.getElementById('myCasePlaintiffInput').value.trim() : '';
        const defendant = document.getElementById('myCaseDefendantInput') ? document.getElementById('myCaseDefendantInput').value.trim() : '';
        const assistant = document.getElementById('myCaseAssistantInput') ? document.getElementById('myCaseAssistantInput').value.trim() : '';

        const params = new URLSearchParams();
        params.append('pageNum', pageNum);
        params.append('pageSize', pageSize);
        if (caseName) params.append('caseName', caseName);
        if (username) params.append('userName', username);
        if (currentMyFilterStatus !== 'all') {
            params.append('status', currentMyFilterStatus);
        } else {
            params.append('status', '我的案件');
        }
        if (station) params.append('station', station);
        if (plaintiff) params.append('plaintiff', plaintiff);
        if (defendant) params.append('defendant', defendant);
        if (assistant) params.append('assistant', assistant);

        const response = await request(`/case/page?${params.toString()}`);
        renderMyCaseTable(response.records);
        // 渲染分页组件（假设后端返回的分页信息包含total、pageNum、pageSize、pages等字段）
        renderMyPagination({
            total: response.total,      // 总记录数
            pageNum: response.pageNum,  // 当前页码
            pageSize: response.pageSize// 每页条数
        });
    } catch (error) {
        document.getElementById('myCaseTableBody').innerHTML = `
            <tr><td colspan="8" class="text-center text-danger">加载案件失败</td></tr>
        `;
    }
}

/**
 * 渲染分页组件
 * @param {Object} pageInfo 分页信息对象，包含total、pageNum、pageSize、pages等
 */
function renderMyPagination(pageInfo) {
    const { total, pageNum, pageSize } = pageInfo;
    const pages= Math.ceil(total / pageSize);
    if (pages <= 1) {
        // 只有一页时不显示分页
        const myPaginationContainer = document.getElementById('myPaginationContainer');
        if (myPaginationContainer) {
            myPaginationContainer.innerHTML = `
                <div class="d-flex justify-content-center mt-2 text-secondary">
                    共 ${total} 条记录
                </div>
            `;
        }
        return;
    }

    // 创建分页容器（如果不存在）
    let myPaginationContainer = document.getElementById('myPaginationContainer');
    if (!myPaginationContainer) {
        myPaginationContainer = document.createElement('div');
        myPaginationContainer.id = 'myPaginationContainer';
        myPaginationContainer.className = 'd-flex justify-content-center mt-4';
        // 插入到表格下方
        document.querySelector('.table-responsive').after(myPaginationContainer);
    }

    // 计算显示的页码范围
    let startPage = Math.max(1, pageNum - 2);
    let endPage = Math.min(pages, startPage + 4);

    // 调整页码范围，确保显示5个页码
    if (endPage - startPage < 4) {
        startPage = Math.max(1, endPage - 4);
    }

    let paginationHtml = `
    <div class="d-flex justify-content-center mb-2 text-secondary">
        共 ${total} 条记录，当前第 ${pageNum}/${pages} 页
    </div>
    <nav aria-label="案件列表分页">
        <ul class="pagination">
            <li class="page-item ${pageNum === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="loadCases(${pageNum - 1}, ${pageSize})" aria-label="上一页">
                    <span aria-hidden="true">&laquo;</span>
                </a>
            </li>
    `;



    // 添加第一页按钮（当当前页不在前5页时）
    if (startPage > 1) {
        paginationHtml += `
            <li class="page-item"><a class="page-link" href="#" onclick="loadMyCases(1, ${pageSize})">1</a></li>
            ${startPage > 2 ? '<li class="page-item disabled"><span class="page-link">...</span></li>' : ''}
        `;
    }

    // 添加中间页码
    for (let i = startPage; i <= endPage; i++) {
        paginationHtml += `
            <li class="page-item ${i === pageNum ? 'active' : ''}">
                <a class="page-link" href="#" onclick="loadMyCases(${i}, ${pageSize})">${i}</a>
            </li>
        `;
    }

    // 添加最后一页按钮（当当前页不在后5页时）
    if (endPage < pages) {
        paginationHtml += `
            ${endPage < pages - 1 ? '<li class="page-item disabled"><span class="page-link">...</span></li>' : ''}
            <li class="page-item"><a class="page-link" href="#" onclick="loadMyCases(${pages}, ${pageSize})">${pages}</a></li>
        `;
    }

    // 下一页按钮
    paginationHtml += `
            <li class="page-item ${pageNum === pages ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="loadMyCases(${pageNum + 1}, ${pageSize})" aria-label="下一页">
                    <span aria-hidden="true">&raquo;</span>
                </a>
            </li>
        </ul>
    </nav>
    `;

    myPaginationContainer.innerHTML = paginationHtml;
}


/**
 * 根据状态筛选我的案件
 */
async function filterMyCases(status, pageNum = 1, pageSize = 10) {

    const allButtons = document.querySelectorAll('.btn-group .btn.btn-outline-primary');
    allButtons.forEach(button => {
        button.classList.remove('active');
    });

    const currentButton = document.querySelector(`.btn-group .btn[onclick="filterMyCases('${status}')"]`);
    if (currentButton) {
        currentButton.classList.add('active');
    }
    currentMyCasePage = pageNum;
    currentMyFilterStatus = status;
    loadMyCases(currentMyCasePage,currentMyCasePageSize);
    // 更新按钮样式（保持不变）
    document.querySelectorAll('.btn-group .btn').forEach(btn => {
        btn.classList.remove('btn-primary');
        btn.classList.add('btn-outline-primary');
    });
}

/**
 * 渲染我的案件表格
 * @param {Array} cases 案件数组
 */
function renderMyCaseTable(cases) {
    const tableBody = document.getElementById('myCaseTableBody');
    if (!cases || cases.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="10" class="text-center">没有找到案件数据</td></tr>`;
        return;
    }
    let html = '';
    cases.forEach(caseInfo => {
        // 状态样式类
        let statusClass = '';
        switch (caseInfo.status) {
            case '待领取':
                statusClass = 'status-pending-receive';
                break;
            case '已领取':
                statusClass = 'status-received';
                break;
            case '反馈':
                statusClass = 'status-pre-feedback';
                break;
            case '延期':
                statusClass = 'status-delayed';
                break;
            case '已完成':
                statusClass = 'status-completed';
                break;
            case '退回':
                statusClass = 'status-returned';
                break;
            case '完结':
                statusClass = 'text-success'; // 绿色表示完结
                break;
        }

        html += `
        <tr>
            <td>${caseInfo.caseNumber}</td>
            <td>${caseInfo.caseName}</td>
            <td>${caseInfo.amount != null ? caseInfo.amount.toFixed(2) : '0.00'}</td>
            <td>${caseInfo.caseLocation || '-'}</td>
            <td>${caseInfo.plaintiffName || '-'}</td>
            <td>${caseInfo.defendantName || '-'}</td>
            <td>${caseInfo.judge || '-'}</td>
            <td>${caseInfo.assistantName || '-'}</td>
            <td><span class="status-badge ${statusClass}">${caseInfo.status}</span></td>
            <td>
                <div class="d-flex gap-2">
                  <div class="dropdown">
                    <button class="btn btn-sm btn-info dropdown-toggle" type="button" data-bs-toggle="dropdown">
                      案件详情
                    </button>
                    <ul class="dropdown-menu">
                      <li>
                        <a class="dropdown-item" href="javascript:void(0);" onclick="showmyCaseDetailModal(${caseInfo.caseId})">
                          <i class="fa fa-eye"></i> 详情
                        </a>
                      </li>
                      <li>
                        <a class="dropdown-item" href="javascript:void(0);" onclick="showCaseHistoryModal(${caseInfo.caseId})">
                          <i class="fa fa-history"></i> 历史流转记录
                        </a>
                      </li>
                    </ul>
                  </div>
                  <div class="dropdown">
                    <button class="btn btn-sm btn-primary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                      案件操作
                    </button>
                    <ul class="dropdown-menu">
                      ${(caseInfo.status === '已领取' || caseInfo.status === '反馈') ? `
                      <li>
                        <a class="dropdown-item" href="javascript:void(0);" onclick="showPreFeedbackModal(${caseInfo.caseId})">
                          <i class="fa fa-comment"></i> 反馈
                        </a>
                      </li>
                      <li>
                        <a class="dropdown-item" href="javascript:void(0);" onclick="showDelayModal(${caseInfo.caseId})">
                          <i class="fa fa-clock-o"></i> 延期
                        </a>
                      </li>
                      ` : caseInfo.status === '反馈' ? `
                      <li>
                        <a class="dropdown-item" href="javascript:void(0);" onclick="showDelayModal(${caseInfo.caseId})">
                          <i class="fa fa-clock-o"></i> 延期
                        </a>
                      </li>
                      `:``}
                      ${(caseInfo.status !== '已完成') ? `
                      <li>
                        <a class="dropdown-item" href="javascript:void(0);" onclick="showCompleteCaseModal(${caseInfo.caseId})">
                          <i class="fa fa-check"></i> 完成
                        </a>
                      </li>
                      <li>
                        <a class="dropdown-item" href="javascript:void(0);" onclick="showReturnCaseModal(${caseInfo.caseId})">
                          <i class="fa fa-undo"></i> 退回
                        </a>
                      </li>
                      `:``}
                    </ul>
                  </div>
                </div>
            </td>
        </tr>
        `;
    });

    tableBody.innerHTML = html;
}

/**
 * 创建延期模态框容器
 */
function createDelayModalContainer() {
    if (!document.getElementById('delayModalContainer')) {
        const container = document.createElement('div');
        container.id = 'delayModalContainer';
        document.body.appendChild(container);
    }
}

/**
 * 显示延期弹窗
 */
async function showDelayModal(caseId) {
    createDelayModalContainer();
    const modalContainer = document.getElementById('delayModalContainer');

    // 渲染弹窗HTML
    modalContainer.innerHTML = `
    <div class="modal fade" id="delayModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">案件延期申请</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <form id="delayForm">
                        <input type="hidden" id="delayCaseId" value="${caseId}">
                        <div class="form-group">
                            <label for="delayReasonContent">延期原因</label>
                            <textarea id="delayReasonContent" class="form-control" rows="5" required placeholder="请输入延期原因..."></textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                    <button type="button" class="btn btn-primary" onclick="submitDelay()">确认提交</button>
                </div>
            </div>
        </div>
    </div>
    `;

    // 显示模态框
    const modal = new bootstrap.Modal(document.getElementById('delayModal'));
    modal.show();
}

/**
 * 提交延期申请到后端
 */
async function submitDelay() {
    const caseId = document.getElementById('delayCaseId').value;
    const delayReason = document.getElementById('delayReasonContent').value.trim();

    if (!delayReason) {
        alert('请输入延期原因');
        return;
    }

    try {
        // 调用后端延期接口
        await request('/case/delay', 'POST', {
            caseId: caseId,
            delayReason: delayReason
        });

        // 关闭弹窗并刷新列表
        const modal = bootstrap.Modal.getInstance(document.getElementById('delayModal'));
        modal.hide();
        loadMyCases(currentMyCasePage,currentMyCasePageSize); // 刷新案件列表
        alert('延期申请提交成功');
    } catch (error) {
        console.error('延期申请提交失败:', error);
        alert('延期申请提交失败，请重试');
    }
}

/**
 * 创建反馈模态框容器
 */
function createPreFeedbackModalContainer() {
    if (!document.getElementById('preFeedbackModalContainer')) {
        const container = document.createElement('div');
        container.id = 'preFeedbackModalContainer';
        document.body.appendChild(container);
    }
}

/**
 * 显示反馈弹窗
 */
async function showPreFeedbackModal(caseId) {
    createPreFeedbackModalContainer();
    const modalContainer = document.getElementById('preFeedbackModalContainer');

    // 渲染弹窗HTML
    modalContainer.innerHTML = `
    <div class="modal fade" id="preFeedbackModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">案件反馈</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <form id="preFeedbackForm">
                        <input type="hidden" id="preFeedbackCaseId" value="${caseId}">
                        <div class="form-group">
                            <label for="preFeedbackContent">反馈内容</label>
                            <textarea id="preFeedbackContent" class="form-control" rows="5" required placeholder="请输入反馈内容..."></textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                    <button type="button" class="btn btn-primary" onclick="submitPreFeedback()">确认提交</button>
                </div>
            </div>
        </div>
    </div>
    `;

    // 显示模态框
    const modal = new bootstrap.Modal(document.getElementById('preFeedbackModal'));
    modal.show();
}

/**
 * 提交反馈内容到后端
 */
async function submitPreFeedback() {
    const caseId = document.getElementById('preFeedbackCaseId').value;
    const feedbackContent = document.getElementById('preFeedbackContent').value.trim();

    if (!feedbackContent) {
        alert('请输入反馈内容');
        return;
    }

    try {
        // 调用后端反馈接口
        await request('/case/pre-feedback','POST', {
            caseId: caseId,
            preFeedback: feedbackContent
        });

        // 关闭弹窗并刷新列表
        const modal = bootstrap.Modal.getInstance(document.getElementById('preFeedbackModal'));
        modal.hide();
        loadMyCases(currentMyCasePage,currentMyCasePageSize); // 刷新案件列表
        alert('反馈提交成功');
    } catch (error) {
        console.error('反馈提交失败:', error);
        alert('反馈提交失败，请重试');
    }
}


/**
 * 显示退回案件模态框
 * @param {number} caseId 案件ID
 */
function showReturnCaseModal(caseId) {
    const modalContainer = document.getElementById('completeCaseModalContainer');

    // 创建模态框
    const modalHtml = `
    <div class="modal fade" id="returnCaseModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">退回案件原因</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <form id="returnCaseForm">
                        <input type="hidden" id="returnCaseId" value="${caseId}">
                        <div class="form-group">
                            <label for="returnReason">请输入退回原因</label>
                            <textarea id="returnReason" class="form-control" rows="5" required placeholder="请详细描述退回原因..."></textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                    <button type="button" class="btn btn-warning" onclick="submitCaseReturn()">提交退回</button>
                </div>
            </div>
        </div>
    </div>
    `;

    modalContainer.innerHTML = modalHtml;

    // 显示模态框
    const returnModal = new bootstrap.Modal(document.getElementById('returnCaseModal'));
    returnModal.show();
}

/**
 * 提交案件退回
 */
async function submitCaseReturn() {
    const caseId = document.getElementById('returnCaseId').value;
    const returnReason = document.getElementById('returnReason').value.trim();

    if (!returnReason) {
        alert('请输入退回原因');
        return;
    }

    try {
        await request('/case/return', 'POST', {
            caseId: caseId,
            returnReason: returnReason
        });

        // 关闭模态框并刷新列表
        const returnModal = bootstrap.Modal.getInstance(document.getElementById('returnCaseModal'));
        returnModal.hide();
        loadMyCases(currentMyCasePage,currentMyCasePageSize);
        alert('案件已成功退回');
    } catch (error) {
    }
}

/**
 * 创建完成案件模态框容器
 */
function createCompleteCaseModalContainer() {
    if (!document.getElementById('completeCaseModalContainer')) {
        const container = document.createElement('div');
        container.id = 'completeCaseModalContainer';
        document.body.appendChild(container);
    }
}

/**
 * 显示完成案件模态框（带完成情况输入）
 * @param {number} caseId 案件ID
 */
function showCompleteCaseModal(caseId) {
    const modalContainer = document.getElementById('completeCaseModalContainer');

    // 创建模态框
    const modalHtml = `
    <div class="modal fade" id="completeCaseModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">案件完成情况</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <form id="completeCaseForm">
                        <input type="hidden" id="completeCaseId" value="${caseId}">
                        <div class="form-group">
                            <label for="completionNotes">请输入案件完成情况</label>
                            <textarea id="completionNotes" class="form-control" rows="5" required placeholder="请详细描述案件完成情况..."></textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                    <button type="button" class="btn btn-primary" onclick="submitCaseCompletion()">提交</button>
                </div>
            </div>
        </div>
    </div>
    `;

    modalContainer.innerHTML = modalHtml;

    // 显示模态框
    const completeModal = new bootstrap.Modal(document.getElementById('completeCaseModal'));
    completeModal.show();
}

/**
 * 提交案件完成情况
 */
async function submitCaseCompletion() {
    const caseId = document.getElementById('completeCaseId').value;
    const notes = document.getElementById('completionNotes').value.trim();

    if (!notes) {
        alert('请输入案件完成情况');
        return;
    }

    try {
        await request('/case/complete-with-notes', 'POST', {
            caseId: caseId,
            notes: notes
        });

        // 关闭模态框
        const modal = bootstrap.Modal.getInstance(document.getElementById('completeCaseModal'));
        modal.hide();

        // 重新加载我的案件列表
        loadMyCases(currentMyCasePage,currentMyCasePageSize);
        alert('案件已成功标记为完成');
    } catch (error) {
        console.error('提交失败:', error);
    }
}