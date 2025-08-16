/**
 * 通用HTTP请求函数
 * @param {string} url 请求地址
 * @param {string} method 请求方法，默认GET
 * @param {object} data 请求数据，默认null
 * @returns {Promise} 返回Promise对象
 */
async function request(url, method = 'GET', data = null) {
    // 保持原有请求头和参数配置不变...
    const headers = {
        'Content-Type': 'application/json'
    };

    const options = {
        method: method,
        headers: headers,
        credentials: 'include'
    };

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        options.body = JSON.stringify(data);
    }

    if (method === 'GET') {
        const separator = url.includes('?') ? '&' : '?';
        url = url + separator + 't=' + new Date().getTime();
    }

    try {
        const baseUrl = 'http://localhost:8090/api';
        const response = await fetch(baseUrl + url, options);

        if (!response.ok) {
            throw new Error(`HTTP错误，状态码: ${response.status}`);
        }

        const result = await response.json();

        // 关键修改：根据后端实际返回的success字段判断成功与否
        if (result.success) {  // 这里改为判断success是否为true
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
    