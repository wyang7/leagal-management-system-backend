// 案件系统文件 TAB 前端逻辑

function loadSystemFilePage() {
    setActiveNav('案件系统文件');
    const mainContent = document.getElementById('mainContent');
    const isAdmin = App && App.user && App.user.roleType && App.user.roleType.indexOf('管理员') !== -1;

    mainContent.innerHTML = `
        <div class="ant-card ant-card-bordered mb-4" style="border-radius:8px;box-shadow:0 2px 8px #f0f1f2;">
            <div class="ant-card-body">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h4 class="mb-0">案件系统文件</h4>
                    ${isAdmin ? `
                    <div class="d-flex align-items-center gap-2 flex-wrap">
                        <div class="d-flex align-items-center gap-1">
                            <span class="text-muted" style="min-width:60px;text-align:right;">文件类型</span>
                            <select id="systemFileType" class="form-select ant-select" style="width:180px;">
                                <option value="九堡法庭模版">九堡法庭模版</option>
                                <option value="笕桥法庭模版">笕桥法庭模版</option>
                                <option value="法院本部模版">法院本部模版</option>
                                <option value="综治中心模版">综治中心模版</option>
                                <option value="通用">通用</option>
                            </select>
                        </div>
                        <div class="d-flex align-items-center gap-1">
                            <span class="text-muted" style="min-width:60px;text-align:right;">保密等级</span>
                            <select id="systemFileSecret" class="form-select ant-select" style="width:160px;">
                                <option value="内部">内部公开</option>
                                <option value="机密">机密</option>
                            </select>
                        </div>
                        <input type="file" id="systemFileInput" multiple accept=".pdf,.doc,.docx,.ppt,.pptx" class="form-control" style="width:260px;">
                        <button class="ant-btn ant-btn-primary" onclick="uploadSystemFiles()">
                            <i class="fa fa-upload"></i> 上传
                        </button>
                    </div>` : `
                    <span class="text-muted" style="font-size:14px;">仅管理员可以上传和删除文件，所有人均可下载。</span>`}
                </div>
                <div class="alert alert-info py-2 mb-3" style="font-size:13px;">
                    支持上传 pdf / doc / docx / ppt / pptx 文件，单个文件大小不超过 10MB，总数量最多 100 个。
                </div>
                <div class="table-responsive">
                    <table class="ant-table table table-hover table-bordered" style="border-radius:6px;overflow:hidden;">
                        <thead class="ant-table-thead table-light">
                            <tr>
                                <th style="white-space:nowrap;">文件名</th>
                                <th style="white-space:nowrap;">文件类型</th>
                                <th style="white-space:nowrap;">保密等级</th>
                                <th style="white-space:nowrap;">上传人</th>
                                <th style="white-space:nowrap;">上传时间</th>
                                <th style="white-space:nowrap;">操作</th>
                            </tr>
                        </thead>
                        <tbody id="systemFileTableBody">
                            <tr><td colspan="6" class="text-center">加载中...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- 编辑系统文件信息的模态框 -->
        <div class="modal fade" id="systemFileEditModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">编辑系统文件信息</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <input type="hidden" id="editSystemFileId" />
                        <div class="mb-3">
                            <label class="form-label">文件类型</label>
                            <select id="editSystemFileType" class="form-select">
                                <option value="九堡法庭模版">九堡法庭模版</option>
                                <option value="笕桥法庭模版">笕桥法庭模版</option>
                                <option value="法院本部模版">法院本部模版</option>
                                <option value="综治中心模版">综治中心模版</option>
                                <option value="通用">通用</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">保密等级</label>
                            <select id="editSystemFileSecret" class="form-select">
                                <option value="内部">内部公开</option>
                                <option value="机密">机密</option>
                            </select>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                        <button type="button" class="btn btn-primary" onclick="saveSystemFileEdit()">保存</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    loadSystemFileList();
}

async function loadSystemFileList() {
    try {
        const list = await request('/systemFile');
        const tbody = document.getElementById('systemFileTableBody');
        const isAdmin = App && App.user && App.user.roleType && App.user.roleType.indexOf('管理员') !== -1;
        if (!list || list.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">暂无系统文件</td></tr>';
            return;
        }
        let html = '';
        list.forEach(item => {
            const uploadTime = item.uploadTime ? new Date(item.uploadTime).toLocaleString() : '';
            const secret = item.secretLevel || '';
            const isSecret = secret.indexOf('机密') !== -1;
            const canDownload = !isSecret || isAdmin;
            html += `
                <tr>
                    <td>${item.fileName || ''}</td>
                    <td>${item.fileType || ''}</td>
                    <td>${secret}</td>
                    <td>${item.uploader || ''}</td>
                    <td>${uploadTime}</td>
                    <td>
                        <button class="ant-btn ant-btn-primary btn btn-sm" ${canDownload ? `onclick="downloadSystemFile(${item.id}, '${secret.replace(/'/g, "\\'")}')"` : 'disabled title="机密文件仅管理员可下载"'}>
                            <i class="fa fa-download"></i> 下载
                        </button>
                        ${isAdmin ? `
                        <button class="ant-btn ant-btn-default btn btn-sm ms-1" onclick="editSystemFile(${item.id}, '${(item.fileType || '').replace(/'/g, "\\'")}', '${secret.replace(/'/g, "\\'")}')">
                            <i class="fa fa-edit"></i> 编辑
                        </button>
                        <button class="ant-btn ant-btn-danger btn btn-sm ms-1" onclick="deleteSystemFile(${item.id})">
                            <i class="fa fa-trash"></i> 删除
                        </button>` : ''}
                    </td>
                </tr>
            `;
        });
        tbody.innerHTML = html;
    } catch (e) {
        document.getElementById('systemFileTableBody').innerHTML = '<tr><td colspan="6" class="text-center text-danger">加载失败</td></tr>';
    }
}

function downloadSystemFile(id, secretLevel) {
    const isAdmin = App && App.user && App.user.roleType && App.user.roleType.indexOf('管理员') !== -1;
    const isSecret = secretLevel && secretLevel.indexOf('机密') !== -1;
    if (isSecret && !isAdmin) {
        alert('机密级别的文件仅管理员可以下载');
        return;
    }
    const link = document.createElement('a');
    link.href = `/api/systemFile/download/${id}?t=${Date.now()}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

async function uploadSystemFiles() {
    const input = document.getElementById('systemFileInput');
    if (!input || !input.files || input.files.length === 0) {
        alert('请选择要上传的文件');
        return;
    }
    const files = Array.from(input.files);
    if (files.length > 10) {
        alert('一次最多选择 10 个文件');
        return;
    }
    const type = document.getElementById('systemFileType').value;
    const secret = document.getElementById('systemFileSecret').value;

    for (const file of files) {
        if (file.size > 10 * 1024 * 1024) {
            alert(`文件 ${file.name} 大小超过 10MB，已取消本次上传`);
            return;
        }
        const lower = file.name.toLowerCase();
        if (!(/[.](pdf|doc|docx)$/.test(lower))) {
            alert(`文件 ${file.name} 类型不支持，只能上传 pdf/doc/docx`);
            return;
        }
    }

    for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('fileType', type);
        formData.append('secretLevel', secret);
        try {
            await requestFileUpload('/systemFile/upload', formData);
        } catch (e) {
            break;
        }
    }
    input.value = '';
    loadSystemFileList();
}

