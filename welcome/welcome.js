// welcome/welcome.js
const openSettings = document.getElementById("btnOpenSettings");
const getKey = document.getElementById("btnGetKey");
const getCerebrasKey = document.getElementById("btnGetCerebrasKey");

openSettings.addEventListener("click", async () => {
  await chrome.storage.sync.set({ onboarded: true });
  chrome.runtime.openOptionsPage();
});

getKey.addEventListener("click", () => {
  chrome.runtime.sendMessage({ type: "UPO_OPEN_API_KEYS" });
});

getCerebrasKey.addEventListener("click", () => {
  chrome.runtime.sendMessage({ type: "UPO_OPEN_CEREBRAS_KEYS" });
});
