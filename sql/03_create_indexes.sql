-- =====================================================
-- Supabase教育应用 - 数据库索引优化脚本
-- 版本: 1.0
-- 创建时间: 2024-12-19
-- 说明: 为AI对话系统创建性能优化索引
-- =====================================================

-- =====================================================
-- 1. conversations表索引
-- =====================================================

-- 用户ID索引（最重要的查询条件）
CREATE INDEX IF NOT EXISTS idx_conversations_user_id 
ON conversations(user_id);

-- 工具ID索引（按工具筛选对话）
CREATE INDEX IF NOT EXISTS idx_conversations_tool_id 
ON conversations(tool_id);

-- 用户ID + 工具ID 复合索引（常见的组合查询）
CREATE INDEX IF NOT EXISTS idx_conversations_user_tool 
ON conversations(user_id, tool_id);

-- 更新时间索引（按时间排序）
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at 
ON conversations(updated_at DESC);

-- 用户ID + 更新时间 复合索引（用户对话历史按时间排序）
CREATE INDEX IF NOT EXISTS idx_conversations_user_updated 
ON conversations(user_id, updated_at DESC);

-- Dify对话ID索引（API调用时查找）
CREATE INDEX IF NOT EXISTS idx_conversations_dify_id 
ON conversations(conversation_id) 
WHERE conversation_id IS NOT NULL;

-- =====================================================
-- 2. messages表索引
-- =====================================================

-- 对话ID索引（获取对话消息）
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id 
ON messages(conversation_id);

-- 用户ID索引（用户权限检查）
CREATE INDEX IF NOT EXISTS idx_messages_user_id 
ON messages(user_id);

-- 对话ID + 创建时间 复合索引（消息按时间排序）
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created 
ON messages(conversation_id, created_at);

-- 消息类型索引（按类型筛选消息）
CREATE INDEX IF NOT EXISTS idx_messages_type 
ON messages(message_type);

-- 工具ID索引（按工具筛选消息）
CREATE INDEX IF NOT EXISTS idx_messages_tool_id 
ON messages(tool_id);

-- 用户ID + 工具ID 复合索引（用户在特定工具的消息）
CREATE INDEX IF NOT EXISTS idx_messages_user_tool 
ON messages(user_id, tool_id);

-- 创建时间索引（时间范围查询）
CREATE INDEX IF NOT EXISTS idx_messages_created_at 
ON messages(created_at DESC);

-- JSONB元数据索引（搜索思考过程等）
CREATE INDEX IF NOT EXISTS idx_messages_metadata_gin 
ON messages USING GIN(metadata);

-- 内容全文搜索索引（如果需要搜索消息内容）
CREATE INDEX IF NOT EXISTS idx_messages_content_gin 
ON messages USING GIN(to_tsvector('chinese', content));

-- =====================================================
-- 3. user_files表索引
-- =====================================================

-- 用户ID索引（用户文件列表）
CREATE INDEX IF NOT EXISTS idx_user_files_user_id 
ON user_files(user_id);

-- 对话ID索引（对话相关文件）
CREATE INDEX IF NOT EXISTS idx_user_files_conversation_id 
ON user_files(conversation_id) 
WHERE conversation_id IS NOT NULL;

-- 工具ID索引（工具相关文件）
CREATE INDEX IF NOT EXISTS idx_user_files_tool_id 
ON user_files(tool_id) 
WHERE tool_id IS NOT NULL;

-- 文件类型索引（按类型筛选文件）
CREATE INDEX IF NOT EXISTS idx_user_files_type 
ON user_files(file_type);

-- 创建时间索引（文件按时间排序）
CREATE INDEX IF NOT EXISTS idx_user_files_created_at 
ON user_files(created_at DESC);

-- 用户ID + 创建时间 复合索引（用户文件按时间排序）
CREATE INDEX IF NOT EXISTS idx_user_files_user_created 
ON user_files(user_id, created_at DESC);

-- 文件名索引（文件名搜索）
CREATE INDEX IF NOT EXISTS idx_user_files_name 
ON user_files(file_name);

-- =====================================================
-- 4. 高级索引优化
-- =====================================================

-- 部分索引：只为有标题的对话创建索引
CREATE INDEX IF NOT EXISTS idx_conversations_titled 
ON conversations(user_id, updated_at DESC) 
WHERE title IS NOT NULL;

