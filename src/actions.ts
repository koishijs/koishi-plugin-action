import {Action} from "./registry";
import {Schema} from "koishi";

const LoggerAction : Action = {
  id: "logger",
  run(ctx,config,features){
    ctx.logger("action-logger").info(config);
  }
}

interface SendMessageActionConfig{
  message:string
}
const SendMessageAction : Action<SendMessageActionConfig> = {
  id: "send-message",
  Config:Schema.object({
    message:Schema.string()
  }),
  async run(ctx,config,features){
    if(features.session && features.session.channelId)
      await features.session.send(config.message)
  }
}

interface MuteActionConfig{
  time:number
}
const MuteAction : Action<MuteActionConfig> = {
  id: "mute",
  Config:Schema.object({
    time:Schema.number()
  }),
  async run(ctx,config,features){
    if(features.session && features.session.guildId)
      await features.session.bot.muteGuildMember(features.session.guildId,features.session.userId,config.time*1000)
  }
}

const RecallMessageAction : Action = {
  id: "recall-message",
  async run(ctx,config,features){
    if(features.session && features.session.messageId && features.session.guildId)
      await features.session.bot.deleteMessage(features.session.cid,features.session.messageId)
  }
}

export const PreRegisteredActions = [
  LoggerAction,
  SendMessageAction,
  MuteAction,
  RecallMessageAction
]
