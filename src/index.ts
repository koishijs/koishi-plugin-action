import { Context, Schema } from 'koishi'
import {Action, actions} from "./actions";
import {Matcher, matchers} from "./matchers";
export const name = 'action'

export interface ActionEntries{
  name:string,
  matchers:Matcher[]
  actions:Action[]
}

export interface Config {
  actions:ActionEntries[]
}

export const Config: Schema<Config> = Schema.object({
  actions:Schema.array(Schema.object({
    name:Schema.string().description("规则名称"),
    matchers:Schema.array(Matcher).description("匹配器,只有所有匹配器都满足才会执行Actions中的内容"),
    actions:Schema.array(Action).description("执行器,执行一些事务")
  }))
}) as any;

export function apply(ctx: Context,config:Config) {
  const logger = ctx.logger("action")
  ctx.middleware((session, next)=>{
    if(config.actions){
      config.actions.forEach(action=>{
        if(!action.matchers || !action.matchers.length){
          logger.warn("The action ["+(action.name)+"] has no matcher. It will be ignored.")
        }
        if(action.matchers.every(matcher=>matchers[matcher.type](session,matcher as any))){
          logger.info("Running action",action.name)
          action.actions.forEach(action=>actions[action.type](session,action as any))
        }
      })
    }
    return next();
  })
}
