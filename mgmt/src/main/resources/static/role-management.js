/**
 * 加载角色管理页面
 */
function loadRoleManagementPage() {
    setActiveNav('角色管理');
    const mainContent = document.getElementById('mainContent');
    mainContent.innerHTML = `
        <div class="page-title">
            <h1>角色管理</h1>
        </div>
        
        <!-- 新增角色按钮 -->
        <div class="row mb-3">
            <div class="col-md-12 text-end">
                <button class="btn btn-success" onclick="showAddRoleModal()">
                    <i class="fa fa-plus"></i> 新增角色
                </button>
            </div>
        </div>
        
        <!-- 角色表格 -->
        <div class="table-responsive">
            <table class="table table-striped table-hover">
                <thead class="table-dark">
                    <tr>
                        <th>角色ID</th>
                        <th>角色名</th>
                        <th>角色类型</th>
                        <th>创建时间</th>
                        <th>关联用户</th>
                        <th>操作</th>
                    </tr>
                </thead>
                <tbody id="roleTableBody">
                    <!-- 角色数据将通过JavaScript动态加载 -->
                    <tr>
                        <td colspan="6" class="text-center">加载中...</td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;
    
    // 创建角色模态框容器
    createRoleModalContainer();
    // 加载角色列表
    loadRoles();
}

/**
 * 创建角色模态框容器
 */
function createRoleModalContainer() {
    if (!document.getElementById('roleModalContainer')) {
        const container = document.createElement('div');
        container.id = 'roleModalContainer';
        document.body.appendChild(container);
    }
}

/**
 * 加载角色列表
 */
async function loadRoles() {
    try {
        const roles = await request('/role');
        renderRoleTable(roles);
    } catch (error) {
        document.getElementById('roleTableBody').innerHTML = `
            <tr><td colspan="6" class="text-center text-danger">加载角色失败</td></tr>
        `;
    }
}

/**
 * 渲染角色表格
 * @param {Array} roles 角色数组
 */
function renderRoleTable(roles) {
    const tableBody = document.getElementById('roleTableBody');
    
    if (!roles || roles.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" class="text-center">没有找到角色数据</td></tr>`;
        return;
    }
    
    let html = '';
    roles.forEach(role => {
        html += `
        <tr>
            <td>${role.roleId}</td>
            <td>${role.roleName}</td>
            <td>${role.roleType}</td>
            <td>${role.createdTime ? new Date(role.createdTime).toLocaleString() : ''}</td>
            <td>
                <button class="btn btn-sm btn-info" onclick="showRoleUsers(${role.roleId})">
                    <i class="fa fa-users"></i> 查看用户
                </button>
            </td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="showEditRoleModal(${role.roleId})">
                    <i class="fa fa-edit"></i> 编辑
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteRole(${role.roleId})">
                    <i class="fa fa-trash"></i> 删除
                </button>
            </td>
        </tr>
        `;
    });
    
    tableBody.innerHTML = html;
}

/**
 * 创建角色表单模态框
 */
function createRoleModal() {
    const modalContainer = document.getElementById('roleModalContainer');
    
    if (!document.getElementById('roleModal')) {
        const modalHtml = `
        <!-- 角色表单模态框 -->
        <div class="modal fade" id="roleModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="roleModalTitle">新增角色</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <form id="roleForm">
                            <input type="hidden" id="roleId">
                            <div class="form-group">
                                <label for="roleName">角色名</label>
                                <input type="text" id="roleName" class="form-control" required>
                            </div>
                            <div class="form-group">
                                <label for="roleType">角色类型</label>
                                <select id="roleType" class="form-control" required>
                                    <option value="">请选择角色类型</option>
                                    <option value="管理员">管理员</option>
                                    <option value="案件助理">案件助理</option>
                                    <option value="财务专员">财务专员</option>
                                    <option value="调解员">调解员</option>
                                </select>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                        <button type="button" class="btn btn-primary" onclick="saveRole()">保存</button>
                    </div>
                </div>
            </div>
        </div>
        `;
        
        modalContainer.innerHTML = modalHtml;
    }
}

/**
 * 显示新增角色模态框
 */
function showAddRoleModal() {
    createRoleModal();
    
    // 重置表单
    document.getElementById('roleForm').reset();
    document.getElementById('roleId').value = '';
    document.getElementById('roleModalTitle').textContent = '新增角色';
    
    // 显示模态框
    const roleModal = new bootstrap.Modal(document.getElementById('roleModal'));
    roleModal.show();
}

/**
 * 显示编辑角色模态框
 * @param {number} roleId 角色ID
 */
async function showEditRoleModal(roleId) {
    createRoleModal();
    
    try {
        const role = await request(`/role/${roleId}`);
        
        // 填充表单数据
        document.getElementById('roleId').value = role.roleId;
        document.getElementById('roleName').value = role.roleName;
        document.getElementById('roleType').value = role.roleType;
        document.getElementById('roleModalTitle').textContent = '编辑角色';
        
        // 显示模态框
        const roleModal = new bootstrap.Modal(document.getElementById('roleModal'));
        roleModal.show();
    } catch (error) {
        // 错误处理已在request函数中完成
    }
}

