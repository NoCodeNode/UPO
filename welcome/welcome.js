// welcome/welcome.js
const openSettings = document.getElementById("btnOpenSettings");
const getKey = document.getElementById("btnGetKey");

openSettings.addEventListener("click", async () => {
  await chrome.storage.sync.set({ onboarded: true });
  chrome.runtime.openOptionsPage();
});

getKey.addEventListener("click", () => {
  chrome.runtime.sendMessage({ type: "UPO_OPEN_API_KEYS" });
});
