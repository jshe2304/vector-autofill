import type { UserData } from "../types";

const STORAGE_KEY = "userData";

/** Retrieve the user's autofill data from chrome.storage.local. */
export async function getUserData(): Promise<UserData> {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  return (result[STORAGE_KEY] as UserData) ?? {};
}

/** Save the user's autofill data to chrome.storage.local. */
export async function setUserData(data: UserData): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEY]: data });
}
