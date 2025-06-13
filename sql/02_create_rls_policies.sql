-- =====================================================
-- Supabase教育应用 - 行级安全策略(RLS)设置脚本
-- 版本: 1.0
-- 创建时间: 2024-12-19
-- 说明: 为AI对话系统设置数据安全访问策略
-- =====================================================

-- =====================================================
-- 1. 启用行级安全策略
-- =====================================================

-- 为conversations表启用RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- 为messages表启用RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 为user_files表启用RLS
ALTER TABLE user_files ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 2. conversations表的RLS策略
-- =====================================================

-- 用户只能查看自己的对话
CREATE POLICY "用户只能查看自己的对话" ON conversations
    FOR SELECT USING (auth.uid() = user_id);

-- 用户只能创建属于自己的对话
CREATE POLICY "用户只能创建自己的对话" ON conversations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 用户只能更新自己的对话
CREATE POLICY "用户只能更新自己的对话" ON conversations
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 用户只能删除自己的对话
CREATE POLICY "用户只能删除自己的对话" ON conversations
    FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- 3. messages表的RLS策略
-- =====================================================

-- 用户只能查看自己的消息
CREATE POLICY "用户只能查看自己的消息" ON messages
    FOR SELECT USING (auth.uid() = user_id);

-- 用户只能创建属于自己的消息
CREATE POLICY "用户只能创建自己的消息" ON messages
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 用户只能更新自己的消息
CREATE POLICY "用户只能更新自己的消息" ON messages
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 用户只能删除自己的消息
CREATE POLICY "用户只能删除自己的消息" ON messages
    FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- 4. user_files表的RLS策略
-- =====================================================

-- 用户只能查看自己的文件
CREATE POLICY "用户只能查看自己的文件" ON user_files
    FOR SELECT USING (auth.uid() = user_id);

-- 用户只能上传属于自己的文件
CREATE POLICY "用户只能上传自己的文件" ON user_files
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 用户只能更新自己的文件记录
CREATE POLICY "用户只能更新自己的文件记录" ON user_files
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 用户只能删除自己的文件记录
CREATE POLICY "用户只能删除自己的文件记录" ON user_files
    FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- 5. 高级RLS策略（可选）
-- =====================================================

-- 管理员可以查看所有数据（如果需要管理功能）
-- 注意：需要在auth.users表中添加role字段或使用metadata
/*
CREATE POLICY "管理员可以查看所有对话" ON conversations
    FOR SELECT USING (
        auth.jwt() ->> 'role' = 'admin' OR 
        (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    );

CREATE POLICY "管理员可以查看所有消息" ON messages
    FOR SELECT USING (
        auth.jwt() ->> 'role' = 'admin' OR 
        (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    );

CREATE POLICY "管理员可以查看所有文件" ON user_files
    FOR SELECT USING (
        auth.jwt() ->> 'role' = 'admin' OR 
        (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
    );
*/

-- =====================================================
-- 6. 验证RLS策略
-- =====================================================

-- 创建测试函数来验证RLS策略是否正确设置
CREATE OR REPLACE FUNCTION verify_rls_policies()
RETURNS TABLE(table_name TEXT, rls_enabled BOOLEAN, policy_count INTEGER) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.tablename::TEXT,
        t.rowsecurity,
        COUNT(p.policyname)::INTEGER
    FROM pg_tables t
    LEFT JOIN pg_policies p ON t.tablename = p.tablename
    WHERE t.schemaname = 'public' 
    AND t.tablename IN ('conversations', 'messages', 'user_files')
    GROUP BY t.tablename, t.rowsecurity
    ORDER BY t.tablename;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- RLS策略设置完成提示
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '✅ 行级安全策略(RLS)设置完成！';
    RAISE NOTICE '🔒 已为以下表启用RLS：conversations, messages, user_files';
    RAISE NOTICE '📋 每个表都设置了完整的CRUD策略（SELECT, INSERT, UPDATE, DELETE）';
    RAISE NOTICE '🛡️ 用户只能访问自己的数据，确保数据隔离';
    RAISE NOTICE '🔍 可以运行 SELECT * FROM verify_rls_policies(); 来验证策略设置';
    RAISE NOTICE '📝 下一步：执行 03_create_indexes.sql 创建性能优化索引';
END $$; 