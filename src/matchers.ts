import {Schema, Session} from "koishi";

export interface SegmentTypeMatcher{
  type:'segment_type',
  segment_type: string
}
export const SegmentTypeMatcher = Schema.object({
  type:Schema.const('segment_type').required(),
  segment_type:Schema.union([
    Schema.const("xml").description("XML卡片消息"),
    Schema.const("quote").description("引用消息"),
    Schema.const("at").description("艾特消息"),
    Schema.const("file").description("文件消息"),
    Schema.string().description("其他类型")
  ]).description("匹配的消息类型").required()
}).description("匹配消息类型")

export function segmentTypeMatcher(session:Session,config:SegmentTypeMatcher){
  if(!session.elements)return false;
  return session.elements.some(t=>t.type == config.segment_type)
}


export interface MessageContentMatcher{
  type:'message_content',
  regex:boolean,
  content:string
}
export const MessageContentMatcher = Schema.object({
  type:Schema.const('message_content').required(),
  regex:Schema.boolean().description("是否启用正则表达式功能").default(true),
  content:Schema.string().description("要匹配的内容").required()
}).description("匹配原始消息内容")
export function messageContentMatcher(session:Session,config:MessageContentMatcher){
  if(config.regex)
    return !!session.content.match(new RegExp(config.content));
  return session.content.includes(config.content);
}

export type Matcher = MessageContentMatcher | SegmentTypeMatcher;
export const Matcher = Schema.intersect([
  Schema.object({
    type:Schema.union([
      Schema.const("message_content").description("匹配原始消息内容"),
      Schema.const("segment_type").description("匹配消息类型")
    ]).required()
  }),
  Schema.union([MessageContentMatcher, SegmentTypeMatcher] as const)
])
export const matchers = {
  message_content:messageContentMatcher,
  segment_type:segmentTypeMatcher
}
