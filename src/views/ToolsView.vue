<template>
    <div class="tools-view">
      <h1>AI工具箱</h1>
      
      <div class="tool-card">
        <h2>数学解题助手</h2>
        <textarea v-model="mathQuestion" placeholder="输入数学问题"></textarea>
        <button @click="solveMathProblem">获取解答</button>
        <div class="response" v-if="mathAnswer">
          <h3>解答:</h3>
          <p>{{ mathAnswer }}</p>
        </div>
      </div>
      
      <div class="tool-card">
        <h2>写作辅助</h2>
        <textarea v-model="writingPrompt" placeholder="输入写作主题"></textarea>
        <button @click="generateWriting">生成内容</button>
        <div class="response" v-if="writingOutput">
          <h3>结果:</h3>
          <p>{{ writingOutput }}</p>
        </div>
      </div>
      
      <button @click="$router.push('/dashboard')">返回首页</button>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import { DifyService } from '@/services/dify';
  
  const mathQuestion = ref('');
  const mathAnswer = ref('');
  const writingPrompt = ref('');
  const writingOutput = ref('');
  
  const solveMathProblem = async () => {
    if (!mathQuestion.value.trim()) return;
    
    mathAnswer.value = '正在为您解答...';
    mathAnswer.value = await DifyService.executeWorkflow('数学解题工作流ID', {
      question: mathQuestion.value
    });
  }
  
  const generateWriting = async () => {
    if (!writingPrompt.value.trim()) return;
    
    writingOutput.value = '正在为您创作...';
    writingOutput.value = await DifyService.executeWorkflow('写作辅助工作流ID', {
      topic: writingPrompt.value
    });
  }
  </script>
  
  <style scoped>
  .tools-view {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
  }
  
  .tool-card {
    background: #fff;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 25px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  
  .tool-card h2 {
    margin-top: 0;
    color: #2c3e50;
    font-size: 1.5em;
    border-bottom: 1px solid #eee;
    padding-bottom: 10px;
    margin-bottom: 15px;
  }
  
  textarea {
    width: 100%;
    min-height: 100px;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    margin-bottom: 10px;
    font-size: 1em;
  }
  
  button {
    background: #3498db;
    color: white;
    border: none;
    padding: 10px 15px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1em;
    transition: background 0.3s;
  }
  
  button:hover {
    background: #2980b9;
  }
  
  .response {
    margin-top: 20px;
    padding: 15px;
    background: #f9f9f9;
    border-left: 4px solid #3498db;
  }
  
  .response h3 {
    margin-top: 0;
  }
  </style>