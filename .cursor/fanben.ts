const aiConfig: aiConfig = {
    enable:true,
    app:{
        interview:{
            id:"interview",
            name:"AI面试官",
            description:"AI面试官，帮助你进行面试准备和模拟面试",
            icon:"heroicons-outline:user-circle",
            iconBgColor:"#e0f2fe",
            type:"chat",
            typename:"AI面试官",
            path:"/ai-interview",
            apikey:"DIFY_API_KEY_LESSON_PLANNER",
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
    tags?:string[],
    apikey:string,
}

export default aiConfig;
