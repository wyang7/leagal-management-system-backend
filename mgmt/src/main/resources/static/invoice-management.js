/**
 * 开票管理页面（财务管理 -> 开票管理）
 */

let invoiceCurrentPage = 1;
let invoicePageSize = 10;
let invoiceCurrentStatus = '待开票';

function loadInvoiceManagementPage(status) {
    invoiceCurrentStatus = status || invoiceCurrentStatus || '待开票';
    setActiveNav('开票管理');

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
                            <input type="text" id="invoiceKeywordSearchInput" class="form-control ant-input" 
                                   placeholder="万能搜索框" 
                                   style="border-radius:0 4px 4px 0;">
                        </div>
                    </div>
                    <div class="col-md-3 d-flex align-items-end">
                        <button class="ant-btn ant-btn-primary w-100" style="border-radius:4px;" onclick="loadInvoiceCases()">
                            <i class="fa fa-search me-1"></i> 查询
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div class="ant-card ant-card-bordered mb-3" style="border-radius:8px;">
            <div class="ant-card-body">
                <div class="btn-group mb-2" role="group">
                    <button class="ant-btn ant-btn-default btn btn-outline-primary" onclick="filterInvoiceStatus('待开票')">待开票</button>
                    <button class="ant-btn ant-btn-default btn btn-outline-primary" onclick="filterInvoiceStatus('已开票')">已开票</button>
                </div>

                <div class="table-responsive">
                    <table class="ant-table table table-hover table-bordered" style="border-radius:6px;overflow:hidden;">
                        <thead class="ant-table-thead table-light" id="invoiceTableHead"></thead>
                        <tbody id="invoiceTableBody">
                            <tr><td colspan="12" class="text-center">加载中...</td></tr>
                        </tbody>
                    </table>
                </div>

                <div id="invoicePaginationContainer" class="d-flex justify-content-center mt-3"></div>
            </div>
        </div>
    `;

    renderInvoiceTableHeader();
    markInvoiceStatusButtonActive(invoiceCurrentStatus);
    loadInvoiceCases(1, invoicePageSize);
}

function markInvoiceStatusButtonActive(status) {
    document.querySelectorAll('.btn-group .btn.btn-outline-primary').forEach(btn => btn.classList.remove('active'));
    const buttons = document.querySelectorAll('.btn-group .btn.btn-outline-primary');
    buttons.forEach(btn => {
        if ((btn.textContent || '').trim() === status) {
            btn.classList.add('active');
        }
    });
}

function filterInvoiceStatus(status) {
    invoiceCurrentStatus = status;
    invoiceCurrentPage = 1;
    markInvoiceStatusButtonActive(status);
    renderInvoiceTableHeader();
    loadInvoiceCases(invoiceCurrentPage, invoicePageSize);
}

function renderInvoiceTableHeader() {
    const thead = document.getElementById('invoiceTableHead');
    if (!thead) return;
    thead.innerHTML = `
        <tr>
            <th style="white-space:nowrap;"><input type="checkbox" id="selectAllInvoiceCases"></th>
            <th style="white-space:nowrap;">案件号</th>
            <th style="white-space:nowrap;">案由</th>
            <th style="white-space:nowrap;">标的额</th>
            <th style="white-space:nowrap;" title="案件归属地">归属地</th>
            <th style="white-space:nowrap;">原告</th>
            <th style="white-space:nowrap;">被告</th>
            <th style="white-space:nowrap;">案件助理</th>
            <th style="white-space:nowrap;">申请开票时间</th>
            <th style="white-space:nowrap;">开票状态</th>
            <th style="white-space:nowrap;">处理人</th>
            <th style="white-space:nowrap;">操作</th>
        </tr>
    `;

    const selectAll = document.getElementById('selectAllInvoiceCases');
    if (selectAll) {
        selectAll.onchange = function () {
            document.querySelectorAll('.invoice-case-checkbox').forEach(cb => { cb.checked = selectAll.checked; });
        };
    }
}

async function loadInvoiceCases(pageNum = 1, pageSize = 10) {
    invoiceCurrentPage = pageNum;
    invoicePageSize = pageSize;

    const tbody = document.getElementById('invoiceTableBody');
    if (!tbody) return;
    tbody.innerHTML = `<tr><td colspan="12" class="text-center">加载中...</td></tr>`;

    const keyword = document.getElementById('invoiceKeywordSearchInput')?.value?.trim() || '';

    const payload = {
        pageNum,
        pageSize,
        invoiceStatus: invoiceCurrentStatus,
        keyword: keyword || undefined
    };

    try {
        const resp = await request('/invoice/page', 'POST', payload);
        renderInvoiceTable(resp.records || []);
        renderInvoicePagination(resp.total || 0, resp.pageNum || pageNum, resp.pageSize || pageSize);
    } catch (e) {
        tbody.innerHTML = `<tr><td colspan="12" class="text-center text-danger">加载失败</td></tr>`;
    }
}

function renderInvoiceTable(records) {
    const tbody = document.getElementById('invoiceTableBody');
    if (!tbody) return;
    if (!records || records.length === 0) {
        tbody.innerHTML = `<tr><td colspan="12" class="text-center">没有找到数据</td></tr>`;
        return;
    }

    const fmtAmount = v => (v!=null && v!=='' && !isNaN(v)) ? Number(v).toLocaleString('zh-CN',{minimumFractionDigits:2,maximumFractionDigits:2}) : '0.00';

    tbody.innerHTML = records.map(r => {
        const applyTime = r.applyInvoiceTime ? (r.applyInvoiceTime.length > 10 ? r.applyInvoiceTime : r.applyInvoiceTime) : '-';
        const statusClass = r.invoiceStatus === '已开票' ? 'status-closed' : 'status-completed';
        const auditBtn = (invoiceCurrentStatus === '待开票')
            ? `<button class="btn btn-sm btn-warning" type="button" onclick="showInvoiceAuditModal(${r.caseId})">开票审核</button>`
            : '';
        return `
        <tr>
            <td><input type="checkbox" class="invoice-case-checkbox" value="${r.caseId}"></td>
            <td>${r.caseNumber || '-'}</td>
            <td>${r.caseName || '-'}</td>
            <td>${r.amount != null ? fmtAmount(r.amount) : '0.00'}</td>
            <td>${r.caseLocation || '-'}</td>
            <td>${r.plaintiffName || '-'}</td>
            <td>${r.defendantName || '-'}</td>
            <td>${r.assistantName || '-'}</td>
            <td>${applyTime ? new Date(applyTime).toLocaleString() : '-'}</td>
            <td><span class="status-badge ${statusClass}">${r.invoiceStatus || '-'}</span></td>
            <td>${r.username || '-'}</td>
            <td>
                <div class="d-flex gap-2 flex-wrap">
                  <button class="btn btn-sm btn-info" type="button" onclick="showCaseDetailModal(${r.caseId})">案件详情</button>
                  ${auditBtn}
                </div>
            </td>
        </tr>`;
    }).join('');

    const selectAll = document.getElementById('selectAllInvoiceCases');
    if (selectAll) {
        selectAll.checked = false;
    }
}

// -------------------------
// 开票审核弹窗（只读查看 + 上传发票PDF）
// -------------------------

async function showInvoiceAuditModal(caseId) {
    let container = document.getElementById('invoiceAuditModalContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'invoiceAuditModalContainer';
        document.body.appendChild(container);
    }

    container.innerHTML = `
    <div class="modal fade" id="invoiceAuditModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content ant-card ant-card-bordered" style="border-radius:10px;box-shadow:0 4px 16px #e6f7ff;">
          <div class="modal-header" style="border-bottom:1px solid #f0f0f0;">
            <h5 class="modal-title"><i class="fa fa-check-square-o text-warning me-2"></i>开票审核</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body" style="background:#fafcff;">
            <input type="hidden" id="invoiceAuditCaseId" value="${caseId}">

            <div class="mb-3">
              <label class="form-label">付款流水（只读）</label>
              <div id="invoiceAuditFlows" class="small"></div>
            </div>

            <div class="row g-2">
              <div class="col-md-6">
                <label class="form-label">是否已付款</label>
                <input type="text" id="invoiceAuditPaid" class="form-control" readonly>
              </div>
              <div class="col-12">
                <label class="form-label">开票信息</label>
                <textarea id="invoiceAuditInfo" rows="4" class="form-control" readonly></textarea>
              </div>
            </div>

            <hr/>

            <div class="mb-2 fw-bold">上传发票PDF</div>
            <div class="row g-2 align-items-end">
              <div class="col-md-8">
                <input type="file" id="invoicePdfFile" accept="application/pdf" class="form-control" />
                <div class="form-text small">只允许 PDF 文件</div>
              </div>
              <div class="col-md-4 d-grid">
                <button type="button" class="btn btn-primary" onclick="submitInvoiceAudit()">确认开票</button>
              </div>
            </div>
            <div class="text-danger mt-2" id="invoiceAuditError" style="display:none;"></div>
          </div>
          <div class="modal-footer" style="border-top:1px solid #f0f0f0;">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">关闭</button>
          </div>
        </div>
      </div>
    </div>`;

    new bootstrap.Modal(document.getElementById('invoiceAuditModal')).show();
    await loadInvoiceAuditData(caseId);
}

async function loadInvoiceAuditData(caseId) {
    const flowsEl = document.getElementById('invoiceAuditFlows');
    const paidEl = document.getElementById('invoiceAuditPaid');
    const infoEl = document.getElementById('invoiceAuditInfo');

    if (flowsEl) flowsEl.innerHTML = '<div class="text-muted">加载中...</div>';

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
        const fmtAmt = v => (v!=null && v!=='' && !isNaN(v)) ? Number(v).toLocaleString('zh-CN',{minimumFractionDigits:2,maximumFractionDigits:2}) : '0.00';
        if (!flows.length) {
            flowsEl.innerHTML = '<div class="text-muted">暂无付款流水</div>';
        } else {
            flowsEl.innerHTML = flows.map((f,idx)=>{
                // 复用 my-cases.js 里的 buildPaymentScreenshotSrc（全局函数）
                const imgSrc = (typeof buildPaymentScreenshotSrc === 'function') ? buildPaymentScreenshotSrc(f) : (f.screenshotUrl || '');
                const finalImgSrc = imgSrc || '';
                return `<div class="border rounded p-2 mb-2 d-flex justify-content-between align-items-center">
                  <div>
                    <div>序号：${idx+1}</div>
                    <div>时间：${f.payTime||'-'}</div>
                    <div>金额：${fmtAmt(f.amount)}</div>
                  </div>
                  <div class="d-flex align-items-center gap-2">
                    ${finalImgSrc? `<img src="${finalImgSrc}" alt="付款截图${idx+1}" class="payment-screenshot" data-url="${finalImgSrc}" style="width:60px;height:60px;object-fit:cover;cursor:pointer;border-radius:4px;border:1px solid #eee;">`
                            : '<span class="text-muted">无截图</span>'}
                  </div>
                </div>`;
            }).join('');
        }

        if (paidEl) {
            paidEl.value = (typeof ext.paid === 'boolean') ? (ext.paid ? '是' : '否') : '-';
        }
        if (infoEl) {
            infoEl.value = ext.invoiceInfo || '';
        }
    } catch (e) {
        if (flowsEl) flowsEl.innerHTML = '<div class="text-danger">加载失败</div>';
    }
}

async function submitInvoiceAudit() {
    const errEl = document.getElementById('invoiceAuditError');
    if (errEl) errEl.style.display = 'none';

    const caseId = document.getElementById('invoiceAuditCaseId')?.value;
    const fileInput = document.getElementById('invoicePdfFile');
    const file = fileInput ? fileInput.files[0] : null;

    if (!caseId) return;
    if (!file) {
        if (errEl) { errEl.textContent = '请上传发票PDF'; errEl.style.display = 'block'; }
        return;
    }
    const lower = (file.name || '').toLowerCase();
    if (!lower.endsWith('.pdf')) {
        if (errEl) { errEl.textContent = '仅支持PDF文件'; errEl.style.display = 'block'; }
        return;
    }

    try {
        const formData = new FormData();
        formData.append('caseId', caseId);
        formData.append('file', file);

        const resp = await fetch(window.baseUrl+'/invoice/audit', {
            method: 'POST',
            body: formData,
            credentials: 'include'
        });
        const json = await resp.json();
        if (!resp.ok || json.code !== 200) {
            throw new Error(json.msg || json.message || '提交失败');
        }

        // 关闭弹窗并刷新列表
        const modalEl = document.getElementById('invoiceAuditModal');
        const modal = modalEl ? bootstrap.Modal.getInstance(modalEl) : null;
        if (modal) modal.hide();
        loadInvoiceCases(invoiceCurrentPage, invoicePageSize);
        alert('开票审核完成');
    } catch (e) {
        if (errEl) { errEl.textContent = '提交失败：' + (e.message || '未知错误'); errEl.style.display = 'block'; }
    }
}

function renderInvoicePagination(total, pageNum, pageSize) {
    const container = document.getElementById('invoicePaginationContainer');
    if (!container) return;

    const pages = Math.ceil((total || 0) / (pageSize || 10));
    if (pages <= 1) {
        container.innerHTML = `<div class="text-secondary">共 ${total || 0} 条记录</div>`;
        return;
    }

    let startPage = Math.max(1, pageNum - 2);
    let endPage = Math.min(pages, startPage + 4);
    if (endPage - startPage < 4) {
        startPage = Math.max(1, endPage - 4);
    }

    let html = `
    <nav aria-label="开票管理分页">
      <ul class="pagination">
        <li class="page-item ${pageNum === 1 ? 'disabled' : ''}">
          <a class="page-link" href="javascript:void(0);" onclick="loadInvoiceCases(${pageNum - 1}, ${pageSize})">&laquo;</a>
        </li>
    `;

    if (startPage > 1) {
        html += `<li class="page-item"><a class="page-link" href="javascript:void(0);" onclick="loadInvoiceCases(1, ${pageSize})">1</a></li>`;
        if (startPage > 2) {
            html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        html += `<li class="page-item ${i === pageNum ? 'active' : ''}"><a class="page-link" href="javascript:void(0);" onclick="loadInvoiceCases(${i}, ${pageSize})">${i}</a></li>`;
    }

    if (endPage < pages) {
        if (endPage < pages - 1) {
            html += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        }
        html += `<li class="page-item"><a class="page-link" href="javascript:void(0);" onclick="loadInvoiceCases(${pages}, ${pageSize})">${pages}</a></li>`;
    }

    html += `
        <li class="page-item ${pageNum === pages ? 'disabled' : ''}">
          <a class="page-link" href="javascript:void(0);" onclick="loadInvoiceCases(${pageNum + 1}, ${pageSize})">&raquo;</a>
        </li>
      </ul>
    </nav>`;

    container.innerHTML = html;
}
