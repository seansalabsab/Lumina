import { isToday, isYesterday, subDays } from "date-fns"
import { Conversation } from "@/api/types"

export enum ConversationGroup {
  TODAY = "Today",
  YESTERDAY = "Yesterday",
  LAST_7_DAYS = "Last 7 Days",
  LAST_30_DAYS = "Last 30 Days",
  OLDER = "Older",
}


export function groupConversations(conversatins:Conversation[]) {
  const groups: Record<ConversationGroup, Conversation[]> = {
    [ConversationGroup.TODAY]: [],
    [ConversationGroup.YESTERDAY]: [],
    [ConversationGroup.LAST_7_DAYS]: [],
    [ConversationGroup.LAST_30_DAYS]: [],
    [ConversationGroup.OLDER]: [],
  };

  const now = new Date()
  for (const conv of conversatins) {
    const createdAt = new Date(conv.created_at) 
    if (isToday(createdAt)) {
      groups[ConversationGroup.TODAY].push(conv)
    } else if (isYesterday(createdAt)) {
      groups[ConversationGroup.YESTERDAY].push(conv)
    } else if (createdAt > subDays(now, 7)) {
      groups[ConversationGroup.LAST_7_DAYS].push(conv)
    } else if (createdAt < subDays(now, 30)) {
      groups[ConversationGroup.LAST_30_DAYS].push(conv)
    } else {
      groups[ConversationGroup.OLDER].push(conv)
    }
  }

  return groups;
}

