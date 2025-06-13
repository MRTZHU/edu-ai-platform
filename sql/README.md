# Supabase教育应用 - 数据库SQL模板

## 📋 概述

本目录包含了Supabase教育应用AI对话系统的完整数据库设置模板，包括表结构创建、行级安全策略(RLS)设置和性能优化索引。

## 📁 文件结构

```
sql/
├── 01_create_tables.sql      # 数据库表结构创建
├── 02_create_rls_policies.sql # 行级安全策略设置
├── 03_create_indexes.sql     # 性能优化索引创建
└── README.md                 # 使用说明文档
```

## 🚀 快速开始

### 方法一：Supabase Dashboard执行（推荐）

1. **登录Supabase Dashboard**
   - 访问 [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - 选择您的项目

2. **打开SQL编辑器**
   - 在左侧导航栏点击 "SQL Editor"
   - 点击 "New query" 创建新查询

3. **按顺序执行SQL文件**
   ```sql
   -- 第一步：创建表结构
   -- 复制 01_create_tables.sql 的内容并执行
   
   -- 第二步：设置RLS策略
   -- 复制 02_create_rls_policies.sql 的内容并执行
   
   -- 第三步：创建性能索引
   -- 复制 03_create_indexes.sql 的内容并执行
   ```

### 方法二：使用Supabase CLI

```bash
# 确保已安装并登录Supabase CLI
supabase login

# 链接到您的项目
supabase link --project-ref YOUR_PROJECT_REF

# 执行SQL文件
supabase db push --include-all

# 或者单独执行每个文件
psql -h YOUR_DB_HOST -U postgres -d postgres -f sql/01_create_tables.sql
psql -h YOUR_DB_HOST -U postgres -d postgres -f sql/02_create_rls_policies.sql
psql -h YOUR_DB_HOST -U postgres -d postgres -f sql/03_create_indexes.sql
```

## 📊 数据库架构

### 核心表结构

#### 1. conversations（对话会话表）
- **用途**：存储用户的AI对话会话
- **主要字段**：
  - `id`: 会话唯一标识符
  - `user_id`: 用户ID（关联auth.users）
  - `tool_id`: AI工具标识符
  - `title`: 对话标题
  - `conversation_id`: Dify API返回的对话ID
  - `created_at/updated_at`: 时间戳

#### 2. messages（消息表）
- **用途**：存储对话中的具体消息内容
- **主要字段**：
  - `id`: 消息唯一标识符
  - `conversation_id`: 所属对话会话ID
  - `user_id`: 用户ID
  - `message_type`: 消息类型（user/assistant/system）
  - `content`: 消息内容
  - `metadata`: JSON元数据（存储AI思考过程等）

#### 3. user_files（用户文件表）
- **用途**：存储用户上传的文件信息
- **主要字段**：
  - `id`: 文件记录唯一标识符
  - `user_id`: 用户ID
  - `file_name/file_type/file_url`: 文件基本信息
  - `conversation_id`: 关联的对话ID（可选）

## 🔒 安全策略

### RLS（行级安全）策略

所有表都启用了行级安全策略，确保：

- ✅ **数据隔离**：用户只能访问自己的数据
- ✅ **完整CRUD权限**：每个表都有SELECT、INSERT、UPDATE、DELETE策略
- ✅ **权限验证**：基于`auth.uid()`进行用户身份验证
- ✅ **管理员支持**：预留管理员访问策略（可选启用）

### 验证RLS设置

```sql
-- 检查RLS策略设置
SELECT * FROM verify_rls_policies();
```

## ⚡ 性能优化

### 索引策略

#### 主要索引类型：
1. **单列索引**：用户ID、工具ID、时间戳等
2. **复合索引**：常见查询组合（如用户+工具、用户+时间）
3. **部分索引**：条件性索引（如非空字段）
4. **GIN索引**：JSONB数据和全文搜索
5. **表达式索引**：计算字段索引

#### 优化场景：
- 📈 用户对话历史查询
- 📈 消息按时间排序
- 📈 工具相关数据筛选
- 📈 AI思考过程搜索
- 📈 消息内容全文搜索

### 性能监控

```sql
-- 监控索引使用情况
SELECT * FROM analyze_index_usage();

-- 检查表和索引大小
SELECT * FROM analyze_table_sizes();

-- 获取维护建议
SELECT * FROM get_index_maintenance_tips();
```

## 🛠️ 维护操作

### 定期维护任务

```sql
-- 更新表统计信息（建议每月执行）
ANALYZE;

-- 检查索引使用情况
SELECT * FROM analyze_index_usage();

-- 清理未使用的索引（谨慎操作）
-- DROP INDEX IF EXISTS unused_index_name;
```

### 故障排除

#### 常见问题：

1. **RLS策略阻止访问**
   ```sql
   -- 检查当前用户
   SELECT auth.uid();
   
   -- 临时禁用RLS（仅用于调试）
   ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;
   ```

2. **查询性能问题**
   ```sql
   -- 分析查询执行计划
   EXPLAIN ANALYZE SELECT * FROM conversations WHERE user_id = auth.uid();
   ```

3. **索引重建**
   ```sql
   -- 重建特定索引
   REINDEX INDEX index_name;
   
   -- 重建表的所有索引
   REINDEX TABLE table_name;
   ```

## 📝 使用注意事项

### ⚠️ 重要提醒

1. **执行顺序**：必须按照文件编号顺序执行（01→02→03）
2. **权限要求**：需要数据库管理员权限
3. **备份建议**：在生产环境执行前请先备份数据库
4. **测试验证**：建议先在开发环境测试所有SQL脚本

### 🔧 自定义配置

如需自定义配置，可以修改以下内容：

- **表结构**：在`01_create_tables.sql`中调整字段定义
- **安全策略**：在`02_create_rls_policies.sql`中修改RLS规则
- **索引策略**：在`03_create_indexes.sql`中添加或删除索引

### 📞 技术支持

如遇到问题，请检查：

1. **Supabase日志**：Dashboard → Logs → Database
2. **SQL执行结果**：查看执行输出中的NOTICE信息
3. **权限设置**：确认用户具有必要的数据库权限

## 🎯 下一步

数据库设置完成后，您可以：

1. ✅ 启动前端应用进行测试
2. ✅ 验证用户注册和登录功能
3. ✅ 测试AI对话功能
4. ✅ 检查数据持久化是否正常工作

---

**版本信息**：v1.0  
**最后更新**：2024-12-19  
**兼容性**：Supabase PostgreSQL 15+ 