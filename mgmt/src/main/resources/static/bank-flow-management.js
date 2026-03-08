/**
 * 银行流水管理（财务管理 -> 银行流水管理）
 */

let bankFlowCurrentPage = 1;
let bankFlowPageSize = 10;

function loadBankFlowManagementPage() {
    setActiveNav('银行流水管理');

    const mainContent = document.getElementById('mainContent');
    mainContent.innerHTML = `
        <div class="ant-card ant-card-bordered mb-4" style="border-radius:8px;box-shadow:0 2px 8px #f0f1f2;">
            <div class="ant-card-body">
                <div class="row g-3 align-items-center">
                    <div class="col-md-4">
                        <div class="input-group">
                            <span class="input-group-text bg-light px-2" style="border-radius:4px 0 0 4px;">
                                <i class="fa fa-search text-secondary"></i>
                            </span>
                            <input type="text" id="bankFlowKeywordInput" class="form-control ant-input" placeholder="万能搜索：流水号/付款方/收款方/渠道/收款账号" style="border-radius:0 4px 4px 0;">
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="input-group">
                            <span class="input-group-text bg-light px-2" style="border-radius:4px 0 0 4px;">
                                <i class="fa fa-briefcase text-secondary"></i>
                            </span>
                            <input type="text" id="bankFlowCaseNumberInput" class="form-control ant-input" placeholder="案件号（精确匹配）" style="border-radius:0 4px 4px 0;">
                        </div>
                    </div>
                    <div class="col-md-2 d-flex align-items-end">
                        <button class="ant-btn ant-btn-primary w-100" style="border-radius:4px;" onclick="loadBankFlows(1, bankFlowPageSize)">
                            <i class="fa fa-search me-1"></i> 查询
                        </button>
                    </div>
                    <div class="col-md-3 d-flex justify-content-end gap-2 flex-wrap">
                        <button class="ant-btn" onclick="downloadBankFlowTemplate()"><i class="fa fa-file-excel-o"></i> 下载导入模板</button>
                        <button class="ant-btn" onclick="showImportBankFlowModal()"><i class="fa fa-upload"></i> 批量导入</button>
                        <button class="ant-btn" onclick="exportBankFlows()"><i class="fa fa-download"></i> 导出</button>
                        <button class="ant-btn ant-btn-primary" onclick="showBankFlowModal()"><i class="fa fa-plus"></i> 新增</button>
                    </div>
                </div>
            </div>
        </div>

        <div class="ant-card ant-card-bordered" style="border-radius:8px;">
            <div class="ant-card-body">
                <div class="table-responsive">
                    <table class="ant-table table table-hover table-bordered" style="border-radius:6px;overflow:hidden;">
                        <thead class="ant-table-thead table-light">
                            <tr>
                                <th>流水号</th>
                                <th>交易时间</th>
                                <th>交易金额</th>
                                <th>付款方</th>
                                <th>收款方</th>
                                <th>交易渠道</th>
                                <th>案件流水金额</th>
                                <th>案件号</th>
                                <th>流水状态</th>
                                <th>操作</th>
                            </tr>
                        </thead>
                        <tbody id="bankFlowTableBody">
                            <tr><td colspan="10" class="text-center">加载中...</td></tr>
                        </tbody>
                    </table>
                </div>
                <div id="bankFlowPaginationContainer" class="d-flex justify-content-center mt-3"></div>
            </div>
        </div>
    `;

    createBankFlowModalContainers();
    loadBankFlows(1, bankFlowPageSize);
}

function createBankFlowModalContainers() {
    if (!document.getElementById('bankFlowModalContainer')) {
        const d = document.createElement('div');
        d.id = 'bankFlowModalContainer';
        document.body.appendChild(d);
    }
    if (!document.getElementById('importBankFlowModalContainer')) {
        const d = document.createElement('div');
        d.id = 'importBankFlowModalContainer';
        document.body.appendChild(d);
    }
}

