import type { MatchResult } from "../types";

/**
 * Set the value of an input element using the native setter pattern.
 * This ensures React, Vue, Angular, and other frameworks detect the change.
 */
function setNativeValue(el: HTMLInputElement | HTMLTextAreaElement, value: string): void {
  const nativeSetter = Object.getOwnPropertyDescriptor(
    Object.getPrototypeOf(el),
    "value"
  )?.set;

  if (nativeSetter) {
    nativeSetter.call(el, value);
  } else {
    el.value = value;
  }

  el.dispatchEvent(new Event("input", { bubbles: true }));
  el.dispatchEvent(new Event("change", { bubbles: true }));
}

/**
 * Handle filling a <select> element by finding the best matching option.
 */
function fillSelect(el: HTMLSelectElement, value: string): void {
  const lowerValue = value.toLowerCase();
  const options = Array.from(el.options);

  // Try exact match on value or text
  const exactMatch = options.find(
    (o) => o.value.toLowerCase() === lowerValue || o.text.toLowerCase() === lowerValue
  );

  // Fall back to partial match
  const partialMatch = options.find(
    (o) =>
      o.value.toLowerCase().includes(lowerValue) ||
      o.text.toLowerCase().includes(lowerValue) ||
      lowerValue.includes(o.value.toLowerCase()) ||
      lowerValue.includes(o.text.toLowerCase())
  );

  const match = exactMatch ?? partialMatch;
  if (match) {
    el.value = match.value;
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }
}

/**
 * Apply match results using the selectors from detected fields.
 */
export function applyMatchesWithSelectors(
  matches: MatchResult[],
  selectors: Map<number, string>
): void {
  for (const match of matches) {
    const selector = selectors.get(match.fieldIndex);
    if (!selector) continue;

    const el = document.querySelector<HTMLElement>(selector);
    if (!el) continue;

    if (el instanceof HTMLSelectElement) {
      fillSelect(el, match.value);
    } else if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
      setNativeValue(el, match.value);
    }
  }
}
