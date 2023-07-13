import { Context, Session } from 'koishi'
import { Config, MessageContentMatcher, SegmentTypeMatcher, RecallAction, SendMessageAction, MuteAction } from './config'

export const name = 'action'
export { Config }

function messageContentMatcher(session: Session, config: MessageContentMatcher) {
  if (config.regex)
    return new RegExp(config.content).test(session.content)
  return session.content.includes(config.content)
}

function segmentTypeMatcher(session: Session, config: SegmentTypeMatcher) {
  if (!session.elements) return false
  return session.elements.some(t => t.type === config.segment_type)
}

const matchers = {
  message_content: messageContentMatcher,
  segment_type: segmentTypeMatcher
}

async function recallAction(session: Session, config: RecallAction) {
  await session.bot.deleteMessage(session.channelId, session.messageId)
}

async function sendMessageAction(session: Session, config: SendMessageAction) {
  await session.send(config.content)
}

async function muteAction(session: Session, config: MuteAction) {
  await session.bot.muteGuildMember(session.guildId, session.userId, config.time)
}

const actions = {
  recall: recallAction,
  send_message: sendMessageAction,
  mute: muteAction
}

export function apply(ctx: Context, config: Config) {
  const logger = ctx.logger('action')
  ctx.middleware((session, next) => {
    for (const action of config.actions) {
      if (action.matchers.length === 0) {
        logger.warn(`The action [${action.name}] has no matcher. It will be ignored.`)
      }
      if (action.matchers.every(matcher => matchers[matcher.type](session, matcher as any))) {
        logger.info('Running action', action.name)
        action.actions.forEach(action => actions[action.type](session, action as any))
      }
    }
    return next()
  })
}