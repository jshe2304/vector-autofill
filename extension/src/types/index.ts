/** User's stored autofill data as key-value pairs. */
export interface UserData {
  [key: string]: string;
}

/** A form field detected on the page. */
export interface DetectedField {
  /** Index of this field among all detected fields */
  index: number;
  /** Best-effort text description extracted from labels, attributes, etc. */
  description: string;
  /** CSS selector to re-find this element */
  selector: string;
  /** The element's tag name (INPUT, SELECT, TEXTAREA) */
  tagName: string;
  /** Input type attribute if applicable */
  inputType?: string;
}

/** A match result mapping a field to a user data value. */
export interface MatchResult {
  fieldIndex: number;
  fieldDescription: string;
  matchedKey: string;
  value: string;
  score: number;
}

/** Server match response entry (mirrors server MatchEntry). */
export interface ServerMatchEntry {
  field_index: number;
  field_description: string;
  matched_key: string;
  score: number;
}

// --- Message types ---

export interface TriggerAutofillMessage {
  type: "TRIGGER_AUTOFILL";
}

export interface GetFieldsMessage {
  type: "GET_FIELDS";
}

export interface GetFieldsResponse {
  fields: DetectedField[];
}

export interface RequestMatchMessage {
  type: "REQUEST_MATCH";
  fields: DetectedField[];
}

export interface RequestMatchResponse {
  matches: MatchResult[];
}

export interface FieldsDetectedMessage {
  type: "FIELDS_DETECTED";
  count: number;
}

export interface CheckServerMessage {
  type: "CHECK_SERVER";
}

export interface CheckServerResponse {
  online: boolean;
}

export type ExtensionMessage =
  | TriggerAutofillMessage
  | GetFieldsMessage
  | RequestMatchMessage
  | FieldsDetectedMessage
  | CheckServerMessage;
