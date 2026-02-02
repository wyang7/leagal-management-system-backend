// 分页参数
let currentMyCasePage = 1;
const currentMyCasePageSize = 10; // 每页显示10条
let currentMyFilterStatus = 'all';

/**
 * 加载我的案件页面
 */
function loadMyCasesPage(timeout = false) {
    setActiveNav('我的案件');
    const mainContent = document.getElementById('mainContent');

    mainContent.innerHTML = `
        <div id="myCasesHeader"></div>
        <div class="ant-card ant-card-bordered mb-4" style="border-radius:8px;box-shadow:0 2px 8px #f0f1f2;">
            <div class="ant-card-body">
                <div class="row g-3 align-items-center">
                    <div class="col-md-4">
                        <div class="input-group">
                            <span class="input-group-text bg-light px-2" style="border-radius:4px 0 0 4px;">
                                <i class="fa fa-search text-secondary"></i>
                            </span>
                            <input type="text" id="keywordSearchInput" class="form-control ant-input" 
                                   placeholder="万能搜索框" 
                                   style="border-radius:0 4px 4px 0;">
                        </div>
                    </div>
                    <div class="col-md-3 d-flex align-items-end">
                        <button class="ant-btn ant-btn-primary w-100" style="border-radius:4px;" onclick="loadMyCases()">
                            <i class="fa fa-search me-1"></i> 查询
                        </button>
                    </div>
                    <div class="col-md-3 d-flex align-items-end">
                         <a href="javascript:void(0);" onclick="toggleAdvancedSearch(this)" class="ms-3">
                            更多查询条件 <i class="fa fa-angle-down"></i>
                        </a>
                    </div>
                </div>
                <div id="advancedSearchContainer" class="row g-3 align-items-center mt-2" style="display: none;">
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
                                <option value="四季青">四季青</option>
                                <option value="笕桥">笕桥</option>
                                <option value="凯旋街道">凯旋街道</option>
                                <option value="闸弄口">闸弄口</option>
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
                    <button class="ant-btn ant-btn-default btn btn-outline-primary" onclick="filterMyCases('结案')">结案</button>
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
    loadMyCases(currentMyCasePage, currentMyCasePageSize, timeout);

    document.querySelector('.btn-group .btn[onclick="filterMyCases(\'all\')"]').classList.add('active');

    // 渲染表头
    renderMyCasesHeader();
}

function toggleAdvancedSearch(element) {
    const container = document.getElementById('advancedSearchContainer');
    if (container.style.display === 'none') {
        container.style.display = 'flex';
        element.innerHTML = '收起查询条件 <i class="fa fa-angle-up"></i>';
    } else {
        container.style.display = 'none';
        element.innerHTML = '更多查询条件 <i class="fa fa-angle-down"></i>';
    }
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
        const [caseInfoResponse, historyList] = await Promise.all([
            request(`/case/detail/${caseId}`),
            request(`/case/history/${caseId}`).catch(()=>[])
        ]);
        const caseInfo=caseInfoResponse.case;
        // 新增金额格式化函数
        const formatAmount = (v)=> (v!=null && v!=='' && !isNaN(v)) ? Number(v).toLocaleString('zh-CN',{minimumFractionDigits:2,maximumFractionDigits:2}) : '0.00';
        // 新增动作图标映射
        const actionIconMap = {
          '领取案件': {icon:'fa-handshake-o',color:'#1890ff'},
          '案件反馈': {icon:'fa-comments',color:'#722ed1'},
          '案件延期申请': {icon:'fa-clock-o',color:'#fa8c16'},
          '退回案件': {icon:'fa-undo',color:'#ff4d4f'},
          '提交结案审核': {icon:'fa-upload',color:'#13c2c2'},
          '调解失败': {icon:'fa-flag',color:'#ff4d4f'},
          '批量调解失败': {icon:'fa-flag-checkered',color:'#ff4d4f'},
          '结案': {icon:'fa-check-circle',color:'#52c41a'}
        };
        let extHtml='';
        if(caseInfo.caseCloseExt){
            try{ const ext=JSON.parse(caseInfo.caseCloseExt); const flows = Array.isArray(ext.paymentFlows)?ext.paymentFlows:[]; const fmtAmount=v=> (v!=null && v!=='' && !isNaN(v))?Number(v).toLocaleString('zh-CN',{minimumFractionDigits:2,maximumFractionDigits:2}):'0.00'; const flowsHtml = flows.length
                ? flows.map((f,idx)=>{
                    const imgSrc = buildPaymentScreenshotSrc(f);
                    return `<div class='border rounded p-2 mb-2 d-flex justify-content-between align-items-center'>
                              <div>
                                <div><span class='text-muted'>序号：</span>${idx+1}</div>
                                <div><span class='text-muted'>时间：</span>${f.payTime||'-'}</div>
                                <div><span class='text-muted'>金额：</span>${fmtAmount(f.amount)}</div>
                              </div>
                              <div class='d-flex align-items-center gap-2'>
                                ${imgSrc? `<img src="${imgSrc}" alt="付款截图${idx+1}" class="payment-screenshot" data-url="${imgSrc}" style="width:60px;height:60px;object-fit:cover;cursor:pointer;border-radius:4px;border:1px solid #eee;">` : '<span class="text-muted">无截图</span>'}
                              </div>
                            </div>`;
                }).join('')
                : `<div class='text-muted'>暂无付款流水</div>`;

                // 发票信息（PDF）
                const invoicePdf = ext.invoicePdf;
                const invoicePdfHtml = invoicePdf
                    ? `<a href="/api/case/invoice-pdf?objectName=${encodeURIComponent(invoicePdf)}" target="_blank" rel="noopener">点击查看/下载发票PDF</a>`
                    : `<span class='text-muted'>暂无发票</span>`;

                extHtml = `
                    <div class='row g-2'>
                        <div class='col-md-6'><span class='text-muted'>签字时间：</span>${ext.signDate||'-'}</div>
                        <div class='col-md-6'><span class='text-muted'>调成标的额：</span>${ext.adjustedAmount!=null?fmtAmount(ext.adjustedAmount):'-'}</div>
                        <div class='col-md-6'><span class='text-muted'>调解费：</span>${ext.mediationFee!=null?fmtAmount(ext.mediationFee):'-'}</div>
                        <div class='col-md-6'><span class='text-muted'>支付方：</span>${ext.payer||'-'}</div>
                        <div class='col-md-6'><span class='text-muted'>开票状态：</span>${ext.invoiceStatus||'暂未申请开票'}</div>
                        <div class='col-md-6'><span class='text-muted'>是否已付款：</span>${ext.paid===true?'是':(ext.paid===false?'否':'-')}</div>
                        <div class='col-12'><span class='text-muted'>开票信息：</span>${ext.invoiceInfo?String(ext.invoiceInfo).replace(/\n/g,'<br>'):'-'}</div>
                        <div class='col-12'>
                            <div class='fw-bold mt-2'>付款流水</div>
                            <div>${flowsHtml}</div>
                        </div>
                        <div class='col-12'>
                            <div class='fw-bold mt-2'>发票信息</div>
                            <div>${invoicePdfHtml}</div>
                        </div>
                    </div>`; }catch(e){ extHtml='<div class="text-danger">结案扩展信息解析失败</div>'; }
        } else { extHtml='<div class="text-muted">暂无结案扩展信息</div>'; }
        // 新增：结案编号展示（澎和/青枫案件号在前，收款单号在后）
        const pengheLabel = (caseInfoResponse.label === null || caseInfoResponse.label === undefined)
            ? '澎和案件号：'
            : caseInfoResponse.label;
        const settlementNumbersHtml = `<div class='row g-2 mb-3'>
            <div class='col-md-6'><span class='text-muted'>${pengheLabel}</span>${caseInfoResponse.number!=null?caseInfoResponse.number:'-'}</div>
            <div class='col-md-6'><span class='text-muted'>收款单号：</span>${caseInfo.receiptNumber!=null?caseInfo.receiptNumber:'-'}</div>
            <div class='col-md-6'><span class='text-muted'>人调号：</span>${caseInfo.mediateCaseNumber!=null?caseInfo.mediateCaseNumber:'-'}</div>
         </div>`;
        const modalContainer = document.getElementById('myCaseDetailModalContainer');
        const formatDate = (dateStr) => !dateStr?'-':(/\d{4}-\d{2}-\d{2}/.test(dateStr)? dateStr : new Date(dateStr).toLocaleString());
        // 历史渲染带图标
        let historyHtml = '';
        if(historyList && historyList.length){
            historyHtml = historyList.map(h=>{ const meta = actionIconMap[h.action]||{icon:'fa-info-circle',color:'#8c8c8c'}; return `<div class='timeline-item mb-2 p-2 rounded border position-relative'>
                <div class='d-flex justify-content-between'>
                  <span class='fw-bold' style='color:${meta.color}'><i class='fa ${meta.icon} me-1'></i>${h.action||'-'}</span>
                  <span class='text-muted small'>${h.createTime? new Date(h.createTime).toLocaleString(): '-'}</span>
                </div>
                <div class='small mt-1'><span class='text-muted'>操作人：</span>${h.operatorName||'-'}</div>
                <div class='small'><span class='text-muted'>状态：</span>${h.beforeStatus||'-'} <i class='fa fa-arrow-right mx-1'></i> ${h.afterStatus||'-'}</div>
                <div class='small'><span class='text-muted'>备注：</span>${h.remarks? h.remarks.replace(/\n/g,'<br>'): '-'}</div>
            </div>`}).join('');
        } else {
            historyHtml = `<div class='text-muted'>暂无历史记录</div>`;
        }
        const delayBlock = `<div class='mb-2'><span class='text-muted'>延期原因：</span><div class='p-2 bg-light rounded border small'>${caseInfo.delayReason? caseInfo.delayReason.replace(/\n/g,'<br>'):'无'}</div></div>`;
        const feedbackBlock = `<div class='mb-2'><span class='text-muted'>反馈情况：</span><div class='p-2 bg-light rounded border small'>${caseInfo.preFeedback? caseInfo.preFeedback.replace(/\n/g,'<br>'):'无'}</div></div>`;
        const returnBlock = `<div class='mb-2'><span class='text-muted'>退回情况：</span><div class='p-2 bg-light rounded border small'>${caseInfo.returnReason? caseInfo.returnReason.replace(/\n/g,'<br>'):'无'}</div></div>`;
        const completionBlock = `<div class='mb-2'><span class='text-muted'>完成情况：</span><div class='p-2 bg-light rounded border small'>${caseInfo.completionNotes? caseInfo.completionNotes.replace(/\n/g,'<br>'):'无'}</div></div>`;
        const failRemarkBlock = `<div class='mb-2'><span class='text-muted'>调解失败备注：</span><div class='p-2 bg-light rounded border small'>${caseInfo.completionRemark? caseInfo.completionRemark.replace(/\n/g,'<br>'):'无'}</div></div>`;
        // 基本详情：移除案件ID、收款单号、澎和案件号
        const basicHtml = `<div class='row g-2'>
            <div class='col-md-6'><span class='text-muted'>案件号：</span><span class='fw-bold'>${caseInfo.caseNumber||'-'}</span></div>
            <div class='col-md-6'><span class='text-muted'>案由：</span>${caseInfo.caseName||'-'}</div>
            <div class='col-md-6'><span class='text-muted'>标的额：</span>${formatAmount(caseInfo.amount)}</div>
            <div class='col-md-6'><span class='text-muted'>归属地：</span>${caseInfo.caseLocation||'-'}</div>
            <div class='col-md-6'><span class='text-muted'>法官：</span>${caseInfo.judge||'-'}</div>
            <div class='col-md-6'><span class='text-muted'>收案时间：</span>${formatDate(caseInfo.courtReceiveTime)}</div>
            <div class='col-md-6'><span class='text-muted'>领取时间：</span>${caseInfo.receiveTime? new Date(caseInfo.receiveTime).toLocaleString():'-'}</div>
            <div class='col-md-6'><span class='text-muted'>原告：</span>${caseInfo.plaintiffName||'-'}</div>
            <div class='col-md-6'><span class='text-muted'>被告：</span>${caseInfo.defendantName||'-'}</div>
            <div class='col-md-6'><span class='text-muted'>案件助理：</span>${caseInfo.assistantName||'-'}</div>
            <div class='col-md-6'><span class='text-muted'>处理人：</span>${caseInfo.username||'-'}</div>
            <div class='col-md-6'><span class='text-muted'>关联案件包：</span>${caseInfo.taskName||'-'}</div>
            <div class='col-md-6'><span class='text-muted'>状态：</span><span class='badge bg-info text-dark'>${caseInfo.status||'-'}</span></div>
        </div>`;
        const modalHtml = `
        <div class=\"modal fade\" id=\"myCaseDetailModal\" tabindex=\"-1\" aria-hidden=\"true\">\n            <div class=\"modal-dialog modal-xl\">\n                <div class=\"modal-content\" style=\"border-radius:12px;box-shadow:0 6px 24px rgba(0,0,0,.08);\">\n                    <div class=\"modal-header\" style=\"background:linear-gradient(90deg,#4096ff,#69c0ff);color:#fff;border-bottom:none;\">\n                        <h5 class=\"modal-title d-flex align-items-center\"><i class=\"fa fa-file-text-o me-2\"></i>案件详情</h5>\n                        <button type=\"button\" class=\"btn-close btn-close-white\" data-bs-dismiss=\"modal\" aria-label=\"Close\"></button>\n                    </div>\n                    <div class=\"modal-body p-0\" style=\"background:#f5f8fa;\">\n                        <ul class=\"nav nav-tabs small px-3 pt-3\" id=\"caseDetailTabs\" role=\"tablist\" style=\"border-bottom:1px solid #e1e5eb;\">\n                          <li class=\"nav-item\" role=\"presentation\">\n                            <button class=\"nav-link active\" id=\"tab-basic\" data-bs-toggle=\"tab\" data-bs-target=\"#panel-basic\" type=\"button\" role=\"tab\">基本详情</button>\n                          </li>\n                          <li class=\"nav-item\" role=\"presentation\">\n                            <button class=\"nav-link\" id=\"tab-flow\" data-bs-toggle=\"tab\" data-bs-target=\"#panel-flow\" type=\"button\" role=\"tab\">流转信息</button>\n                          </li>\n                          <li class=\"nav-item\" role=\"presentation\">\n                            <button class=\"nav-link\" id=\"tab-close\" data-bs-toggle=\"tab\" data-bs-target=\"#panel-close\" type=\"button\" role=\"tab\">结案信息</button>\n                          </li>\n                        </ul>\n                        <div class=\"tab-content p-3\" style=\"max-height:70vh;overflow-y:auto;\">\n                          <div class=\"tab-pane fade show active\" id=\"panel-basic\" role=\"tabpanel\">\n                            <div class=\"card shadow-sm mb-3 border-0\" style=\"border-radius:10px;\">\n                              <div class=\"card-body\">${basicHtml}</div>\n                            </div>\n                          </div>\n                          <div class=\"tab-pane fade\" id=\"panel-flow\" role=\"tabpanel\">\n                            <div class=\"card shadow-sm mb-3 border-0\" style=\"border-radius:10px;\">\n                              <div class=\"card-header bg-white fw-bold\" style=\"border-radius:10px 10px 0 0;border-bottom:1px solid #eee;\">反馈 / 退回 / 延期</div>\n                              <div class=\"card-body\">${feedbackBlock}${returnBlock}${delayBlock}</div>\n                            </div>\n                            <div class=\"card shadow-sm border-0\" style=\"border-radius:10px;\">\n                              <div class=\"card-header bg-white fw-bold\" style=\"border-radius:10px 10px 0 0;border-bottom:1px solid #eee;\">历史流转记录</div>\n                              <div class=\"card-body\" style=\"background:#fcfdff;\">${historyHtml}</div>\n                            </div>\n                          </div>\n                          <div class=\"tab-pane fade\" id=\"panel-close\" role=\"tabpanel\">\n                            <div class=\"card shadow-sm mb-3 border-0\" style=\"border-radius:10px;\">\n                              <div class=\"card-header bg-white fw-bold\" style=\"border-radius:10px 10px 0 0;border-bottom:1px solid #eee;\">完成 / 失败备注</div>\n                              <div class=\"card-body\">${completionBlock}${failRemarkBlock}</div>\n                            </div>\n                            <div class=\"card shadow-sm border-0\" style=\"border-radius:10px;\">\n                              <div class=\"card-header bg-white fw-bold\" style=\"border-radius:10px 10px 0 0;border-bottom:1px solid #eee;\">结案扩展信息</div>\n                              <div class=\"card-body\">${settlementNumbersHtml}${extHtml}</div>\n                            </div>\n                          </div>\n                        </div>\n                    </div>\n                    <div class=\"modal-footer\" style=\"border-top:1px solid #e1e5eb;background:#fff;border-radius:0 0 12px 12px;\">\n                        <button type=\"button\" class=\"btn btn-outline-secondary\" data-bs-dismiss=\"modal\">关闭</button>\n                    </div>\n                </div>\n            </div>\n        </div>`;
        modalContainer.innerHTML = modalHtml;
        new bootstrap.Modal(document.getElementById('myCaseDetailModal')).show();
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
async function loadMyCases(pageNum = 1, pageSize = 10, timeout = false) {
    try {
        const username = await getCurrentUserName();
        const tableBodyEl = document.getElementById('myCaseTableBody');
        if (!tableBodyEl) {
            // 页面容器尚未渲染，直接退出，稍后用户重新触发或页面重新加载
            return;
        }
        if (!username) {
            tableBodyEl.innerHTML = `<tr><td colspan="11" class="text-center text-danger">未获取到用户信息</td></tr>`;
            return;
        }
        const caseName = document.getElementById('myCaseSearchInput')?.value.trim() || '';
        const station = document.getElementById('myCaseStationSelect')?.value.trim() || '';
        const plaintiff = document.getElementById('myCasePlaintiffInput')?.value.trim() || '';
        const defendant = document.getElementById('myCaseDefendantInput')?.value.trim() || '';
        const assistant = document.getElementById('myCaseAssistantInput')?.value.trim() || '';
        const keyword = document.getElementById('keywordSearchInput')?.value.trim() || '';
        const statusValue = currentMyFilterStatus !== 'all' ? currentMyFilterStatus : '我的案件';
        const payload = {
            pageNum,
            pageSize,
            caseName: caseName || undefined,
            userName: username || undefined,
            status: statusValue,
            station: station || undefined,
            plaintiff: plaintiff || undefined,
            defendant: defendant || undefined,
            assistant: assistant || undefined,
            timeout: timeout || undefined,
            keyword: keyword || undefined
        };
        const response = await request('/case/page', 'POST', payload);
        if (tableBodyEl) { renderMyCaseTable(response.records); }
        renderMyPagination({ total: response.total, pageNum: response.pageNum, pageSize: response.pageSize });
    } catch (error) {
        const body = document.getElementById('myCaseTableBody');
        if (body) { body.innerHTML = `<tr><td colspan="11" class="text-center text-danger">加载案件失败</td></tr>`; }
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
                <a class="page-link" href="#" onclick="loadMyCases(${pageNum - 1}, ${pageSize})" aria-label="上一页">
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
    cases.forEach((caseInfo) => {
        let statusClass = '';
        switch (caseInfo.status) {
            case '待领取': statusClass = 'status-pending-receive'; break;
            case '已领取': statusClass = 'status-received'; break;
            case '反馈': statusClass = 'status-pre-feedback'; break;
            case '延期': statusClass = 'status-delayed'; break;
            case '待结案': statusClass = 'status-completed'; break;
            case '退回': statusClass = 'status-returned'; break;
            case '调解失败': statusClass = 'status-failed'; break;
            case '结案': statusClass = 'status-closed'; break;
        }
        let remindHtml = '';
        if (caseInfo.receiveTime) {
            const receiveDate = new Date(Date.parse(caseInfo.receiveTime));
            const daysSinceReceived = Math.floor((now - receiveDate) / (1000 * 60 * 60 * 24));
            if (caseInfo.receiveType === 'self_receive') {
                if (caseInfo.status === '已领取' && daysSinceReceived > 0 && daysSinceReceived <= 3) {
                    remindHtml = `<div class="alert alert-danger p-1 mb-1" style="font-size:13px;">即将自动退回，请及时操作！</div>`;
                }
                if (caseInfo.status === '反馈' && daysSinceReceived >= 12 && daysSinceReceived <= 15) {
                    remindHtml = `<div class="alert alert-danger p-1 mb-1" style="font-size:13px;">即将自动退回，请及时操作！</div>`;
                }
            }
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
            <td><span class="status-badge ${statusClass}">${caseInfo.status}</span>${remindHtml}</td>
            <td>
                <div class="d-flex flex-column gap-2">
                  <button class="btn btn-sm btn-info" type="button" onclick="showmyCaseDetailModal(${caseInfo.caseId})">案件详情</button>
                  <div class="dropdown">
                    <button class="btn btn-sm btn-primary dropdown-toggle my-dropdown-btn" type="button" data-dropdown-type="action" data-case-id="${caseInfo.caseId}">
                      案件操作
                    </button>
                    <ul class="dropdown-menu" style="display:none;">
                      ${(caseInfo.status === '已领取' || caseInfo.status === '反馈' || caseInfo.status === '延期') ? `
                      <li><a class="dropdown-item" href="javascript:void(0);" onclick="showPreFeedbackModal(${caseInfo.caseId})"><i class="fa fa-comment"></i> 反馈</a></li>
                      <li><a class="dropdown-item" href="javascript:void(0);" onclick="showDelayModal(${caseInfo.caseId})"><i class="fa fa-clock-o"></i> 延期</a></li>
                      ` : ''}
                      ${(caseInfo.status === '待结案' || caseInfo.status === '结案') ? `
                      <li><a class="dropdown-item" href="javascript:void(0);" onclick="showPaymentFlowsModal(${caseInfo.caseId}, true)"><i class="fa fa-credit-card"></i> 补充付款流水</a></li>
                      <li><a class="dropdown-item" href="javascript:void(0);" onclick="showCompleteCaseModal(${caseInfo.caseId})"><i class="fa fa-check"></i> 修改结案信息</a></li>
                      <li><a class="dropdown-item" href="javascript:void(0);" onclick="showApplyInvoiceModal(${caseInfo.caseId})"><i class="fa fa-file-text-o"></i> 申请开票</a></li>
                      ` : `
                      <li><a class="dropdown-item" href="javascript:void(0);" onclick="showCompleteCaseModal(${caseInfo.caseId})"><i class="fa fa-check"></i> 提交结案审核</a></li>
                      <li><a class="dropdown-item" href="javascript:void(0);" onclick="showReturnCaseModal(${caseInfo.caseId})"><i class="fa fa-undo"></i> 退回</a></li>
                      `}
                      ${(caseInfo.status === '待结案') ? `
                      <li><a class="dropdown-item" href="javascript:void(0);" onclick="showReturnCaseModal(${caseInfo.caseId})"><i class="fa fa-undo"></i> 退回</a></li>
                      ` : ''}
                    </ul>
                  </div>
                </div>
            </td>
        </tr>`;
    });
    tableBody.innerHTML = html;
    bindFixedDropdownMenus();
}

// 付款流水弹窗（复用管理端逻辑，增加 isMyCases 标记控制接口前缀）
function showPaymentFlowsModal(caseId, fromMyCases) {
    const modalId = 'paymentFlowsModal';
    // 我的案件页复用一个全局容器
    let container = document.getElementById('paymentFlowsModalContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'paymentFlowsModalContainer';
        document.body.appendChild(container);
    }
    container.innerHTML = `
    <div class="modal fade" id="${modalId}" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-lg">
            <div class="modal-content ant-card ant-card-bordered" style="border-radius:10px;box-shadow:0 4px 16px #e6f7ff;">
                <div class="modal-header" style="border-bottom:1px solid #f0f0f0;">
                    <h5 class="modal-title"><i class="fa fa-credit-card text-primary me-2"></i>补充结案信息 - 付款流水</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body" style="background:#fafcff;">
                    <input type="hidden" id="paymentFlowsCaseId" value="${caseId}">
                    <div class="mb-3">
                        <label class="form-label">已有付款流水</label>
                        <div id="paymentFlowsList" class="list-group small"></div>
                    </div>
                    <hr/>
                    <div class="mb-2 fw-bold">新增付款流水</div>
                    <div class="mb-2 text-muted">一次填写为一次付款流水（截图 + 时间 + 金额），只能新增和删除，不允许修改。</div>
                    <div class="row g-2 align-items-end">
                        <div class="col-md-4">
                            <label class="form-label">付款截图 (jpg/jpeg/png)</label>
                            <input type="file" id="paymentScreenshotFile" accept="image/png,image/jpeg" class="form-control" />
                        </div>
                        <div class="col-md-4">
                            <label class="form-label">付款时间</label>
                            <input type="datetime-local" id="paymentTimeInput" class="form-control" />
                        </div>
                        <div class="col-md-3">
                            <label class="form-label">付款金额 (元)</label>
                            <input type="number" step="0.01" id="paymentAmountInput" class="form-control" />
                        </div>
                        <div class="col-md-1 d-grid">
                            <button type="button" class="btn btn-primary" onclick="submitNewPaymentFlow()">添加</button>
                        </div>
                    </div>
                    <div class="text-danger mt-2" id="paymentFlowsError" style="display:none;"></div>
                </div>
                <div class="modal-footer" style="border-top:1px solid #f0f0f0;">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">关闭</button>
                </div>
            </div>
        </div>
    </div>`;
    const modal = new bootstrap.Modal(document.getElementById(modalId));
    modal.show();
    // 标记来源便于接口前缀统一（这里实际上前后端接口相同，所以不区分 fromMyCases）
    loadPaymentFlows(caseId);
}

async function loadPaymentFlows(caseId) {
    const listEl = document.getElementById('paymentFlowsList');
    const errEl = document.getElementById('paymentFlowsError');
    listEl.innerHTML = '<div class="text-muted">加载中...</div>';
    errEl.style.display = 'none';
    try {
        const resp = await request(`/case/detail/${caseId}`);
        // /case/detail/{id} 返回的是 {case: CaseInfo, ...}，这里做兼容
        const caseInfo = (resp && resp.case) ? resp.case : resp;
        if (!caseInfo || !caseInfo.caseCloseExt) {
            listEl.innerHTML = '<div class="text-muted">暂无付款流水</div>';
            return;
        }
        let ext;
        try {
            ext = (typeof caseInfo.caseCloseExt === 'string') ? JSON.parse(caseInfo.caseCloseExt) : caseInfo.caseCloseExt;
        } catch (e) {
            ext = null;
        }
        const flows = (ext && Array.isArray(ext.paymentFlows)) ? ext.paymentFlows : [];
        if (!flows.length) {
            listEl.innerHTML = '<div class="text-muted">暂无付款流水</div>';
            return;
        }
        const fmtAmt = v => (v!=null && v!=='' && !isNaN(v)) ? Number(v).toLocaleString('zh-CN',{minimumFractionDigits:2,maximumFractionDigits:2}) : '0.00';
        listEl.innerHTML = flows.map((f,idx)=>{
            const imgSrc = buildPaymentScreenshotSrc(f);
            const finalImgSrc = imgSrc ? (imgSrc.startsWith('/api') ? imgSrc : '/api' + imgSrc) : '';
            return `
    <div class="list-group-item d-flex justify-content-between align-items-center">
        <div>
            <div>序号：${idx+1}</div>
            <div>时间：${f.payTime||'-'}</div>
            <div>金额：${fmtAmt(f.amount)}</div>
        </div>
        <div class="d-flex align-items-center gap-2">
            ${finalImgSrc? `<img src="${finalImgSrc}"
                              alt="付款截图${idx+1}"
                              class="payment-screenshot"
                              data-url="${finalImgSrc}"
                              style="width:60px;height:60px;object-fit:cover;cursor:pointer;border-radius:4px;border:1px solid #eee;">`
                      : '<span class="text-muted">无截图</span>'}
            <button type="button" class="btn btn-sm btn-outline-danger" onclick="removePaymentFlow(${idx})">删除</button>
        </div>
    </div>`;
        }).join('');
    } catch (e) {
        listEl.innerHTML = '<div class="text-danger">加载付款流水失败</div>';
    }
}

async function submitNewPaymentFlow() {
    const caseId = document.getElementById('paymentFlowsCaseId').value;
    const fileInput = document.getElementById('paymentScreenshotFile');
    const payTimeInput = document.getElementById('paymentTimeInput');
    const amountInput = document.getElementById('paymentAmountInput');
    const errEl = document.getElementById('paymentFlowsError');
    errEl.style.display = 'none';
    const file = fileInput.files[0];
    const payTime = payTimeInput.value.trim();
    const amountRaw = amountInput.value.trim();
    if (!file || !payTime || !amountRaw) {
        errEl.textContent = '付款截图、付款时间和付款金额为必填项';
        errEl.style.display = 'block';
        return;
    }
    const lower = file.name.toLowerCase();
    if (!lower.endsWith('.jpg') && !lower.endsWith('.jpeg') && !lower.endsWith('.png')) {
        errEl.textContent = '仅支持 jpg 或 png 格式的图片';
        errEl.style.display = 'block';
        return;
    }
    if (isNaN(amountRaw) || Number(amountRaw) < 0) {
        errEl.textContent = '付款金额格式不正确或为负';
        errEl.style.display = 'block';
        return;
    }
    try {
        // 关闭当前上传浮窗
        const modalEl = document.getElementById('paymentFlowsModal');
        const modal = modalEl ? bootstrap.Modal.getInstance(modalEl) : null;
        if (modal) modal.hide();


        const formData = new FormData();
        formData.append('file', file);
        const uploadResp = await fetch('/api/case/upload-payment-screenshot', {
            method: 'POST',
            body: formData
        });
        const uploadJson = await uploadResp.json();
        if (!uploadResp.ok || uploadJson.code !== 200) {
            throw new Error(uploadJson.msg || '上传失败');
        }

        alert('上传成功');

        const screenshotUrl = uploadJson.data;
        await request('/case/payment-flows', 'POST', {
            caseId,
            action: 'add',
            screenshotUrl,
            payTime,
            amount: amountRaw
        });

        fileInput.value = '';
        payTimeInput.value = '';
        amountInput.value = '';
        loadPaymentFlows(caseId);
    } catch (e) {
        errEl.textContent = '保存付款流水失败：' + (e.message || '未知错误');
        errEl.style.display = 'block';
    }
}

async function removePaymentFlow(index) {
    const caseId = document.getElementById('paymentFlowsCaseId').value;
    const errEl = document.getElementById('paymentFlowsError');
    errEl.style.display = 'none';
    if (!confirm('确定要删除该条付款流水吗？')) return;
    try {
        await request('/case/payment-flows', 'POST', {
            caseId,
            action: 'remove',
            index
        });
        loadPaymentFlows(caseId);
    } catch (e) {
        errEl.textContent = '删除付款流水失败';
        errEl.style.display = 'block';
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
async function showCompleteCaseModal(caseId) {
    const modalContainer = document.getElementById('completeCaseModalContainer');
    modalContainer.innerHTML = `<div class="modal fade" id="completeCaseModal" tabindex="-1" aria-hidden="true"><div class="modal-dialog"><div class="modal-content"><div class="modal-body p-4 text-center">加载中...</div></div></div></div>`;
    let caseInfo = null;
    try { caseInfo = await request(`/case/detail/${caseId}`); } catch (e) {}

    // 兼容 /case/detail 返回 {case: {...}} 或直接 {...}
    const c = (caseInfo && caseInfo.case) ? caseInfo.case : caseInfo;
    // 解析既有结案扩展信息，便于“修改结案信息”时回填
    let existExt = {};
    if (c && c.caseCloseExt) {
        try {
            existExt = (typeof c.caseCloseExt === 'string') ? (JSON.parse(c.caseCloseExt) || {}) : (c.caseCloseExt || {});
        } catch (e) {
            existExt = {};
        }
    }

    // 回填值准备
    const existNotes = (existExt && existExt.completionNotes != null && String(existExt.completionNotes).trim() !== '')
        ? String(existExt.completionNotes).trim()
        : ((c && (c.completionNotes != null ? c.completionNotes : c.notes) != null)
            ? String(c.completionNotes != null ? c.completionNotes : c.notes).trim()
            : '');
    const existSignDate = existExt.signDate ? String(existExt.signDate).slice(0, 10) : '';
    const existAdjustedAmount = (existExt.adjustedAmount != null && existExt.adjustedAmount !== '')
        ? Number(existExt.adjustedAmount).toFixed(2)
        : '';
    const existPayer = existExt.payer || '';
    const existMediationFee = (existExt.mediationFee != null && existExt.mediationFee !== '') ? String(existExt.mediationFee) : '';
    const existPMediationFee = (existExt.plaintiffMediationFee != null && existExt.plaintiffMediationFee !== '') ? String(existExt.plaintiffMediationFee) : '';
    const existDMediationFee = (existExt.defendantMediationFee != null && existExt.defendantMediationFee !== '') ? String(existExt.defendantMediationFee) : '';
    const existIsMediateCase = !!(c && (c.isMediateCase === true || c.isMediateCase === 1 || c.isMediateCase === 'true'));

    // 调成标的额默认：优先已有结案信息，其次案件原标的额
    const defaultAmount = existAdjustedAmount || (c && c.amount != null ? (Number(c.amount).toFixed(2)) : '');
     const today = new Date().toISOString().slice(0,10);
     const modalHtml = `
     <div class="modal fade" id="completeCaseModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content ant-card ant-card-bordered" style="border-radius:10px;box-shadow:0 4px 16px #e6f7ff;">
                <div class="modal-header" style="border-bottom:1px solid #f0f0f0;">
                    <h5 class="modal-title"><i class="fa fa-check text-primary me-2"></i>提交结案审核</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body" style="background:#fafcff;">
                    <form id="completeCaseForm" novalidate>
                        <input type="hidden" id="completeCaseId" value="${caseId}">
                        <div class="form-group mb-3">
                            <label class="form-label">结案方式 <span class="text-danger">*</span></label>
                            <select id="completionNotes" class="form-select" required>
                                <option value="">请选择</option>
                                <option value="司法确认" ${existNotes==='司法确认'?'selected':''}>司法确认</option>
                                <option value="撤诉" ${existNotes==='撤诉'?'selected':''}>撤诉</option>
                                <option value="民初" ${existNotes==='民初'?'selected':''}>民初</option>
                                <option value="其他" ${existNotes==='其他'?'selected':''}>其他</option>
                             </select>
                         </div>
                         <hr/>
                         <div class="form-group mb-3">
                             <label class="form-label">签字时间 (≥ 今日)</label>
                            <input type="date" id="signDate" class="form-control" min="${today}" value="${existSignDate}">
                         </div>
                         <div class="form-group mb-3">
                             <label class="form-label">调成标的额 (元) <span class="text-danger">*</span></label>
                             <input type="number" step="0.01" id="adjustedAmount" required class="form-control" placeholder="请输入调成标的额" value="${defaultAmount}">
                             <div class="form-text">默认值来自案件原标的额，可自行修改。</div>
                         </div>
                         <div class="form-group mb-3" id="mediationFeeGroup">
                             <label class="form-label">
                                 调解费 (元) <span class="text-danger">*</span>
                             </label>
                            <input type="number" step="0.01" id="mediationFee" required class="form-control" placeholder="请输入调解费" value="${existMediationFee}">
                         </div>
                         <div class="form-group mb-3" id="plaintiffMediationFeeGroup" style="display:none;">
                             <label class="form-label">
                                 原告调解费 (元) <span class="text-danger">*</span>
                             </label>
                            <input type="number" step="0.01" id="plaintiffMediationFee" class="form-control" placeholder="请输入原告调解费" value="${existPMediationFee}">
                         </div>
                         <div class="form-group mb-3" id="defendantMediationFeeGroup" style="display:none;">
                             <label class="form-label">
                                 被告调解费 (元) <span class="text-danger">*</span>
                             </label>
                            <input type="number" step="0.01" id="defendantMediationFee" class="form-control" placeholder="请输入被告调解费" value="${existDMediationFee}">
                         </div>
                         <div class="form-group mb-3">
                             <label class="form-label">支付方 <span class="text-danger">*</span></label>
                             <select id="payer" class="form-select" required onchange="togglePayerMediationFields()">
                                 <option value="">请选择</option>
                                <option value="原告" ${existPayer==='原告'?'selected':''}>原告</option>
                                <option value="被告" ${existPayer==='被告'?'selected':''}>被告</option>
                                <option value="原被告" ${existPayer==='原被告'?'selected':''}>原被告</option>
                             </select>
                         </div>
                         <div class="form-group mb-3">
                             <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="isMediateCase" ${existIsMediateCase?'checked':''}>
                                 <label class="form-check-label" for="isMediateCase">
                                     是否是人调案件（系统将自动生成人调号）
                                 </label>
                             </div>
                         </div>
                     </form>
                 </div>
                 <div class="modal-footer" style="border-top:1px solid #f0f0f0;">
                     <button type="button" class="ant-btn ant-btn-secondary btn btn-secondary" data-bs-dismiss="modal" style="border-radius:4px;">取消</button>
                     <button type="button" class="ant-btn ant-btn-primary btn btn-primary" onclick="submitCaseCompletion()" style="border-radius:4px;">提交审核</button>
                 </div>
             </div>
         </div>
     </div>`;
    modalContainer.innerHTML = modalHtml;
    new bootstrap.Modal(document.getElementById('completeCaseModal')).show();

    // 强制回填结案方式（注意：select 的 id 是 completionNotes）
    const notesSel = document.getElementById('completionNotes');
    if (notesSel) {
        // 兜底规范化：去空格/换行，并兼容一些别名
        const normalized = (existNotes || '').replace(/\s+/g, '');
        const noteAliasMap = {
            '司法确认书': '司法确认',
            '司法确认': '司法确认',
            '撤诉': '撤诉',
            '民初': '民初',
            '民初一审': '民初',
            '其他': '其他'
        };
        const finalVal = noteAliasMap[normalized] || existNotes;
        // 只有当下拉里存在对应 option 时才设置，避免设置后仍显示空
        const hasOption = Array.from(notesSel.options || []).some(o => o.value === finalVal);
        if (hasOption) {
            notesSel.value = finalVal;
        }
    }

    // 回填后，根据支付方展示/隐藏调解费字段
     togglePayerMediationFields();
 }
function togglePayerMediationFields() {
    const payer = document.getElementById('payer')?.value || '';
    const totalGroup = document.getElementById('mediationFeeGroup');
    const totalInput = document.getElementById('mediationFee');
    const pGroup = document.getElementById('plaintiffMediationFeeGroup');
    const dGroup = document.getElementById('defendantMediationFeeGroup');
    const pInput = document.getElementById('plaintiffMediationFee');
    const dInput = document.getElementById('defendantMediationFee');
    if (!totalGroup || !totalInput || !pGroup || !dGroup || !pInput || !dInput) return;
    if (payer === '原被告') {
        // 隐藏总调解费，显示原告/被告调解费
        totalGroup.style.display = 'none';
        totalInput.removeAttribute('required');
        totalInput.value = '';
        pGroup.style.display = '';
        dGroup.style.display = '';
        pInput.setAttribute('required','required');
        dInput.setAttribute('required','required');
    } else if (payer === '原告' || payer === '被告') {
        // 显示总调解费，隐藏拆分
        totalGroup.style.display = '';
        totalInput.setAttribute('required','required');
        pGroup.style.display = 'none';
        dGroup.style.display = 'none';
        pInput.removeAttribute('required');
        dInput.removeAttribute('required');
        pInput.value = '';
        dInput.value = '';
    } else {
        // 未选择支付方时，默认显示总调解费
        totalGroup.style.display = '';
        totalInput.setAttribute('required','required');
        pGroup.style.display = 'none';
        dGroup.style.display = 'none';
        pInput.removeAttribute('required');
        dInput.removeAttribute('required');
        pInput.value = '';
        dInput.value = '';
    }
}
async function submitCaseCompletion() {
    const notes = document.getElementById('completionNotes').value.trim();
    if (!notes) { alert('请选择结案方式'); return; }
    const adjustedAmountRaw = document.getElementById('adjustedAmount').value.trim();
    const payer = document.getElementById('payer').value.trim();
    const signDate = document.getElementById('signDate').value || undefined;
    const totalMediationRaw = document.getElementById('mediationFee').value.trim();
    const pMediationRaw = document.getElementById('plaintiffMediationFee')?.value.trim() || '';
    const dMediationRaw = document.getElementById('defendantMediationFee')?.value.trim() || '';
    // 必填校验
    if(adjustedAmountRaw===''){ alert('请填写调成标的额'); return; }
    if(payer===''){ alert('请选择支付方'); return; }
    // 数值校验
    if(isNaN(adjustedAmountRaw) || Number(adjustedAmountRaw)<0){ alert('调成标的额格式不正确或为负'); return; }
    if(payer === '原被告') {
        if(isNaN(pMediationRaw) || Number(pMediationRaw)<0){ alert('原告调解费格式不正确或为负'); return; }
        if(isNaN(dMediationRaw) || Number(dMediationRaw)<0){ alert('被告调解费格式不正确或为负'); return; }
    } else {
        if(isNaN(totalMediationRaw) || Number(totalMediationRaw)<0){ alert('调解费格式不正确或为负'); return; }
    }
    const isMediateCase = !!document.getElementById('isMediateCase')?.checked;

    const caseId = document.getElementById('completeCaseId').value;
    const payload = {
        caseId,
        notes,
        signDate,
        adjustedAmount: adjustedAmountRaw,
        mediationFee: payer === '原被告' ? undefined : totalMediationRaw,
        plaintiffMediationFee: payer === '原被告' ? pMediationRaw : undefined,
        defendantMediationFee: payer === '原被告' ? dMediationRaw : undefined,
        payer,
        isMediateCase
    };
    try {
        await request('/case/complete-with-notes','POST', payload);
        bootstrap.Modal.getInstance(document.getElementById('completeCaseModal')).hide();
        loadMyCases(currentMyCasePage,currentMyCasePageSize);
        alert('已提交结案审核');
    } catch (e) {
        alert('提交失败，请重试');
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

// 在文件末尾（如还未定义 showImagePreview）新增统一的图片预览函数
if (typeof showImagePreview === 'undefined') {
    function showImagePreview(url) {
        let container = document.getElementById('imagePreviewModalContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'imagePreviewModalContainer';
            document.body.appendChild(container);
        }
        container.innerHTML = `
        <div class="modal fade" id="imagePreviewModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered modal-xl">
                <div class="modal-content" style="background:rgba(0,0,0,0.85);border:none;">
                    <div class="modal-header border-0">
                        <button type="button" class="btn-close btn-close-white ms-auto" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body d-flex justify-content-center align-items-center p-2">
                        <img src="${url}" alt="预览" style="max-width:100%;max-height:80vh;border-radius:4px;">
                    </div>
                </div>
            </div>
        </div>`;
        const modal = new bootstrap.Modal(document.getElementById('imagePreviewModal'));
        modal.show();
    }
}

// 在文件靠后位置增加一次性的图片点击代理绑定
if (!window.__myCasesImagePreviewBound) {
    window.__myCasesImagePreviewBound = true;
    document.addEventListener('click', function (e) {
        const target = e.target;
        if (target && target.classList && target.classList.contains('payment-screenshot')) {
            const url = target.getAttribute('data-url');
            if (url && typeof showImagePreview === 'function') {
                showImagePreview(url);
            }
        }
    });
}

// 反馈弹窗
function showPreFeedbackModal(caseId) {
    const modalHtml = `
    <div class="modal fade" id="myPreFeedbackModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content ant-card ant-card-bordered" style="border-radius:10px;box-shadow:0 4px 16px #e6f7ff;">
                <div class="modal-header" style="border-bottom:1px solid #f0f0f0;">
                    <h5 class="modal-title"><i class="fa fa-comment text-primary me-2"></i>案件反馈</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body" style="background:#fafcff;">
                    <input type="hidden" id="myPreFeedbackCaseId" value="${caseId}">
                    <div class="mb-3">
                        <label class="form-label">反馈内容 <span class="text-danger">*</span></label>
                        <textarea id="myPreFeedbackContent" class="form-control" rows="4" placeholder="请输入反馈内容"></textarea>
                    </div>
                </div>
                <div class="modal-footer" style="border-top:1px solid #f0f0f0;">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                    <button type="button" class="btn btn-primary" onclick="submitMyPreFeedback()">提交反馈</button>
                </div>
            </div>
        </div>
    </div>`;
    const temp = document.createElement('div');
    temp.innerHTML = modalHtml;
    document.body.appendChild(temp);
    const modal = new bootstrap.Modal(document.getElementById('myPreFeedbackModal'));
    modal.show();
    document.getElementById('myPreFeedbackModal').addEventListener('hidden.bs.modal', () => temp.remove());
}

async function submitMyPreFeedback() {
    const caseId = document.getElementById('myPreFeedbackCaseId').value;
    const content = document.getElementById('myPreFeedbackContent').value.trim();
    if (!content) {
        alert('请填写反馈内容');
        return;
    }
    try {
        await request('/case/pre-feedback', 'POST', { caseId, preFeedback: content });
        const modalEl = document.getElementById('myPreFeedbackModal');
        if (modalEl) {
            const modal = bootstrap.Modal.getInstance(modalEl);
            modal && modal.hide();
        }
        // 刷新“我的案件”页面
        loadMyCasesPage();
        alert('反馈已提交');
    } catch (e) {
        alert('提交反馈失败，请重试');
    }
}

// 延期弹窗
function showDelayModal(caseId) {
    const modalHtml = `
    <div class="modal fade" id="myDelayModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content ant-card ant-card-bordered" style="border-radius:10px;box-shadow:0 4px 16px #e6f7ff;">
                <div class="modal-header" style="border-bottom:1px solid #f0f0f0;">
                    <h5 class="modal-title"><i class="fa fa-clock-o text-primary me-2"></i>延期申请</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body" style="background:#fafcff;">
                    <input type="hidden" id="myDelayCaseId" value="${caseId}">
                    <div class="mb-3">
                        <label class="form-label">延期原因 <span class="text-danger">*</span></label>
                        <textarea id="myDelayReason" class="form-control" rows="4" placeholder="请输入延期原因"></textarea>
                    </div>
                </div>
                <div class="modal-footer" style="border-top:1px solid #f0f0f0;">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                    <button type="button" class="btn btn-primary" onclick="submitMyDelay()">提交延期</button>
                </div>
            </div>
        </div>
    </div>`;
    const temp = document.createElement('div');
    temp.innerHTML = modalHtml;
    document.body.appendChild(temp);
    const modal = new bootstrap.Modal(document.getElementById('myDelayModal'));
    modal.show();
    document.getElementById('myDelayModal').addEventListener('hidden.bs.modal', () => temp.remove());
}

async function submitMyDelay() {
    const caseId = document.getElementById('myDelayCaseId').value;
    const reason = document.getElementById('myDelayReason').value.trim();
    if (!reason) {
        alert('请填写延期原因');
        return;
    }
    try {
        await request('/case/delay', 'POST', { caseId, delayReason: reason });
        const modalEl = document.getElementById('myDelayModal');
        if (modalEl) {
            const modal = bootstrap.Modal.getInstance(modalEl);
            modal && modal.hide();
        }
        loadMyCasesPage();
        alert('延期申请已提交');
    } catch (e) {
        alert('提交延期失败，请稍后重试');
    }
}

// 退回弹窗
function showReturnCaseModal(caseId) {
    const modalHtml = `
    <div class="modal fade" id="myReturnCaseModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content ant-card ant-card-bordered" style="border-radius:10px;box-shadow:0 4px 16px #e6f7ff;">
                <div class="modal-header" style="border-bottom:1px solid #f0f0;">
                    <h5 class="modal-title"><i class="fa fa-undo textprimary me-2"></i>退回案件</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body" style="background:#fafcff;">
                    <input type="hidden" id="myReturnCaseId" value="${caseId}">
                    <div class="mb-3">
                        <label class="form-label">退回原因 <span class="text-danger">*</span></label>
                        <textarea id="myReturnReason" class="form-control" rows="4" placeholder="请输入退回原因"></textarea>
                    </div>
                </div>
                <div class="modal-footer" style="border-top:1px solid #f0f0f0;">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                    <button type="button" class="btn btn-primary" onclick="submitMyReturnCase()">确认退回</button>
                </div>
            </div>
        </div>
    </div>`;
    const temp = document.createElement('div');
    temp.innerHTML = modalHtml;
    document.body.appendChild(temp);
    const modal = new bootstrap.Modal(document.getElementById('myReturnCaseModal'));
    modal.show();
    document.getElementById('myReturnCaseModal').addEventListener('hidden.bs.modal', () => temp.remove());
}

async function submitMyReturnCase() {
    const caseId = document.getElementById('myReturnCaseId').value;
    const reason = document.getElementById('myReturnReason').value.trim();
    if (!reason) {
        alert('请填写退回原因');
        return;
    }
    try {
        await request('/case/return', 'POST', { caseId, returnReason: reason });
        const modalEl = document.getElementById('myReturnCaseModal');
        if (modalEl) {
            const modal = bootstrap.Modal.getInstance(modalEl);
            modal && modal.hide();
        }
        loadMyCasesPage();
        alert('案件已退回');
    } catch (e) {
        alert('退回案件失败，请稍后重试');
    }
}

// 付款流水：根据 screenshotUrlType 决定图片展示地址
function buildPaymentScreenshotSrc(flow) {
    if (!flow || !flow.screenshotUrl) return '';

    // 新：OSS 存储，screenshotUrl 存的是 objectName，例如 payment/xxx.png
    if (flow.screenshotUrlType === 'Oss') {
        return `/api/case/payment-screenshot?objectName=${encodeURIComponent(flow.screenshotUrl)}`;
    }

    // 旧：本地静态路径，直接访问
    return flow.screenshotUrl;
}

// =========================
// 申请开票（待结案独立入口）
// =========================

async function showApplyInvoiceModal(caseId) {
    let container = document.getElementById('applyInvoiceModalContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'applyInvoiceModalContainer';
        document.body.appendChild(container);
    }

    // 读取当前案件 ext，用于回填
    let ext = {};
    try {
        const resp = await request(`/case/detail/${caseId}`);
        const caseInfo = (resp && resp.case) ? resp.case : resp;
        if (caseInfo && caseInfo.caseCloseExt) {
            try {
                ext = (typeof caseInfo.caseCloseExt === 'string') ? (JSON.parse(caseInfo.caseCloseExt) || {}) : (caseInfo.caseCloseExt || {});
            } catch (e) {
                ext = {};
            }
        }
    } catch (e) {
        ext = {};
    }

    const paidVal = (typeof ext.paid === 'boolean') ? (ext.paid ? 'true' : 'false') : '';
    const invoiceInfo = ext.invoiceInfo || '';

    container.innerHTML = `
    <div class="modal fade" id="applyInvoiceModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content ant-card ant-card-bordered" style="border-radius:10px;box-shadow:0 4px 16px #e6f7ff;">
          <div class="modal-header" style="border-bottom:1px solid #f0f0f0;">
            <h5 class="modal-title"><i class="fa fa-file-text-o text-primary me-2"></i>申请开票</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body" style="background:#fafcff;">
            <input type="hidden" id="applyInvoiceCaseId" value="${caseId}">

            <div class="mb-3">
              <label class="form-label">付款流水</label>
              <div class="d-flex gap-2 mb-2 align-items-center">
                <button type="button" class="btn btn-sm btn-outline-primary" onclick="showPaymentFlowsModal(${caseId}, true)"><i class="fa fa-credit-card"></i> 维护付款流水</button>
                <span class="text-muted small">（可上传/删除，修改后返回此处再点击“刷新预览”即可看到最新）</span>
                <button type="button" class="btn btn-sm btn-outline-secondary" onclick="refreshApplyInvoiceFlowsPreview(${caseId})">刷新预览</button>
              </div>
              <div id="applyInvoiceFlowsPreview" class="small"></div>
            </div>

            <hr/>

            <div class="row g-2">
              <div class="col-md-6">
                <label class="form-label">是否已付款</label>
                <select id="applyInvoicePaid" class="form-select">
                  <option value="" ${paidVal===''?'selected':''}>未填写</option>
                  <option value="true" ${paidVal==='true'?'selected':''}>是</option>
                  <option value="false" ${paidVal==='false'?'selected':''}>否</option>
                </select>
              </div>
              <div class="col-12">
                <label class="form-label">开票信息</label>
                <textarea id="applyInvoiceInfo" rows="4" class="form-control" placeholder="请输入开票抬头 / 税号 / 地址等信息">${invoiceInfo || ''}</textarea>
              </div>
            </div>
            <div class="text-danger mt-2" id="applyInvoiceError" style="display:none;"></div>
          </div>
          <div class="modal-footer" style="border-top:1px solid #f0f0f0;">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
            <button type="button" class="btn btn-primary" onclick="submitApplyInvoice()">提交</button>
          </div>
        </div>
      </div>
    </div>`;

    new bootstrap.Modal(document.getElementById('applyInvoiceModal')).show();
    await refreshApplyInvoiceFlowsPreview(caseId);
}

async function refreshApplyInvoiceFlowsPreview(caseId) {
    const el = document.getElementById('applyInvoiceFlowsPreview');
    if (!el) return;
    el.innerHTML = '<div class="text-muted">加载中...</div>';
    try {
        const resp = await request(`/case/detail/${caseId}`);
        const caseInfo = (resp && resp.case) ? resp.case : resp;
        let ext = {};
        if (caseInfo && caseInfo.caseCloseExt) {
            try {
                ext = (typeof caseInfo.caseCloseExt === 'string') ? (JSON.parse(caseInfo.caseCloseExt) || {}) : (caseInfo.caseCloseExt || {});
            } catch (e) {
                ext = {};
            }
        }
        const flows = Array.isArray(ext.paymentFlows) ? ext.paymentFlows : [];
        if (!flows.length) {
            el.innerHTML = '<div class="text-muted">暂无付款流水</div>';
            return;
        }
        const fmtAmt = v => (v!=null && v!=='' && !isNaN(v)) ? Number(v).toLocaleString('zh-CN',{minimumFractionDigits:2,maximumFractionDigits:2}) : '0.00';
        el.innerHTML = flows.map((f,idx)=>{
            const imgSrc = buildPaymentScreenshotSrc(f);
            const finalImgSrc = imgSrc ? (imgSrc.startsWith('/api') ? imgSrc : '/api' + imgSrc) : '';
            return `<div class="border rounded p-2 mb-2 d-flex justify-content-between align-items-center">
            <div>
              <div>序号：${idx+1}</div>
              <div>时间：${f.payTime||'-'}</div>
              <div>金额：${fmtAmt(f.amount)}</div>
            </div>
            <div class="d-flex align-items-center gap-2">
              ${finalImgSrc? `<img src="${finalImgSrc}"
                              alt="付款截图${idx+1}"
                              class="payment-screenshot"
                              data-url="${finalImgSrc}"
                              style="width:60px;height:60px;object-fit:cover;cursor:pointer;border-radius:4px;border:1px solid #eee;">`
                      : '<span class="text-muted">无截图</span>'}
            </div>
        </div>`;
        }).join('');
    } catch (e) {
        el.innerHTML = '<div class="text-danger">加载付款流水失败</div>';
    }
}

async function submitApplyInvoice() {
    const errEl = document.getElementById('applyInvoiceError');
    if (errEl) errEl.style.display = 'none';

    const caseId = document.getElementById('applyInvoiceCaseId')?.value;
    const paidStr = document.getElementById('applyInvoicePaid')?.value;
    const invoiceInfo = document.getElementById('applyInvoiceInfo')?.value || '';

    if (!caseId) return;

    const payload = {
        caseId,
        invoiceInfo: invoiceInfo.trim() || undefined
    };
    if (paidStr === 'true') payload.paid = true;
    if (paidStr === 'false') payload.paid = false;

    try {
        await request('/case/apply-invoice', 'POST', payload);
        const modalEl = document.getElementById('applyInvoiceModal');
        const modal = modalEl ? bootstrap.Modal.getInstance(modalEl) : null;
        if (modal) modal.hide();
        loadMyCases(currentMyCasePage, currentMyCasePageSize);
        alert('开票信息已提交');
    } catch (e) {
        if (errEl) { errEl.textContent = '提交失败，请稍后重试'; errEl.style.display = 'block'; }
    }
}

