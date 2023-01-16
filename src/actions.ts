import {Action} from "./registry";

const LoggerAction : Action = {
  id: "logger",
  run(ctx,config,features){
    ctx.logger("action-logger").info(config);
  }
}

export const PreRegisteredActions = [
  LoggerAction
]
