/**
 * 加载案件管理页面，接收驻点参数
 * @param {string} station 驻点名称（九堡彭埠、本部、笕桥）
 */

let currentStation= '';
// 新增全局变量跟踪当前分页和筛选状态
let currentPage = 1;
const pageSize = 10;
// 新增全局变量，跟踪当前状态
let currentFilterStatus = 'all';

// 新增全局排序参数
let currentSortField = '';
let currentSortOrder = 'asc'; // 'asc' or 'desc'

function loadCaseManagementPage(station) {

    // 记录当前选中的驻点
    currentStation = station;

    // 修复BUG：切换驻点时重置状态筛选为全部
    currentFilterStatus = 'all';

    setActiveNav('案件管理');
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
                            <input type="text" id="caseSearchInput" class="form-control ant-input" placeholder="案由" style="border-radius:0 4px 4px 0;">
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="input-group">
                            <span class="input-group-text bg-light px-2" style="border-radius:4px 0 0 4px;">
                                <i class="fa fa-hashtag text-secondary"></i>
                            </span>
                            <input type="text" id="caseNumberSearchInput" class="form-control ant-input" placeholder="案号" style="border-radius:0 4px 4px 0;">
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="input-group">
                            <span class="input-group-text bg-light px-2" style="border-radius:4px 0 0 4px;">
                                <i class="fa fa-user text-secondary"></i>
                            </span>
                            <input type="text" id="plaintiffSearchInput" class="form-control ant-input" placeholder="原告" style="border-radius:0 4px 4px 0;">
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="input-group">
                            <span class="input-group-text bg-light px-2" style="border-radius:4px 0 0 4px;">
                                <i class="fa fa-user-o text-secondary"></i>
                            </span>
                            <input type="text" id="defendantSearchInput" class="form-control ant-input" placeholder="被告" style="border-radius:0 4px 4px 0;">
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="input-group">
                            <span class="input-group-text bg-light px-2" style="border-radius:4px 0 0 4px;">
                                <i class="fa fa-user text-secondary"></i>
                            </span>
                            <input type="text" id="userNameSearchInput" class="form-control ant-input" placeholder="处理人" style="border-radius:0 4px 4px 0;">
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="input-group">
                            <span class="input-group-text bg-light px-2" style="border-radius:4px 0 0 4px;">
                                <i class="fa fa-user-plus text-secondary"></i>
                            </span>
                            <input type="text" id="assistantSearchInput" class="form-control ant-input" placeholder="助理" style="border-radius:0 4px 4px 0;">
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="input-group">
                            <span class="input-group-text bg-light px-2" style="border-radius:4px 0 0 4px;">
                                <i class="fa fa-calendar text-secondary"></i>
                            </span>
                            <input type="date" id="receiveTimeSearchInput" class="form-control ant-input" style="border-radius:0 4px 4px 0;">
                        </div>
                    </div>
                    <div class="col-md-3 d-flex align-items-end">
                        <button class="ant-btn ant-btn-primary w-100" style="border-radius:4px;" onclick="loadCases()">
                            <i class="fa fa-search me-1"></i> 查询
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <div class="ant-card ant-card-bordered mb-3" style="border-radius:8px;">
            <div class="ant-card-body">
                <div class="d-flex justify-content-end gap-2 mb-2">
                    <input type="file" id="excelFileInput" accept=".xls,.xlsx" style="display:none" onchange="importCasesFromExcel(event)">
                    <button class="ant-btn" onclick="document.getElementById('excelFileInput').click()">
                        <i class="fa fa-upload me-1"></i> 导入Excel
                    </button>
                    <button class="ant-btn" onclick="exportCases()">
                        <i class="fa fa-download me-1"></i> 导出案件
                    </button>
                    <button class="ant-btn ant-btn-success" style="background:#52c41a;border-color:#52c41a;color:#fff;" onclick="showAddCaseModal()">
                        <i class="fa fa-plus me-1"></i> 新增案件
                    </button>
                    <button class="ant-btn ant-btn-primary" onclick="showBatchAssignModal()">
                        <i class="fa fa-users"></i> 批量分派
                    </button>
<!--                    <button class="ant-btn ant-btn-success" style="background:#52c41a;border-color:#52c41a;color:#fff;" onclick="showBatchAssignTaskModal()">-->
<!--                        <i class="fa fa-plus me-1"></i> 批量关联案件包-->
<!--                    </button>-->
                    <button class="ant-btn ant-btn-warning" id="batchReturnCourtTimeBtn" style="display:none;" onclick="showBatchReturnCourtTimeModal()">
                        <i class="fa fa-calendar"></i> 批量退回法院时间
                    </button>
                    <button class="ant-btn ant-btn-danger" id="batchFailedBtn" style="display:none;margin-left:8px;" onclick="showBatchFailedModal()">
                        <i class="fa fa-flag-checkered"></i> 批量调解失败
                    </button>
                </div>
                <div class="btn-group mb-2" role="group">
                    <button class="ant-btn ant-btn-default btn btn-outline-primary" onclick="filterCases('all')">全部</button>
                    <button class="ant-btn ant-btn-default btn btn-outline-primary" onclick="filterCases('待领取')">待领取</button>
                    <button class="ant-btn ant-btn-default btn btn-outline-primary" onclick="filterCases('已领取')">已领取</button>
                    <button class="ant-btn ant-btn-default btn btn-outline-primary" onclick="filterCases('反馈')">反馈</button>
                    <button class="ant-btn ant-btn-default btn btn-outline-primary" onclick="filterCases('延期')">延期</button>
                    <button class="ant-btn ant-btn-default btn btn-outline-primary" onclick="filterCases('待结案')">待结案</button>
                    <button class="ant-btn ant-btn-default btn btn-outline-primary" onclick="filterCases('退回')">退回</button>
                    <button class="ant-btn ant-btn-default btn btn-outline-primary" onclick="filterCases('调解失败')">调解失败</button>
                    <button class="ant-btn ant-btn-default btn btn-outline-primary" onclick="filterCases('结案')">结案</button>
                </div>
                <div id="batchCloseCaseBtnContainer"></div>
                <div class="table-responsive">
                    <table class="ant-table table table-hover table-bordered" style="border-radius:6px;overflow:hidden;">
                        <thead class="ant-table-thead table-light"></thead>
                        <tbody id="caseTableBody">
                            <tr>
                                <td colspan="13" class="text-center">加载中...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    // 创建案件模态框容器
    createCaseModalContainer();
    // 创建案件详情模态框容器
    createCaseDetailModalContainer();
    // 创建案件历史记录模态框容器
    createCaseHistoryModalContainer();
    // 创建批量分派模态框
    createBatchAssignModal();
    // 创建批量退回法院时间模态框
    createBatchReturnCourtTimeModal();
    // 加载案件列表（默认第一页，状态为全部）
    loadCases(1, 10, station);

    // 修复BUG：切换驻点时按钮高亮重置为全部
    setTimeout(() => {
        document.querySelectorAll('.btn-group .btn').forEach(btn => btn.classList.remove('active'));
        const allBtn = document.querySelector('.btn-group .btn[onclick="filterCases(\'all\')"]');
        if (allBtn) allBtn.classList.add('active');
    }, 0);

    renderCaseTableHeader(); // 新增：初次渲染表头
}

