import { detectFormFields } from "./detector";
import { applyMatchesWithSelectors } from "./filler";
import type {
  DetectedField,
  ExtensionMessage,
  GetFieldsResponse,
  RequestMatchResponse,
  MatchResult,
} from "../types";

let lastDetectedFields: DetectedField[] = [];

/** Run field detection and notify the background about field count. */
function scanPage(): void {
  lastDetectedFields = detectFormFields();
  if (lastDetectedFields.length > 0) {
    chrome.runtime.sendMessage({
      type: "FIELDS_DETECTED",
      count: lastDetectedFields.length,
    });
  }
}

/** Request matches from the background and apply them to the page. */
async function triggerAutofill(): Promise<void> {
  if (lastDetectedFields.length === 0) {
    scanPage();
  }
  if (lastDetectedFields.length === 0) return;

  const response = (await chrome.runtime.sendMessage({
    type: "REQUEST_MATCH",
    fields: lastDetectedFields,
  })) as RequestMatchResponse | undefined;

  if (!response?.matches?.length) return;

  // Build a map of field index -> selector for applying matches
  const selectors = new Map<number, string>();
  for (const field of lastDetectedFields) {
    selectors.set(field.index, field.selector);
  }

  applyMatchesWithSelectors(response.matches, selectors);
}

// --- Message listeners ---

chrome.runtime.onMessage.addListener(
  (
    message: ExtensionMessage,
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response?: GetFieldsResponse) => void
  ) => {
    switch (message.type) {
      case "TRIGGER_AUTOFILL":
        triggerAutofill();
        break;
      case "GET_FIELDS":
        scanPage();
        sendResponse({ fields: lastDetectedFields });
        break;
    }
    return false;
  }
);

// --- Initial scan ---
scanPage();

// --- MutationObserver for SPAs ---
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

const observer = new MutationObserver(() => {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => scanPage(), 500);
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});
