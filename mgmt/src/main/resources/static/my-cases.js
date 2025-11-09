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
        <div id="myCasesHeader"></div>
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
                    <button class="ant-btn ant-btn-default btn btn-outline-primary" onclick="filterMyCases('待结案')">待结案</button>
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
                                <th style="white-space:nowrap;">领取时间</th>
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

    // 渲染表头
    renderMyCasesHeader();
}

/**
 * 渲染我的案件表头
 */
function renderMyCasesHeader() {
    const header = document.getElementById('myCasesHeader');
    if (header) {
        header.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h4 class="mb-0">我的案件</h4>
                <button class="ant-btn ant-btn-primary" onclick="exportMyCases()">
                    <i class="fa fa-download"></i> 导出我的案件
                </button>
            </div>
        `;
    }
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
        const formatDate = (dateStr) => dateStr ? new Date(dateStr).toLocaleString() : '-';

        const modalHtml = `
        <div class="modal fade" id="myCaseDetailModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content ant-card ant-card-bordered" style="border-radius:10px;box-shadow:0 4px 16px #e6f7ff;">
                    <div class="modal-header" style="border-bottom:1px solid #f0f0f0;">
                        <h5 class="modal-title"><i class="fa fa-info-circle text-primary me-2"></i>案件详情</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body" style="background:#fafcff;">
                        <div class="row mb-2">
                            <div class="col-md-6 mb-2">
                                <span class="text-muted">案件ID：</span><span class="fw-bold">${caseInfo.caseId}</span>
                            </div>
                            <div class="col-md-6 mb-2">
                                <span class="text-muted">案件号：</span><span class="fw-bold">${caseInfo.caseNumber || '-'}</span>
                            </div>
                        </div>
                        <hr>
                        <div class="row mb-2">
                            <div class="col-md-6 mb-2">
                                <span class="text-muted">案由：</span>${caseInfo.caseName || '-'}
                            </div>
                            <div class="col-md-6 mb-2">
                                <span class="text-muted">标的额：</span>${caseInfo.amount != null ? caseInfo.amount.toFixed(2) : '0.00'}
                            </div>
                        </div>
                        <div class="row mb-2">
                            <div class="col-md-6 mb-2">
                                <span class="text-muted">案件归属地：</span>${caseInfo.caseLocation || '-'}
                            </div>
                            <div class="col-md-6 mb-2">
                                <span class="text-muted">法官：</span>${caseInfo.judge || '-'}
                            </div>
                        </div>
                        <div class="row mb-2">
                            <div class="col-md-6 mb-2">
                                <span class="text-muted">收案时间：</span>${formatDate(caseInfo.courtReceiveTime)}
                            </div>
                            <div class="col-md-6 mb-2">
                                <span class="text-muted">原告：</span>${caseInfo.plaintiffName || '-'}
                            </div>
                        </div>
                        <div class="row mb-2">
                            <div class="col-md-6 mb-2">
                                <span class="text-muted">被告：</span>${caseInfo.defendantName || '-'}
                            </div>
                            <div class="col-md-6 mb-2">
                                <span class="text-muted">案件助理：</span>${caseInfo.assistantName || '-'}
                            </div>
                        </div>
                        <div class="row mb-2">
                            <div class="col-md-6 mb-2">
                                <span class="text-muted">关联案件包：</span>${caseInfo.taskName || '-'}
                            </div>
                            <div class="col-md-6 mb-2">
                                <span class="text-muted">状态：</span>${caseInfo.status || '-'}
                            </div>
                        </div>
                        <div class="row mb-2">
                            <div class="col-md-6 mb-2">
                                <span class="text-muted">处理人：</span>${caseInfo.username || '-'}
                            </div>
                        </div>
                        <hr>
                        <div class="mb-2">
                            <span class="text-muted">反馈情况：</span>
                            <div class="mt-1 p-2 bg-light rounded border">${caseInfo.preFeedback ? caseInfo.preFeedback.replace(/\n/g, '<br>') : '无'}</div>
                        </div>
                        <div class="mb-2">
                            <span class="text-muted">退回情况：</span>
                            <div class="mt-1 p-2 bg-light rounded border">${caseInfo.returnReason ? caseInfo.returnReason.replace(/\n/g, '<br>') : '无'}</div>
                        </div>
                        <div class="mb-2">
                            <span class="text-muted">完成情况：</span>
                            <div class="mt-1 p-2 bg-light rounded border">${caseInfo.completionNotes ? caseInfo.completionNotes.replace(/\n/g, '<br>') : '无'}</div>
                        </div>
                    </div>
                    <div class="modal-footer" style="border-top:1px solid #f0f0f0;">
                        <button type="button" class="ant-btn ant-btn-primary btn btn-primary" data-bs-dismiss="modal" style="border-radius:4px;">关闭</button>
                    </div>
                </div>
            </div>
        </div>
        `;
        modalContainer.innerHTML = modalHtml;
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
 * 导出我的案件
 */
async function exportMyCases() {
    try {
        // 获取当前用户ID（假设App.user.userId已全局可用）
        const userId = App.user.userId;
        const url = '/api/case/export-my-cases';
        const fetchOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId })
        };
        const response = await fetch(url, fetchOptions);
        if (!response.ok) throw new Error('导出失败');
        const blob = await response.blob();
        const filename = '我的案件_' + new Date().toISOString().slice(0, 10) + '.xlsx';
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = filename;
        link.click();
    } catch (e) {
        alert('导出失败，请重试');
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
        tableBody.innerHTML = `<tr><td colspan="11" class="text-center">没有找到案件数据</td></tr>`;
        return;
    }
    let html = '';
    const now = new Date();
    cases.forEach((caseInfo, idx) => {
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
            case '待结案':
                statusClass = 'status-completed';
                break;
            case '退回':
                statusClass = 'status-returned';
                break;
            case '调解失败':
                statusClass = 'status-failed'; // 红色表示失败
                break;
            case '结案':
                statusClass = 'status-closed';
                break;
        }

        // 自动退回提醒逻辑
        let remindHtml = '';
        if (caseInfo.receiveTime) {
            const receiveDate = new Date(caseInfo.receiveTime);
            const daysSinceReceived = Math.floor((now - receiveDate) / (1000 * 60 * 60 * 24));
            // 自行领取
            if (caseInfo.receiveType === 'self_receive') {
                if (caseInfo.status === '已领取' && daysSinceReceived >= 0 && daysSinceReceived > 0 && daysSinceReceived <= 3) {
                    remindHtml = `<div class="alert alert-danger p-1 mb-1" style="font-size:13px;">即将自动退回，请及时操作！</div>`;
                }
                if (caseInfo.status === '反馈' && daysSinceReceived >= 12 && daysSinceReceived <= 15) {
                    remindHtml = `<div class="alert alert-danger p-1 mb-1" style="font-size:13px;">即将自动退回，请及时操作！</div>`;
                }
            }
            // 被分派
            if (caseInfo.receiveType === 'assign' && (caseInfo.status === '已领取' || caseInfo.status === '反馈')) {
                if (daysSinceReceived >= 7 && daysSinceReceived <= 10) {
                    remindHtml = `<div class="alert alert-danger p-1 mb-1" style="font-size:13px;">即将自动退回，请及时操作！</div>`;
                }
            }
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
            <td>${caseInfo.receiveTime ? new Date(caseInfo.receiveTime).toLocaleString() : '-'}</td>
            <td>
                <span class="status-badge ${statusClass}">${caseInfo.status}</span>
                ${remindHtml}
            </td>
            <td>
                <div class="d-flex flex-column gap-2">
                  <div class="dropdown">
                    <button class="btn btn-sm btn-info dropdown-toggle my-dropdown-btn" type="button" data-dropdown-type="detail" data-case-id="${caseInfo.caseId}">
                      案件详情
                    </button>
                    <ul class="dropdown-menu" style="display:none;">
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
                    <button class="btn btn-sm btn-primary dropdown-toggle my-dropdown-btn" type="button" data-dropdown-type="action" data-case-id="${caseInfo.caseId}">
                      案件操作
                    </button>
                    <ul class="dropdown-menu" style="display:none;">
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
                      ${(caseInfo.status !== '待结案') ? `
                      <li>
                        <a class="dropdown-item" href="javascript:void(0);" onclick="showCompleteCaseModal(${caseInfo.caseId})">
                          <i class="fa fa-check"></i> 提交结案审核
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

    // 绑定自定义下拉菜单浮层逻辑
    bindFixedDropdownMenus();
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

    // 渲染弹窗HTML（antd风格）
    modalContainer.innerHTML = `
    <div class="modal fade" id="delayModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content ant-card ant-card-bordered" style="border-radius:10px;box-shadow:0 4px 16px #e6f7ff;">
                <div class="modal-header" style="border-bottom:1px solid #f0f0f0;">
                    <h5 class="modal-title"><i class="fa fa-clock-o text-primary me-2"></i>案件延期申请</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body" style="background:#fafcff;">
                    <form id="delayForm">
                        <input type="hidden" id="delayCaseId" value="${caseId}">
                        <div class="form-group">
                            <label for="delayReasonContent">延期原因</label>
                            <textarea id="delayReasonContent" class="form-control" rows="5" required placeholder="请输入延期原因..."></textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer" style="border-top:1px solid #f0f0f0;">
                    <button type="button" class="ant-btn ant-btn-secondary btn btn-secondary" data-bs-dismiss="modal" style="border-radius:4px;">取消</button>
                    <button type="button" class="ant-btn ant-btn-primary btn btn-primary" onclick="submitDelay()" style="border-radius:4px;">确认提交</button>
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

    // 渲染弹窗HTML（antd风格）
    modalContainer.innerHTML = `
    <div class="modal fade" id="preFeedbackModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content ant-card ant-card-bordered" style="border-radius:10px;box-shadow:0 4px 16px #e6f7ff;">
                <div class="modal-header" style="border-bottom:1px solid #f0f0f0;">
                    <h5 class="modal-title"><i class="fa fa-comment text-primary me-2"></i>案件反馈</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body" style="background:#fafcff;">
                    <form id="preFeedbackForm">
                        <input type="hidden" id="preFeedbackCaseId" value="${caseId}">
                        <div class="form-group">
                            <label for="preFeedbackContent">反馈内容</label>
                            <textarea id="preFeedbackContent" class="form-control" rows="5" required placeholder="请输入反馈内容..."></textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer" style="border-top:1px solid #f0f0f0;">
                    <button type="button" class="ant-btn ant-btn-secondary btn btn-secondary" data-bs-dismiss="modal" style="border-radius:4px;">取消</button>
                    <button type="button" class="ant-btn ant-btn-primary btn btn-primary" onclick="submitPreFeedback()" style="border-radius:4px;">确认提交</button>
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

    // 创建模态框（antd风格）
    const modalHtml = `
    <div class="modal fade" id="returnCaseModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content ant-card ant-card-bordered" style="border-radius:10px;box-shadow:0 4px 16px #e6f7ff;">
                <div class="modal-header" style="border-bottom:1px solid #f0f0f0;">
                    <h5 class="modal-title"><i class="fa fa-undo text-primary me-2"></i>退回案件原因</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body" style="background:#fafcff;">
                    <form id="returnCaseForm">
                        <input type="hidden" id="returnCaseId" value="${caseId}">
                        <div class="form-group">
                            <label for="returnReason">请输入退回原因</label>
                            <textarea id="returnReason" class="form-control" rows="5" required placeholder="请详细描述退回原因..."></textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer" style="border-top:1px solid #f0f0f0;">
                    <button type="button" class="ant-btn ant-btn-secondary btn btn-secondary" data-bs-dismiss="modal" style="border-radius:4px;">取消</button>
                    <button type="button" class="ant-btn ant-btn-warning btn btn-warning" onclick="submitCaseReturn()" style="border-radius:4px;">提交退回</button>
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

    // 创建模态框（antd风格）
    const modalHtml = `
    <div class="modal fade" id="completeCaseModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content ant-card ant-card-bordered" style="border-radius:10px;box-shadow:0 4px 16px #e6f7ff;">
                <div class="modal-header" style="border-bottom:1px solid #f0f0f0;">
                    <h5 class="modal-title"><i class="fa fa-check text-primary me-2"></i>案件完成情况</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body" style="background:#fafcff;">
                    <form id="completeCaseForm">
                        <input type="hidden" id="completeCaseId" value="${caseId}">
                        <div class="form-group">
                            <label for="completionNotes">请选择结案方式</label>
                            <select id="completionNotes" class="form-select" required>
                                <option value="">请选择</option>
                                <option value="司法确认">司法确认</option>
                                <option value="撤诉">撤诉</option>
                                <option value="民初">民初</option>
                            </select>
                        </div>
                    </form>
                </div>
                <div class="modal-footer" style="border-top:1px solid #f0f0f0;">
                    <button type="button" class="ant-btn ant-btn-secondary btn btn-secondary" data-bs-dismiss="modal" style="border-radius:4px;">取消</button>
                    <button type="button" class="ant-btn ant-btn-primary btn btn-primary" onclick="submitCaseCompletion()" style="border-radius:4px;">提交</button>
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
        alert('请选择结案方式');
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
        alert('案件已成功标记为待结案');
    } catch (error) {
        console.error('提交失败:', error);
    }
}

