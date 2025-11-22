/**
 * 加载助理案件页面
 */
function loadAssistantCasesPage() {
    setActiveNav('助理案件');
    const mainContent = document.getElementById('mainContent');

    mainContent.innerHTML = `
        <div class="ant-card ant-card-bordered mb-4" style="border-radius:8px;box-shadow:0 2px 8px #f0f1f2;">
            <div class="ant-card-body">
                <div class="row g-3 align-items-center">
                    <div class="col-md-4">
                        <div class="input-group">
                            <span class="input-group-text bg-light px-2" style="border-radius:4px 0 0 4px;">
                                <i class="fa fa-book text-secondary"></i>
                            </span>
                            <input type="text" id="assistantCaseSearchInput" class="form-control ant-input" placeholder="案由" style="border-radius:0 4px 4px 0;">
                        </div>
                    </div>
                    <div class="col-md-2 d-flex align-items-end">
                        <button class="ant-btn ant-btn-primary w-100" style="border-radius:4px;" onclick="searchAssistantCases()">
                            <i class="fa fa-search me-1"></i> 查询
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <div class="ant-card ant-card-bordered mb-3" style="border-radius:8px;">
            <div class="ant-card-body">
                <div class="btn-group mb-2" role="group">
                    <button class="ant-btn ant-btn-default btn btn-outline-primary" onclick="filterAssistantCases('all')">全部</button>
                    <button class="ant-btn ant-btn-default btn btn-outline-primary" onclick="filterAssistantCases('待领取')">待领取</button>
                    <button class="ant-btn ant-btn-default btn btn-outline-primary" onclick="filterAssistantCases('已领取')">已领取</button>
                    <button class="ant-btn ant-btn-default btn btn-outline-primary" onclick="filterAssistantCases('反馈')">反馈</button>
                    <button class="ant-btn ant-btn-default btn btn-outline-primary" onclick="filterAssistantCases('延期')">延期</button>
                    <button class="ant-btn ant-btn-default btn btn-outline-primary" onclick="filterAssistantCases('待结案')">待结案</button>
                    <button class="ant-btn ant-btn-default btn btn-outline-primary" onclick="filterAssistantCases('退回')">退回</button>
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
                                <th style="white-space:nowrap;">处理人</th>
                                <th style="white-space:nowrap;">案件助理</th>
                                <th style="white-space:nowrap;">状态</th>
                                <th style="white-space:nowrap;">操作</th>
                            </tr>
                        </thead>
                        <tbody id="assistantCaseTableBody">
                            <tr>
                                <td colspan="11" class="text-center">加载中...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    // 创建案件详情模态框容器
    createassistantCaseDetailModalContainer();
    // 创建案件历史记录模态框容器
    createCaseHistoryModalContainer();
    // 加载我的案件列表
    loadAssistantCases();
}

/**
 * 创建案件详情模态框容器
 */
function createassistantCaseDetailModalContainer() {
    if (!document.getElementById('assistantCaseDetailModalContainer')) {
        const container = document.createElement('div');
        container.id = 'assistantCaseDetailModalContainer';
        document.body.appendChild(container);
    }
}


/**
 * 显示案件详情模态框
 * @param {number} caseId 案件ID
 */
async function showAssistantCaseDetailModal(caseId) {
    try {
        const caseInfo = await request(`/case/detail/${caseId}`);
        const modalContainer = document.getElementById('assistantCaseDetailModalContainer');
        const formatDate = (dateStr) => dateStr ? new Date(dateStr).toLocaleString() : '-';

        const modalHtml = `
        <div class="modal fade" id="assistantCaseDetailModal" tabindex="-1" aria-hidden="true">
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
                                <span class="text-muted">处理人：</span>${caseInfo.userName || '-'}
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
        const detailModal = new bootstrap.Modal(document.getElementById('assistantCaseDetailModal'));
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
}

/**
 * 加载我的案件列表
 */
