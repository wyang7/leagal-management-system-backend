/**
 * 加载助理案件页面
 */
function loadAssistantCasesPage() {
    setActiveNav('助理案件');
    const mainContent = document.getElementById('mainContent');


    mainContent.innerHTML = `
        <div class="page-title">
            <h1>助理案件</h1>
        </div>
        
        <!-- 搜索区域 -->
        <div class="row mb-3">
            <div class="col-md-6">
                <div class="input-group">
                    <input type="text" id="assistantCaseSearchInput" class="form-control" placeholder="输入案由搜索">
                    <button class="btn btn-primary" onclick="searchAssistantCases()">
                        <i class="fa fa-search"></i> 搜索
                    </button>
                </div>
            </div>
        </div>
        
        <!-- 案件状态筛选 -->
        <div class="row mb-3">
            <div class="col-md-12">
                <div class="btn-group" role="group">
                    <button class="btn btn-outline-primary" onclick="filterAssistantCases('all')">全部</button>
                    <button class="btn btn-outline-primary" onclick="filterAssistantCases('待领取')">待领取</button>
                    <button class="btn btn-outline-primary" onclick="filterAssistantCases('已领取')">已领取</button>
                    <button class="btn btn-outline-primary" onclick="filterAssistantCases('预反馈')">预反馈</button>
                    <button class="btn btn-outline-primary" onclick="filterAssistantCases('延期')">延期</button>
                    <button class="btn btn-outline-primary" onclick="filterAssistantCases('已完成')">已完成</button>
                    <button class="btn btn-outline-primary" onclick="filterAssistantCases('退回')">退回</button>
                </div>
            </div>
        </div>
        
        <!-- 案件表格 -->
        <div class="table-responsive">
            <table class="table table-striped table-hover">
                <thead class="table-dark">
                    <tr>
                        <th>案件号</th>
                        <th>案由</th>
                        <th>标的额</th> <!-- 之前添加的标的额字段 -->
                        <th>案件归属地</th>
                        <th>法院收案时间</th>
                        <th>原告</th>
                        <th>被告</th>
                        <th>处理人</th>
                        <th>关联案件包</th>
                        <th>状态</th>
                        <th>操作</th>
                    </tr>
                </thead>
                <tbody id="assistantCaseTableBody">
                    <tr>
                        <td colspan="8" class="text-center">加载中...</td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;

    // 创建案件详情模态框容器
    createCaseDetailModalContainer();
    // 加载我的案件列表
    loadAssistantCases();
}

/**
 * 创建案件详情模态框容器
 */
function createCaseDetailModalContainer() {
    if (!document.getElementById('caseDetailModalContainer')) {
        const container = document.createElement('div');
        container.id = 'caseDetailModalContainer';
        document.body.appendChild(container);
    }
}


/**
 * 显示案件详情模态框
 * @param {number} caseId 案件ID
 */
async function showCaseDetailModal(caseId) {
    try {
        const caseInfo = await request(`/case/detail/${caseId}`);
        const modalContainer = document.getElementById('caseDetailModalContainer');

        // 格式化日期
        const formatDate = (dateStr) => {
            return dateStr ? new Date(dateStr).toLocaleString() : '-';
        };

        // 创建模态框
        const modalHtml = `
        <div class="modal fade" id="caseDetailModal" tabindex="-1" aria-hidden="true">
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
                                <strong>法院收案时间:</strong> ${formatDate(caseInfo.courtReceiveTime)}
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
                            </div>
                        </div>
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <strong>状态:</strong> ${caseInfo.status || '-'}
                            </div>
                            <div class="col-md-6">
                                <strong>处理人:</strong> ${caseInfo.userName || '-'}
                            </div>
                        </div>
                        <div class="row mb-3">
                            <div class="col-md-12">
                                <strong>完成情况:</strong>
                                <div class="mt-2 p-3 bg-light rounded">
                                    ${caseInfo.completionNotes || '无'}
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
        const detailModal = new bootstrap.Modal(document.getElementById('caseDetailModal'));
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
        tableBody.innerHTML = `<tr><td colspan="8" class="text-center">没有找到案件数据</td></tr>`;
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
            case '预反馈':
                statusClass = 'text-info';
                break;
            case '延期':
                statusClass = 'text-danger';
                break;
            case '已完成':
                statusClass = 'status-completed';
                break;
        }

        html += `
        <tr>
            <td>${caseInfo.caseNumber}</td>
            <td>${caseInfo.caseName}</td>
            <td>${caseInfo.amount != null ? caseInfo.amount.toFixed(2) : '0.00'}</td> <!-- 标的额展示 -->
            <td>${caseInfo.caseLocation || '-'}</td>
            <td>${caseInfo.courtReceiveTime ? new Date(caseInfo.courtReceiveTime).toLocaleDateString() : '-'}</td>
            <td>${caseInfo.plaintiffName || '-'}</td>
            <td>${caseInfo.defendantName || '-'}</td>
            <td>${caseInfo.username || '-'}</td>
            <td>${caseInfo.taskId || '-'}</td>
            <td><span class="status-badge ${statusClass}">${caseInfo.status}</span></td>
            <td>
                <button class="btn btn-sm btn-secondary" onclick="showCaseDetailModal(${caseInfo.caseId})">
                    <i class="fa fa-eye"></i> 详情
                </button>
            </td>
        </tr>
        `;
    });

    tableBody.innerHTML = html;
}



