// 认证工具函数
export const ADMIN_USERNAME = 'admin';
export const ADMIN_PASSWORD = '123456';

export const login = (username, password) => {
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    localStorage.setItem('adminLoggedIn', 'true');
    localStorage.setItem('adminLoginTime', Date.now().toString());
    return { success: true };
  }
  return { success: false, message: '用户名或密码错误' };
};

export const logout = () => {
  localStorage.removeItem('adminLoggedIn');
  localStorage.removeItem('adminLoginTime');
};

export const isLoggedIn = () => {
  const loggedIn = localStorage.getItem('adminLoggedIn') === 'true';
  const loginTime = localStorage.getItem('adminLoginTime');

  // 24小时后自动登出
  if (loggedIn && loginTime) {
    const hoursElapsed = (Date.now() - parseInt(loginTime)) / (1000 * 60 * 60);
    if (hoursElapsed > 24) {
      logout();
      return false;
    }
  }

  return loggedIn;
};