/**
 * 创建案件历史记录模态框容器
 */
function createCaseHistoryModalContainer() {
    if (!document.getElementById('caseHistoryModalContainer')) {
        const container = document.createElement('div');
        container.id = 'caseHistoryModalContainer';
        document.body.appendChild(container);
    }
}

/**
 * 显示案件历史流转记录模态框（antd风格）
 * @param {number} caseId 案件ID
 */
async function showCaseHistoryModal(caseId) {
    createCaseHistoryModalContainer();
    const modalContainer = document.getElementById('caseHistoryModalContainer');
    try {
        const historyList = await request(`/case/history/${caseId}`);
        let historyHtml = '';
        if (historyList && historyList.length > 0) {
            historyHtml = historyList.map(item => `
                <div class="mb-3 pb-2 border-bottom">
                    <div class="d-flex justify-content-between align-items-center">
                        <span class="fw-bold text-primary">${item.action || '-'}</span>
                        <span class="text-muted small">${item.createTime ? new Date(item.createTime).toLocaleString() : '-'}</span>
                    </div>
                    <div class="mt-1">
                        <span class="text-muted">操作人：</span>${item.operatorName || '-'}
                    </div>
                    <div class="mt-1">
                        <span class="text-muted">状态变更：</span>
                        <span>${item.beforeStatus || '-'} <i class="fa fa-arrow-right mx-1"></i> ${item.afterStatus || '-'}</span>
                    </div>
                    <div class="mt-1">
                        <span class="text-muted">备注：</span>${item.remarks ? item.remarks.replace(/\n/g, '<br>') : '-'}
                    </div>
                </div>
            `).join('');
        } else {
            historyHtml = `<div class="text-center text-muted">暂无流转记录</div>`;
        }

        const modalHtml = `
        <div class="modal fade" id="caseHistoryModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content ant-card ant-card-bordered" style="border-radius:10px;box-shadow:0 4px 16px #e6f7ff;">
                    <div class="modal-header" style="border-bottom:1px solid #f0f0f0;">
                        <h5 class="modal-title"><i class="fa fa-history text-primary me-2"></i>案件历史流转记录</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body" style="background:#fafcff;max-height:60vh;overflow-y:auto;">
                        ${historyHtml}
                    </div>
                    <div class="modal-footer" style="border-top:1px solid #f0f0f0;">
                        <button type="button" class="ant-btn ant-btn-primary btn btn-primary" data-bs-dismiss="modal" style="border-radius:4px;">关闭</button>
                    </div>
                </div>
            </div>
        </div>
        `;
        modalContainer.innerHTML = modalHtml;
        const historyModal = new bootstrap.Modal(document.getElementById('caseHistoryModal'));
        historyModal.show();
    } catch (error) {
        alert('加载历史流转记录失败');
    }
}

