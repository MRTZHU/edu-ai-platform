export class DifyService {
    static async executeWorkflow(workflowId, inputs) {
      try {
        const response = await fetch('https://api.dify.ai/v1/workflows/run', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_DIFY_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            workflow_id: workflowId,
            inputs: inputs,
            response_mode: "blocking"
          })
        });
        
        if (!response.ok) {
          throw new Error(`Dify请求失败: ${response.status}`);
        }
        
        const data = await response.json();
        return data.output;
        
      } catch (error) {
        console.error('Dify服务错误:', error);
        return `抱歉，处理您的请求时出错: ${error.message}`;
      }
    }
  }