/**
 * 通用HTTP请求函数
 * @param {string} url 请求地址
 * @param {string} method 请求方法，默认GET
 * @param {object} data 请求数据，默认null
 * @returns {Promise} 返回Promise对象
 */
async function request(url, method = 'GET', data = null) {
    // 设置请求头
    const headers = {
        'Content-Type': 'application/json'
    };

    // 配置请求参数
    const options = {
        method: method,
        headers: headers,
        // 处理跨域请求时携带cookie
        credentials: 'include'
    };

    // 如果是POST、PUT等方法，添加请求体
    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        options.body = JSON.stringify(data);
    }
    // 处理GET请求的缓存问题
    if (method === 'GET') {
        const separator = url.includes('?') ? '&' : '?';
        url = url + separator + 't=' + new Date().getTime();
    }

    try {
        // 发送请求，确保后端地址正确
        // 注意：如果后端端口或上下文路径不同，请修改这里
        const baseUrl = 'http://47.118.19.86:8090/api';
        // const baseUrl = 'http://localhost:8090/api';
        const response = await fetch(baseUrl + url, options);

        // 处理响应
        if (!response.ok) {
            throw new Error(`HTTP错误，状态码: ${response.status}`);
        }

        // 解析JSON响应
        const result = await response.json();

        // 假设后端返回格式为 {code: 200, msg: "success", data: ...}
        if (result.code === 200) {
            return result.data;
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        alert(`请求失败: ${error.message}`);
        throw error;
    }
}

/**
 * 同步风格的HTTP请求（基于本质仍是异步，但可通过await实现同步代码风格）
 * @param {string} url 请求地址
 * @param {string} method 请求方法，默认GET
 * @param {object} data 请求数据，默认null
 * @returns {any} 返回响应数据
 */
async function requestSync(url, method = 'GET', data = null) {
    return await request(url, method, data); // 复用现有异步request方法
}

/**
 * 设置当前激活的导航项
 * @param {string} pageName 页面名称（用户管理、角色管理、案件管理、案件包）
 */
function setActiveNav(pageName) {
    // 移除所有导航项的active类
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // 为当前页面的导航项添加active类
    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.textContent.includes(pageName)) {
            link.classList.add('active');
        }
    });
}

// 创建历史记录模态框容器
function createCaseHistoryModalContainer() {
    if (!document.getElementById('caseHistoryModalContainer')) {
        const container = document.createElement('div');
        container.id = 'caseHistoryModalContainer';
        document.body.appendChild(container);
    }
}


// 显示历史记录模态框
async function showCaseHistoryModal(caseId) {
    try {
        const historyList = await request(`/case/history/${caseId}`);
        const modalContainer = document.getElementById('caseHistoryModalContainer');

        // 格式化日期
        const formatDateTime = (dateStr) => {
            return dateStr ? new Date(dateStr).toLocaleString() : '-';
        };

        // 生成历史记录表格
        let historyTable = `
            <table class="table table-striped">
                <thead>
                    <tr>
                        <th>操作时间</th>
                        <th>操作人</th>
                        <th>操作动作</th>
                        <th>状态变更</th>
                        <th>备注</th>
                    </tr>
                </thead>
                <tbody>
        `;

        if (historyList.length === 0) {
            historyTable += `
                <tr>
                    <td colspan="5" class="text-center">暂无流转记录</td>
                </tr>
            `;
        } else {
            historyList.forEach(history => {
                historyTable += `
                    <tr>
                        <td>${formatDateTime(history.createTime)}</td>
                        <td>${history.operatorName}</td>
                        <td>${history.action}</td>
                        <td>${history.beforeStatus || '无'} → ${history.afterStatus}</td>
                        <td>${history.remarks || '-'}</td>
                    </tr>
                `;
            });
        }

        historyTable += `
                </tbody>
            </table>
        `;

        // 创建模态框
        const modalHtml = `
        <div class="modal fade" id="caseHistoryModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">案件流转历史记录</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        ${historyTable}
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
        const historyModal = new bootstrap.Modal(document.getElementById('caseHistoryModal'));
        historyModal.show();
    } catch (error) {
        console.error('获取案件历史记录失败:', error);
        alert('获取案件历史记录失败');
    }
}

/**
 * 退出登录：调用后端 /auth/logout 并跳转到登录页
 */
async function logout() {
    try {
        await request('/auth/logout', 'POST');
    } catch (e) {
        // 即使后端报错，也尝试清理前端状态并跳转
        console.error('调用登出接口失败:', e);
    } finally {
        // 清理全局用户信息并跳转到登录页
        if (typeof App !== 'undefined') {
            App.user = null;
        }
        window.location.href = 'login.html';
    }
}
