import { Events, Session } from "koishi";
import { Trigger } from "./runtime";

export function EventTriggerFactory<T extends keyof Events>(event_name: T): Trigger {
  return {
    id: event_name,
    apply(ctx, config, callback) {
      ctx.on(event_name as keyof Events, (session: Session) => {
        callback({ session })
      })
    }
  }
}

export const PreRegisteredTriggers = [
  EventTriggerFactory('message'),
  EventTriggerFactory('message-deleted'),
  EventTriggerFactory('message-updated'),
  EventTriggerFactory('message-updated'),

  EventTriggerFactory('friend-added'),
  EventTriggerFactory('friend-updated'),
  EventTriggerFactory('friend-deleted'),
  EventTriggerFactory('friend-request'),

  EventTriggerFactory('channel-added'),
  EventTriggerFactory('channel-updated'),
  EventTriggerFactory('channel-deleted'),

  EventTriggerFactory('guild-added'),
  EventTriggerFactory('guild-deleted'),
  EventTriggerFactory('guild-updated'),
  EventTriggerFactory('guild-request'),

  EventTriggerFactory('channel-added'),
  EventTriggerFactory('channel-updated'),
  EventTriggerFactory('channel-deleted'),


  EventTriggerFactory('guild-member-added'),
  EventTriggerFactory('guild-member-deleted'),
  EventTriggerFactory('guild-member-updated'),
  EventTriggerFactory('guild-member-request'),

  EventTriggerFactory('guild-role-added'),
  EventTriggerFactory('guild-role-updated'),
  EventTriggerFactory('guild-role-deleted'),

  EventTriggerFactory('guild-file-added'),
  EventTriggerFactory('guild-file-updated'),
  EventTriggerFactory('guild-file-deleted')
]
