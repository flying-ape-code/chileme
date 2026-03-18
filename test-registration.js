const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://isefskqnkeesepcczbyo.supabase.co';
const supabaseServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzZWZza3Fua2Vlc2VwY2N6YnlvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzIyNjMzMSwiZXhwIjoyMDg4ODAyMzMxfQ.VDLE3nahVyNKQl-SpvETN2XBM9kwhhEuX0FgPkR8Y-8';

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function executeSQL(sql) {
  // 使用 Supabase Management API 执行 SQL
  const response = await fetch(`${supabaseUrl}/rest/v1/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${supabaseServiceRoleKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'tx=commit'
    },
    body: JSON.stringify({ query: sql })
  });
  
  const result = await response.json();
  return result;
}

async function fixRLS() {
  console.log('🔧 开始修复 RLS...\n');
  
  const sql = `
    -- 禁用 RLS
    ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
    ALTER TABLE products DISABLE ROW LEVEL SECURITY;
    
    -- 删除旧触发器
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
    
    -- 创建触发器函数
    CREATE FUNCTION public.handle_new_user()
    RETURNS TRIGGER
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    BEGIN
      INSERT INTO public.profiles (id, username, email, role, created_at, updated_at)
      VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        NEW.email,
        'user',
        NOW(),
        NOW()
      )
      ON CONFLICT (id) DO NOTHING;
      RETURN NEW;
    END;
    $$;
    
    -- 创建触发器
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW
      EXECUTE FUNCTION public.handle_new_user();
    
    -- 启用 RLS
    ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
    ALTER TABLE products ENABLE ROW LEVEL SECURITY;
    
    -- 创建策略
    DROP POLICY IF EXISTS "profiles_select" ON profiles;
    DROP POLICY IF EXISTS "profiles_insert" ON profiles;
    DROP POLICY IF EXISTS "profiles_update" ON profiles;
    DROP POLICY IF EXISTS "products_select" ON products;
    DROP POLICY IF EXISTS "products_admin" ON products;
    
    CREATE POLICY "profiles_select" ON profiles FOR SELECT TO authenticated USING (true);
    CREATE POLICY "profiles_insert" ON profiles FOR INSERT TO authenticated WITH CHECK (true);
    CREATE POLICY "profiles_update" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
    
    CREATE POLICY "products_select" ON products FOR SELECT TO public USING (true);
    CREATE POLICY "products_admin" ON products FOR ALL TO authenticated 
      USING ((auth.jwt()->>'role')::text = 'admin')
      WITH CHECK ((auth.jwt()->>'role')::text = 'admin');
  `;
  
  try {
    const result = await executeSQL(sql);
    console.log('✅ SQL 执行成功!');
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('❌ SQL 执行失败:', error.message);
  }
  
  // 验证
  console.log('\n🔍 验证修复结果...\n');
  
  // 检查触发器
  const triggerCheck = await supabase.rpc('check_trigger', {
    trigger_name: 'on_auth_user_created'
  });
  
  // 直接查询
  const triggers = await supabase
    .from('information_schema.triggers')
    .select('trigger_name')
    .eq('trigger_name', 'on_auth_user_created');
  
  console.log('触发器状态:', triggers.data?.length ? '✅ 存在' : '❌ 不存在');
  
  // 检查用户和 profile
  const users = await supabase
    .from('auth.users')
    .select('id, email, created_at')
    .order('created_at', { ascending: false })
    .limit(3);
  
  const profiles = await supabase
    .from('profiles')
    .select('id, username, email')
    .order('created_at', { ascending: false })
    .limit(3);
  
  console.log('\n最近用户:');
  users.data?.forEach(u => console.log(`  - ${u.email} (${u.id})`));
  
  console.log('\n最近 Profile:');
  profiles.data?.forEach(p => console.log(`  - ${p.username} (${p.email})`));
}

fixRLS();
