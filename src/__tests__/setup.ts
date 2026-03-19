import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Supabase client
export const mockSupabase = {
  from: vi.fn(),
  storage: {
    from: vi.fn(),
  },
};

// Mock the supabaseClient module
vi.mock('../lib/supabaseClient', () => ({
  supabase: mockSupabase,
}));

// Mock auth utilities
vi.mock('../lib/auth', () => ({
  getCurrentUser: vi.fn(),
  isAdmin: vi.fn(),
}));

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
});

// Global test timeout
vi.setConfig({
  testTimeout: 10000,
});
