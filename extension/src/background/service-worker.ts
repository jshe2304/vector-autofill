import { getUserData } from "../utils/storage";
import { fetchMatch, checkHealth } from "../utils/api";
import type {
  ExtensionMessage,
  RequestMatchResponse,
  CheckServerResponse,
  DetectedField,
  MatchResult,
} from "../types";

chrome.runtime.onMessage.addListener(
  (
    message: ExtensionMessage,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: RequestMatchResponse | CheckServerResponse) => void
  ) => {
    switch (message.type) {
      case "REQUEST_MATCH":
        handleMatchRequest(message.fields)
          .then(sendResponse)
          .catch(() => sendResponse({ matches: [] }));
        return true; // async response

      case "FIELDS_DETECTED":
        // Update the badge with the number of detected fields
        const badgeText = message.count > 0 ? String(message.count) : "";
        if (sender.tab?.id != null) {
          chrome.action.setBadgeText({ text: badgeText, tabId: sender.tab.id });
          chrome.action.setBadgeBackgroundColor({ color: "#4688F1", tabId: sender.tab.id });
        }
        break;

      case "CHECK_SERVER":
        checkHealth()
          .then((online) => sendResponse({ online }))
          .catch(() => sendResponse({ online: false }));
        return true; // async response
    }

    return false;
  }
);

async function handleMatchRequest(
  fields: DetectedField[]
): Promise<RequestMatchResponse> {
  const userData = await getUserData();
  const keys = Object.keys(userData);

  if (keys.length === 0 || fields.length === 0) {
    return { matches: [] };
  }

  const descriptions = fields.map((f) => f.description);
  const serverMatches = await fetchMatch(descriptions, keys);

  // Map server matches back to MatchResult with user values
  const matches: MatchResult[] = serverMatches.map((m) => ({
    fieldIndex: m.field_index,
    fieldDescription: m.field_description,
    matchedKey: m.matched_key,
    value: userData[m.matched_key] ?? "",
    score: m.score,
  }));

  return { matches };
}
