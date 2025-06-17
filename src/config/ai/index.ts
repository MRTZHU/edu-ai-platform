const aiConfig: AiConfig = {
    enable: true,
    apps: {
        interview: {
            id: "interview",
            name: "AI面试官",
            description: "AI面试官，帮助你进行面试准备和模拟面试",
            icon: "heroicons-outline:user-circle",
            iconBgColor: "#e0f2fe",
            type: "chat",
            typename: "AI面试官",
            path: "/ai-interview",
            category: "问题",
            apikey: "VITE_DIFY_API_KEY_INTERVIEW",
        },
        translator: {
            id: "translator",
            name: "AI翻译",
            description: "AI翻译，帮助你进行翻译",
            icon: "heroicons-outline:user-circle",
            iconBgColor: "#e0f2fe",
            type: "chat",
            typename: "AI翻译",
            path: "/ai-translator",
            category: "问题",
            apikey: "VITE_DIFY_API_KEY_TRANSLATOR",
        },

        painting: {
            id: "painting",
            name: "AI绘画",
            description: "AI绘画，帮助你进行绘画",
            icon: "heroicons-outline:user-circle",
            iconBgColor: "#e0f2fe",
            type: "workflow",
            typename: "AI绘画",
            path: "/ai-painting",
            category: "问题",
            apikey: "VITE_DIFY_API_KEY_PAINTING",
        },
        ai_edu_assistant: {
            id: "ai_edu_assistant",
            name: "AI教育助手",
            description: "AI教育助手，帮助你进行教育工作",
            icon: "heroicons-outline:user-circle",
            iconBgColor: "#e0f2fe",
            type: "agent",
            typename: "AI教育助手",
            path: "/ai-edu-assistant",
            category: "问题",
            apikey: "VITE_DIFY_API_KEY_AI_EDU_ASSISTANT",
        },
        ai_edu_assistant_2: {
            id: "ai_edu_assistant_2",
            name: "AI教育助手2",
            description: "AI教育助手2，帮助你进行教育工作",
            icon: "heroicons-outline:user-circle",
            iconBgColor: "#e0f2fe",
            type: "agent",
            typename: "AI教育助手",
            path: "/ai-edu-assistant",
            category: "问题",
            apikey: "VITE_DIFY_API_KEY_AI_EDU_ASSISTANT",
        }
        
        
    }
};

interface AiConfig {
    enable: boolean;
    apps: {
        [key: string]: DifyAppConfig;
    };
}

export type AppKey = keyof typeof aiConfig.apps;

export interface DifyAppConfig {
    id: string;
    name: string;
    description: string;
    icon: string;
    iconBgColor: string;
    type: string;
    typename: string;
    path: string;
    category: string;
    tags?: string[];
    apikey: string;
}

export default aiConfig; 