-- 表达式索引：按日期分组统计
CREATE INDEX IF NOT EXISTS idx_conversations_date 
ON conversations(user_id, DATE(created_at));

CREATE INDEX IF NOT EXISTS idx_messages_date 
ON messages(user_id, DATE(created_at));

-- JSONB特定字段索引：思考过程搜索
CREATE INDEX IF NOT EXISTS idx_messages_agent_thoughts 
ON messages USING GIN((metadata->'agent_thoughts')) 
WHERE metadata ? 'agent_thoughts';

-- =====================================================
-- 5. 索引维护函数
-- =====================================================

-- 创建索引使用情况分析函数
CREATE OR REPLACE FUNCTION analyze_index_usage()
RETURNS TABLE(
    schemaname TEXT,
    tablename TEXT,
    indexname TEXT,
    idx_scan BIGINT,
    idx_tup_read BIGINT,
    idx_tup_fetch BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.schemaname::TEXT,
        s.tablename::TEXT,
        s.indexname::TEXT,
        s.idx_scan,
        s.idx_tup_read,
        s.idx_tup_fetch
    FROM pg_stat_user_indexes s
    WHERE s.schemaname = 'public'
    AND s.tablename IN ('conversations', 'messages', 'user_files')
    ORDER BY s.idx_scan DESC;
END;
$$ LANGUAGE plpgsql;

-- 创建表大小分析函数
CREATE OR REPLACE FUNCTION analyze_table_sizes()
RETURNS TABLE(
    table_name TEXT,
    row_count BIGINT,
    total_size TEXT,
    index_size TEXT,
    table_size TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.tablename::TEXT,
        c.reltuples::BIGINT,
        pg_size_pretty(pg_total_relation_size(c.oid)),
        pg_size_pretty(pg_indexes_size(c.oid)),
        pg_size_pretty(pg_relation_size(c.oid))
    FROM pg_tables t
    JOIN pg_class c ON c.relname = t.tablename
    WHERE t.schemaname = 'public'
    AND t.tablename IN ('conversations', 'messages', 'user_files')
    ORDER BY pg_total_relation_size(c.oid) DESC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 6. 索引维护建议
-- =====================================================

-- 创建索引维护建议函数
CREATE OR REPLACE FUNCTION get_index_maintenance_tips()
RETURNS TABLE(tip_category TEXT, tip_description TEXT) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        '定期维护'::TEXT,
        '建议每月运行 ANALYZE; 更新表统计信息'::TEXT
    UNION ALL
    SELECT 
        '性能监控'::TEXT,
        '使用 SELECT * FROM analyze_index_usage(); 监控索引使用情况'::TEXT
    UNION ALL
    SELECT 
        '存储监控'::TEXT,
        '使用 SELECT * FROM analyze_table_sizes(); 监控表和索引大小'::TEXT
    UNION ALL
    SELECT 
        '索引清理'::TEXT,
        '删除未使用的索引以节省存储空间和提高写入性能'::TEXT
    UNION ALL
    SELECT 
        '查询优化'::TEXT,
        '使用 EXPLAIN ANALYZE 分析慢查询并考虑添加新索引'::TEXT;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 索引创建完成提示
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '✅ 数据库索引优化完成！';
    RAISE NOTICE '📊 已创建 %s 个索引用于性能优化', (
        SELECT COUNT(*) 
        FROM pg_indexes 
        WHERE schemaname = 'public' 
        AND tablename IN ('conversations', 'messages', 'user_files')
        AND indexname LIKE 'idx_%'
    );
    RAISE NOTICE '🔍 主要优化场景：';
    RAISE NOTICE '   - 用户对话历史查询';
    RAISE NOTICE '   - 消息按时间排序';
    RAISE NOTICE '   - 工具相关数据筛选';
    RAISE NOTICE '   - JSONB元数据搜索';
    RAISE NOTICE '   - 全文内容搜索';
    RAISE NOTICE '📈 监控命令：';
    RAISE NOTICE '   - SELECT * FROM analyze_index_usage();';
    RAISE NOTICE '   - SELECT * FROM analyze_table_sizes();';
    RAISE NOTICE '   - SELECT * FROM get_index_maintenance_tips();';
    RAISE NOTICE '📝 数据库设置完成！可以开始使用应用了。';
END $$; 