async function requestFileUpload(url, formData) {
    try {
        const resp = await fetch(`/api${url}`, {
            method: 'POST',
            body: formData,
            credentials: 'include'
        });
        if (!resp.ok) {
            throw new Error('HTTP错误: ' + resp.status);
        }
        const result = await resp.json();
        if (result.code !== 200) {
            throw new Error(result.message || '上传失败');
        }
        return result.data;
    } catch (e) {
        alert('上传失败: ' + e.message);
        throw e;
    }
}

async function deleteSystemFile(id) {
    if (!confirm('确定要删除该文件吗？')) {
        return;
    }
    try {
        await request(`/systemFile/${id}`, 'DELETE');
        loadSystemFileList();
    } catch (e) {
    }
}

// 打开编辑模态框
function editSystemFile(id, fileType, secretLevel) {
    const idInput = document.getElementById('editSystemFileId');
    const typeSelect = document.getElementById('editSystemFileType');
    const secretSelect = document.getElementById('editSystemFileSecret');
    if (!idInput || !typeSelect || !secretSelect) {
        return;
    }
    idInput.value = id;
    typeSelect.value = fileType || '';
    secretSelect.value = secretLevel || '';

    if (typeof bootstrap !== 'undefined') {
        const modalEl = document.getElementById('systemFileEditModal');
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
    } else {
        alert('当前页面不支持弹窗编辑');
    }
}

// 保存编辑结果
async function saveSystemFileEdit() {
    const id = document.getElementById('editSystemFileId').value;
    const fileType = document.getElementById('editSystemFileType').value;
    const secretLevel = document.getElementById('editSystemFileSecret').value;
    if (!id) {
        alert('未找到文件ID');
        return;
    }
    if (!fileType) {
        alert('请选择文件类型');
        return;
    }
    if (!secretLevel) {
        alert('请选择保密等级');
        return;
    }
    try {
        await request(`/systemFile/${id}`, 'PUT', { fileType, secretLevel });
        if (typeof bootstrap !== 'undefined') {
            const modalEl = document.getElementById('systemFileEditModal');
            const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
            modal.hide();
        }
        loadSystemFileList();
    } catch (e) {
    }
}
