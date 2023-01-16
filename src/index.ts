import { Context, Schema } from 'koishi'
import {ActionService, Workflow} from "./registry";
import {PreRegisteredTriggers} from "./triggers";
import {PreRegisteredMatchers} from "./matchers";
import {PreRegisteredActions} from "./actions";
export const name = 'action'

declare module 'koishi'{
  interface Context{
    action:ActionService
  }
}

export interface Config{
  workflows : Workflow[]
}

export const Config:Schema<Config>=Schema.object({
  workflows:Schema.array(Schema.object({
    id:Schema.string(),
    triggers:Schema.array(
        Schema.object({
          type:Schema.string(),
          config:Schema.dict(Schema.string())
        })
    ),
    matchers:Schema.array(
      Schema.object({
        type:Schema.string(),
        config:Schema.dict(Schema.string())
      })
    ),
    actions:Schema.array(
      Schema.object({
        type:Schema.string(),
        config:Schema.dict(Schema.string())
      })
    )
  }))
})

export function apply(ctx: Context,config:Config) {
  ctx.plugin(ActionService);
  ctx.using(['action'],(ctx)=>{
    PreRegisteredTriggers.forEach((t)=>ctx.action.triggers.set(t.id,t))
    PreRegisteredMatchers.forEach((t)=>ctx.action.matchers.set(t.id,t))
    PreRegisteredActions.forEach((t)=>ctx.action.actions.set(t.id,t))
    config.workflows.forEach((w)=>{
      ctx.action.workflows.set(w.id,w);
    })
    ctx.action.load()
  })
}
