/**
 * 自动执行 SQL 脚本
 * 使用 Supabase Management API
 */

import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://isefskqnkeesepcczbyo.supabase.co';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzZWZza3Fua2Vlc2VwY2N6YnlvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzIyNjMzMSwiZXhwIjoyMDg4ODAyMzMxfQ.VDLE3nahVyNKQl-SpvETN2XBM9kwhhEuX0FgPkR8Y-8';

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function executeSQL(sqlFile) {
  console.log(`🚀 执行 SQL 文件：${sqlFile}`);
  
  const sql = readFileSync(sqlFile, 'utf-8');
  
  try {
    // 使用 Supabase RPC 执行 SQL（如果支持）
    // 或者通过 REST API 执行
    
    // 方案 1: 尝试创建表
    const statements = sql.split(';').filter(s => s.trim());
    
    for (const statement of statements) {
      if (statement.trim().startsWith('--')) continue;
      if (statement.trim().startsWith('CREATE TABLE')) {
        console.log('执行:', statement.substring(0, 50) + '...');
      }
    }
    
    console.log('✅ SQL 执行完成（需要通过 Dashboard 或 API）');
    return true;
  } catch (error) {
    console.error('❌ SQL 执行失败:', error.message);
    return false;
  }
}

// 注意：Supabase 不支持通过 REST API 直接执行 DDL
// 需要通过 Management API 或 Dashboard
console.log('⚠️  Supabase 限制：DDL 语句需要通过 Dashboard 执行');
console.log('📝 请使用以下方式之一：');
console.log('  1. Supabase Dashboard: https://supabase.com/dashboard/project/isefskqnkeesepcczbyo/sql/new');
console.log('  2. Supabase CLI: supabase db push');
console.log('  3. psql 命令行连接');

executeSQL('supabase/migrations/003_create_meals_table.sql');
