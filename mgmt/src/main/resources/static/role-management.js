/**
 * 加载角色管理页面
 */
function loadRoleManagementPage() {
    setActiveNav('角色管理');
    const mainContent = document.getElementById('mainContent');
    mainContent.innerHTML = `
        <div class="ant-card ant-card-bordered mb-4" style="border-radius:8px;box-shadow:0 2px 8px #f0f1f2;">
            <div class="ant-card-body">
                <div class="d-flex justify-content-end mb-2">
                    <button class="ant-btn ant-btn-success" style="background:#52c41a;border-color:#52c41a;color:#fff;" onclick="showAddRoleModal()">
                        <i class="fa fa-plus"></i> 新增角色
                    </button>
                </div>
                <div class="table-responsive">
                    <table class="ant-table table table-hover table-bordered" style="border-radius:6px;overflow:hidden;">
                        <thead class="ant-table-thead table-light">
                            <tr>
                                <th style="white-space:nowrap;">角色ID</th>
                                <th style="white-space:nowrap;">角色名</th>
                                <th style="white-space:nowrap;">角色类型</th>
                                <th style="white-space:nowrap;">驻点信息</th>
                                <th style="white-space:nowrap;">创建时间</th>
                                <th style="white-space:nowrap;">关联用户</th>
                                <th style="white-space:nowrap;">操作</th>
                            </tr>
                        </thead>
                        <tbody id="roleTableBody">
                            <tr>
                                <td colspan="7" class="text-center">加载中...</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
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
            <tr><td colspan="7" class="text-center text-danger">加载角色失败</td></tr>
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
        tableBody.innerHTML = `<tr><td colspan="7" class="text-center">没有找到角色数据</td></tr>`;
        return;
    }
    
    let html = '';
    roles.forEach(role => {
        html += `
        <tr>
            <td>${role.roleId}</td>
            <td>${role.roleName}</td>
            <td>${role.roleType}</td>
            <td>${role.station || ''}</td>
            <td>${role.createdTime ? new Date(role.createdTime).toLocaleString() : ''}</td>
            <td>
                <button class="ant-btn ant-btn-info btn btn-sm btn-info" onclick="showRoleUsers(${role.roleId})">
                    <i class="fa fa-users"></i> 查看用户
                </button>
            </td>
            <td>
                <button class="ant-btn ant-btn-primary btn btn-sm btn-primary" onclick="showEditRoleModal(${role.roleId})">
                    <i class="fa fa-edit"></i> 编辑
                </button>
                <button class="ant-btn ant-btn-danger btn btn-sm btn-danger" onclick="deleteRole(${role.roleId})">
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
                                    <option value="临时调解员">临时调解员</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="roleStation">驻点</label>
                                <select id="roleStation" class="form-control" required>
                                    <option value="">请选择驻点</option>
                                    <option value="九堡彭埠">九堡彭埠</option>
                                    <option value="本部">本部</option>
                                    <option value="四季青">四季青</option>
                                    <option value="笕桥">笕桥</option>
                                    <option value="凯旋街道">凯旋街道</option>
                                    <option value="闸弄口">闸弄口</option>
                                    <option value="总部">总部</option>
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
        document.getElementById('roleStation').value = role.station || '总部';
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
    const roleStation = document.getElementById('roleStation').value.trim();
    
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
        roleType: roleType,
        station: roleStation
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
        let userListHtml = '<ul class="list-group">';
        if (users && users.length > 0) {
            users.forEach(user => {
                userListHtml += `
                <li class="list-group-item d-flex justify-content-between align-items-center">
                    ${user.username} (ID: ${user.userId})
                    <button class="ant-btn ant-btn-warning btn btn-sm btn-warning" onclick="unassignUserFromRole(${user.userId}, ${roleId})">
                        解除关联
                    </button>
                </li>
                `;
            });
        } else {
            userListHtml += '<li class="list-group-item">该角色暂无关联用户</li>';
        }
        userListHtml += '</ul>';
        const modalHtml = `
        <div class="modal fade" id="roleUsersModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content ant-card ant-card-bordered" style="border-radius:10px;box-shadow:0 4px 16px #e6f7ff;">
                    <div class="modal-header" style="border-bottom:1px solid #f0f0f0;">
                        <h5 class="modal-title"><i class="fa fa-users text-primary me-2"></i>角色关联用户</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body" style="background:#fafcff;">
                        ${userListHtml}
                        <hr>
                    </div>
                    <div class="modal-footer" style="border-top:1px solid #f0f0f0;">
                        <button type="button" class="ant-btn ant-btn-primary btn btn-primary" data-bs-dismiss="modal" style="border-radius:4px;">关闭</button>
                    </div>
                </div>
            </div>
        </div>
        `;
        const tempContainer = document.createElement('div');
        tempContainer.innerHTML = modalHtml;
        document.body.appendChild(tempContainer);
        const roleUsersModal = new bootstrap.Modal(document.getElementById('roleUsersModal'));
        roleUsersModal.show();
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
