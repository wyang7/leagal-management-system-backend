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
        const baseUrl = 'http://localhost:8090/api';
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
            alert(`操作失败: ${result.message}`);
            throw new Error(result.message);
        }
    } catch (error) {
        console.error('请求错误:', error);
        alert(`请求失败: ${error.message}`);
        throw error;
    }
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
    