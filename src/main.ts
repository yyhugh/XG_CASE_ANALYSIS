import { Application, ApplicationContext } from "@/application"; // @ is an alias to /src

// 获取应用上下文
const context = ApplicationContext.current;

// 启动应用程序
Application.instance.start(context);
