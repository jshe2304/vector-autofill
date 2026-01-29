import type { UserData, CheckServerResponse } from "../types";

const fieldsContainer = document.getElementById("fields-container")!;
const addFieldBtn = document.getElementById("add-field-btn")!;
const saveBtn = document.getElementById("save-btn")!;
const fillBtn = document.getElementById("fill-btn")!;
const serverStatus = document.getElementById("server-status")!;
const statusText = document.getElementById("status-text")!;

// --- Server status ---

async function updateServerStatus(): Promise<void> {
  const response = (await chrome.runtime.sendMessage({
    type: "CHECK_SERVER",
  })) as CheckServerResponse | undefined;

  const online = response?.online ?? false;
  serverStatus.className = `status ${online ? "status--online" : "status--offline"}`;
  statusText.textContent = online ? "online" : "offline";
}

// --- Field rendering ---

function createFieldRow(key: string, value: string): HTMLDivElement {
  const row = document.createElement("div");
  row.className = "field-row";

  const keyInput = document.createElement("input");
  keyInput.type = "text";
  keyInput.placeholder = "Field name";
  keyInput.value = key;
  keyInput.dataset.role = "key";

  const valueInput = document.createElement("input");
  valueInput.type = "text";
  valueInput.placeholder = "Value";
  valueInput.value = value;
  valueInput.dataset.role = "value";

  const removeBtn = document.createElement("button");
  removeBtn.textContent = "\u00d7";
  removeBtn.title = "Remove field";
  removeBtn.addEventListener("click", () => row.remove());

  row.appendChild(keyInput);
  row.appendChild(valueInput);
  row.appendChild(removeBtn);
  return row;
}

function renderFields(data: UserData): void {
  fieldsContainer.innerHTML = "";
  const entries = Object.entries(data);
  if (entries.length === 0) {
    // Add a few default empty rows
    fieldsContainer.appendChild(createFieldRow("", ""));
  } else {
    for (const [key, value] of entries) {
      fieldsContainer.appendChild(createFieldRow(key, value));
    }
  }
}

function collectFields(): UserData {
  const data: UserData = {};
  const rows = fieldsContainer.querySelectorAll<HTMLDivElement>(".field-row");
  for (const row of rows) {
    const keyInput = row.querySelector<HTMLInputElement>('[data-role="key"]');
    const valueInput = row.querySelector<HTMLInputElement>('[data-role="value"]');
    const key = keyInput?.value.trim();
    const value = valueInput?.value.trim();
    if (key && value) {
      data[key] = value;
    }
  }
  return data;
}

// --- Load / Save ---

async function loadData(): Promise<void> {
  const result = await chrome.storage.local.get("userData");
  const data = (result.userData as UserData) ?? {};
  renderFields(data);
}

async function saveData(): Promise<void> {
  const data = collectFields();
  await chrome.storage.local.set({ userData: data });
}

// --- Fill ---

async function triggerFill(): Promise<void> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.id == null) return;

  await chrome.tabs.sendMessage(tab.id, { type: "TRIGGER_AUTOFILL" });
}

// --- Event listeners ---

addFieldBtn.addEventListener("click", () => {
  fieldsContainer.appendChild(createFieldRow("", ""));
});

saveBtn.addEventListener("click", () => saveData());
fillBtn.addEventListener("click", async () => {
  await saveData();
  await triggerFill();
});

// --- Init ---
loadData();
updateServerStatus();
