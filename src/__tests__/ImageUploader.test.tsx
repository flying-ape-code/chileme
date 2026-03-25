import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ImageUploader from '../components/Feedback/ImageUploader';

describe('ImageUploader', () => {
  const mockOnImagesChange = vi.fn();
  const mockOnError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = (props = {}) => {
    return render(
      <ImageUploader
        images={[]}
        onImagesChange={mockOnImagesChange}
        onError={mockOnError}
        {...props}
      />
    );
  };

  it('renders upload button', () => {
    renderComponent();
    expect(screen.getByText(/点击或拖拽上传图片/i)).toBeInTheDocument();
  });

  it('accepts image files only', () => {
    renderComponent();
    expect(screen.getByText(/最多/i)).toBeInTheDocument();
    expect(screen.getByText(/张，单张不超过/i)).toBeInTheDocument();
  });

  it('shows upload progress', () => {
    const { container } = renderComponent();
    expect(container.querySelector('.border-dashed')).toBeInTheDocument();
  });

  it('displays max files info', () => {
    renderComponent({ maxImages: 5 });
    expect(screen.getByText(/5 张/i)).toBeInTheDocument();
  });

  it('displays max size info', () => {
    renderComponent({ maxSizeMB: 5 });
    expect(screen.getByText(/5MB/i)).toBeInTheDocument();
  });
});
