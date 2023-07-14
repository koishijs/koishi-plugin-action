import { Argv, Awaitable, Context, Logger, Schema, Service, Session } from "koishi"


export interface Features {
  session: Session,
  argv: Argv
}

export interface BaseEntity<C> {
  id: string
  description?: string
  Config?: Schema<C>
  features?: readonly string[]
}

export interface Trigger<C = any, F extends Features = any> extends BaseEntity<C> {
  apply: (ctx: Context, config: C, callback: (features: Partial<F>) => void) => Awaitable<void>
}

export interface Matcher<C = any, F extends Features = any> extends BaseEntity<C> {
  match: (ctx: Context, config: C, features: Partial<F>) => Awaitable<boolean>
}

export interface Action<C = any, F extends Features = any> extends BaseEntity<C> {
  run: (ctx: Context, config: C, features: Partial<F>) => void
}

export interface EntityConfig {
  type: string
  config: any
}

export interface Workflow {
  id: string
  triggers: EntityConfig[]
  matchers: EntityConfig[]
  actions: EntityConfig[]
}

export class ActionService extends Service {
  triggers: Map<string, Trigger> = new Map()
  matchers: Map<string, Matcher> = new Map()
  actions: Map<string, Action> = new Map()
  workflows: Map<string, Workflow> = new Map()
  contexts: Map<string, Context> = new Map()
  protected logger: Logger

  constructor(ctx: Context) {
    super(ctx, 'action');
    this.logger = ctx.logger('action')
  }

  createContext(id: string) {
    if (this.contexts.has(id)) {
      this.contexts.get(id).dispose()
    }
    let ctx = this.ctx.extend()
    this.contexts.set(id, ctx)
    return ctx
  }

  load() {
    this.workflows.forEach((workflow) => {
      try {
        const ctx = this.createContext(workflow.id)
        const action_callback = this.buildAction(ctx, workflow)
        const matcher_callback = this.buildMatcher(ctx, workflow, action_callback)
        this.buildTrigger(ctx, workflow, matcher_callback)
      } catch (e) {
        this.logger.error(e)
        this.logger.error("Failed to load workflow " + workflow.id)
      }
    })
  }

  buildAction(ctx, workflow) {
    let actions = workflow.actions.map((action) => {
      if (!this.actions.has(action.type)) return () => { }
      const action_instance = this.actions.get(action.type)
      const config = action_instance.Config?.(action.config)

      return (futures) => (!action_instance.features || action_instance.features.every(t => futures[t]))
        && action_instance.run(ctx, config, futures)
    })
    return (futures) => {
      actions.forEach(a => a(futures))
    }
  }

  buildMatcher(ctx, workflow, action_callback) {
    let matchers = workflow.matchers.map((matcher) => {
      if (!this.matchers.has(matcher.type)) return () => false;
      const matcher_instance = this.matchers.get(matcher.type)
      const config = matcher_instance.Config?.(matcher.config)
      return async (futures) => (!matcher_instance.features || matcher_instance.features.every(t => futures[t]))
        && await matcher_instance.match(ctx, config, futures) && action_callback(futures);
    })

    if (!workflow.matchers.length) {
      this.logger.warn(`The workflow ${workflow.id} has no matchers. This workflow will not be apply`)
    }

    return async (futures: Features) => {
      if ((await Promise.all(matchers.map((matcher) => { matcher(futures) }))).every(t => t))
        action_callback(futures)
    }
  }

  buildTrigger(ctx, workflow, matcher_callback) {
    workflow.triggers.forEach((trigger) => {
      const trigger_instance = this.triggers.get(trigger.type)
      if (trigger_instance)
        trigger_instance.apply(ctx, trigger_instance.Config?.(trigger.config), matcher_callback)
    })
  }
}
