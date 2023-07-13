import { Schema } from "koishi"

export const MessageContentMatcher = Schema.object({
    type: Schema.const('message_content').required(),
    regex: Schema.boolean().description("是否启用正则表达式功能").default(true).hidden(),
    content: Schema.string().description("要匹配的内容 (支持正则表达式)").required()
})

export const SegmentTypeMatcher = Schema.object({
    type: Schema.const('segment_type').required(),
    segment_type: Schema.union([
        Schema.const("xml").description("XML卡片消息"),
        Schema.const("json").description("JSON卡片消息"),
        Schema.const("quote").description("引用消息"),
        Schema.const("at").description("艾特消息"),
        Schema.const("file").description("文件消息"),
        Schema.string().description("其他类型"),
    ]).description("匹配的消息类型").default('xml')
})

export const Matcher = Schema.intersect([
    Schema.object({
        type: Schema.union([
            Schema.const("message_content").description("匹配原始消息内容"),
            Schema.const("segment_type").description("匹配消息类型")
        ]).required().description('监听类型')
    }),
    Schema.union([MessageContentMatcher, SegmentTypeMatcher])
] as const)

export const RecallAction = Schema.object({
    type: Schema.const('recall').required()
})

export const SendMessageAction = Schema.object({
    type: Schema.const('send_message').required(),
    content: Schema.string().description("发送的消息内容")
})

export const MuteAction = Schema.object({
    type: Schema.const('mute').required(),
    time: Schema.number().min(0).description("禁言时长 (单位: 毫秒)")
})

export const Action = Schema.intersect([
    Schema.object({
        type: Schema.union([
            Schema.const("mute").description("禁言用户"),
            Schema.const("recall").description("撤回消息"),
            Schema.const("send_message").description("发送消息")
        ]).required().description("操作类型")
    }),
    Schema.union([RecallAction, SendMessageAction, MuteAction])
] as const)

export const Config: Schema<Config> = Schema.object({
    actions: Schema.array(Schema.object({
        name: Schema.string().description("规则名称"),
        matchers: Schema.array(Matcher).description("匹配器, 只有所有匹配器都满足才会执行Actions中的内容").default([]),
        actions: Schema.array(Action).description("执行器, 做一些事情").default([])
    })).default([])
})

export interface ActionEntries {
    name: string,
    matchers: Matcher[]
    actions: Action[]
}

export interface Config {
    actions: ActionEntries[]
}


export interface MuteAction {
    type: 'mute',
    time: number
}

export interface SendMessageAction {
    type: 'send_message',
    content: string
}

export interface RecallAction {
    type: 'recall'
}

export type Action = RecallAction | SendMessageAction | MuteAction


export interface SegmentTypeMatcher {
    type: 'segment_type',
    segment_type: string
}

export interface MessageContentMatcher {
    type: 'message_content',
    regex: boolean,
    content: string
}

export type Matcher = MessageContentMatcher | SegmentTypeMatcher;