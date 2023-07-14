import { Action, EntityConfig } from "./runtime"
import { Schema } from "koishi"

interface LoggerActionConfig {
  message: string
}
const LoggerAction: Action<LoggerActionConfig> = {
  id: "logger",
  description: "打印日志",
  Config: Schema.object({
    message: Schema.string().description('日志内容').required()
  }),
  run(ctx, config, features) {
    ctx.logger("action-logger").info(config.message)
  }
}

interface SendMessageActionConfig {
  message: string
}
const SendMessageAction: Action<SendMessageActionConfig> = {
  id: "send-message",
  description: "发送消息",
  Config: Schema.object({
    message: Schema.string().description('消息内容').required()
  }),
  async run(ctx, config, features) {
    if (features.session && features.session.channelId)
      await features.session.send(config.message)
  }
}

interface MuteActionConfig {
  time: number
}
const MuteAction: Action<MuteActionConfig> = {
  id: "mute",
  description: "禁言用户",
  Config: Schema.object({
    time: Schema.number().min(0).description('禁言时长').required()
  }),
  async run(ctx, config, features) {
    if (features.session && features.session.guildId)
      await features.session.bot.muteGuildMember(features.session.guildId, features.session.userId, config.time * 1000)
  }
}

const RecallMessageAction: Action = {
  id: "recall-message",
  description: "撤回消息",
  async run(ctx, config, features) {
    if (features.session && features.session.messageId && features.session.guildId)
      await features.session.bot.deleteMessage(features.session.cid, features.session.messageId)
  }
}

const KickMemberAction: Action = {
  id: "kick-member",
  description: "移出用户",
  async run(ctx, config, features) {
    if (features.session && features.session.guildId)
      await features.session.bot.kickGuildMember(features.session.guildId, features.session.userId)
  }
}

export const PreRegisteredActions = [
  LoggerAction,
  SendMessageAction,
  MuteAction,
  RecallMessageAction,
  KickMemberAction
]