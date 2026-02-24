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
                                <th>收款账号</th>
                                <th>案件号</th>
                                <th>操作</th>
                            </tr>
                        </thead>
                        <tbody id="bankFlowTableBody">
                            <tr><td colspan="9" class="text-center">加载中...</td></tr>
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
    tbody.innerHTML = `<tr><td colspan="9" class="text-center">加载中...</td></tr>`;

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
        tbody.innerHTML = `<tr><td colspan="9" class="text-center text-danger">加载失败</td></tr>`;
    }
}

function renderBankFlowTable(list) {
    const tbody = document.getElementById('bankFlowTableBody');
    if (!tbody) return;

    if (!list || list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" class="text-center">没有找到数据</td></tr>`;
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
            <td>${r.payeeAccount || '-'}</td>
            <td>${r.caseNumber || '-'}</td>
            <td>
                <div class="d-flex gap-2 flex-wrap">
                    <button class="btn btn-sm btn-primary" onclick='showBankFlowModal(${JSON.stringify(r).replace(/'/g, "&#39;")})'>编辑</button>
                    <button class="btn btn-sm btn-danger" onclick='deleteBankFlow(${r.id})'>删除</button>
                </div>
            </td>
        </tr>
    `).join('');
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
