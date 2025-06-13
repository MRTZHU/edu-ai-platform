-- =====================================================
-- Supabase教育应用 - 数据库表结构创建脚本
-- 版本: 1.0
-- 创建时间: 2024-12-19
-- 说明: 创建AI对话系统所需的核心表结构
-- =====================================================

-- 启用必要的扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. 对话会话表 (conversations)
-- 用于存储用户的对话会话信息
-- =====================================================
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tool_id VARCHAR(100) NOT NULL,
    title TEXT,
    conversation_id TEXT, -- Dify返回的conversation_id
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 添加表注释
COMMENT ON TABLE conversations IS '对话会话表，存储用户的AI对话会话信息';
COMMENT ON COLUMN conversations.id IS '会话唯一标识符';
COMMENT ON COLUMN conversations.user_id IS '用户ID，关联auth.users表';
COMMENT ON COLUMN conversations.tool_id IS '工具ID，标识使用的AI工具';
COMMENT ON COLUMN conversations.title IS '对话标题，通常从第一条消息生成';
COMMENT ON COLUMN conversations.conversation_id IS 'Dify API返回的对话ID，用于API调用';
COMMENT ON COLUMN conversations.created_at IS '创建时间';
COMMENT ON COLUMN conversations.updated_at IS '最后更新时间';

-- =====================================================
-- 2. 消息表 (messages)
-- 用于存储对话中的具体消息内容
-- =====================================================
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tool_id VARCHAR(100) NOT NULL,
    message_type VARCHAR(20) NOT NULL CHECK (message_type IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 添加表注释
COMMENT ON TABLE messages IS '消息表，存储对话中的具体消息内容';
COMMENT ON COLUMN messages.id IS '消息唯一标识符';
COMMENT ON COLUMN messages.conversation_id IS '所属对话会话ID';
COMMENT ON COLUMN messages.user_id IS '用户ID，关联auth.users表';
COMMENT ON COLUMN messages.tool_id IS '工具ID，标识使用的AI工具';
COMMENT ON COLUMN messages.message_type IS '消息类型：user(用户)、assistant(AI助手)、system(系统)';
COMMENT ON COLUMN messages.content IS '消息内容';
COMMENT ON COLUMN messages.metadata IS '消息元数据，JSON格式，存储思考过程、文件等信息';
COMMENT ON COLUMN messages.created_at IS '创建时间';

-- =====================================================
-- 3. 用户文件表 (user_files)
-- 用于存储用户上传的文件信息
-- =====================================================
CREATE TABLE IF NOT EXISTS user_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_url TEXT NOT NULL,
    file_size BIGINT,
    tool_id VARCHAR(100),
    conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 添加表注释
COMMENT ON TABLE user_files IS '用户文件表，存储用户上传的文件信息';
COMMENT ON COLUMN user_files.id IS '文件记录唯一标识符';
COMMENT ON COLUMN user_files.user_id IS '用户ID，关联auth.users表';
COMMENT ON COLUMN user_files.file_name IS '文件名称';
COMMENT ON COLUMN user_files.file_type IS '文件类型/MIME类型';
COMMENT ON COLUMN user_files.file_url IS '文件存储URL';
COMMENT ON COLUMN user_files.file_size IS '文件大小（字节）';
COMMENT ON COLUMN user_files.tool_id IS '关联的工具ID';
COMMENT ON COLUMN user_files.conversation_id IS '关联的对话会话ID';
COMMENT ON COLUMN user_files.created_at IS '创建时间';

-- =====================================================
-- 4. 创建更新时间触发器函数
-- 自动更新conversations表的updated_at字段
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为conversations表创建触发器
CREATE TRIGGER update_conversations_updated_at 
    BEFORE UPDATE ON conversations 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 表创建完成提示
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '✅ 数据库表结构创建完成！';
    RAISE NOTICE '📋 已创建表：conversations, messages, user_files';
    RAISE NOTICE '🔧 已创建触发器：自动更新conversations.updated_at';
    RAISE NOTICE '📝 下一步：执行 02_create_rls_policies.sql 设置行级安全策略';
END $$; 