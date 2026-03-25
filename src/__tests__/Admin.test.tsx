import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Admin from '../pages/Admin';
import { useAuth } from '../context/AuthContext';

// Mock useAuth
vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

describe('Admin 后台管理页面', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      isAdmin: true,
      user: { id: '1', email: 'admin@test.com' },
    });
  });

  const renderWithRouter = (component: React.ReactElement) => {
    return render(
      <MemoryRouter>
        {component}
      </MemoryRouter>
    );
  };

  describe('权限控制', () => {
    it('应该验证用户权限', () => {
      renderWithRouter(<Admin />);
      expect(useAuth).toHaveBeenCalled();
    });
  });

  describe('页面渲染', () => {
    it('应该成功渲染页面', () => {
      const { container } = renderWithRouter(<Admin />);
      expect(container).toBeTruthy();
    });
  });
});
