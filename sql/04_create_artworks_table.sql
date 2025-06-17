-- =====================================================
-- Supabase教育应用 - AI美育作品表创建脚本
-- 版本: 1.0
-- 创建时间: 2024-12-19
-- 说明: 创建AI美育功能所需的artworks表
-- =====================================================

-- =====================================================
-- 0. 确保必要的函数存在
-- 创建或更新 updated_at 字段的触发器函数
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =====================================================
-- 1. 创建作品表 (artworks)
-- 用于存储AI生成的美育作品信息
-- =====================================================
CREATE TABLE IF NOT EXISTS artworks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tool_id VARCHAR(100) NOT NULL,
    title TEXT NOT NULL,
    content_type VARCHAR(20) NOT NULL CHECK (content_type IN ('image', 'video', 'audio', 'text')),
    content_url TEXT NOT NULL,
    thumbnail_url TEXT,
    prompt TEXT,
    input_image_url TEXT,
    output_image_url TEXT,
    output_metadata JSONB DEFAULT '{}',
    tool_name VARCHAR(100),
    is_favorite BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 添加表注释
COMMENT ON TABLE artworks IS 'AI美育作品表，存储用户生成的各类AI作品';
COMMENT ON COLUMN artworks.id IS '作品唯一标识符';
COMMENT ON COLUMN artworks.user_id IS '用户ID，关联auth.users表';
COMMENT ON COLUMN artworks.tool_id IS '工具ID，标识使用的AI工具';
COMMENT ON COLUMN artworks.title IS '作品标题';
COMMENT ON COLUMN artworks.content_type IS '内容类型：image(图像)、video(视频)、audio(音频)、text(文本)';
COMMENT ON COLUMN artworks.content_url IS '作品内容URL';
COMMENT ON COLUMN artworks.thumbnail_url IS '缩略图URL（可选）';
COMMENT ON COLUMN artworks.prompt IS '生成提示词';
COMMENT ON COLUMN artworks.input_image_url IS '输入图像URL（用于图像转换类工具）';
COMMENT ON COLUMN artworks.output_image_url IS '输出图像URL';
COMMENT ON COLUMN artworks.output_metadata IS '输出元数据，JSON格式，存储尺寸、格式等信息';
COMMENT ON COLUMN artworks.tool_name IS '工具名称';
COMMENT ON COLUMN artworks.is_favorite IS '是否收藏';
COMMENT ON COLUMN artworks.is_public IS '是否公开';
COMMENT ON COLUMN artworks.created_at IS '创建时间';
COMMENT ON COLUMN artworks.updated_at IS '最后更新时间';

-- =====================================================
-- 2. 创建索引以优化查询性能
-- =====================================================

-- 用户作品查询索引
CREATE INDEX IF NOT EXISTS idx_artworks_user_id ON artworks(user_id);

-- 工具类型查询索引
CREATE INDEX IF NOT EXISTS idx_artworks_tool_id ON artworks(tool_id);

-- 内容类型查询索引
CREATE INDEX IF NOT EXISTS idx_artworks_content_type ON artworks(content_type);

-- 收藏作品查询索引
CREATE INDEX IF NOT EXISTS idx_artworks_is_favorite ON artworks(is_favorite) WHERE is_favorite = TRUE;

-- 公开作品查询索引
CREATE INDEX IF NOT EXISTS idx_artworks_is_public ON artworks(is_public) WHERE is_public = TRUE;

-- 创建时间排序索引
CREATE INDEX IF NOT EXISTS idx_artworks_created_at ON artworks(created_at DESC);

-- 复合索引：用户+工具类型
CREATE INDEX IF NOT EXISTS idx_artworks_user_tool ON artworks(user_id, tool_id);

-- 复合索引：用户+内容类型
CREATE INDEX IF NOT EXISTS idx_artworks_user_content_type ON artworks(user_id, content_type);

-- =====================================================
-- 3. 创建更新时间触发器
-- =====================================================

-- 为artworks表创建触发器（复用已有的触发器函数）
CREATE TRIGGER update_artworks_updated_at 
    BEFORE UPDATE ON artworks 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 4. 设置行级安全策略 (RLS)
-- =====================================================

-- 启用行级安全
ALTER TABLE artworks ENABLE ROW LEVEL SECURITY;

-- 用户只能查看自己的作品或公开的作品
CREATE POLICY "Users can view own artworks or public artworks" ON artworks
    FOR SELECT USING (
        auth.uid() = user_id OR is_public = TRUE
    );

-- 用户只能插入自己的作品
CREATE POLICY "Users can insert own artworks" ON artworks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 用户只能更新自己的作品
CREATE POLICY "Users can update own artworks" ON artworks
    FOR UPDATE USING (auth.uid() = user_id);

-- 用户只能删除自己的作品
CREATE POLICY "Users can delete own artworks" ON artworks
    FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- 5. 创建视图以便于查询
-- =====================================================

-- 创建用户作品统计视图
CREATE OR REPLACE VIEW user_artwork_stats AS
SELECT 
    user_id,
    COUNT(*) as total_artworks,
    COUNT(*) FILTER (WHERE is_favorite = TRUE) as favorite_count,
    COUNT(*) FILTER (WHERE is_public = TRUE) as public_count,
    COUNT(*) FILTER (WHERE content_type = 'image') as image_count,
    COUNT(*) FILTER (WHERE content_type = 'video') as video_count,
    COUNT(*) FILTER (WHERE content_type = 'audio') as audio_count,
    COUNT(*) FILTER (WHERE content_type = 'text') as text_count,
    MAX(created_at) as last_created_at
FROM artworks
GROUP BY user_id;

-- 为视图添加注释
COMMENT ON VIEW user_artwork_stats IS '用户作品统计视图，提供各类作品数量统计';

-- =====================================================
-- 完成提示
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '✅ AI美育作品表创建完成！';
    RAISE NOTICE '📋 已创建表：artworks';
    RAISE NOTICE '🔍 已创建索引：8个查询优化索引';
    RAISE NOTICE '🔒 已设置RLS策略：用户数据隔离和公开作品访问';
    RAISE NOTICE '📊 已创建视图：user_artwork_stats（用户作品统计）';
    RAISE NOTICE '🔧 已创建触发器：自动更新artworks.updated_at';
    RAISE NOTICE '🎨 AI美育功能现在可以正常使用了！';
END $$; 