// 控制批量退回法院时间按钮显示
function updateBatchReturnCourtTimeBtnVisibility() {
    const btn = document.getElementById('batchReturnCourtTimeBtn');
    if (!btn) return;
    if (currentFilterStatus === '结案' || currentFilterStatus === '调解失败') {
        btn.style.display = '';
    } else {
        btn.style.display = 'none';
    }
}

// 创建批量退回法院时间模态框
function createBatchReturnCourtTimeModal() {
    if (!document.getElementById('batchReturnCourtTimeModal')) {
        const modalHtml = `
        <div class="modal fade" id="batchReturnCourtTimeModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content ant-card ant-card-bordered" style="border-radius:10px;box-shadow:0 4px 16px #e6f7ff;">
                    <div class="modal-header" style="border-bottom:1px solid #f0f0f0;">
                        <h5 class="modal-title"><i class="fa fa-calendar text-warning me-2"></i>批量设置退回法院时间</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body" style="background:#fafcff;">
                        <div class="mb-3">
                            <label class="form-label">请选择退回法院时间（精确到天）</label>
                            <input type="date" id="batchReturnCourtTimeInput" class="form-control" required>
                        </div>
                        <div class="text-danger" id="batchReturnCourtTimeError" style="display:none;"></div>
                    </div>
                    <div class="modal-footer" style="border-top:1px solid #f0f0f0;">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                        <button type="button" class="btn btn-primary" onclick="submitBatchReturnCourtTime()" style="border-radius:4px;">批量写入</button>
                    </div>
                </div>
            </div>
        </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }
}

/**
 * 显示批量退回法院时间弹窗
 */
function showBatchReturnCourtTimeModal() {
    const selectedCaseIds = getSelectedCaseIds();
    if (!selectedCaseIds.length) {
        alert('请先选择要批量设置退回法院时间的案件');
        return;
    }
    // 清空上次输入和错误提示
    document.getElementById('batchReturnCourtTimeInput').value = '';
    document.getElementById('batchReturnCourtTimeError').style.display = 'none';
    // 显示模态框
    const modal = new bootstrap.Modal(document.getElementById('batchReturnCourtTimeModal'));
    modal.show();
}

/**
 * 提交批量退回法院时间
 */
async function submitBatchReturnCourtTime() {
    const selectedCaseIds = getSelectedCaseIds();
    const returnCourtTime = document.getElementById('batchReturnCourtTimeInput').value;
    const errorDiv = document.getElementById('batchReturnCourtTimeError');
    errorDiv.style.display = 'none';

    if (!selectedCaseIds.length) {
        errorDiv.textContent = '请选择要批量设置的案件';
        errorDiv.style.display = 'block';
        return;
    }
    if (!returnCourtTime) {
        errorDiv.textContent = '请选择退回法院时间';
        errorDiv.style.display = 'block';
        return;
    }

    try {
        await request('/case/batch-update-return-court-time', 'POST', {
            caseIds: selectedCaseIds,
            returnCourtTime: returnCourtTime
        });
        // 关闭模态框
        const modal = bootstrap.Modal.getInstance(document.getElementById('batchReturnCourtTimeModal'));
        modal.hide();
        // 刷新列表
        loadCases();
        alert('批量退回法院时间设置成功');
    } catch (e) {
        errorDiv.textContent = '批量设置失败，请重试';
        errorDiv.style.display = 'block';
    }
}

/**
 * 创建批量分派模态框
 */
function createBatchAssignModal() {
    const modalHtml = `
    <div class="modal fade" id="batchAssignModal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">批量分派案件</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="mb-3">
                        <label class="form-label">选择负责人</label>
                        <select class="form-select" id="batchReceiveUserId" required>
                            <option value="">-- 请选择负责人 --</option>
                            <!-- 这里通过JS动态加载用户列表 -->
                        </select>
                    </div>
                    <div class="text-danger" id="batchAssignError" style="display: none;"></div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                    <button type="button" class="btn btn-primary" onclick="confirmBatchAssign()">确认分派</button>
                </div>
            </div>
        </div>
    </div>
    `;
    // 添加到页面
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    // 加载可选用户列表（实际项目中从接口获取）
    loadUsersForReceiveDropdown(true);
}

/**
 * 显示批量分派模态框
 */
function showBatchAssignModal() {
    const checkedBoxes = getSelectedCaseIds();

    if (checkedBoxes.length === 0) {
        alert('请选择要分派的案件');
        return;
    }
    // 重置模态框状态
    document.getElementById('batchAssignError').style.display = 'none';
    // 显示模态框
    new bootstrap.Modal(document.getElementById('batchAssignModal')).show();
}

/**
 * 确认批量分派
 */
async function confirmBatchAssign() {
    const userId = document.getElementById('batchReceiveUserId').value;
    const checkedBoxes = getSelectedCaseIds();

    if (!userId) {
        document.getElementById('batchAssignError').textContent = '请选择负责人';
        document.getElementById('batchAssignError').style.display = 'block';
        return;
    }

    try {
        await request(`/case/batch-assign`, 'POST', {
            caseIds: checkedBoxes,
            userId: userId
        });
        alert(`成功分派 ${checkedBoxes.length} 个案件`);
        // 关闭模态框并刷新列表
        bootstrap.Modal.getInstance(document.getElementById('batchAssignModal')).hide();
        loadCases(); // 刷新案件列表
        document.getElementById('selectAllCases').checked = false; // 取消全选
    } catch (error) {
        alert('批量分派失败: ' + (error.message || '未知错误'));
    }
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
 * 显示案件详情模态框（与my-cases.js中的实现相同，可以考虑抽取到common.js中复用）
 * @param {number} caseId 案件ID
 */
async function showCaseDetailModal(caseId) {
    try {
        const caseInfo = await request(`/case/detail/${caseId}`);
        const modalContainer = document.getElementById('caseDetailModalContainer');
        const formatDate = (dateStr) => dateStr ? new Date(dateStr).toLocaleString() : '-';

        modalContainer.innerHTML = `
        <div class="modal fade" id="caseDetailModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content ant-card ant-card-bordered" style="border-radius:10px;box-shadow:0 4px 16px #e6f7ff;">
                    <div class="modal-header" style="border-bottom:1px solid #f0f0f0;">
                        <h5 class="modal-title"><i class="fa fa-info-circle text-primary me-2"></i>案件详情</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body" style="background:#fafcff;">
                        <div class="row mb-2">
                            <div class="col-md-6 mb-2" style="display: none;">
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
                                <span class="text-muted">退回法院时间：</span>${formatDate(caseInfo.returnCourtTime)}
                            </div>
                        </div>
                        <div class="row mb-2">
                            <div class="col-md-6 mb-2">
                                <span class="text-muted">原告：</span>${caseInfo.plaintiffName || '-'}
                            </div>
                            <div class="col-md-6 mb-2">
                                <span class="text-muted">被告：</span>${caseInfo.defendantName || '-'}
                            </div>
                        </div>
                        <div class="row mb-2">
                            <div class="col-md-6 mb-2">
                                <span class="text-muted">案件助理：</span>${caseInfo.assistantName || '-'}
                            </div>
                            <div class="col-md-6 mb-2">
                                <span class="text-muted">关联案件包：</span>${caseInfo.taskName || '-'}
                            </div>
                        </div>
                        <div class="row mb-2">
                            <div class="col-md-6 mb-2">
                                <span class="text-muted">状态：</span>${caseInfo.status || '-'}
                            </div>
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
                            <span class="text-muted">案件完成情况：</span>
                            <div class="mt-1 p-2 bg-light rounded border">${caseInfo.completionNotes ? caseInfo.completionNotes.replace(/\n/g, '<br>') : '无'}</div>
                        </div>
                        <div class="mb-2">
                            <span class="text-muted">调解失败备注：</span>
                            <div class="mt-1 p-2 bg-light rounded border">${caseInfo.completionRemark ? caseInfo.completionRemark.replace(/\n/g, '<br>') : '无'}</div>
                        </div>
                    </div>
                    <div class="modal-footer" style="border-top:1px solid #f0f0f0;">
                        <button type="button" class="ant-btn ant-btn-primary btn btn-primary" data-bs-dismiss="modal" style="border-radius:4px;">关闭</button>
                    </div>
                </div>
            </div>
        </div>
        `;
        const detailModal = new bootstrap.Modal(document.getElementById('caseDetailModal'));
        detailModal.show();
    } catch (error) {
        console.error('获取案件详情失败:', error);
        alert('获取案件详情失败');
    }
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
 * 加载案件列表（支持分页）
 */
async function loadCases(pageNum = 1, pageSize = 10, station) {
    try {

        // 使用当前选中的驻点或传入的驻点参数
        const currentStationTemp = station || currentStation;
        currentPage = pageNum;

        // 发起分页查询请求
        const caseName = document.getElementById('caseSearchInput').value.trim();
        const caseNumber = document.getElementById('caseNumberSearchInput').value.trim();
        const plaintiff = document.getElementById('plaintiffSearchInput').value.trim();
        const defendant = document.getElementById('defendantSearchInput').value.trim();
        const userName = document.getElementById('userNameSearchInput').value.trim();
        const assistant = document.getElementById('assistantSearchInput').value.trim();
        const courtReceiveTime = document.getElementById('receiveTimeSearchInput').value.trim();

        const params = new URLSearchParams();
        params.append('pageNum', pageNum);
        params.append('pageSize', pageSize);
        if (caseName) params.append('caseName', caseName);
        if (caseNumber) params.append('caseNumber', caseNumber);
        if (plaintiff) params.append('plaintiff', plaintiff);   // 原告参数
        if (defendant) params.append('defendant', defendant); // 被告参数
        if (userName) params.append('userName', userName); // 处理人参数
        if (assistant) params.append('assistant', assistant); // 案件助理参数
        if (courtReceiveTime) params.append('courtReceiveTime', courtReceiveTime);
        if (currentFilterStatus !== 'all') params.append('status', currentFilterStatus);
        if (currentStationTemp) params.append('station', currentStationTemp); // 驻点信息
        if (currentSortField) {
            params.append('sortField', currentSortField);
            params.append('sortOrder', currentSortOrder);
        }

        const response = await request(`/case/page?${params.toString()}`);
        // 渲染表格和分页组件
        renderCaseTableHeader(); // 新增：每次加载数据时重建表头
        renderCaseTable(response.records);
        // 渲染分页组件（假设后端返回的分页信息包含total、pageNum、pageSize、pages等字段）
        renderPagination({
            total: response.total,      // 总记录数
            pageNum: response.pageNum,  // 当前页码
            pageSize: response.pageSize// 每页条数
        });
    } catch (error) {
        console.log("error2", error);
        document.getElementById('caseTableBody').innerHTML = `
            <tr><td colspan="14" class="text-center text-danger">加载案件失败</td></tr>
        `;
        // 清除分页组件
        document.getElementById('paginationContainer')?.remove();
    }
}

async function importCasesFromExcel(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async function(e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, {type: 'array'});
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, {header: 1});
        // 校验数据量
        if (rows.length - 1 > 5000) {
            alert('单次导入数据不能超过5000条');
            return;
        }
        const expected = ['案件号','案件归属地', '法院收案时间', '原告', '被告', '案由', '标的额', '助理', '法官'];
        if (rows[0].join() !== expected.join()) {
            alert('Excel表头格式不正确');
            return;
        }
        const caseList = [];
        const dateRegFull = /^\d{4}\.\d{1,2}\.\d{1,2}$/; // 2025.8.15
        const dateRegNoYear = /^\d{1,2}\.\d{1,2}$/;      // 8.15
        for (let i = 1; i < rows.length; i++) {
            const row = rows[i];
            // 校验字段缺失
            if (!row || row.length < 9 || row.slice(1,7).some(cell => cell === undefined || cell === null || cell === '')
            ) {
                alert(`第${i+1}行存在字段缺失`);
                return;
            }
            // 校验日期格式
            const dateStr = row[2] + '';
            if (!dateRegFull.test(dateStr) && !dateRegNoYear.test(dateStr)) {
                alert(`第${i+1}行法院收案时间格式错误，需为2025.8.15或8.15`);
                return;
            }
            caseList.push({
                caseNumber: row[0],
                caseLocation: row[1],
                courtReceiveTime: row[2],
                plaintiffName: row[3],
                defendantName: row[4],
                caseName: row[5],
                amount: parseFloat(row[6]) || 0 ,
                assistantName: row[7],
                judge: row[8]
            });
        }
        try {
            await request('/case/import-excel', 'POST', caseList);
            alert('导入成功');
            loadCases();
        } catch (e) {
            alert('导入失败');
        }
    };
    reader.readAsArrayBuffer(file);
}
/**
 * 渲染分页组件
 * @param {Object} pageInfo 分页信息对象，包含total、pageNum、pageSize、pages等
 */
function renderPagination(pageInfo) {
    const { total, pageNum, pageSize } = pageInfo;
    const pages= Math.ceil(total / pageSize);
    if (pages <= 1) {
        // 只有一页时不显示分页
        const paginationContainer = document.getElementById('paginationContainer');
        if (paginationContainer) {
            paginationContainer.innerHTML = `
                <div class="d-flex justify-content-center mt-2 text-secondary">
                    共 ${total} 条记录
                </div>
            `;
        }
        return;
    }

    // 创建分页容器（如果不存在）
    let paginationContainer = document.getElementById('paginationContainer');
    if (!paginationContainer) {
        paginationContainer = document.createElement('div');
        paginationContainer.id = 'paginationContainer';
        paginationContainer.className = 'd-flex justify-content-center mt-4';
        // 插入到表格下方
        document.querySelector('.table-responsive').after(paginationContainer);
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
            <li class="page-item"><a class="page-link" href="#" onclick="loadCases(1, ${pageSize})">1</a></li>
            ${startPage > 2 ? '<li class="page-item disabled"><span class="page-link">...</span></li>' : ''}
        `;
    }

    // 添加中间页码
    for (let i = startPage; i <= endPage; i++) {
        paginationHtml += `
            <li class="page-item ${i === pageNum ? 'active' : ''}">
                <a class="page-link" href="#" onclick="loadCases(${i}, ${pageSize})">${i}</a>
            </li>
        `;
    }

    // 添加最后一页按钮（当当前页不在后5页时）
    if (endPage < pages) {
        paginationHtml += `
            ${endPage < pages - 1 ? '<li class="page-item disabled"><span class="page-link">...</span></li>' : ''}
            <li class="page-item"><a class="page-link" href="#" onclick="loadCases(${pages}, ${pageSize})">${pages}</a></li>
        `;
    }

    // 下一页按钮
    paginationHtml += `
            <li class="page-item ${pageNum === pages ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="loadCases(${pageNum + 1}, ${pageSize})" aria-label="下一页">
                    <span aria-hidden="true">&raquo;</span>
                </a>
            </li>
        </ul>
    </nav>
    `;

    paginationContainer.innerHTML = paginationHtml;
}

