import { createClient } from "@supabase/supabase-js";

// Supabase配置
const supabaseConfig = {
  url: import.meta.env.VITE_SUPABASE_URL as string,
  key: import.meta.env.VITE_SUPABASE_KEY as string,
};

// 创建Supabase客户端
export const supabase = createClient(supabaseConfig.url, supabaseConfig.key);

// 导出配置对象
export { supabaseConfig };

// 数据库连接状态检查
export const checkDbConnection = async () => {
  try {
    const { data, error } = await supabase.from('_health').select('*').limit(1);
    return { connected: !error, error };
  } catch (error) {
    return { connected: false, error };
  }
};

export default supabase; 