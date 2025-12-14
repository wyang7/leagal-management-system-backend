/**
 * 加载用户管理页面
 */
function loadUserManagementPage() {
    setActiveNav('用户管理');
    const mainContent = document.getElementById('mainContent');
    mainContent.innerHTML = `
        <div class="ant-card ant-card-bordered mb-4" style="border-radius:8px;box-shadow:0 2px 8px #f0f1f2;">
            <div class="ant-card-body">
                <div class="row g-3 align-items-center">
                    <div class="col-md-6">
                        <div class="input-group">
                            <span class="input-group-text bg-light px-2" style="border-radius:4px 0 0 4px;">
                                <i class="fa fa-user text-secondary"></i>
                            </span>
                            <input type="text" id="userSearchInput" class="form-control ant-input" placeholder="用户名" style="border-radius:0 4px 4px 0;">
                        </div>
                    </div>
                    <div class="col-md-2 d-flex align-items-end">
                        <button class="ant-btn ant-btn-primary w-100" style="border-radius:4px;" onclick="searchUsers()">
                            <i class="fa fa-search me-1"></i> 查询
                        </button>
                    </div>
                    <div class="col-md-4 d-flex justify-content-end align-items-end">
                        <button class="ant-btn ant-btn-success" style="background:#52c41a;border-color:#52c41a;color:#fff;" onclick="showAddUserModal()">
                            <i class="fa fa-plus"></i> 新增用户
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <div class="ant-card ant-card-bordered mb-3" style="border-radius:8px;">
            <div class="ant-card-body">
                <div class="table-responsive">
                    <table class="ant-table table table-hover table-bordered" style="border-radius:6px;overflow:hidden;">
                        <thead class="ant-table-thead table-light">
                            <tr>
                                <th style="white-space:nowrap;">用户ID</th>
                                <th style="white-space:nowrap;">用户名</th>
                                <th style="white-space:nowrap;">角色名</th>
                                <th style="white-space:nowrap;">创建时间</th>
                                <th style="white-space:nowrap;">操作</th>
                            </tr>
                        </thead>
                        <tbody id="userTableBody">
                            <tr>
                                <td colspan="5" class="text-center">加载中...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
    
    // 确保模态框容器存在
    createUserModalContainer();
    // 加载角色列表（用于新增/编辑用户时选择角色）
    loadRolesForUserForm();
    // 加载用户列表
    loadUsers();
}

/**
 * 创建用户模态框容器（确保DOM中始终存在）
 */
function createUserModalContainer() {
    if (!document.getElementById('userModalContainer')) {
        const container = document.createElement('div');
        container.id = 'userModalContainer';
        document.body.appendChild(container);
    }
}

/**
 * 加载用户列表
 */
async function loadUsers() {
    try {
        const users = await request('/user');
        renderUserTable(users);
    } catch (error) {
        document.getElementById('userTableBody').innerHTML = `
            <tr><td colspan="5" class="text-center text-danger">加载用户失败</td></tr>
        `;
    }
}

/**
 * 根据用户名搜索用户
 */
async function searchUsers() {
    const username = document.getElementById('userSearchInput').value.trim();
    try {
        let users;
        if (username) {
            users = await request(`/user/search?username=${encodeURIComponent(username)}`);
        } else {
            users = await request('/user');
        }
        renderUserTable(users);
    } catch (error) {
        // 错误处理已在request函数中完成
    }
}

/**
 * 渲染用户表格
 * @param {Array} users 用户数组
 */
function renderUserTable(users) {
    const tableBody = document.getElementById('userTableBody');
    
    if (!users || users.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="5" class="text-center">没有找到用户数据</td></tr>`;
        return;
    }
    
    let html = '';
    users.forEach((user, idx) => {
        const roleNameDisplay = (user.roleName || '').trim();
        const roleNames = roleNameDisplay
            ? roleNameDisplay.split(',').map(s => s.trim()).filter(Boolean)
            : [];
        const rowId = `user-role-row-${user.userId || idx}`;
        let roleCellHtml = '';
        if (roleNames.length === 0) {
            roleCellHtml = '<span class="text-muted">未分配角色</span>';
        } else {
            const visible = roleNames.slice(0, 3);
            const hidden = roleNames.slice(3);
            roleCellHtml += `<div id="${rowId}" class="d-flex flex-wrap align-items-center" style="font-size:14px;">`;
            visible.forEach(name => {
                roleCellHtml += `<span class="badge bg-light text-dark border me-1 mb-1" style="font-weight:500;">${name}</span>`;
            });
            if (hidden.length > 0) {
                const moreId = `${rowId}-more`;
                const hiddenHtml = hidden.map(n => `<span class=\"badge bg-light text-dark border me-1 mb-1\" style=\"font-weight:500;\">${n}</span>`).join('');
                roleCellHtml += `
                    <a href="javascript:void(0);" class="text-primary" style="font-size:12px;" onclick="toggleMoreRoles('${moreId}')">更多</a>
                    <div id="${moreId}" class="mt-1" style="display:none;">${hiddenHtml}</div>
                `;
            }
            roleCellHtml += `</div>`;
        }
        html += `
        <tr>
            <td>${user.userId}</td>
            <td>${user.username}</td>
            <td>${roleCellHtml}</td>
            <td>${user.createdTime ? new Date(user.createdTime).toLocaleString() : ''}</td>
            <td>
                <button class="ant-btn ant-btn-primary btn btn-sm btn-primary" onclick="showEditUserModal(${user.userId})">
                    <i class="fa fa-edit"></i> 编辑
                </button>
                <button class="ant-btn ant-btn-danger btn btn-sm btn-danger" onclick="deleteUser(${user.userId})">
                    <i class="fa fa-trash"></i> 删除
                </button>
            </td>
        </tr>
        `;
    });
    
    tableBody.innerHTML = html;
}

