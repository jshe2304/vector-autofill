import type { DetectedField } from "../types";

const FILLABLE_SELECTOR = 'input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([type="reset"]):not([type="image"]), select, textarea';

/**
 * Build a unique CSS selector for an element so we can re-find it later.
 */
function buildSelector(el: HTMLElement): string {
  if (el.id) return `#${CSS.escape(el.id)}`;
  // Fall back to nth-child path
  const parts: string[] = [];
  let current: HTMLElement | null = el;
  while (current && current !== document.body) {
    const parent = current.parentElement;
    if (!parent) break;
    const index = Array.from(parent.children).indexOf(current) + 1;
    parts.unshift(`${current.tagName.toLowerCase()}:nth-child(${index})`);
    current = parent;
  }
  return parts.join(" > ");
}

/**
 * Extract a text description for a form field using a cascade of strategies:
 * 1. <label for="id">
 * 2. Implicit wrapping <label>
 * 3. aria-label
 * 4. aria-labelledby
 * 5. placeholder
 * 6. name attribute
 * 7. title attribute
 * 8. Adjacent text (previous sibling or parent text)
 * 9. Fallback to input type
 */
function extractDescription(el: HTMLElement): string {
  // 1. Explicit <label for>
  if (el.id) {
    const label = document.querySelector<HTMLLabelElement>(`label[for="${CSS.escape(el.id)}"]`);
    if (label?.textContent?.trim()) return label.textContent.trim();
  }

  // 2. Implicit wrapping <label>
  const wrappingLabel = el.closest("label");
  if (wrappingLabel) {
    const text = wrappingLabel.textContent?.replace(el.textContent ?? "", "").trim();
    if (text) return text;
  }

  // 3. aria-label
  const ariaLabel = el.getAttribute("aria-label");
  if (ariaLabel?.trim()) return ariaLabel.trim();

  // 4. aria-labelledby
  const labelledBy = el.getAttribute("aria-labelledby");
  if (labelledBy) {
    const parts = labelledBy
      .split(/\s+/)
      .map((id) => document.getElementById(id)?.textContent?.trim())
      .filter(Boolean);
    if (parts.length) return parts.join(" ");
  }

  // 5. placeholder
  if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
    if (el.placeholder?.trim()) return el.placeholder.trim();
  }

  // 6. name attribute
  const name = el.getAttribute("name");
  if (name?.trim()) return name.replace(/[_\-[\]]/g, " ").trim();

  // 7. title attribute
  const title = el.getAttribute("title");
  if (title?.trim()) return title.trim();

  // 8. Adjacent text
  const prev = el.previousElementSibling;
  if (prev?.textContent?.trim()) return prev.textContent.trim();

  // 9. Fallback
  const type = el instanceof HTMLInputElement ? el.type : el.tagName.toLowerCase();
  return type;
}

/**
 * Detect all fillable form fields on the page and extract descriptions.
 */
export function detectFormFields(): DetectedField[] {
  const elements = document.querySelectorAll<HTMLElement>(FILLABLE_SELECTOR);
  const fields: DetectedField[] = [];

  elements.forEach((el, index) => {
    const description = extractDescription(el);
    fields.push({
      index,
      description,
      selector: buildSelector(el),
      tagName: el.tagName,
      inputType: el instanceof HTMLInputElement ? el.type : undefined,
    });
  });

  return fields;
}
