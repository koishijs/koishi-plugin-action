import { Context, Schema } from 'koishi'
import { ActionService, Workflow, EntityConfig, BaseEntity } from "./runtime"
import { PreRegisteredTriggers } from "./triggers"
import { PreRegisteredMatchers } from "./matchers"
import { PreRegisteredActions } from "./actions"
export const name = 'action'

declare module 'koishi' {
  interface Context {
    action: ActionService
  }
}

export interface Config {
  workflows: Workflow[]
}

function GenerateConfig<C = any>(args: BaseEntity<C>[]): Schema<EntityConfig> {
  const types = []
  const configs = []
  for (const arg of args) {
    types.push(Schema.const(arg.id).description(arg.description))
    const config = arg.Config ? { config: arg.Config } : {}
    configs.push(Schema.object({
      type: Schema.const(arg.id).required(),
      ...config
    }))
  }
  return Schema.intersect([
    Schema.object({
      type: Schema.union(types).required().description('类型'),
    }),
    Schema.union(configs),
  ])
}

export const Config: Schema<Config> = Schema.object({
  workflows: Schema.array(Schema.object({
    id: Schema.string(),
    triggers: Schema.array(GenerateConfig(PreRegisteredTriggers)).description('触发器'),
    matchers: Schema.array(GenerateConfig(PreRegisteredMatchers)).description('匹配器'),
    actions: Schema.array(GenerateConfig(PreRegisteredActions)).description('执行器')
  }))
})

export function apply(ctx: Context, config: Config) {
  ctx.plugin(ActionService)
  ctx.using(['action'], ({ action }) => {
    for (const t of PreRegisteredTriggers) {
      action.triggers.set(t.id, t)
    }
    for (const m of PreRegisteredMatchers) {
      action.matchers.set(m.id, m)
    }
    for (const a of PreRegisteredActions) {
      action.actions.set(a.id, a)
    }
    for (const w of config.workflows) {
      action.workflows.set(w.id, w)
    }
    action.load()
  })
}
