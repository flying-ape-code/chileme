// 认证工具

// 默认管理员账号
const DEFAULT_ADMIN = {
  username: 'admin',
  password: '123456'
};

// 检查是否登录
export const isAuthenticated = (): boolean => {
  const loginTime = localStorage.getItem('adminLoginTime');
  if (!loginTime) return false;

  // 24小时后自动登出
  const loginTimeNum = parseInt(loginTime, 10);
  const now = Date.now();
  const hoursPassed = (now - loginTimeNum) / (1000 * 60 * 60);

  return hoursPassed < 24;
};

// 登录
export const login = (username: string, password: string): boolean => {
  if (username === DEFAULT_ADMIN.username && password === DEFAULT_ADMIN.password) {
    localStorage.setItem('adminLoginTime', Date.now().toString());
    return true;
  }
  return false;
};

// 登出
export const logout = (): void => {
  localStorage.removeItem('adminLoginTime');
};