async function loadAssistantCases() {
    try {
        const userId = await getCurrentUserId();
        if (!userId) {
            // 如果userId为空，直接终止（已在getCurrentUserId中处理跳转）
            document.getElementById('assistantCaseTableBody').innerHTML = `
                <tr><td colspan="7" class="text-center text-danger">未获取到用户信息</td></tr>
            `;
            return;
        }

        // 确保userId有效后再发起请求
        const cases = await request(`/case/assistant-cases?userId=${userId}`);
        renderAssistantCaseTable(cases);
    } catch (error) {
        document.getElementById('assistantCaseTableBody').innerHTML = `
            <tr><td colspan="8" class="text-center text-danger">加载案件失败</td></tr>
        `;
    }
}

/**
 * 根据案由搜索我的案件
 */
async function searchAssistantCases() {
    const caseName = document.getElementById('assistantCaseSearchInput').value.trim();
    const userId = await getCurrentUserId();
    try {
        let cases;
        if (caseName) {
            // 先搜索所有符合条件的案件，再筛选当前用户的
            const allMatchedCases = await request(`/case/search?name=${encodeURIComponent(caseName)}`);
            cases = allMatchedCases.filter(c => c.userId == userId);
        } else {
            cases = await request(`/case/assistant-cases?userId=${userId}`);
        }
        renderAssistantCaseTable(cases);
    } catch (error) {
        console.error('搜索失败:', error);
    }
}

/**
 * 根据状态筛选我的案件
 */
async function filterAssistantCases(status) {
    const userId = await getCurrentUserId();
    try {
        let cases = await request(`/case/assistant-cases?userId=${userId}`);
        if (status !== 'all') {
            cases = cases.filter(c => c.status === status);
        }
        renderAssistantCaseTable(cases);

        // 更新按钮样式
        document.querySelectorAll('.btn-group .btn').forEach(btn => {
            btn.classList.remove('btn-primary');
            btn.classList.add('btn-outline-primary');
        });
        event.currentTarget.classList.remove('btn-outline-primary');
        event.currentTarget.classList.add('btn-primary');
    } catch (error) {
        console.error('筛选失败:', error);
    }
}

/**
 * 渲染我的案件表格
 * @param {Array} cases 案件数组
 */
function renderAssistantCaseTable(cases) {
    const tableBody = document.getElementById('assistantCaseTableBody');
    if (!cases || cases.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="11" class="text-center">没有找到案件数据</td></tr>`;
        return;
    }
    let html = '';
    cases.forEach(caseInfo => {
        let statusClass = '';
        switch (caseInfo.status) {
            case '待领取': statusClass = 'status-pending-receive'; break;
            case '已领取': statusClass = 'status-received'; break;
            case '反馈': statusClass = 'status-pre-feedback'; break;
            case '延期': statusClass = 'status-delayed'; break;
            case '待结案': statusClass = 'status-completed'; break;
            case '退回': statusClass = 'status-returned'; break;
            case '调解失败': statusClass = 'status-failed'; break;
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
            <td>${caseInfo.username || '-'}</td>
            <td>${caseInfo.assistantName || '-'}</td>
            <td><span class="status-badge ${statusClass}">${caseInfo.status}</span></td>
            <td>
                <div class="d-flex flex-column gap-2">
                  <button class="btn btn-sm btn-info" type="button" onclick="showAssistantCaseDetailModal(${caseInfo.caseId})">案件详情</button>
                  <div class="dropdown">
                    <button class="btn btn-sm btn-primary dropdown-toggle" type="button" data-bs-toggle="dropdown">案件操作</button>
                    <ul class="dropdown-menu">
                      <li><a class="dropdown-item" href="javascript:void(0);" onclick="showPreFeedbackModal(${caseInfo.caseId})"><i class="fa fa-comment"></i> 反馈</a></li>
                      <li><a class="dropdown-item" href="javascript:void(0);" onclick="showDelayModal(${caseInfo.caseId})"><i class="fa fa-clock-o"></i> 延期</a></li>
                      <li><a class="dropdown-item" href="javascript:void(0);" onclick="showCompleteCaseModal(${caseInfo.caseId})"><i class="fa fa-check"></i> 完成</a></li>
                      <li><a class="dropdown-item" href="javascript:void(0);" onclick="showReturnCaseModal(${caseInfo.caseId})"><i class="fa fa-undo"></i> 退回</a></li>
                    </ul>
                  </div>
                </div>
            </td>
        </tr>`;
    });
    tableBody.innerHTML = html;
}
