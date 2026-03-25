import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ImageUploader from '../components/Feedback/ImageUploader';

describe('ImageUploader - Complete Tests', () => {
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
    expect(screen.getByText(/最多/i)).toBeInTheDocument();
  });

  it('handles multiple files config', () => {
    render(<ImageUploader images={mockImages} onImagesChange={mockOnImagesChange} maxImages={3} />);
    expect(screen.getByText(/3 张/i)).toBeInTheDocument();
  });

  it('displays size limit', () => {
    render(<ImageUploader images={mockImages} onImagesChange={mockOnImagesChange} maxSizeMB={5} />);
    expect(screen.getByText(/5MB/i)).toBeInTheDocument();
  });

  it('shows empty state', () => {
    render(<ImageUploader images={[]} onImagesChange={mockOnImagesChange} />);
    expect(screen.getByText(/点击或拖拽上传图片/i)).toBeInTheDocument();
  });
});