function fmtAmount(v) {
    if (v == null || v === '' || isNaN(v)) return '0.00';
    return Number(v).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

async function loadBankFlows(pageNum = 1, pageSize = 10) {
    bankFlowCurrentPage = pageNum;
    bankFlowPageSize = pageSize;

    const tbody = document.getElementById('bankFlowTableBody');
    if (!tbody) return;
    tbody.innerHTML = `<tr><td colspan="10" class="text-center">加载中...</td></tr>`;

    const keyword = document.getElementById('bankFlowKeywordInput')?.value?.trim() || '';
    const caseNumber = document.getElementById('bankFlowCaseNumberInput')?.value?.trim() || '';

    try {
        const resp = await request('/bank-flow/page', 'POST', {
            pageNum,
            pageSize,
            keyword: keyword || undefined,
            caseNumber: caseNumber || undefined
        });
        renderBankFlowTable(resp.records || []);
        renderBankFlowPagination(resp.total || 0, resp.pageNum || pageNum, resp.pageSize || pageSize);
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="10" class="text-center text-danger">加载失败</td></tr>`;
    }
}

function renderBankFlowTable(list) {
    const tbody = document.getElementById('bankFlowTableBody');
    if (!tbody) return;

    if (!list || list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="10" class="text-center">没有找到数据</td></tr>`;
        return;
    }

    tbody.innerHTML = list.map(r => `
        <tr>
            <td>${r.flowNo || '-'}</td>
            <td>${r.tradeTime || '-'}</td>
            <td>${fmtAmount(r.tradeAmount)}</td>
            <td>${r.payer || '-'}</td>
            <td>${r.payee || '-'}</td>
            <td>${r.channel || '-'}</td>
            <td>${r.casePaymentId ? fmtAmount(r.remainingAmount) : '-'}</td>
            <td>${r.caseNumber || '-'}</td>
            <td>${getFlowStatusTag(r.flowStatus)}</td>
            <td>
                <div class="d-flex gap-2 flex-wrap">
                    ${canAudit(r.flowStatus) ? `<button class="btn btn-sm btn-success" onclick='showAuditModal(${r.id})'><i class="fa fa-check-circle"></i> 审批</button>` : ''}
                    <button class="btn btn-sm btn-primary" onclick='showBankFlowModal(${JSON.stringify(r).replace(/'/g, "&#39;")})'>编辑</button>
                    <button class="btn btn-sm btn-danger" onclick='deleteBankFlow(${r.id})'>删除</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function getFlowStatusTag(status) {
    if (!status) return '<span class="badge bg-secondary">待案件匹配</span>';
    const statusMap = {
        '待案件匹配': '<span class="badge bg-secondary">待案件匹配</span>',
        '申请结算': '<span class="badge bg-warning text-dark">申请结算</span>',
        '结算通过': '<span class="badge bg-success">结算通过</span>',
        '结算不通过': '<span class="badge bg-danger">结算不通过</span>',
        '申请退费': '<span class="badge bg-info text-dark">申请退费</span>',
        '退费通过': '<span class="badge bg-success">退费通过</span>',
        '退费不通过': '<span class="badge bg-danger">退费不通过</span>',
        '已结算': '<span class="badge bg-success">已结算</span>',
        '已退费': '<span class="badge bg-primary">已退费</span>'
    };
    return statusMap[status] || `<span class="badge bg-secondary">${status}</span>`;
}

/**
 * 判断是否可以审批（状态为申请结算或申请退费）
 */
function canAudit(status) {
    return status === '申请结算' || status === '申请退费';
}

function renderBankFlowPagination(total, pageNum, pageSize) {
    const container = document.getElementById('bankFlowPaginationContainer');
    if (!container) return;

    const pages = Math.ceil(total / pageSize);
    if (pages <= 1) {
        container.innerHTML = `<div class="text-secondary">共 ${total} 条记录</div>`;
        return;
    }

    let startPage = Math.max(1, pageNum - 2);
    let endPage = Math.min(pages, startPage + 4);
    if (endPage - startPage < 4) startPage = Math.max(1, endPage - 4);

    let html = `
    <div class="d-flex flex-column align-items-center">
      <div class="mb-1 text-secondary">共 ${total} 条记录，当前第 ${pageNum}/${pages} 页</div>
      <nav>
        <ul class="pagination">
          <li class="page-item ${pageNum === 1 ? 'disabled' : ''}">
            <a class="page-link" href="javascript:void(0);" onclick="loadBankFlows(${pageNum - 1}, ${pageSize})">&laquo;</a>
          </li>`;

    if (startPage > 1) {
        html += `<li class="page-item"><a class="page-link" href="javascript:void(0);" onclick="loadBankFlows(1, ${pageSize})">1</a></li>`;
        if (startPage > 2) html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
    }

    for (let i = startPage; i <= endPage; i++) {
        html += `<li class="page-item ${i === pageNum ? 'active' : ''}"><a class="page-link" href="javascript:void(0);" onclick="loadBankFlows(${i}, ${pageSize})">${i}</a></li>`;
    }

    if (endPage < pages) {
        if (endPage < pages - 1) html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        html += `<li class="page-item"><a class="page-link" href="javascript:void(0);" onclick="loadBankFlows(${pages}, ${pageSize})">${pages}</a></li>`;
    }

    html += `
          <li class="page-item ${pageNum === pages ? 'disabled' : ''}">
            <a class="page-link" href="javascript:void(0);" onclick="loadBankFlows(${pageNum + 1}, ${pageSize})">&raquo;</a>
          </li>
        </ul>
      </nav>
    </div>`;

    container.innerHTML = html;
}

function showBankFlowModal(row) {
    const container = document.getElementById('bankFlowModalContainer');
    if (!container) return;

    const isEdit = !!(row && row.id);

    // datetime-local 需要形如 yyyy-MM-ddTHH:mm
    const toDatetimeLocal = (v) => {
        if (!v) return '';
        const s = String(v).trim();
        // 兼容后端常见格式：yyyy-MM-dd HH:mm:ss 或 yyyy-MM-dd HH:mm
        if (s.includes(' ') && !s.includes('T')) {
            const parts = s.split(' ');
            const date = parts[0];
            const time = (parts[1] || '').trim();
            const hm = time.length >= 5 ? time.slice(0, 5) : time;
            return `${date}T${hm}`;
        }
        // 已经是 yyyy-MM-ddTHH:mm 或带秒
        if (s.includes('T')) {
            // 去掉秒
            return s.length >= 16 ? s.slice(0, 16) : s;
        }
        return s;
    };

    container.innerHTML = `
    <div class="modal fade" id="bankFlowModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content ant-card ant-card-bordered" style="border-radius:10px;box-shadow:0 4px 16px #e6f7ff;">
          <div class="modal-header" style="border-bottom:1px solid #f0f0f0;">
            <h5 class="modal-title"><i class="fa fa-bank text-primary me-2"></i>${isEdit ? '编辑' : '新增'}银行流水</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body" style="background:#fafcff;">
            <input type="hidden" id="bfId" value="${row && row.id ? row.id : ''}">
            <div class="row g-2">
              <div class="col-md-6">
                <label class="form-label">流水号 <span class="text-danger">*</span></label>
                 <input type="text" class="form-control" id="bfFlowNo" value="${row && row.flowNo ? row.flowNo : ''}" ${isEdit ? '' : ''}>
               </div>
               <div class="col-md-6">
                <label class="form-label">交易时间 <span class="text-danger">*</span></label>
                <input type="datetime-local" class="form-control" id="bfTradeTime" value="${toDatetimeLocal(row && row.tradeTime ? row.tradeTime : '')}">
               </div>
               <div class="col-md-6">
                <label class="form-label">交易金额 <span class="text-danger">*</span></label>
                 <input type="number" step="0.01" class="form-control" id="bfTradeAmount" value="${row && row.tradeAmount != null ? row.tradeAmount : ''}">
               </div>
               <div class="col-md-6">
                <label class="form-label">交易渠道 <span class="text-danger">*</span></label>
                 <input type="text" class="form-control" id="bfChannel" value="${row && row.channel ? row.channel : ''}">
               </div>
               <div class="col-md-6">
                <label class="form-label">付款方 <span class="text-danger">*</span></label>
                 <input type="text" class="form-control" id="bfPayer" value="${row && row.payer ? row.payer : ''}">
               </div>
               <div class="col-md-6">
                <label class="form-label">收款方 <span class="text-danger">*</span></label>
                 <input type="text" class="form-control" id="bfPayee" value="${row && row.payee ? row.payee : ''}">
               </div>
               <div class="col-md-6">
                 <label class="form-label">收款账号</label>
                 <input type="text" class="form-control" id="bfPayeeAccount" value="${row && row.payeeAccount ? row.payeeAccount : ''}">
               </div>
               <div class="col-md-6">
                 <label class="form-label">案件号</label>
                 <input type="text" class="form-control" id="bfCaseNumber" value="${row && row.caseNumber ? row.caseNumber : ''}">
               </div>
             </div>
             <div class="text-danger mt-2" id="bfError" style="display:none;"></div>
           </div>
           <div class="modal-footer" style="border-top:1px solid #f0f0f0;">
             <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
             <button type="button" class="btn btn-primary" onclick="submitBankFlow()">保存</button>
           </div>
         </div>
       </div>
     </div>`;

    new bootstrap.Modal(document.getElementById('bankFlowModal')).show();
}

async function submitBankFlow() {
    const err = document.getElementById('bfError');
    if (err) err.style.display = 'none';

    const idStr = document.getElementById('bfId')?.value;
    const flowNo = document.getElementById('bfFlowNo')?.value?.trim();
    const tradeTimeRaw = document.getElementById('bfTradeTime')?.value?.trim();
    const tradeAmount = document.getElementById('bfTradeAmount')?.value?.trim();
    const payer = document.getElementById('bfPayer')?.value?.trim();
    const payee = document.getElementById('bfPayee')?.value?.trim();
    const channel = document.getElementById('bfChannel')?.value?.trim();
    const payeeAccount = document.getElementById('bfPayeeAccount')?.value?.trim();
    const caseNumber = document.getElementById('bfCaseNumber')?.value?.trim();

    // 必填校验：流水号、交易时间、交易金额、交易渠道、付款方、收款方
    const missing = [];
    if (!flowNo) missing.push('流水号');
    if (!tradeTimeRaw) missing.push('交易时间');
    if (tradeAmount === '' || tradeAmount == null) missing.push('交易金额');
    if (!channel) missing.push('交易渠道');
    if (!payer) missing.push('付款方');
    if (!payee) missing.push('收款方');
    if (missing.length) {
        if (err) {
            err.textContent = `以下字段为必填：${missing.join('、')}`;
            err.style.display = 'block';
        }
        return;
    }

    if (isNaN(tradeAmount)) {
        if (err) { err.textContent = '交易金额格式不正确'; err.style.display = 'block'; }
        return;
    }

    // datetime-local -> yyyy-MM-dd HH:mm:ss
    const tradeTime = tradeTimeRaw ? (tradeTimeRaw.replace('T', ' ') + ':00') : undefined;

    const payload = {
        id: idStr ? Number(idStr) : undefined,
        flowNo,
        tradeTime: tradeTime || undefined,
        tradeAmount: tradeAmount === '' ? undefined : tradeAmount,
        payer: payer || undefined,
        payee: payee || undefined,
        channel: channel || undefined,
        payeeAccount: payeeAccount || undefined,
        caseNumber: caseNumber || undefined
    };

    try {
        const api = payload.id ? '/bank-flow/update' : '/bank-flow/create';
        await request(api, 'POST', payload);
        const modalEl = document.getElementById('bankFlowModal');
        const modal = modalEl ? bootstrap.Modal.getInstance(modalEl) : null;
        if (modal) modal.hide();
        loadBankFlows(bankFlowCurrentPage, bankFlowPageSize);
    } catch (e) {
        if (err) { err.textContent = e.message || '保存失败'; err.style.display = 'block'; }
    }
}

async function deleteBankFlow(id) {
    if (!id) return;
    if (!confirm('确认删除该条流水吗？')) return;

    try {
        await request('/bank-flow/delete', 'POST', { id });
        loadBankFlows(bankFlowCurrentPage, bankFlowPageSize);
    } catch (e) {
        alert(e.message || '删除失败');
    }
}

function downloadBankFlowTemplate() {
    window.location.href = `${window.baseUrl}/bank-flow/template`;
}

function showImportBankFlowModal() {
    const container = document.getElementById('importBankFlowModalContainer');
    if (!container) return;

    container.innerHTML = `
    <div class="modal fade" id="importBankFlowModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content ant-card ant-card-bordered" style="border-radius:10px;box-shadow:0 4px 16px #e6f7ff;">
          <div class="modal-header" style="border-bottom:1px solid #f0f0f0;">
            <h5 class="modal-title"><i class="fa fa-upload text-primary me-2"></i>批量导入银行流水</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body" style="background:#fafcff;">
            <input type="file" id="bankFlowImportFile" accept=".xlsx" class="form-control" />
            <div class="form-text small">支持 .xlsx。列顺序：流水号/交易时间/交易金额/付款方/收款方（青枫、澎和工作室、澎和信息）/交易渠道（支付宝、微信、对公、系统内资金清算往来、系统内清算资金往来-全渠道收单平台）</div>
            <div class="text-danger mt-2" id="bankFlowImportError" style="display:none;"></div>
            <pre class="mt-2 small" id="bankFlowImportResult" style="display:none;background:#fff;border:1px solid #eee;border-radius:6px;padding:8px;max-height:220px;overflow:auto;"></pre>
          </div>
          <div class="modal-footer" style="border-top:1px solid #f0f0f0;">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">关闭</button>
            <button type="button" class="btn btn-primary" onclick="submitImportBankFlows()">开始导入</button>
          </div>
        </div>
      </div>
    </div>`;

    new bootstrap.Modal(document.getElementById('importBankFlowModal')).show();
}

async function submitImportBankFlows() {
    const fileInput = document.getElementById('bankFlowImportFile');
    const err = document.getElementById('bankFlowImportError');
    const resultEl = document.getElementById('bankFlowImportResult');
    if (err) err.style.display = 'none';
    if (resultEl) resultEl.style.display = 'none';

    const file = fileInput && fileInput.files && fileInput.files[0];
    if (!file) {
        if (err) { err.textContent = '请选择文件'; err.style.display = 'block'; }
        return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
        // 这里不用 request()，因为 request 固定 Content-Type=application/json，不适合 multipart
        const resp = await fetch(`${window.baseUrl}/bank-flow/import`, {
            method: 'POST',
            body: formData,
            credentials: 'include'
        });
        const json = await resp.json();
        if (!resp.ok || !json || json.code !== 200) {
            throw new Error((json && (json.msg || json.message)) || '导入失败');
        }

        const data = json.data || {};
        const lines = [];
        lines.push(`成功：${data.success || 0}`);
        lines.push(`失败：${data.failed || 0}`);
        if (data.errors && data.errors.length) {
            lines.push('失败明细：');
            data.errors.slice(0, 200).forEach(e => lines.push(e));
        }
        if (resultEl) {
            resultEl.textContent = lines.join('\n');
            resultEl.style.display = 'block';
        }
        loadBankFlows(1, bankFlowPageSize);
    } catch (e) {
        if (err) { err.textContent = e.message || '导入失败'; err.style.display = 'block'; }
    }
}

function exportBankFlows() {
    const keyword = document.getElementById('bankFlowKeywordInput')?.value?.trim() || '';
    const caseNumber = document.getElementById('bankFlowCaseNumberInput')?.value?.trim() || '';

    const params = new URLSearchParams();
    if (keyword) params.append('keyword', keyword);
    if (caseNumber) params.append('caseNumber', caseNumber);

    window.location.href = `${window.baseUrl}/bank-flow/export?${params.toString()}`;
}

// ========== 审批功能 ==========

let currentAuditBankFlowId = null;

/**
 * 显示审批弹窗
 */
async function showAuditModal(bankFlowId) {
    currentAuditBankFlowId = bankFlowId;

    // 创建弹窗容器
    let container = document.getElementById('auditModalContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'auditModalContainer';
        document.body.appendChild(container);
    }

    container.innerHTML = `
        <div class="modal fade" id="auditModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-xl">
                <div class="modal-content ant-card ant-card-bordered" style="border-radius:10px;box-shadow:0 4px 16px #e6f7ff;">
                    <div class="modal-header" style="border-bottom:1px solid #f0f0f0;">
                        <h5 class="modal-title"><i class="fa fa-check-circle text-success me-2"></i>银行流水审批</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body" id="auditModalBody" style="background:#fafcff;max-height:70vh;overflow-y:auto;">
                        <div class="text-center py-4">
                            <div class="spinner-border text-primary" role="status"></div>
                            <p class="mt-2">加载中...</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    const modal = new bootstrap.Modal(document.getElementById('auditModal'));
    modal.show();

    try {
        // 获取审核详情
        const resp = await request(`/bank-flow/audit-detail?bankFlowId=${bankFlowId}`, 'GET');
        const data = resp.data || resp;
        renderAuditModal(data);
    } catch (e) {
        const bodyEl = document.getElementById('auditModalBody');
        if (bodyEl) {
            bodyEl.innerHTML = `
                <div class="alert alert-danger">加载失败：${e.message || '未知错误'}</div>
            `;
        }
    }
}

/**
 * 渲染审批弹窗内容
 */
function renderAuditModal(data) {
    const bodyEl = document.getElementById('auditModalBody');
    if (!bodyEl) return;

    const bankFlow = data.bankFlow || {};
    const casePaymentFlow = data.casePaymentFlow || {};
    const caseInfo = data.caseInfo || {};

    // 处理截图URL（兼容Oss和本地存储）
    function buildPaymentScreenshotSrc(flow) {
        if (!flow || !flow.screenshotUrl) return '';
        if (flow.screenshotUrlType === 'Oss') {
            return `/api/case/payment-screenshot?objectName=${encodeURIComponent(flow.screenshotUrl)}`;
        }
        return flow.screenshotUrl;
    }

    // 处理截图URL
    let screenshotHtml = '<p class="text-muted">无转账截图</p>';
    if (casePaymentFlow.screenshotUrl) {
        const urls = casePaymentFlow.screenshotUrl.split(',').filter(u => u.trim());
        if (urls.length > 0) {
            screenshotHtml = `
                <div class="d-flex flex-wrap gap-2">
                    ${urls.map(url => {
                        // 构建完整的截图URL（考虑Oss类型）
                        const fullUrl = buildPaymentScreenshotSrc(casePaymentFlow);
                        return `
                        <a href="${fullUrl}" target="_blank" class="d-block" style="width:200px;height:200px;border:1px solid #ddd;border-radius:4px;overflow:hidden;">
                            <img src="${fullUrl}" style="width:100%;height:100%;object-fit:cover;" alt="转账截图" onerror="this.parentElement.innerHTML='<div class=text-center p-4 text-muted>图片加载失败</div>'">
                        </a>
                        `;
                    }).join('')}
                </div>
            `;
        }
    }

    bodyEl.innerHTML = `
        <div class="row g-4">
            <!-- 第一部分：银行流水信息 -->
            <div class="col-md-6">
                <div class="card h-100">
                    <div class="card-header bg-primary text-white">
                        <i class="fa fa-bank me-2"></i>银行流水信息
                    </div>
                    <div class="card-body">
                        <table class="table table-borderless table-sm">
                            <tr><td class="text-muted" style="width:100px;">流水号</td><td>${bankFlow.flowNo || '-'}</td></tr>
                            <tr><td class="text-muted">交易时间</td><td>${bankFlow.tradeTime || '-'}</td></tr>
                            ${bankFlow.remainingAmount != null && bankFlow.tradeAmount != null && bankFlow.remainingAmount !== bankFlow.tradeAmount ? `
                            <tr><td class="text-muted">交易金额</td><td class="fw-bold text-primary">${fmtAmount(bankFlow.tradeAmount)}</td></tr>
                            <tr><td class="text-muted">案件金额</td><td class="fw-bold text-success">${fmtAmount(bankFlow.remainingAmount)} <span class="badge bg-warning text-dark ms-1">拆分流水</span></td></tr>
                            ` : `
                            <tr><td class="text-muted">交易金额</td><td class="fw-bold text-primary">${fmtAmount(bankFlow.tradeAmount)}</td></tr>
                            `}
                            <tr><td class="text-muted">付款方</td><td>${bankFlow.payer || '-'}</td></tr>
                            <tr><td class="text-muted">收款方</td><td>${bankFlow.payee || '-'}</td></tr>
                            <tr><td class="text-muted">交易渠道</td><td>${bankFlow.channel || '-'}</td></tr>
                            <tr><td class="text-muted">当前状态</td><td>${getFlowStatusTag(bankFlow.flowStatus)}</td></tr>
                        </table>
                    </div>
                </div>
            </div>

            <!-- 第二部分：案件流水信息 -->
            <div class="col-md-6">
                <div class="card h-100">
                    <div class="card-header bg-info text-white">
                        <i class="fa fa-credit-card me-2"></i>案件流水信息
                    </div>
                    <div class="card-body">
                        <table class="table table-borderless table-sm">
                            <tr><td class="text-muted" style="width:100px;">流水ID</td><td>${casePaymentFlow.id || '-'}</td></tr>
                            <tr><td class="text-muted">付款时间</td><td>${casePaymentFlow.payTime ? new Date(casePaymentFlow.payTime).toLocaleString('zh-CN') : '-'}</td></tr>
                            <tr>
                                <td class="text-muted">付款金额</td>
                                <td class="fw-bold text-info">${fmtAmount(casePaymentFlow.amount)} <span class="text-muted mx-1">|</span> ${casePaymentFlow.channel || '-'}</td>
                            </tr>
                        </table>
                        <!-- 转账截图 -->
                        <div class="mt-2">
                            <div class="text-muted small mb-2"><i class="fa fa-image me-1"></i>转账截图</div>
                            ${screenshotHtml}
                        </div>
                    </div>
                </div>
            </div>

            <!-- 第三部分：案件基本信息 -->
            <div class="col-12">
                <div class="card">
                    <div class="card-header bg-secondary text-white">
                        <i class="fa fa-briefcase me-2"></i>案件基本信息
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-6">
                                <table class="table table-borderless table-sm">
                                    <tr><td class="text-muted" style="width:100px;">案件编号</td><td>${caseInfo.caseNumber || '-'}</td></tr>
                                    <tr><td class="text-muted">案由</td><td>${caseInfo.caseName || '-'}</td></tr>
                                    <tr><td class="text-muted">原告</td><td>${caseInfo.plaintiffName || '-'}</td></tr>
                                </table>
                            </div>
                            <div class="col-md-6">
                                <table class="table table-borderless table-sm">
                                    <tr><td class="text-muted" style="width:100px;">案件状态</td><td>${caseInfo.status || '-'}</td></tr>
                                    <tr><td class="text-muted">领取时间</td><td>${caseInfo.receiveTime || '-'}</td></tr>
                                    <tr><td class="text-muted">被告</td><td>${caseInfo.defendantName || '-'}</td></tr>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 操作按钮 -->
            <div class="col-12">
                <div class="d-flex justify-content-center gap-3 mt-3">
                    <button class="btn btn-lg btn-success" onclick="submitAudit(true)">
                        <i class="fa fa-check me-2"></i>审核通过
                    </button>
                    <button class="btn btn-lg btn-danger" onclick="submitAudit(false)">
                        <i class="fa fa-times me-2"></i>审核不通过
                    </button>
                </div>
            </div>
        </div>
    `;
}

/**
 * 提交审批结果
 */
async function submitAudit(approved) {
    if (!currentAuditBankFlowId) return;

    const confirmMsg = approved ? '确认审核通过？' : '确认审核不通过？';
    if (!confirm(confirmMsg)) return;

    try {
        await request('/bank-flow/audit', 'POST', {
            bankFlowId: currentAuditBankFlowId,
            approved: approved
        });

        alert('审批提交成功');

        // 关闭弹窗
        const modalEl = document.getElementById('auditModal');
        const modal = modalEl ? bootstrap.Modal.getInstance(modalEl) : null;
        if (modal) modal.hide();

        // 刷新列表
        loadBankFlows(bankFlowCurrentPage, bankFlowPageSize);
    } catch (e) {
        alert('审批提交失败：' + (e.message || '未知错误'));
    }
}
