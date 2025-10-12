/**
 * 加载用户管理页面
 */
function loadUserManagementPage() {
    setActiveNav('用户管理');
    const mainContent = document.getElementById('mainContent');
    mainContent.innerHTML = `
        <div class="page-title">
            <h1>用户管理</h1>
        </div>
        
        <!-- 搜索和新增区域 -->
        <div class="row mb-3">
            <div class="col-md-6">
                <div class="input-group">
                    <input type="text" id="userSearchInput" class="form-control" placeholder="输入用户名搜索">
                    <button class="btn btn-primary" onclick="searchUsers()">
                        <i class="fa fa-search"></i> 搜索
                    </button>
                </div>
            </div>
            <div class="col-md-6 text-end">
                <button class="btn btn-success" onclick="showAddUserModal()">
                    <i class="fa fa-plus"></i> 新增用户
                </button>
            </div>
        </div>
        
        <!-- 用户表格 -->
        <div class="table-responsive">
            <table class="table table-striped table-hover">
                <thead class="table-dark">
                    <tr>
                        <th>用户ID</th>
                        <th>用户名</th>
                        <th>角色名</th>
                        <th>创建时间</th>
                        <th>操作</th>
                    </tr>
                </thead>
                <tbody id="userTableBody">
                    <!-- 用户数据将通过JavaScript动态加载 -->
                    <tr>
                        <td colspan="5" class="text-center">加载中...</td>
                    </tr>
                </tbody>
            </table>
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
    users.forEach(user => {
        html += `
        <tr>
            <td>${user.userId}</td>
            <td>${user.username}</td>
            <td>${user.roleName}</td>
            <td>${user.createdTime ? new Date(user.createdTime).toLocaleString() : ''}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="showEditUserModal(${user.userId})">
                    <i class="fa fa-edit"></i> 编辑
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteUser(${user.userId})">
                    <i class="fa fa-trash"></i> 删除
                </button>
            </td>
        </tr>
        `;
    });
    
    tableBody.innerHTML = html;
}

/**
 * 加载角色列表到用户表单的下拉框
 */
async function loadRolesForUserForm() {
    try {
        const roles = await request('/role');
        
        // 创建角色选项HTML，确保roleId正确获取
        let roleOptions = '<option value="">请选择角色</option>';
        roles.forEach(role => {
            // 确保roleId存在且为有效值
            const roleId = role.roleId || '';
            roleOptions += `<option value="${roleId}">${role.roleName} (${role.roleType})</option>`;
        });
        
        // 创建用户表单模态框
        await createUserModal(roleOptions);
    } catch (error) {
        console.error('加载角色失败:', error);
        alert('加载角色列表失败，请刷新页面重试');
    }
}

/**
 * 创建用户表单模态框
 * @param {string} roleOptions 角色下拉框选项HTML
 */
function createUserModal(roleOptions) {
    return new Promise((resolve) => {
        const modalContainer = document.getElementById('userModalContainer');
        
        // 检查模态框是否已存在，如果不存在则创建
        if (!document.getElementById('userModal')) {
            const modalHtml = `
            <!-- 用户表单模态框 -->
            <div class="modal fade" id="userModal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="userModalTitle">新增用户</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <form id="userForm">
                                <input type="hidden" id="userId">
                                <div class="form-group">
                                    <label for="username">用户名</label>
                                    <input type="text" id="username" class="form-control" required>
                                </div>
                                <div class="form-group">
                                    <label for="password">密码</label>
                                    <input type="password" id="password" class="form-control" required>
                                </div>
                                <div class="form-group">
                                    <label for="roleId">角色</label>
                                    <select id="roleId" class="form-control" required>
                                        ${roleOptions}
                                    </select>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                            <button type="button" class="btn btn-primary" onclick="saveUser()">保存</button>
                        </div>
                    </div>
                </div>
            </div>
            `;
            
            modalContainer.innerHTML = modalHtml;
            // 等待DOM渲染完成
            setTimeout(() => {
                resolve();
            }, 0);
        } else {
            // 如果模态框已存在，更新角色下拉框
            document.getElementById('roleId').innerHTML = roleOptions;
            resolve();
        }
    });
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
    // 确保角色选择框清空
    const roleSelect = document.getElementById('roleId');
    if (roleSelect) {
        roleSelect.value = '';
    }
    document.getElementById('userId').value = '';
    document.getElementById('userModalTitle').textContent = '新增用户';
    
    // 显示模态框
    const userModalElement = document.getElementById('userModal');
    if (userModalElement) {
        // 确保正确实例化模态框
        const userModal = new bootstrap.Modal(userModalElement);
        userModal.show();
    } else {
        alert('模态框加载失败，请刷新页面重试');
    }
}

/**
 * 显示编辑用户模态框
 * @param {number} userId 用户ID
 */
async function showEditUserModal(userId) {
    try {
        const user = await request(`/user/${userId}`);
        
        // 填充表单数据
        document.getElementById('userId').value = user.userId || '';
        document.getElementById('username').value = user.username || '';
        // 编辑时清空密码字段
        document.getElementById('password').value = '';
        
        // 确保角色选择正确设置
        const roleSelect = document.getElementById('roleId');
        if (roleSelect && user.roleId) {
            roleSelect.value = user.roleId.toString();
        }
        
        document.getElementById('userModalTitle').textContent = '编辑用户';
        
        // 显示模态框
        const userModalElement = document.getElementById('userModal');
        if (userModalElement) {
            const userModal = new bootstrap.Modal(userModalElement);
            userModal.show();
        } else {
            alert('模态框加载失败，请刷新页面重试');
        }
    } catch (error) {
        // 错误处理已在request函数中完成
    }
}

/**
 * 保存用户（新增或编辑）
 */
async function saveUser() {
    // 获取表单元素
    const userIdElement = document.getElementById('userId');
    const usernameElement = document.getElementById('username');
    const passwordElement = document.getElementById('password');
    const roleIdElement = document.getElementById('roleId');
    
    // 检查元素是否存在
    if (!usernameElement || !roleIdElement) {
        alert('表单加载失败，请刷新页面重试');
        return;
    }
    
    // 获取表单数据
    const userId = userIdElement.value;
    const username = usernameElement.value.trim();
    const password = passwordElement.value.trim();
    const roleId = roleIdElement.value;
    
    // 详细验证
    if (!username) {
        alert('请输入用户名');
        usernameElement.focus();
        return;
    }
    
    if (!roleId || roleId === '') {
        alert('请选择角色');
        roleIdElement.focus();
        return;
    }
    
    // 确保roleId是数字
    if (isNaN(parseInt(roleId))) {
        alert('选择的角色无效');
        roleIdElement.focus();
        return;
    }
    
    const userData = {
        username: username,
        roleId: parseInt(roleId)
    };
    
    try {
        if (userId) {
            // 编辑用户
            userData.userId = parseInt(userId);
            await request('/user', 'PUT', userData);
        } else {
            // 新增用户
            await request('/auth/register', 'POST', {
                username,
                password,
                roleId: parseInt(roleId)
            });
        }
        
        // 关闭模态框
        const userModalElement = document.getElementById('userModal');
        if (userModalElement) {
            const userModal = bootstrap.Modal.getInstance(userModalElement);
            if (userModal) {
                userModal.hide();
            }
        }
        
        // 重新加载用户列表
        loadUsers();
        
        alert(userId ? '用户更新成功' : '用户新增成功');
    } catch (error) {
        // 错误处理已在request函数中完成
    }
}

/**
 * 删除用户
 * @param {number} userId 用户ID
 */
async function deleteUser(userId) {
    if (!confirm('确定要删除这个用户吗？')) {
        return;
    }
    
    try {
        await request(`/user/${userId}`, 'DELETE');
        // 重新加载用户列表
        loadUsers();
        alert('用户删除成功');
    } catch (error) {
        // 错误处理已在request函数中完成
    }
}
    