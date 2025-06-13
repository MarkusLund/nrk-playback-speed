const select = document.getElementById("speed") as HTMLSelectElement;
const versionElement = document.getElementById("version") as HTMLElement;

// Load and display version
if (versionElement) {
  const manifest = chrome.runtime.getManifest();
  versionElement.textContent = `v${manifest.version}`;
}

// Load saved speed
chrome.storage.sync.get({ rate: "1", playbackSpeed: "1" }, (result) => {
  const speed = result.playbackSpeed || result.rate || "1";
  select.value = speed;
});

// When user picks a speed, save it and notify content script
select.addEventListener("change", () => {
  const rate = select.value;

  // Save to both keys for compatibility
  chrome.storage.sync.set({
    rate: rate,
    playbackSpeed: rate,
  });

  // Send message to content script to update speed and indicator
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    if (tab.id) {
      chrome.tabs.sendMessage(tab.id, {
        action: "setSpeed",
        speed: parseFloat(rate),
      });

      // Also run the script directly as fallback
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: setPlaybackRate,
        args: [parseFloat(rate)],
      });
    }
  });
});

function setPlaybackRate(rate: number): void {
  const apply = (v: HTMLVideoElement) => {
    v.playbackRate = rate;
  };
  document.querySelectorAll<HTMLVideoElement>("video").forEach(apply);
}
