/**
 * 加载我的案件页面
 */
function loadMyCasesPage() {
    setActiveNav('我的案件');
    const mainContent = document.getElementById('mainContent');


    mainContent.innerHTML = `
        <div class="page-title">
            <h1>我的案件</h1>
        </div>
        
        <!-- 搜索区域 -->
        <div class="row mb-3">
            <div class="col-md-6">
                <div class="input-group">
                    <input type="text" id="myCaseSearchInput" class="form-control" placeholder="输入案由搜索">
                    <button class="btn btn-primary" onclick="searchMyCases()">
                        <i class="fa fa-search"></i> 搜索
                    </button>
                </div>
            </div>
        </div>
        
        <!-- 案件状态筛选 -->
        <div class="row mb-3">
            <div class="col-md-12">
                <div class="btn-group" role="group">
                    <button class="btn btn-outline-primary" onclick="filterMyCases('all')">全部</button>
                    <button class="btn btn-outline-primary" onclick="filterMyCases('待领取')">待领取</button>
                    <button class="btn btn-outline-primary" onclick="filterMyCases('已领取')">已领取</button>
                    <button class="btn btn-outline-primary" onclick="filterMyCases('已完成')">已完成</button>
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
                        <th>标的额</th> <!-- 之前添加的标的额字段 -->
                        <th>案件归属地</th>
                        <th>法院收案时间</th>
                        <th>原告</th>
                        <th>被告</th>
                        <th>案件助理</th>
                        <th>关联案件包</th>
                        <th>状态</th>
                        <th>操作</th>
                    </tr>
                </thead>
                <tbody id="myCaseTableBody">
                    <tr>
                        <td colspan="8" class="text-center">加载中...</td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;

    // 创建完成案件模态框容器
    createCompleteCaseModalContainer();
    // 加载我的案件列表
    loadMyCases();
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
async function loadMyCases() {
    try {
        const userId = await getCurrentUserId();
        if (!userId) {
            // 如果userId为空，直接终止（已在getCurrentUserId中处理跳转）
            document.getElementById('myCaseTableBody').innerHTML = `
                <tr><td colspan="7" class="text-center text-danger">未获取到用户信息</td></tr>
            `;
            return;
        }

        // 确保userId有效后再发起请求
        const cases = await request(`/case/my-cases?userId=${userId}`);
        renderMyCaseTable(cases);
    } catch (error) {
        document.getElementById('myCaseTableBody').innerHTML = `
            <tr><td colspan="8" class="text-center text-danger">加载案件失败</td></tr>
        `;
    }
}

/**
 * 根据案由搜索我的案件
 */
async function searchMyCases() {
    const caseName = document.getElementById('myCaseSearchInput').value.trim();
    const userId = getCurrentUserId();
    try {
        let cases;
        if (caseName) {
            // 先搜索所有符合条件的案件，再筛选当前用户的
            const allMatchedCases = await request(`/case/search?name=${encodeURIComponent(caseName)}`);
            cases = allMatchedCases.filter(c => c.userId == userId);
        } else {
            cases = await request(`/case/my-cases?userId=${userId}`);
        }
        renderMyCaseTable(cases);
    } catch (error) {
        console.error('搜索失败:', error);
    }
}

/**
 * 根据状态筛选我的案件
 */
async function filterMyCases(status) {
    const userId = getCurrentUserId();
    try {
        let cases = await request(`/case/my-cases?userId=${userId}`);
        if (status !== 'all') {
            cases = cases.filter(c => c.status === status);
        }
        renderMyCaseTable(cases);

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
function renderMyCaseTable(cases) {
    const tableBody = document.getElementById('myCaseTableBody');

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
            case '已完成':
                statusClass = 'status-completed';
                break;
        }

        html += `
        <tr>
            <td>${caseInfo.caseId}</td>
            <td>${caseInfo.caseNumber}</td>
            <td>${caseInfo.caseName}</td>
            <td>${caseInfo.amount != null ? caseInfo.amount.toFixed(2) : '0.00'}</td> <!-- 标的额展示 -->
            <td>${caseInfo.caseLocation || '-'}</td>
            <td>${caseInfo.courtReceiveTime ? new Date(caseInfo.courtReceiveTime).toLocaleString() : '-'}</td>
            <td>${caseInfo.plaintiffName || '-'}</td>
            <td>${caseInfo.defendantName || '-'}</td>
            <td>${caseInfo.assistantName || '-'}</td>
            <td>${caseInfo.taskId || '-'}</td>
            <td><span class="status-badge ${statusClass}">${caseInfo.status}</span></td>
            <td>
                <!-- 只有已领取状态显示完成按钮 -->
                ${caseInfo.status === '已领取' ? `
                <button class="btn btn-sm btn-info" onclick="showCompleteCaseModal(${caseInfo.caseId})">
                    <i class="fa fa-check"></i> 完成
                </button>
                ` : ''}
            </td>
        </tr>
        `;
    });

    tableBody.innerHTML = html;
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
        loadMyCases();
        alert('案件已成功标记为完成');
    } catch (error) {
        console.error('提交失败:', error);
    }
}