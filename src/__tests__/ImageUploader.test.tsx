import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ImageUploader from '../components/Feedback/ImageUploader';

// Mock Supabase storage upload
vi.mock('../lib/supabaseClient', () => ({
  supabase: {
    storage: {
      from: vi.fn().mockReturnValue({
        upload: vi.fn().mockResolvedValue({ data: { path: 'test.jpg' }, error: null }),
        getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://test.jpg' } })
      })
    }
  }
}));

describe('ImageUploader', () => {
  const mockOnUpload = vi.fn();
  const mockOnError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders upload button', () => {
    render(<ImageUploader onUpload={mockOnUpload} onError={mockOnError} />);
    expect(screen.getByText(/上传图片/i)).toBeInTheDocument();
  });

  it('accepts image files only', () => {
    render(<ImageUploader onUpload={mockOnUpload} onError={mockOnError} />);
    const fileInput = screen.getByTestId('image-upload-input');
    expect(fileInput).toHaveAttribute('accept', 'image/*');
  });

  it('validates file size (max 5MB)', () => {
    render(<ImageUploader onUpload={mockOnUpload} onError={mockOnError} />);
    
    const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });
    const fileInput = screen.getByTestId('image-upload-input');
    
    fireEvent.change(fileInput, { target: { files: [largeFile] } });
    
    expect(mockOnError).toHaveBeenCalledWith(expect.stringContaining('文件大小'));
  });

  it('validates file type', () => {
    render(<ImageUploader onUpload={mockOnUpload} onError={mockOnError} />);
    
    const invalidFile = new File(['test'], 'document.pdf', { type: 'application/pdf' });
    const fileInput = screen.getByTestId('image-upload-input');
    
    fireEvent.change(fileInput, { target: { files: [invalidFile] } });
    
    expect(mockOnError).toHaveBeenCalledWith(expect.stringContaining('图片格式'));
  });

  it('handles multiple files (max 5)', () => {
    render(<ImageUploader onUpload={mockOnUpload} onError={mockOnError} maxFiles={5} />);
    
    const files = Array.from({ length: 6 }, (_, i) => 
      new File(['test'], `image${i}.jpg`, { type: 'image/jpeg' })
    );
    
    const fileInput = screen.getByTestId('image-upload-input');
    fireEvent.change(fileInput, { target: { files } });
    
    // Should only accept first 5 files
    expect(mockOnUpload).toHaveBeenCalledTimes(5);
  });

  it('shows upload progress', async () => {
    const { container } = render(<ImageUploader onUpload={mockOnUpload} onError={mockOnError} />);
    
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const fileInput = screen.getByTestId('image-upload-input');
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    // Should show progress indicator
    expect(container.querySelector('.upload-progress')).toBeInTheDocument();
  });
});
