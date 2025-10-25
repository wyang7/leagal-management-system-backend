/**
 * 加载案件管理页面，接收驻点参数
 * @param {string} station 驻点名称（九堡彭埠、本部、笕桥）
 */

let currentStation= '';
// 新增全局变量跟踪当前分页和筛选状态
let currentPage = 1;
const pageSize = 10;
let currentFilterStatus = 'all';

function loadCaseManagementPage(station) {

    // 记录当前选中的驻点
    currentStation = station;

    setActiveNav('案件管理');
    const mainContent = document.getElementById('mainContent');
    mainContent.innerHTML = `
        <div class="page-title">
            <h1>案件管理 - ${station}</h1>
        </div>
        
        <!-- 搜索和新增区域 -->
        <div class="row mb-4">
    <!-- 搜索区域 - 占满整行，在小屏幕自动堆叠 -->
        <div class="col-12 mb-3">
        <div class="d-flex flex-wrap gap-3 align-items-center p-3 bg-light bg-opacity-50 rounded-3 shadow-sm">
        <!-- 案由搜索 -->
            <div class="flex-grow-1 min-w-[200px]">
                <div class="input-group">
                    <span class="input-group-text bg-light">
                        <i class="fa fa-file-text-o text-secondary"></i>
                    </span>
                    <input type="text" id="caseSearchInput" class="form-control" placeholder="输入案由搜索" 
                       style="transition: border-color 0.2s ease;">
                </div>
            </div>

        <!-- 案号搜索 -->
            <div class="flex-grow-1 min-w-[200px]">
                <div class="input-group">
                    <span class="input-group-text bg-light">
                        <i class="fa fa-hashtag text-secondary"></i>
                    </span>
                    <input type="text" id="caseNumberSearchInput" class="form-control" placeholder="输入案号搜索"
                       style="transition: border-color 0.2s ease;">
                </div>
            </div>

        <!-- 原告搜索 -->
            <div class="flex-grow-1 min-w-[200px]">
                <div class="input-group">
                    <span class="input-group-text bg-light">
                        <i class="fa fa-user text-primary"></i>
                    </span>
                    <input type="text" id="plaintiffSearchInput" class="form-control" placeholder="输入原告搜索"
                       style="transition: border-color 0.2s ease;">
                </div>
            </div>

        <!-- 被告搜索 -->
            <div class="flex-grow-1 min-w-[200px]">
                <div class="input-group">
                    <span class="input-group-text bg-light">
                        <i class="fa fa-user-o text-danger"></i>
                    </span>
                    <input type="text" id="defendantSearchInput" class="form-control" placeholder="输入被告搜索"
                       style="transition: border-color 0.2s ease;">
                </div>
            </div>

        <!-- 处理人搜索 -->
            <div class="flex-grow-1 min-w-[200px]">
                <div class="input-group">
                    <span class="input-group-text bg-light">
                        <i class="fa fa-user-circle text-info"></i>
                    </span>
                    <input type="text" id="userNameSearchInput" class="form-control" placeholder="输入处理人搜索"
                       style="transition: border-color 0.2s ease;">
                </div>
            </div>

        <!-- 助理搜索 -->
            <div class="flex-grow-1 min-w-[200px]">
                <div class="input-group">
                    <span class="input-group-text bg-light">
                        <i class="fa fa-user-plus text-success"></i>
                    </span>
                    <input type="text" id="assistantSearchInput" class="form-control" placeholder="输入助理搜索"
                       style="transition: border-color 0.2s ease;">
                </div>
            </div>

        <!-- 搜索按钮 -->
            <div class="min-w-[100px]">
                <button class="btn btn-primary w-100 py-2 hover:bg-primary/90 active:bg-primary/80 transition-all duration-200" 
                    onclick="loadCases()">
                    <i class="fa fa-search me-1"></i> 搜索
                </button>
            </div>
        </div>
</div>

    <!-- 按钮区域 - 独立一行，右对齐 -->
        <div class="col-12">
            <div class="d-flex justify-content-end gap-3">
                <input type="file" id="excelFileInput" accept=".xls,.xlsx" style="display:none" onchange="importCasesFromExcel(event)">
                <button class="btn btn-secondary" onclick="document.getElementById('excelFileInput').click()">
                    <i class="fa fa-upload me-1"></i> 导入Excel
                </button>
                <button class="btn btn-success" onclick="showAddCaseModal()">
                    <i class="fa fa-plus me-1"></i> 新增案件
                </button>
                <button class="btn btn-primary" onclick="showBatchAssignModal()">
                    <i class="fa fa-users"></i> 批量分派
                </button>
                <button class="btn btn-success" onclick="showBatchAssignTaskModal()">
                    <i class="fa fa-plus me-1"></i> 批量关联案件包
                </button>
            </div>
        </div>
    </div>
        
        <!-- 案件状态筛选 -->
        <div class="row mb-3">
            <div class="col-md-12">
                <div class="btn-group" role="group">
                    <button class="btn btn-outline-primary" onclick="filterCases('all')">全部</button>
                    <button class="btn btn-outline-primary" onclick="filterCases('待领取')">待领取</button>
                    <button class="btn btn-outline-primary" onclick="filterCases('已领取')">已领取</button>
                    <button class="btn btn-outline-primary" onclick="filterCases('反馈')">反馈</button>
                    <button class="btn btn-outline-primary" onclick="filterCases('延期')">延期</button>
                    <button class="btn btn-outline-primary" onclick="filterCases('已完成')">已完成</button>
                    <button class="btn btn-outline-primary" onclick="filterCases('退回')">退回</button>
                    <button class="btn btn-outline-primary" onclick="filterCases('完结')">完结</button>
                </div>
            </div>
        </div>
        
        <!-- 案件表格 -->
        <div class="table-responsive">
            <table class="table table-striped table-hover">
                <thead class="table-dark">
                    <tr>
                        <th><input type="checkbox" id="selectAllCases"></th>
                        <th>案件号</th>
                        <th>案由</th>
                        <th>标的额</th>
                        <th>案件归属地</th>
                        <th>收案时间</th>
                        <th>原告</th>
                        <th>被告</th>
                        <th>法官</th>
                        <th>案件助理</th>
                        <th>关联案件包</th>
                        <th>状态</th>
                        <th>处理人</th>
                        <th>操作</th>
                    </tr>
                </thead>
                <tbody id="caseTableBody">
                    <!-- 案件数据将通过JavaScript动态加载 -->
                    <tr>
                        <td colspan="8" class="text-center">加载中...</td>
                    </tr>
                </tbody>
            </table>
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
    // 加载案件列表（默认第一页）
    loadCases(1, 10, station);

    document.querySelector('.btn-group .btn[onclick="filterCases(\'all\')"]').classList.add('active');
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
                        <select class="form-select" id="receiveUserId" required>
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
    loadUsersForReceiveDropdown();
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
    const userId = document.getElementById('receiveUserId').value;
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
                            <div class="col-md-6" style="display: none;">
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
                            <div class="col-md-6">
                                <strong>退回法院时间:</strong> ${formatDate(caseInfo.returnCourtTime)}
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
                                <strong>案件完成情况:</strong>
                                <div class="mt-2 p-3 bg-light rounded">
                                    ${caseInfo.completionNotes ? caseInfo.completionNotes.replace(/\n/g, '<br>') : '无'}
                                </div>
                            </div>
                        </div>
                        <div class="row mb-3">
                            <div class="col-md-12">
                                <strong>完结备注:</strong>
                                <div class="mt-2 p-3 bg-light rounded">
                                    ${caseInfo.completionRemark ? caseInfo.completionRemark.replace(/\n/g, '<br>') : '无'}
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

        const params = new URLSearchParams();
        params.append('pageNum', pageNum);
        params.append('pageSize', pageSize);
        if (caseName) params.append('caseName', caseName);
        if (caseNumber) params.append('caseNumber', caseNumber);
        if (plaintiff) params.append('plaintiff', plaintiff);   // 原告参数
        if (defendant) params.append('defendant', defendant); // 被告参数
        if (userName) params.append('userName', userName); // 处理人参数
        if (assistant) params.append('assistant', assistant); // 案件助理参数
        if (currentFilterStatus !== 'all') params.append('status', currentFilterStatus);
        if (currentStationTemp) params.append('station', currentStationTemp); // 驻点信息

        const response = await request(`/case/page?${params.toString()}`);
        // 渲染表格和分页组件
        renderCaseTable(response.records);
        // 渲染分页组件（假设后端返回的分页信息包含total、pageNum、pageSize、pages等字段）
        renderPagination({
            total: response.total,      // 总记录数
            pageNum: response.pageNum,  // 当前页码
            pageSize: response.pageSize// 每页条数
        });
    } catch (error) {
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
        tableBody.innerHTML = `<tr><td colspan="14" class="text-center">没有找到案件数据</td></tr>`;
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
            <td><input type="checkbox" class="case-checkbox" value="${caseInfo.caseId}"></td>
            <td>${caseInfo.caseNumber}</td>
            <td>${caseInfo.caseName}</td>
            <td>${caseInfo.amount != null ? caseInfo.amount.toFixed(2) : '0.00'}</td>
            <td>${caseInfo.caseLocation || '-'}</td>
            <td>${caseInfo.courtReceiveTime ? new Date(caseInfo.courtReceiveTime).toLocaleDateString() : '-'}</td>
            <td>${caseInfo.plaintiffName || '-'}</td>
            <td>${caseInfo.defendantName || '-'}</td>
            <td>${caseInfo.judge || '-'}</td>
            <td>${caseInfo.assistantName || '-'}</td>
            <td>${caseInfo.taskName || '-'}</td>
            <td><span class="status-badge ${statusClass}">${caseInfo.status}</span></td>
            <td>${caseInfo.username || '-'}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="showAssignTaskModal(${caseInfo.caseId}, ${caseInfo.taskId || 'null'})">
                    <i class="fa fa-link"></i> 关联案件包
                </button>
                <button class="btn btn-sm btn-primary" onclick="showEditCaseModal(${caseInfo.caseId})">
                    <i class="fa fa-edit"></i> 编辑
                </button>
                <button class="btn btn-sm btn-secondary" onclick="showCaseDetailModal(${caseInfo.caseId})">
                    <i class="fa fa-eye"></i> 详情
                </button>
                <button class="btn btn-sm btn-secondary me-1" onclick="showCaseHistoryModal(${caseInfo.caseId})">历史流转记录</button>
                <button class="btn btn-sm btn-danger" onclick="deleteCase(${caseInfo.caseId})">
                    <i class="fa fa-trash"></i> 删除
                </button>
                <button class="btn btn-sm btn-success" onclick="showReceiveCaseModal(${caseInfo.caseId})">
                    <i class="fa fa-handshake-o"></i> 分派案件
                </button>
                ${caseInfo.status === '已领取' ? `
                <button class="btn btn-sm btn-info" onclick="completeCase(${caseInfo.caseId})">
                    <i class="fa fa-check"></i> 完成
                </button>
                ` : ''}
                ${caseInfo.status === '已领取' ? `
                <button class="btn btn-sm btn-warning" onclick="returnCase(${caseInfo.caseId})">
                    <i class="fa fa-check"></i> 退回
                </button>
                ` : ''}
                ${(caseInfo.status !== '完结' && caseInfo.status !== '待领取') ? `
                <button class="btn btn-sm btn-success me-1" onclick="showFinishCaseModal(${caseInfo.caseId})">完结</button>` 
                : ''}
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

}


// 4. 添加完结案件的模态框函数
// 创建完结案件模态框容器
function createFinishCaseModalContainer() {
    if (!document.getElementById('finishCaseModalContainer')) {
        const container = document.createElement('div');
        container.id = 'finishCaseModalContainer';
        document.body.appendChild(container);
    }
}

// 显示完结案件模态框
function showFinishCaseModal(caseId) {
    createFinishCaseModalContainer(); // 确保容器存在
    const modalContainer = document.getElementById('finishCaseModalContainer');

    // 模态框HTML（使用新ID）
    const modalHtml = `
    <div class="modal fade" id="finishCaseModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">案件完结确认</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <!-- 完结备注和退回时间表单 -->
                    <input type="hidden" id="finishCaseId" value="${caseId}">
                    <div class="mb-3">
                        <label class="form-label">完结备注</label>
                        <select class="form-select" id="finishRemark">
                            <option value="司法确认">司法确认</option>
                            <option value="撤诉">撤诉</option>
                            <option value="民初">民初</option>
                            <option value="拒绝调解">拒绝调解</option>
                            <option value="联系不上">联系不上</option>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">退回法院时间</label>
                        <input type="date" class="form-control" id="returnCourtTime">
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                    <button type="button" class="btn btn-primary" onclick="confirmFinishCase()">确认完结</button>
                </div>
            </div>
        </div>
    </div>
    `;

    modalContainer.innerHTML = modalHtml;
    const finishModal = new bootstrap.Modal(document.getElementById('finishCaseModal'));
    finishModal.show();
}

// 5. 添加确认完结的函数
async function confirmFinishCase() {
    const caseId = document.getElementById('finishCaseId').value;
    const completionRemark = document.getElementById('finishRemark').value;
    const returnCourtTime = document.getElementById('returnCourtTime').value;

    if (!completionRemark) {
        alert('请选择完结备注');
        return;
    }

    if (!returnCourtTime) {
        alert('请选择退回法院时间');
        return;
    }

    try {
        await request('/case/complete', 'POST', {
            caseId:caseId,
            status: '完结',
            completionRemark:completionRemark,
            returnCourtTime:returnCourtTime
        });
        // 关闭模态框
        const modal = bootstrap.Modal.getInstance(document.getElementById('finishCaseModal'));
        modal.hide();
        // 重新加载案件列表
        loadCases();
        alert('案件已成功完结');
    } catch (error) {
        console.error('完结案件失败:', error);
        alert('完结案件失败');
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
                    <div class="modal-header">
                        <h5 class="modal-title">批量关联案件包</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
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


// 添加关联案件包模态框
function createAssignTaskModal() {
    const modalContainer = document.getElementById('caseModalContainer');

    if (!document.getElementById('assignTaskModal')) {
        const modalHtml = `
        <div class="modal fade" id="assignTaskModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">关联案件包</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form id="assignTaskForm">
                            <input type="hidden" id="assignCaseId">
                            <div class="form-group">
                                <label for="taskSelect">选择案件包</label>
                                <select id="taskSelect" class="form-control" required>
                                    <option value="">-- 请选择案件包 --</option>
                                    <option value="0">取消关联</option>
                                </select>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                        <button type="button" class="btn btn-primary" onclick="submitTaskAssignment()">提交</button>
                    </div>
                </div>
            </div>
        </div>
        `;

        modalContainer.innerHTML += modalHtml;
    }
}

// 显示关联案件包模态框
async function showAssignTaskModal(caseId, currentTaskId) {
    createAssignTaskModal();

    // 保存当前案件ID
    document.getElementById('assignCaseId').value = caseId;

    try {
        // 获取所有案件包
        const tasks = await request('/task');
        const taskSelect = document.getElementById('taskSelect');

        // 清空现有选项（保留第一个）
        while (taskSelect.options.length > 1) {
            taskSelect.remove(1);
        }

        // 添加案件包选项
        tasks.forEach(task => {
            const option = document.createElement('option');
            option.value = task.taskId;
            option.textContent = task.taskName;
            if (currentTaskId && task.taskId === currentTaskId) {
                option.selected = true;
            }
            taskSelect.appendChild(option);
        });

        // 显示模态框
        const modal = new bootstrap.Modal(document.getElementById('assignTaskModal'));
        modal.show();
    } catch (error) {
        alert('加载案件包失败');
    }
}

// 提交案件包关联
async function submitTaskAssignment() {
    const caseId = document.getElementById('assignCaseId').value;
    const taskId = document.getElementById('taskSelect').value;

    try {
        await request('/case/update-task', 'POST', {
            caseId: parseInt(caseId),
            taskId: taskId === '0' ? null : parseInt(taskId)
        });

        // 关闭模态框
        const modal = bootstrap.Modal.getInstance(document.getElementById('assignTaskModal'));
        modal.hide();

        // 重新加载案件列表
        loadCases();

        alert('关联成功');
    } catch (error) {
        alert('关联失败');
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
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="caseModalTitle">新增案件</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
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
                                    <option value="已完成">已完成</option>
                                </select>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                        <button type="button" class="btn btn-primary" onclick="saveCase()">保存</button>
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

    // 创建领取案件模态框
    const modalHtml = `
    <div class="modal fade" id="receiveCaseModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">领取案件</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <input type="hidden" id="receiveCaseId" value="${caseId}">
                    <div class="form-group">
                        <label for="receiveUserId">选择领取用户</label>
                        <select id="receiveUserId" class="form-select" required>
                            <option value="">加载用户中...</option>
                        </select>
                    </div>
                    <p class="text-muted mt-2">请选择要领取此案件的用户，领取后案件状态将变为"已领取"</p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                    <button type="button" class="btn btn-primary" onclick="confirmAssignCase()">确认分派案件</button>
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
async function loadUsersForReceiveDropdown() {
    try {
        // 调用获取用户列表的接口（与案件包分配共用同一接口或专用接口）
        const users = await request('/user');
        const userSelect = document.getElementById('receiveUserId');

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
 * 发布案件（状态从待发布变为待领取）
 * @param {number} caseId 案件ID
 */
async function publishCase(caseId) {
    if (!confirm('确定要发布这个案件吗？发布后状态将变为"待领取"')) {
        return;
    }
    
    try {
        await request('/case/update-status', 'POST', {
            caseId: caseId,
            status: '待领取'
        });
        
        // 重新加载案件列表
        loadCases();
        alert('案件发布成功');
    } catch (error) {
        // 错误处理已在request函数中完成
    }
}

/**
 * 完成案件（状态从已领取变为已完成）
 * @param {number} caseId 案件ID
 */
async function completeCase(caseId) {
    if (!confirm('确定要标记这个案件为已完成吗？')) {
        return;
    }
    
    try {
        await request('/case/update-status', 'POST', {
            caseId: caseId,
            status: '已完成'
        });
        
        // 重新加载案件列表
        loadCases();
        alert('案件已标记为已完成');
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
    