/**
 * 保存角色（新增或编辑）
 */
async function saveRole() {
    // 获取表单数据
    const roleId = document.getElementById('roleId').value;
    const roleName = document.getElementById('roleName').value.trim();
    const roleType = document.getElementById('roleType').value;
    
    // 简单验证
    if (!roleName) {
        alert('请输入角色名');
        return;
    }
    
    if (!roleType) {
        alert('请选择角色类型');
        return;
    }
    
    const roleData = {
        roleName: roleName,
        roleType: roleType
    };
    
    try {
        if (roleId) {
            // 编辑角色
            roleData.roleId = parseInt(roleId);
            await request('/role', 'PUT', roleData);
        } else {
            // 新增角色
            await request('/role', 'POST', roleData);
        }
        
        // 关闭模态框
        const roleModal = bootstrap.Modal.getInstance(document.getElementById('roleModal'));
        roleModal.hide();
        
        // 重新加载角色列表
        loadRoles();
        
        alert(roleId ? '角色更新成功' : '角色新增成功');
    } catch (error) {
        // 错误处理已在request函数中完成
    }
}

/**
 * 删除角色
 * @param {number} roleId 角色ID
 */
async function deleteRole(roleId) {
    if (!confirm('确定要删除这个角色吗？删除后关联的用户将无法正常使用系统！')) {
        return;
    }
    
    try {
        await request(`/role/${roleId}`, 'DELETE');
        // 重新加载角色列表
        loadRoles();
        alert('角色删除成功');
    } catch (error) {
        // 错误处理已在request函数中完成
    }
}

/**
 * 显示角色关联的用户
 * @param {number} roleId 角色ID
 */
async function showRoleUsers(roleId) {
    try {
        const users = await request(`/role/${roleId}/users`);
        
        // 创建用户列表HTML
        let userListHtml = '<ul class="list-group">';
        if (users && users.length > 0) {
            users.forEach(user => {
                userListHtml += `
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    ${user.username} (ID: ${user.userId})
                    <button class="btn btn-sm btn-warning" onclick="unassignUserFromRole(${user.userId}, ${roleId})">
                        解除关联
                    </button>
                </li>
                `;
            });
        } else {
            userListHtml += '<li class="list-group-item">该角色暂无关联用户</li>';
        }
        userListHtml += '</ul>';
        
        // 创建模态框
        const modalHtml = `
        <div class="modal fade" id="roleUsersModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">角色关联用户</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        ${userListHtml}
                        <hr>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">关闭</button>
                    </div>
                </div>
            </div>
        </div>
        `;
        
        // 添加到页面并显示
        const tempContainer = document.createElement('div');
        tempContainer.innerHTML = modalHtml;
        document.body.appendChild(tempContainer);
        
        const roleUsersModal = new bootstrap.Modal(document.getElementById('roleUsersModal'));
        roleUsersModal.show();
        
        // 模态框关闭后移除元素
        document.getElementById('roleUsersModal').addEventListener('hidden.bs.modal', function() {
            tempContainer.remove();
        });
    } catch (error) {
        alert('加载角色用户失败');
    }
}

/**
 * 为角色分配用户
 * @param {number} roleId 角色ID
 */
async function assignUserToRole(roleId) {
    const userId = document.getElementById('userIdToAdd').value.trim();
    
    if (!userId || isNaN(userId)) {
        alert('请输入有效的用户ID');
        return;
    }
    
    try {
        await request(`/user/${userId}/role/${roleId}`, 'PUT');
        alert('用户关联成功');
        
        // 刷新角色用户列表
        const modal = bootstrap.Modal.getInstance(document.getElementById('roleUsersModal'));
        modal.hide();
        setTimeout(() => {
            showRoleUsers(roleId);
        }, 300);
    } catch (error) {
        // 错误处理已在request函数中完成
    }
}

/**
 * 解除用户与角色的关联
 * @param {number} userId 用户ID
 * @param {number} roleId 角色ID
 */
async function unassignUserFromRole(userId, roleId) {
    if (!confirm('确定要解除该用户的角色关联吗？')) {
        return;
    }
    
    try {
        await request(`/role/${roleId}/users/${userId}`, 'DELETE');
        alert('解除关联成功');
        
        // 刷新当前模态框
        const modalElement = document.getElementById('roleUsersModal');
        if (modalElement) {
            const roleId = modalElement.dataset.roleId;
            const modal = bootstrap.Modal.getInstance(modalElement);
            modal.hide();
            setTimeout(() => {
                showRoleUsers(roleId);
            }, 300);
        }
    } catch (error) {
        // 错误处理已在request函数中完成
        console.error('解除关联失败:', error);
    }
}
    