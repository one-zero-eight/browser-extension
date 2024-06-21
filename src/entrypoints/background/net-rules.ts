import { MOODLE_WS_URL } from '@/shared/config/moodle'
import HeaderOperation = chrome.declarativeNetRequest.HeaderOperation
import ResourceType = chrome.declarativeNetRequest.ResourceType
import Rule = chrome.declarativeNetRequest.Rule
import RuleActionType = chrome.declarativeNetRequest.RuleActionType

export async function applyUserAgentRule() {
  // Set "MoodleMobile" User-Agent for requests to get_autologin_key.
  // This doesn't work in Firefox, so we need to set User-Agent in Axios.
  const ua_rule: Rule = {
    id: 1,
    action: {
      type: RuleActionType.MODIFY_HEADERS,
      requestHeaders: [
        {
          header: 'User-Agent',
          operation: HeaderOperation.SET,
          value: 'MoodleMobile',
        },
      ],
    },
    condition: {
      urlFilter: MOODLE_WS_URL,
      resourceTypes: [ResourceType.XMLHTTPREQUEST],
    },
  }
  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [ua_rule.id],
    addRules: [ua_rule],
  })
}