// 切换“更多”角色展开/收起
function toggleMoreRoles(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.style.display = el.style.display === 'none' || el.style.display === '' ? 'block' : 'none';
}

/**
 * 加载角色列表到用户表单的下拉框
 */
async function loadRolesForUserForm() {
    try {
        const roles = await request('/role');
        let roleOptions = '';
        roles.forEach(role => {
            const roleId = role.roleId || '';
            roleOptions += `<option value="${roleId}">${role.roleName} (${role.roleType})</option>`;
        });
        await createUserModal(roleOptions);
    } catch (error) {
        console.error('加载角色失败:', error);
        alert('加载角色列表失败，请刷新页面重试');
    }
}

/**
 * 创建用户表单模态框
 * @param {string} roleOptions 角色下拉框选项HTML（仍保留参数但不再直接使用 select）
 */
function createUserModal(roleOptions) {
    return new Promise((resolve) => {
        const modalContainer = document.getElementById('userModalContainer');
        if (!document.getElementById('userModal')) {
            const modalHtml = `
            <div class="modal fade" id="userModal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content ant-card ant-card-bordered" style="border-radius:10px;box-shadow:0 4px 16px #e6f7ff;">
                        <div class="modal-header" style="border-bottom:1px solid #f0f0f0;">
                            <h5 class="modal-title" id="userModalTitle"><i class="fa fa-user text-primary me-2"></i>新增用户</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body" style="background:#fafcff;">
                            <form id="userForm">
                                <input type="hidden" id="userId">
                                <div class="form-group mb-2">
                                    <label for="username">用户名</label>
                                    <input type="text" id="username" class="form-control" required>
                                </div>
                                <div class="form-group mb-2">
                                    <label for="password">密码</label>
                                    <input type="password" id="password" class="form-control" required>
                                </div>
                                <div class="form-group mb-1">
                                    <label>角色（可多选）</label>
                                    <div id="roleCheckboxGroup" class="border rounded p-2" style="max-height:220px;overflow-y:auto;background:#fff;"></div>
                                    <div class="form-text text-muted" style="font-size:12px;">直接勾选需要赋予给用户的角色。</div>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer" style="border-top:1px solid #f0f0f0;">
                            <button type="button" class="ant-btn ant-btn-secondary btn btn-secondary" data-bs-dismiss="modal" style="border-radius:4px;">取消</button>
                            <button type="button" class="ant-btn ant-btn-primary btn btn-primary" onclick="saveUser()" style="border-radius:4px;">保存</button>
                        </div>
                    </div>
                </div>
            </div>
            `;
            modalContainer.innerHTML = modalHtml;
            // 渲染角色复选框
            renderRoleCheckboxes(roleOptions);
            setTimeout(() => { resolve(); }, 0);
        } else {
            renderRoleCheckboxes(roleOptions);
            resolve();
        }
    });
}

// 将后端角色列表渲染为复选框
function renderRoleCheckboxes(roleOptions) {
    const container = document.getElementById('roleCheckboxGroup');
    if (!container) return;
    try {
        // roleOptions 是一串 <option>，这里解析出 value 和文本
        const temp = document.createElement('select');
        temp.innerHTML = roleOptions;
        let html = '';
        Array.from(temp.options).forEach(opt => {
            const value = opt.value;
            const text = opt.textContent || opt.innerText;
            html += `
                <div class="form-check mb-1">
                    <input class="form-check-input" type="checkbox" name="roleIdCheckbox" value="${value}" id="role_cb_${value}">
                    <label class="form-check-label" for="role_cb_${value}">${text}</label>
                </div>
            `;
        });
        container.innerHTML = html;
    } catch (e) {
        console.error('渲染角色复选框失败', e);
    }
}