/**
 * 根据状态筛选案件（支持分页）
 */
async function filterCases(status, pageNum = 1, pageSize = 10) {
    try {
        const allButtons = document.querySelectorAll('.btn-group .btn.btn-outline-primary');
        allButtons.forEach(button => {
            button.classList.remove('active');
        });

        const currentButton = document.querySelector(`.btn-group .btn[onclick="filterCases('${status}')"]`);
        if (currentButton) {
            currentButton.classList.add('active');
        }

        currentPage = pageNum;
        currentFilterStatus = status;
        updateBatchReturnCourtTimeBtnVisibility();
        updateBatchFailedBtnVisibility();
        updateBatchCloseCaseBtnVisibility();

        renderCaseTableHeader(); // 新增：切换状态时重建表头
        loadCases(currentPage, pageSize, currentStation);

        // 更新按钮样式（保持不变）
        document.querySelectorAll('.btn-group .btn').forEach(btn => {
            btn.classList.remove('btn-primary');
            btn.classList.add('btn-outline-primary');
        });
    } catch (error) {
        console.error('筛选失败:', error);
        document.getElementById('paginationContainer')?.remove();
    }
}

// 页面加载完成后初始化全选功能
document.addEventListener('DOMContentLoaded', function() {
    // 为全选复选框添加事件监听
    const selectAllCheckbox = document.getElementById('selectAllCases');
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', handleSelectAllChange);
    }
});

