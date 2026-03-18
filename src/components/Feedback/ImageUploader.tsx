import React, { useState, useRef, useCallback } from 'react';

interface ImageUploaderProps {
  images: File[];
  onImagesChange: (images: File[]) => void;
  maxImages?: number;
  maxSizeMB?: number;
  disabled?: boolean;
}

export default function ImageUploader({
  images,
  onImagesChange,
  maxImages = 3,
  maxSizeMB = 5,
  disabled = false
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 压缩图片
  const compressImage = async (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // 如果图片尺寸过大，进行缩放（最大 1920px）
          const maxWidth = 1920;
          const maxHeight = 1920;
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.floor(width * ratio);
            height = Math.floor(height * ratio);
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('图片压缩失败'));
                return;
              }
              // 如果压缩后仍然大于 5MB，继续降低质量
              if (blob.size > maxSizeMB * 1024 * 1024) {
                canvas.toBlob(
                  (compressedBlob) => {
                    if (!compressedBlob) {
                      reject(new Error('图片压缩失败'));
                      return;
                    }
                    resolve(new File([compressedBlob], file.name, {
                      type: 'image/jpeg',
                      lastModified: Date.now()
                    }));
                  },
                  'image/jpeg',
                  0.7
                );
              } else {
                resolve(new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now()
                }));
              }
            },
            'image/jpeg',
            0.8
          );
        };
        img.onerror = () => reject(new Error('图片加载失败'));
      };
      reader.onerror = () => reject(new Error('文件读取失败'));
    });
  };

  // 处理文件
  const handleFiles = useCallback(async (files: FileList | File[]) => {
    setError('');
    const fileArray = Array.from(files);
    
    // 验证文件数量
    if (images.length + fileArray.length > maxImages) {
      setError(`最多只能上传 ${maxImages} 张图片`);
      return;
    }

    // 验证并压缩图片
    const validFiles: File[] = [];
    for (const file of fileArray) {
      // 验证文件类型
      if (!file.type.startsWith('image/')) {
        setError(`文件 "${file.name}" 不是图片`);
        continue;
      }

      // 验证文件大小（压缩前）
      if (file.size > 10 * 1024 * 1024) {
        setError(`文件 "${file.name}" 超过 10MB`);
        continue;
      }

      try {
        // 压缩图片
        const compressedFile = await compressImage(file);
        
        // 验证压缩后的大小
        if (compressedFile.size > maxSizeMB * 1024 * 1024) {
          setError(`文件 "${file.name}" 压缩后仍超过 ${maxSizeMB}MB`);
          continue;
        }

        validFiles.push(compressedFile);
      } catch (err: any) {
        setError(`处理文件 "${file.name}" 失败：${err.message}`);
      }
    }

    if (validFiles.length > 0) {
      onImagesChange([...images, ...validFiles]);
    }
  }, [images, onImagesChange, maxImages, maxSizeMB]);

  // 拖拽事件
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (!disabled && e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  }, [disabled, handleFiles]);

  // 点击上传
  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // 删除图片
  const handleRemove = (index: number) => {
    if (!disabled) {
      onImagesChange(images.filter((_, i) => i !== index));
    }
  };

  // 预览图片
  const getPreviewUrl = (file: File) => {
    return URL.createObjectURL(file);
  };

  return (
    <div className="space-y-2">
      {/* 拖拽上传区域 */}
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
          transition-all duration-200
          ${isDragging
            ? 'border-cyan-400 bg-cyan-400/10'
            : 'border-gray-600 hover:border-cyan-500 hover:bg-gray-700/50'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          className="hidden"
          disabled={disabled}
        />
        
        <div className="space-y-2">
          <div className="text-4xl">📷</div>
          <div className="text-gray-300">
            {images.length === 0 ? (
              <>
                <p>点击或拖拽上传图片</p>
                <p className="text-sm text-gray-500">
                  最多 {maxImages} 张，单张不超过 {maxSizeMB}MB
                </p>
              </>
            ) : (
              <>
                <p>已上传 {images.length} / {maxImages} 张</p>
                <p className="text-sm text-cyan-400">
                  继续添加图片
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded px-3 py-2">
          {error}
        </div>
      )}

      {/* 图片预览 */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {images.map((file, index) => (
            <div
              key={index}
              className="relative group aspect-square rounded-lg overflow-hidden border border-gray-600"
            >
              <img
                src={getPreviewUrl(file)}
                alt={`预览 ${index + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  disabled={disabled}
                  className="bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="absolute bottom-1 left-1 bg-black/70 text-white text-xs px-2 py-1 rounded">
                {(file.size / 1024 / 1024).toFixed(2)}MB
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
