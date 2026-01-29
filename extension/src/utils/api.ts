import type { DetectedField, ServerMatchEntry } from "../types";

const SERVER_BASE = "http://127.0.0.1:8766";

/** Check if the embedding server is running. */
export async function checkHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${SERVER_BASE}/health`);
    return res.ok;
  } catch {
    return false;
  }
}

/** Request the server to match field descriptions against user data keys. */
export async function fetchMatch(
  fieldDescriptions: string[],
  userDataKeys: string[],
  threshold = 0.35
): Promise<ServerMatchEntry[]> {
  const res = await fetch(`${SERVER_BASE}/match`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      field_descriptions: fieldDescriptions,
      user_data_keys: userDataKeys,
      threshold,
    }),
  });

  if (!res.ok) {
    throw new Error(`Server returned ${res.status}`);
  }

  const data = (await res.json()) as { matches: ServerMatchEntry[] };
  return data.matches;
}