// 处理全选复选框变化事件
function handleSelectAllChange() {
    const selectAllCheckbox = document.getElementById('selectAllCases');
    // 获取所有行复选框
    const caseCheckboxes = document.querySelectorAll('.case-checkbox');

    // 同步所有行复选框状态与全选框一致
    caseCheckboxes.forEach(checkbox => {
        checkbox.checked = selectAllCheckbox.checked;
    });
}

/**
 * 渲染案件表格
 * @param {Array} cases 案件数组
 */
function renderCaseTable(cases) {
    const tableBody = document.getElementById('caseTableBody');
    if (!cases || cases.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="13" class="text-center">没有找到案件数据</td></tr>`;
        return;
    }
    let html = '';
    cases.forEach(caseInfo => {
        let statusClass = '';
        let statusText = caseInfo.status;
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
                statusText = '待结案';
                break;
            case '退回':
                statusClass = 'status-returned';
                break;
            case '调解失败':
                statusClass = 'status-failed';
                break;
            case '结案':
                statusClass = 'status-closed';
                break;
        }

        html += `
        <tr>
            <td><input type="checkbox" class="case-checkbox" value="${caseInfo.caseId}"></td>
            <td>${caseInfo.caseNumber}</td>
            <td>${caseInfo.caseName}</td>
            <td>${caseInfo.amount != null ? caseInfo.amount.toFixed(2) : '0.00'}</td>
            <td>${caseInfo.caseLocation || '-'}</td>
            <td>${caseInfo.plaintiffName || '-'}</td>
            <td>${caseInfo.defendantName || '-'}</td>
            <td>${caseInfo.judge || '-'}</td>
            <td>${caseInfo.assistantName || '-'}</td>
            `+
            ((currentFilterStatus !== '结案' && currentFilterStatus !== '调解失败')
                ? `<td>${caseInfo.receiveTime ? new Date(caseInfo.receiveTime).toLocaleString() : '-'}</td>`
                : '')+
            ((currentFilterStatus === '结案' || currentFilterStatus === '调解失败')
                ? `<td>${caseInfo.returnCourtTime ? caseInfo.returnCourtTime.split(' ')[0] : '-'}</td>`
                : '')+
            `<td><span class="status-badge ${statusClass}">${statusText}</span></td>
            <td>${caseInfo.username || '-'}</td>
            <td>
                <div class="d-flex flex-column gap-2">
                  <div class="dropdown">
                    <button class="btn btn-sm btn-info dropdown-toggle my-dropdown-btn" type="button" data-dropdown-type="detail" data-case-id="${caseInfo.caseId}">
                      案件详情
                    </button>
                    <ul class="dropdown-menu" style="display:none;">
                      <li>
                        <a class="dropdown-item" href="javascript:void(0);" onclick="showCaseDetailModal(${caseInfo.caseId})">
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
                      <li>
                        <a class="dropdown-item" href="javascript:void(0);" onclick="showEditCaseModal(${caseInfo.caseId})">
                          <i class="fa fa-edit"></i> 编辑
                        </a>
                      </li>
                      ${caseInfo.status !== '结案' ?
                        ((App.user.roleType === '管理员' && App.user.station === '总部') ? `
                      <li>
                        <a class="dropdown-item text-danger" href="javascript:void(0);" onclick="deleteCase(${caseInfo.caseId})">
                          <i class="fa fa-trash"></i> 删除
                        </a>
                      </li>
                      ` : '') : ''}
                      ${caseInfo.status !== '结案' ? `
                      <li>
                        <a class="dropdown-item" href="javascript:void(0);" onclick="showReceiveCaseModal(${caseInfo.caseId})">
                          <i class="fa fa-handshake-o"></i> 分派案件
                        </a>
                      </li>
                      ${caseInfo.status === '待结案' ? `
                      <li>
                        <a class="dropdown-item" href="javascript:void(0);" onclick="closeCase(${caseInfo.caseId})">
                          <i class="fa fa-check"></i> 结案
                        </a>
                      </li>
                      ` : ''}
                      ${(caseInfo.status !== '失败' && caseInfo.status !== '待领取') ? `
                      <li>
                        <a class="dropdown-item" href="javascript:void(0);" onclick="showFinishCaseModal(${caseInfo.caseId})">
                          <i class="fa fa-flag-checkered"></i> 调解失败
                        </a>
                      </li>
                      ` : ''}
                      ` : ''}
                    </ul>
                  </div>
                </div>
            </td>
        </tr>
        `;
    });
    tableBody.innerHTML = html;
    // 重新绑定全选事件（因为表格内容已刷新）
    const selectAllCheckbox = document.getElementById('selectAllCases');
    if (selectAllCheckbox) {
        // 先移除可能存在的旧事件监听
        selectAllCheckbox.removeEventListener('change', handleSelectAllChange);
        // 添加新的事件监听
        selectAllCheckbox.addEventListener('change', handleSelectAllChange);
    }
    bindFixedDropdownMenus();
}


// === 新增：动态渲染表头函数 ===
function renderCaseTableHeader() {
    const thead = document.querySelector('.ant-table-thead');
    if (!thead) return;
    thead.innerHTML = `
        <tr>
            <th style="white-space:nowrap;"><input type="checkbox" id="selectAllCases"></th>
            <th style="white-space:nowrap;">案件号</th>
            <th style="white-space:nowrap;">案由</th>
            <th style="white-space:nowrap;">标的额</th>
            <th style="white-space:nowrap;" title="案件归属地">归属地</th>
            <th style="white-space:nowrap;">原告</th>
            <th style="white-space:nowrap;">被告</th>
            <th style="white-space:nowrap;">法官</th>
            <th style="white-space:nowrap;">案件助理</th>
            ${
            (currentFilterStatus !== '结案' && currentFilterStatus !== '调解失败')
            ? `<th style="white-space:nowrap;">
                领取时间
                <span class="sort-btn" onclick="toggleSort('receiveTime')">
                    <i class="fa fa-sort${currentSortField==='receiveTime'?(currentSortOrder==='asc'?'-asc':'-desc'):''}"></i>
                </span>
               </th>`
            : ''
            }
            
            ${
                (currentFilterStatus === '结案' || currentFilterStatus === '调解失败')
                ? `<th style="white-space:nowrap;">
                    退法院时间
                    <span class="sort-btn" onclick="toggleSort('returnCourtTime')">
                        <i class="fa fa-sort${currentSortField==='returnCourtTime'?(currentSortOrder==='asc'?'-asc':'-desc'):''}"></i>
                    </span>
                </th>`
                : ''
            }
            <th style="white-space:nowrap;">状态</th>
            <th style="white-space:nowrap;">处理人</th>
            <th style="white-space:nowrap;">操作</th>
        </tr>
    `;
    // 重新绑定全选事件
    const selectAllCheckbox = document.getElementById('selectAllCases');
    if (selectAllCheckbox) {
        selectAllCheckbox.removeEventListener('change', handleSelectAllChange);
        selectAllCheckbox.addEventListener('change', handleSelectAllChange);
    }
}



/**
 * 排序按钮切换
 */
function toggleSort(field) {
    if (currentSortField === field) {
        currentSortOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
    } else {
        currentSortField = field;
        currentSortOrder = 'asc';
    }
    loadCases(currentPage, pageSize, currentStation);
}

/**
 * 绑定固定位置的下拉菜单
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

// 显示调解失败案件模态框
function showFinishCaseModal(caseId) {
    // 创建调解失败案件模态框（antd风格）
    const modalHtml = `
    <div class="modal fade" id="finishCaseModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content ant-card ant-card-bordered" style="border-radius:10px;box-shadow:0 4px 16px #e6f7ff;">
                <div class="modal-header" style="border-bottom:1px solid #f0f0f0;">
                    <h5 class="modal-title"><i class="fa fa-flag-checkered text-primary me-2"></i>调解失败确认</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body" style="background:#fafcff;">
                    <!-- 调解失败备注和退回时间表单 -->
                    <input type="hidden" id="finishCaseId" value="${caseId}">
                    <div class="mb-3">
                        <label class="form-label">调解失败备注</label>
                        <select class="form-select" id="finishRemark">
                            <option value="拒绝调解">拒绝调解</option>
                            <option value="联系不上">联系不上</option>
                            <option value="差距较大">差距较大</option>
                        </select>
                    </div>
                </div>
                <div class="modal-footer" style="border-top:1px solid #f0f0f0;">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                    <button type="button" class="btn btn-primary" onclick="confirmFinishCase()" style="border-radius:4px;">确认调解失败</button>
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
    const finishModal = new bootstrap.Modal(document.getElementById('finishCaseModal'));
    finishModal.show();

    // 模态框关闭后移除
    document.getElementById('finishCaseModal').addEventListener('hidden.bs.modal', function() {
        tempContainer.remove();
    });
}

// 5. 添加确认调解失败的函数
async function confirmFinishCase() {
    const caseId = document.getElementById('finishCaseId').value;
    const completionRemark = document.getElementById('finishRemark').value;

    if (!completionRemark) {
        alert('请选择调解失败备注');
        return;
    }

    try {
        await request('/case/complete', 'POST', {
            caseId:caseId,
            status: '调解失败',
            completionRemark:completionRemark
        });
        // 关闭模态框
        const modal = bootstrap.Modal.getInstance(document.getElementById('finishCaseModal'));
        modal.hide();
        // 重新加载案件列表
        loadCases();
        alert('案件已标记为调解失败');
    } catch (error) {
        console.error('调解失败案件失败:', error);
        alert('调解失败案件失败');
    }
}

// 创建批量关联案件包模态框
function createBatchAssignTaskModal() {
    const modalContainer = document.getElementById('caseModalContainer');

    if (!document.getElementById('batchAssignTaskModal')) {
        const modalHtml = `
        <div class="modal fade" id="batchAssignTaskModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
<!--                    <div class="modal-header">-->
<!--                        <h5 class="modal-title">批量关联案件包</h5>-->
<!--                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>-->
<!--                    </div>-->
                    <div class="modal-body">
                        <form id="batchAssignTaskForm">
                            <div class="form-group mb-3">
                                <label>已选择 <span id="selectedCaseCount">0</span> 个案件</label>
                            </div>
                            <div class="form-group">
                                <label for="batchTaskSelect">选择案件包</label>
                                <select id="batchTaskSelect" class="form-control" required>
                                    <option value="">-- 请选择案件包 --</option>
                                    <option value="0">取消关联</option>
                                </select>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                        <button type="button" class="btn btn-primary" onclick="submitBatchTaskAssignment()">提交</button>
                    </div>
                </div>
            </div>
        </div>
        `;

        modalContainer.innerHTML += modalHtml;
    }
}


// 显示批量关联案件包模态框
async function showBatchAssignTaskModal() {
    // 获取选中的案件ID
    const selectedCaseIds = getSelectedCaseIds();

    if (selectedCaseIds.length === 0) {
        alert('请先选择需要关联的案件');
        return;
    }

    createBatchAssignTaskModal();

    // 更新选中数量显示
    document.getElementById('selectedCaseCount').textContent = selectedCaseIds.length;

    try {
        // 获取所有案件包
        const tasks = await request('/task');
        const taskSelect = document.getElementById('batchTaskSelect');

        // 清空现有选项（保留第一个）
        while (taskSelect.options.length > 1) {
            taskSelect.remove(1);
        }

        // 添加案件包选项
        tasks.forEach(task => {
            const option = document.createElement('option');
            option.value = task.taskId;
            option.textContent = task.taskName;
            taskSelect.appendChild(option);
        });

        // 显示模态框
        const modal = new bootstrap.Modal(document.getElementById('batchAssignTaskModal'));
        modal.show();
    } catch (error) {
        alert('加载案件包失败');
    }
}


// 获取选中的案件ID
function getSelectedCaseIds() {
    const checkboxes = document.querySelectorAll('.case-checkbox:checked');
    return Array.from(checkboxes).map(checkbox => parseInt(checkbox.value));
}


// 提交批量案件包关联
async function submitBatchTaskAssignment() {
    const selectedCaseIds = getSelectedCaseIds();
    const taskId = document.getElementById('batchTaskSelect').value;

    if (selectedCaseIds.length === 0) {
        alert('没有选中的案件');
        return;
    }

    try {
        await request('/case/batch-update-task', 'POST', {
            caseIds: selectedCaseIds,
            taskId: taskId === '0' ? null : parseInt(taskId)
        });

        // 关闭模态框
        const modal = bootstrap.Modal.getInstance(document.getElementById('batchAssignTaskModal'));
        modal.hide();

        // 重新加载案件列表
        loadCases();


        alert(`成功关联 ${selectedCaseIds.length} 个案件`);
    } catch (error) {
        alert('批量关联失败');
    }
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
                <div class="modal-content ant-card ant-card-bordered" style="border-radius:10px;box-shadow:0 4px 16px #e6f7ff;">
                    <div class="modal-header" style="border-bottom:1px solid #f0f0f0;">
                        <h5 class="modal-title" id="caseModalTitle"><i class="fa fa-plus text-primary me-2"></i>新增案件</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body" style="background:#fafcff;">
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
                                <input type="date" id="courtReceiveTime" class="form-control" required>
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
                            <div class="form-group" hidden="hidden">
                                <label for="caseTaskId">关联案件包（可选）</label>
                                <select id="caseTaskId" class="form-control">
                                    ${taskOptions}
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="caseStatus">案件状态</label>
                                <select id="caseStatus" class="form-control" required>
                                    <option value="待领取">待领取</option>
                                    <option value="已领取">已领取</option>
                                    <option value="反馈">反馈</option>
                                    <option value="退回">退回</option>
                                    <option value="延期">延期</option>
                                    <option value="待结案">待结案</option>
                                </select>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer" style="border-top:1px solid #f0f0f0;">
                        <button type="button" class="ant-btn ant-btn-secondary btn btn-secondary" data-bs-dismiss="modal" style="border-radius:4px;">取消</button>
                        <button type="button" class="ant-btn ant-btn-primary btn btn-primary" onclick="saveCase()" style="border-radius:4px;">保存</button>
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
        // 确保caseInfo是一个对象，避免后续访问时报错
        const safeCaseInfo = caseInfo || {};
        const taskOptions = await loadTasksForCaseForm();
        const assistantOptions = await loadCaseAssistants();
        createCaseModal(taskOptions,assistantOptions);
        await loadCaseAssistants();

        let courtReceiveDate = '';
        if (caseInfo.courtReceiveTime) {
            // 后端返回格式为 "2025-09-19 00:00:00"，通过 split 分割出日期部分
            courtReceiveDate = caseInfo.courtReceiveTime.split(' ')[0];
            // 分割后得到 "2025-09-19"，符合 input[type=date] 要求
        }
        
        // 填充表单数据
        document.getElementById('caseAssistantId').value = safeCaseInfo.assistantId ?? '';
        document.getElementById('caseId').value = safeCaseInfo.caseId ?? '';
        document.getElementById('caseNumber').value = safeCaseInfo.caseNumber ?? '';
        document.getElementById('caseName').value = safeCaseInfo.caseName ?? '';
        document.getElementById('caseAmount').value = safeCaseInfo.amount ?? '';
        document.getElementById('caseLocation').value = safeCaseInfo.caseLocation ?? '';
        document.getElementById('courtReceiveTime').value = courtReceiveDate ?? '';
        document.getElementById('defendantName').value = safeCaseInfo.defendantName ?? '';
        document.getElementById('plaintiffName').value = safeCaseInfo.plaintiffName ?? '';
        document.getElementById('caseStatus').value = safeCaseInfo.status ?? '';
        document.getElementById('caseTaskId').value = caseInfo.taskId || '';
        document.getElementById('caseModalTitle').textContent = '编辑案件';
        
        // 显示模态框
        const caseModal = new bootstrap.Modal(document.getElementById('caseModal'));
        caseModal.show();
    } catch (error) {
        console.error("异常:", error);
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
    const plaintiffName = document.getElementById('plaintiffName').value.trim();
    const caseLocation = document.getElementById('caseLocation').value.trim();
    const courtReceiveTime = document.getElementById('courtReceiveTime').value.trim();
    const defendantName = document.getElementById('defendantName').value.trim();
    const caseName = document.getElementById('caseName').value.trim();
    const amount = parseFloat(document.getElementById('caseAmount').value) || 0;
    const taskId = document.getElementById('caseTaskId').value;
    const caseAssistantId = document.getElementById('caseAssistantId').value;
    const status = document.getElementById('caseStatus').value;
    
    // 简单验证
    if (!plaintiffName) {
        alert('请输入原告');
        return;
    }
    if (!defendantName) {
        alert('请输入被告');
        return;
    }
    if (!courtReceiveTime) {
        alert('请输入收案时间');
        return;
    }
    if (!caseLocation) {
        alert('请输入归属地');
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
    const caseData = {
        caseNumber: caseNumber,
        caseName: caseName,
        amount: amount,
        status: status,
        caseLocation: caseLocation,
        courtReceiveTime: courtReceiveTime,
        plaintiffName: plaintiffName,
        defendantName: defendantName,
        assistantId: caseAssistantId
    };
    // 可选字段
    if (taskId) {
        caseData.taskId = parseInt(taskId);
    }
    try {
        if (caseId) {
            // 编辑案件
            caseData.caseId = parseInt(caseId);
            await request('/case', 'PUT', caseData);
        } else {
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
    // 先加载用户列表数据
    loadUsersForReceiveDropdown();

    // 创建领取案件模态框（antd风格）
    const modalHtml = `
    <div class="modal fade" id="receiveCaseModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content ant-card ant-card-bordered" style="border-radius:10px;box-shadow:0 4px 16px #e6f7ff;">
                <div class="modal-header" style="border-bottom:1px solid #f0f0f0;">
                    <h5 class="modal-title"><i class="fa fa-handshake-o text-primary me-2"></i>领取案件</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body" style="background:#fafcff;">
                    <input type="hidden" id="receiveCaseId" value="${caseId}">
                    <div class="form-group">
                        <label for="receiveUserId">选择领取用户</label>
                        <select id="receiveUserId" class="form-select" required>
                            <option value="">加载用户中...</option>
                        </select>
                    </div>
                    <p class="text-muted mt-2">请选择要领取此案件的用户，领取后案件状态将变为"已领取"</p>
                </div>
                <div class="modal-footer" style="border-top:1px solid #f0f0f0;">
                    <button type="button" class="ant-btn ant-btn-secondary btn btn-secondary" data-bs-dismiss="modal" style="border-radius:4px;">取消</button>
                    <button type="button" class="ant-btn ant-btn-primary btn btn-primary" onclick="confirmAssignCase()" style="border-radius:4px;">确认分派案件</button>
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
 * 加载可领取案件的用户列表到下拉框
 */
async function loadUsersForReceiveDropdown(isBatch=false) {
    try {
        // 调用获取用户列表的接口（与案件包分配共用同一接口或专用接口）
        const users = await request('/user');
        const userSelect = isBatch?document.getElementById('batchReceiveUserId')
            :document.getElementById('receiveUserId');

        if (!userSelect) return; // 防止DOM未加载完成的情况

        // 清空现有选项
        userSelect.innerHTML = '';

        // 添加默认选项
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = '请选择领取用户';
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
        console.error('加载领取用户列表失败:', error);
        const userSelect = document.getElementById('receiveUserId');
        if (userSelect) {
            userSelect.innerHTML = '<option value="">加载用户失败</option>';
        }
    }
}


/**
 * 确认分派案件
 */
async function confirmAssignCase() {
    const caseId = document.getElementById('receiveCaseId').value;
    const userId = document.getElementById('receiveUserId').value.trim();
    
    if (!userId || isNaN(userId)) {
        alert('请输入有效的用户ID');
        return;
    }
    
    try {
        await request('/case/assign', 'POST', {
            caseId: parseInt(caseId),
            userId: parseInt(userId)
        });
        
        // 关闭模态框
        const receiveModal = bootstrap.Modal.getInstance(document.getElementById('receiveCaseModal'));
        receiveModal.hide();
        
        // 重新加载案件列表
        loadCases();
        alert('案件分派成功');
    } catch (error) {
        // 错误处理已在request函数中完成
    }
}


/**
 * 完成案件（状态从已领取变为待结案）
 * @param {number} caseId 案件ID
 */
async function completeCase(caseId) {
    if (!confirm('确定要标记这个案件为待结案吗？')) {
        return;
    }
    
    try {
        await request('/case/update-status', 'POST', {
            caseId: caseId,
            status: '待结案'
        });
        
        // 重新加载案件列表
        loadCases();
        alert('案件已标记为待结案');
    } catch (error) {
        // 错误处理已在request函数中完成
    }
}



/**
 * 完成案件（状态从已领取变为退回）
 * @param {number} caseId 案件ID
 */
async function returnCase(caseId) {
    if (!confirm('确定要标记这个案件为退回吗？')) {
        return;
    }

    try {
        await request('/case/update-status', 'POST', {
            caseId: caseId,
            status: '退回'
        });

        // 重新加载案件列表
        loadCases();
        alert('案件已标记为退回');
    } catch (error) {
        // 错误处理已在request函数中完成
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

        modalContainer.innerHTML = `
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
        const historyModal = new bootstrap.Modal(document.getElementById('caseHistoryModal'));
        historyModal.show();
    } catch (error) {
        alert('加载历史流转记录失败');
    }
}

/**
 * 导出案件功能
 */
async function exportCases() {
    const selectedCaseIds = getSelectedCaseIds();
    let params = {};
    if (selectedCaseIds.length > 0) {
        params.caseIds = selectedCaseIds;
    } else {
        // 当前查询条件
        params = {
            caseName: document.getElementById('caseSearchInput').value.trim(),
            caseNumber: document.getElementById('caseNumberSearchInput').value.trim(),
            plaintiff: document.getElementById('plaintiffSearchInput').value.trim(),
            defendant: document.getElementById('defendantSearchInput').value.trim(),
            userName: document.getElementById('userNameSearchInput').value.trim(),
            assistant: document.getElementById('assistantSearchInput').value.trim(),
            courtReceiveTime: document.getElementById('receiveTimeSearchInput').value.trim(),
            status: currentFilterStatus !== 'all' ? currentFilterStatus : undefined,
            station: currentStation || undefined
        };
    }
    // 请求后端导出接口，返回文件流
    const url = '/api/case/export';
    const fetchOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
    };
    try {
        const response = await fetch(url, fetchOptions);
        if (!response.ok) throw new Error('导出失败');
        const blob = await response.blob();
        // 文件名
        const filename = '案件导出_' + new Date().toISOString().slice(0, 10) + '.xlsx';
        // 下载
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = filename;
        link.click();
    } catch (e) {
        alert('导出失败，请重试');
    }
}

// 新增结案操作弹窗
function showCloseCaseModal(caseId) {
    const modalHtml = `
    <div class="modal fade" id="closeCaseModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content ant-card ant-card-bordered" style="border-radius:10px;box-shadow:0 4px 16px #e6f7ff;">
                <div class="modal-header" style="border-bottom:1px solid #f0f0f0;">
                    <h5 class="modal-title"><i class="fa fa-check text-primary me-2"></i>结案确认</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body" style="background:#fafcff;">
                    <input type="hidden" id="closeCaseId" value="${caseId}">
                    <div class="mb-3">
                        <label class="form-label">结案备注</label>
                        <textarea id="closeCaseRemark" class="form-control" rows="3" placeholder="请输入结案备注"></textarea>
                    </div>
                </div>
                <div class="modal-footer" style="border-top:1px solid #f0f0f0;">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                    <button type="button" class="btn btn-primary" onclick="confirmCloseCase()" style="border-radius:4px;">确认结案</button>
                </div>
            </div>
        </div>
    </div>
    `;
    const tempContainer = document.createElement('div');
    tempContainer.innerHTML = modalHtml;
    document.body.appendChild(tempContainer);
    const closeModal = new bootstrap.Modal(document.getElementById('closeCaseModal'));
    closeModal.show();
    document.getElementById('closeCaseModal').addEventListener('hidden.bs.modal', function() {
        tempContainer.remove();
    });
}

// 修改结案操作入口为弹窗
function closeCase(caseId) {
    showCloseCaseModal(caseId);
}

// 确认结案操作
async function confirmCloseCase() {
    const caseId = document.getElementById('closeCaseId').value;
    const remark = document.getElementById('closeCaseRemark').value.trim();
    if (!remark) {
        alert('请填写结案备注');
        return;
    }
    try {
        await request('/case/update-status', 'POST', {
            caseId: caseId,
            status: '结案',
            remark: remark
        });
        // 写入案件操作历史（可选：后端自动记录）
        // 关闭模态框
        const modal = bootstrap.Modal.getInstance(document.getElementById('closeCaseModal'));
        modal.hide();
        loadCases();
        alert('案件已结案');
    } catch (error) {
        alert('结案操作失败');
    }
}

// 批量调解失败相关逻辑

function updateBatchFailedBtnVisibility() {
    const btn = document.getElementById('batchFailedBtn');
    if (!btn) return;
    if (currentFilterStatus === '退回') {
        btn.style.display = '';
    } else {
        btn.style.display = 'none';
    }
}

// 在页面渲染按钮区域添加批量调解失败按钮
function renderBatchFailedBtn() {
    if (!document.getElementById('batchFailedBtn')) {
        const btnHtml = `<button class="ant-btn ant-btn-danger" id="batchFailedBtn" style="display:none;margin-left:8px;" onclick="showBatchFailedModal()">
            <i class="fa fa-flag-checkered"></i> 批量调解失败
        </button>`;
        const btnGroup = document.querySelector('.d-flex.justify-content-end.gap-2.mb-2');
        if (btnGroup) btnGroup.insertAdjacentHTML('beforeend', btnHtml);
    }
    updateBatchFailedBtnVisibility();
}

// 批量调解失败弹窗
function showBatchFailedModal() {
    const selectedCaseIds = getSelectedCaseIds();
    if (!selectedCaseIds.length) {
        alert('请先选择要批量调解失败的案件');
        return;
    }
    const modalHtml = `
    <div class="modal fade" id="batchFailedModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog" style="z-index:3000;">
            <div class="modal-content ant-card ant-card-bordered" style="border-radius:10px;box-shadow:0 4px 16px #e6f7ff;">
                <div class="modal-header" style="border-bottom:1px solid #f0f0f0;">
                    <h5 class="modal-title"><i class="fa fa-flag-checkered text-danger me-2"></i>批量调解失败</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body" style="background:#fafcff;">
                    <div class="mb-3">
                        <label class="form-label">调解失败备注</label>
                        <select class="form-select" id="batchFailedRemark">
                            <option value="拒绝调解">拒绝调解</option>
                            <option value="联系不上">联系不上</option>
                            <option value="差距较大">差距较大</option>
                        </select>
                    </div>
                </div>
                <div class="modal-footer" style="border-top:1px solid #f0f0f0;">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                    <button type="button" class="btn btn-danger" onclick="confirmBatchFailed()" style="border-radius:4px;">确认批量调解失败</button>
                </div>
            </div>
        </div>
    </div>
    `;
    const tempContainer = document.createElement('div');
    tempContainer.innerHTML = modalHtml;
    document.body.appendChild(tempContainer);
    const modal = new bootstrap.Modal(document.getElementById('batchFailedModal'));
    modal.show();
    document.getElementById('batchFailedModal').addEventListener('hidden.bs.modal', function() {
        tempContainer.remove();
    });
}

// 批量调解失败确认
async function confirmBatchFailed() {
    const selectedCaseIds = getSelectedCaseIds();
    const remark = document.getElementById('batchFailedRemark').value;
    if (!remark) {
        alert('请选择调解失败备注');
        return;
    }
    try {
        await request('/case/batch-failed', 'POST', {
            caseIds: selectedCaseIds,
            completionRemark: remark
        });
        const modal = bootstrap.Modal.getInstance(document.getElementById('batchFailedModal'));
        modal.hide();
        loadCases();
        alert('批量调解失败操作成功');
    } catch (error) {
        alert('批量调解失败操作失败');
    }
}

// 批量结案相关逻辑
function updateBatchCloseCaseBtnVisibility() {
    const batchAssignBtn = document.querySelector('.ant-btn[onclick="showBatchAssignModal()"]');
    let batchCloseBtn = document.getElementById('batchCloseCaseBtn');
    if (currentFilterStatus === '待结案') {
        if (!batchCloseBtn) {
            batchCloseBtn = document.createElement('button');
            batchCloseBtn.className = 'ant-btn ant-btn-primary';
            batchCloseBtn.id = 'batchCloseCaseBtn';
            batchCloseBtn.style.marginLeft = '8px';
            batchCloseBtn.innerHTML = '<i class="fa fa-check"></i> 批量结案';
            batchCloseBtn.onclick = showBatchCloseCaseModal;
            if (batchAssignBtn && batchAssignBtn.parentNode) {
                batchAssignBtn.parentNode.insertBefore(batchCloseBtn, batchAssignBtn.nextSibling);
            }
        } else {
            batchCloseBtn.style.display = '';
        }
    } else {
        if (batchCloseBtn) batchCloseBtn.style.display = 'none';
    }
}

function showBatchCloseCaseModal() {
    const selectedCaseIds = getSelectedCaseIds();
    if (!selectedCaseIds.length) {
        alert('请先选择要批量结案的案件');
        return;
    }
    const modalHtml = `
    <div class="modal fade" id="batchCloseCaseModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content ant-card ant-card-bordered" style="border-radius:10px;box-shadow:0 4px 16px #e6f7ff;">
                <div class="modal-header" style="border-bottom:1px solid #f0f0f0;">
                    <h5 class="modal-title"><i class="fa fa-check text-primary me-2"></i>批量结案</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body" style="background:#fafcff;">
                    <div class="mb-3">
                        <label class="form-label">结案备注</label>
                        <textarea id="batchCloseCaseRemark" class="form-control" rows="3" placeholder="请输入结案备注"></textarea>
                    </div>
                </div>
                <div class="modal-footer" style="border-top:1px solid #f0f0f0;">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                    <button type="button" class="btn btn-primary" onclick="confirmBatchCloseCase()" style="border-radius:4px;">确认批量结案</button>
                </div>
            </div>
        </div>
    </div>
    `;
    const tempContainer = document.createElement('div');
    tempContainer.innerHTML = modalHtml;
    document.body.appendChild(tempContainer);
    const modal = new bootstrap.Modal(document.getElementById('batchCloseCaseModal'));
    modal.show();
    document.getElementById('batchCloseCaseModal').addEventListener('hidden.bs.modal', function() {
        tempContainer.remove();
    });
}

async function confirmBatchCloseCase() {
    const selectedCaseIds = getSelectedCaseIds();
    const remark = document.getElementById('batchCloseCaseRemark').value.trim();
    if (!remark) {
        alert('请填写结案备注');
        return;
    }
    try {
        await request('/case/batch-close', 'POST', {
            caseIds: selectedCaseIds,
            completionRemark: remark
        });
        const modal = bootstrap.Modal.getInstance(document.getElementById('batchCloseCaseModal'));
        modal.hide();
        loadCases();
        alert('批量结案操作成功');
    } catch (error) {
        alert('批量结案操作失败');
    }
}

// 在筛选状态切换时调用
function afterPageInitOrFilter() {
    renderBatchFailedBtn();
    updateBatchFailedBtnVisibility();
    updateBatchCloseCaseBtnVisibility();
}
