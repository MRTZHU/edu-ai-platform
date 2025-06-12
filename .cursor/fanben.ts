const aiConfig: aiConfig = {
    enable:true,
    apps:{
        interview:{
            id:"interview",
            name:"AI面试官",
            description:"AI面试官，帮助你进行面试准备和模拟面试",
            icon:"heroicons-outline:user-circle",
            iconBgColor:"#e0f2fe",
            type:"chat",
            typename:"AI面试官",
            path:"/ai-interview",
            category:"问题",
            apikey:"VITE_DIFY_API_KEY_INTERVIEW",
        },
        translator:{
            id:"translator",
            name:"AI翻译",
            description:"AI翻译，帮助你进行翻译",
            icon:"heroicons-outline:user-circle",
            iconBgColor:"#e0f2fe",
            type:"chat",
            typename:"AI翻译",
            path:"/ai-translator",
            category:"问题",
            apikey:"VITE_DIFY_API_KEY_TRANSLATOR",
        }
    }
};

interface aiConfig{
    enable:boolean,
    apps:{
        [key:string]:DifyappConfig            
        };
    }

export type appkey = keyof typeof aiConfig.apps;

export interface DifyappConfig{
    id:string,
    name:string,
    description:string,
    icon:string,
    iconBgColor:string,
    type:string,
    typename:string,
    path:string,
    category:string,
    tags?:string[],
    apikey:string,
}

export default aiConfig;