/**
 * 显示新增用户模态框
 */
function showAddUserModal() {
    // 重置表单
    const form = document.getElementById('userForm');
    if (form) {
        form.reset();
    }
    // 清空角色复选框勾选
    document.querySelectorAll('input[name="roleIdCheckbox"]').forEach(cb => {
        cb.checked = false;
    });
    const idInput = document.getElementById('userId');
    if (idInput) idInput.value = '';
    const titleEl = document.getElementById('userModalTitle');
    if (titleEl) titleEl.textContent = '新增用户';

    // 显示模态框
    const userModalElement = document.getElementById('userModal');
    if (userModalElement) {
        const userModal = new bootstrap.Modal(userModalElement);
        userModal.show();
    }
}

/**
 * 显示编辑用户模态框
 * @param {number} userId 用户ID
 */
async function showEditUserModal(userId) {
    try {
        const user = await request(`/user/${userId}`);
        // 填充基本信息
        const idInput = document.getElementById('userId');
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');
        if (idInput) idInput.value = user.userId || '';
        if (usernameInput) usernameInput.value = user.username || '';
        if (passwordInput) passwordInput.value = '';

        // 解析用户已有角色ID（支持数组 / 字符串 / 单个）
        let roleIds = [];
        if (Array.isArray(user.roleIds)) {
            roleIds = user.roleIds.map(String);
        } else if (typeof user.roleIds === 'string') {
            roleIds = user.roleIds.split(',').map(s => s.trim()).filter(Boolean);
        } else if (user.roleId) {
            roleIds = [String(user.roleId)];
        }

        // 根据 roleIds 勾选复选框
        document.querySelectorAll('input[name="roleIdCheckbox"]').forEach(cb => {
            cb.checked = roleIds.includes(cb.value);
        });

        const titleEl = document.getElementById('userModalTitle');
        if (titleEl) titleEl.textContent = '编辑用户';

        const userModalElement = document.getElementById('userModal');
        if (userModalElement) {
            const userModal = new bootstrap.Modal(userModalElement);
            userModal.show();
        }
    } catch (e) {
        console.error('加载用户信息失败', e);
    }
}

/**
 * 保存用户（新增或编辑）
 */
async function saveUser() {
    const userIdElement = document.getElementById('userId');
    const usernameElement = document.getElementById('username');
    const passwordElement = document.getElementById('password');

    if (!usernameElement) {
        alert('表单加载失败，请刷新页面重试');
        return;
    }

    const userId = userIdElement ? userIdElement.value : '';
    const username = usernameElement.value.trim();
    const password = passwordElement ? passwordElement.value.trim() : '';

    // 从复选框收集选中的角色ID
    const checkedBoxes = document.querySelectorAll('input[name="roleIdCheckbox"]:checked');
    const selectedRoleIds = Array.from(checkedBoxes).map(cb => cb.value).filter(v => v);

    if (!username) {
        alert('请输入用户名');
        usernameElement.focus();
        return;
    }
    if (selectedRoleIds.length === 0) {
        alert('请至少选择一个角色');
        return;
    }

    const payload = {
        userId: userId ? parseInt(userId, 10) : undefined,
        username,
        password: password || undefined,
        roleIds: selectedRoleIds.map(id => parseInt(id, 10))
    };
    const method = userId ? 'PUT' : 'POST';

    await request('/user', method, payload);

    // 关闭模态框
    const userModalElement = document.getElementById('userModal');
    if (userModalElement) {
        const modalInstance = bootstrap.Modal.getInstance(userModalElement) || new bootstrap.Modal(userModalElement);
        modalInstance.hide();
    }

    // 重新加载用户列表
    loadUsers();
}

/**
 * 删除用户
 * @param {number} userId 用户ID
 */
async function deleteUser(userId) {
    if (!userId && userId !== 0) {
        return;
    }
    if (!confirm('确认要删除该用户吗？删除后不可恢复。')) {
        return;
    }
    try {
        await request(`/user/${userId}`, 'DELETE');
        // 删除成功后重新加载用户列表
        await loadUsers();
    } catch (e) {
        // 错误提示在 request 内部已处理，这里可按需补充
        console.error('删除用户失败', e);
    }
}
