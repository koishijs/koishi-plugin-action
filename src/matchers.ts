import { Matcher } from "./runtime";
import { Schema } from "koishi";

const AlwaysExecuteMatcher: Matcher = {
  id: "always-execute",
  description: "始终匹配",
  match() {
    return true
  }
}


interface SegmentTypeMatcherConfig {
  type: string
}
const SegmentTypeMatcher: Matcher<SegmentTypeMatcherConfig> = {
  id: "segment-type",
  description: "匹配类型消息",
  Config: Schema.object({
    type: Schema.union([
      Schema.const("xml").description("XML卡片消息"),
      Schema.const("json").description("JSON卡片消息"),
      Schema.const("quote").description("引用消息"),
      Schema.const("at").description("艾特消息"),
      Schema.const("file").description("文件消息"),
      Schema.string().description("其他类型"),
    ]).description("匹配的消息类型").required()
  }),
  match(ctx, config, features) {
    return features.session.elements.some((s) => s.type === config.type)
  }
}

interface RawMessageContentMatcherConfig {
  regex: boolean,
  content: string
}
const RawMessageContentMatcher: Matcher<RawMessageContentMatcherConfig> = {
  id: "raw-message-content",
  description: "匹配原始消息",
  Config: Schema.object({
    regex: Schema.boolean().description("是否使用正则表达式匹配"),
    content: Schema.string().description("匹配的内容").required()
  }),
  match(ctx, config, features) {
    if (config.regex)
      return new RegExp(config.content).test(features.session.content)
    return features.session.content.includes(config.content)
  }
}

interface TextMessageContentMatcherConfig {
  regex: boolean,
  content: string
}
const TextMessageContentMatcher: Matcher<TextMessageContentMatcherConfig> = {
  id: "text-message-content",
  description: "匹配文字消息",
  Config: Schema.object({
    regex: Schema.boolean().description("是否使用正则表达式匹配"),
    content: Schema.string().description("匹配的内容").required()
  }),
  match(ctx, config, features) {
    return features.session.elements.filter((s) => s.type === "text").some((s) => {
      if (config.regex)
        return new RegExp(config.content).test(s.attrs.content)
      return s.attrs.content.includes(config.content)
    })
  }
}

export const PreRegisteredMatchers = [
  AlwaysExecuteMatcher,
  SegmentTypeMatcher,
  RawMessageContentMatcher,
  TextMessageContentMatcher
]