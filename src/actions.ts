import {Schema, Session} from "koishi";

export interface MuteAction{
  type:'mute',
  time:number
}
export const MuteAction = Schema.object({
  type:Schema.const('mute'),
  time:Schema.number().description("禁言时长")
}).description("禁言该用户")

export async function muteAction(session:Session,action:MuteAction){
  await session.bot.muteGuildMember(session.guildId,session.userId,action.time,"spam")
}

export interface SendMessageAction{
  type:'send_message',
  content:string
}
export const SendMessageAction = Schema.object({
  type:Schema.const('send_message').required(),
  content:Schema.string().description("发送的消息内容")
}).description("发送消息")
export async function sendMessageAction(session:Session,action:SendMessageAction){
  await session.send(action.content);
}

export interface RecallAction{
  type:'recall'
}
export const RecallAction = Schema.object({
  type:Schema.const('recall').required()
}).description("撤回消息")
export async function recallAction(session:Session,action:RecallAction){
  if(session.messageId)await session.bot.deleteMessage(session.cid,session.messageId)
}

export type Action = RecallAction | SendMessageAction | MuteAction

export const Action = Schema.intersect([
  Schema.object({
    type:Schema.union(['mute','recall','send_message'])
  }),
  Schema.union([RecallAction,SendMessageAction,MuteAction] as const)
])

export const actions = {
  recall:recallAction,
  send_message:sendMessageAction,
  mute:muteAction
}
