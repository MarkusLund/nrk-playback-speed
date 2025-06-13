const select = document.getElementById("speed");
// load saved
chrome.storage.sync.get({ rate: "1" }, ({ rate }) => {
  select.value = rate;
});
// when user picks a speed, save it and notify content script
select.addEventListener("change", () => {
  const rate = select.value;
  chrome.storage.sync.set({ rate });
  // run the content script in the active tab
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: setPlaybackRate,
      args: [parseFloat(rate)],
    });
  });
});

function setPlaybackRate(rate) {
  const apply = (v) => {
    v.playbackRate = rate;
  };
  document.querySelectorAll("video").forEach(apply);
}
