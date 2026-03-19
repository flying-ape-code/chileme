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
  const mockOnImagesChange = vi.fn();
  const mockImages = [];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders upload button', () => {
    render(<ImageUploader images={mockImages} onImagesChange={mockOnImagesChange} />);
    expect(screen.getByText(/点击或拖拽上传图片/i)).toBeInTheDocument();
  });

  it('accepts image files only', () => {
    render(<ImageUploader images={mockImages} onImagesChange={mockOnImagesChange} />);
    const fileInput = screen.getByTestId('image-upload-input');
    expect(fileInput).toHaveAttribute('accept', 'image/*');
  });

  it('validates file size (max 5MB)', () => {
    render(<ImageUploader images={mockImages} onImagesChange={mockOnImagesChange} />);
    
    const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });
    const fileInput = screen.getByTestId('image-upload-input');
    
    fireEvent.change(fileInput, { target: { files: [largeFile] } });
    
    expect(screen.getByText(/文件大小不能超过/i)).toBeInTheDocument();
  });

  it('validates file type', () => {
    render(<ImageUploader images={mockImages} onImagesChange={mockOnImagesChange} />);
    
    const invalidFile = new File(['test'], 'document.pdf', { type: 'application/pdf' });
    const fileInput = screen.getByTestId('image-upload-input');
    
    fireEvent.change(fileInput, { target: { files: [invalidFile] } });
    
    expect(screen.getByText(/请选择图片文件/i)).toBeInTheDocument();
  });

  it('handles multiple files (max 3)', () => {
    render(<ImageUploader images={mockImages} onImagesChange={mockOnImagesChange} maxImages={3} />);
    
    const files = Array.from({ length: 4 }, (_, i) => 
      new File(['test'], `image${i}.jpg`, { type: 'image/jpeg' })
    );
    
    const fileInput = screen.getByTestId('image-upload-input');
    fireEvent.change(fileInput, { target: { files } });
    
    // Should only accept first 3 files
    expect(mockOnImagesChange).toHaveBeenCalledTimes(1);
    expect(mockOnImagesChange).toHaveBeenCalledWith(expect.arrayContaining([
      expect.objectContaining({ name: 'image0.jpg' }),
      expect.objectContaining({ name: 'image1.jpg' }),
      expect.objectContaining({ name: 'image2.jpg' })
    ]));
  });

  it('shows image preview', () => {
    render(<ImageUploader images={mockImages} onImagesChange={mockOnImagesChange} />);
    
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const fileInput = screen.getByTestId('image-upload-input');
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    
    // Should show preview
    expect(mockOnImagesChange).toHaveBeenCalledWith([file]);
  });
});