/**
 * 绑定自定义下拉菜单浮层逻辑
 */
function bindFixedDropdownMenus() {
    // 先移除所有已存在的全局浮动菜单
    document.querySelectorAll('.my-fixed-dropdown-menu').forEach(el => el.remove());

    // 关闭菜单的事件
    function closeAllDropdownMenus() {
        document.querySelectorAll('.my-fixed-dropdown-menu').forEach(el => el.remove());
    }

    // 绑定按钮点击
    document.querySelectorAll('.my-dropdown-btn').forEach(btn => {
        btn.onclick = function(e) {
            e.stopPropagation();
            // 先关闭其它
            closeAllDropdownMenus();

            // 获取原ul
            const ul = btn.parentElement.querySelector('.dropdown-menu');
            if (!ul) return;

            // 克隆ul内容
            const menu = ul.cloneNode(true);
            menu.classList.add('my-fixed-dropdown-menu');
            menu.style.display = 'block';
            menu.style.position = 'fixed';
            menu.style.zIndex = 3000;
            menu.style.minWidth = btn.offsetWidth + 'px';

            // 计算按钮在页面的位置
            const rect = btn.getBoundingClientRect();
            // 判断空间，优先下方，若下方空间不足则上方
            const menuHeight = 40 * menu.children.length;
            let top = rect.bottom;
            if (top + menuHeight > window.innerHeight) {
                top = rect.top - menuHeight;
            }
            menu.style.left = rect.left + 'px';
            menu.style.top = top + 'px';

            // 点击菜单项后关闭
            menu.onclick = function(ev) {
                ev.stopPropagation();
                closeAllDropdownMenus();
            };

            // 添加到body
            document.body.appendChild(menu);

            // 点击页面其它地方关闭
            setTimeout(() => {
                document.addEventListener('click', closeAllDropdownMenus, { once: true });
            }, 0);
        };
    });
}
