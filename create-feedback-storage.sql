-- ============================================
-- 吃了么 Phase 3 - Supabase Storage 配置
-- 创建 feedback-images bucket 和 RLS 策略
-- ============================================

-- 1. 创建 Storage Bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('feedback-images', 'feedback-images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. 启用 RLS
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. 创建 RLS 策略

-- 策略 1: 用户可以上传自己的图片
CREATE POLICY "Users can upload images to feedback-images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'feedback-images'
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 策略 2: 用户可以查看自己的图片
CREATE POLICY "Users can view own images"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'feedback-images'
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 策略 3: 用户可以删除自己的图片
CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'feedback-images'
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 策略 4: 管理员可以访问所有图片
CREATE POLICY "Admins can access all images"
ON storage.objects FOR ALL
USING (
  bucket_id = 'feedback-images'
  AND EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.raw_user_meta_data->>'role' = 'admin'
  )
);

-- 4. 创建公开访问策略（允许匿名读取）
CREATE POLICY "Public access to feedback images"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'feedback-images'
);

-- ============================================
-- 验证配置
-- ============================================

-- 检查 bucket 是否创建成功
SELECT * FROM storage.buckets WHERE id = 'feedback-images';

-- 检查 RLS 策略
SELECT * FROM pg_policies 
WHERE schemaname = 'storage' 
AND tablename = 'objects'
AND policyname LIKE '%feedback-images%';
