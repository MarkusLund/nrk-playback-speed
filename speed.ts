// Function to set video playback speed
function setPlaybackSpeed(speed: number): void {
  const videoElements = document.getElementsByTagName("video");
  for (const video of videoElements) {
    video.playbackRate = speed;
  }
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "setSpeed") {
    setPlaybackSpeed(request.speed);
    sendResponse({ success: true });
  }
});

// Initial setup - set default speed when page loads
document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.sync.get(["playbackSpeed"], (result) => {
    if (result.playbackSpeed) {
      setPlaybackSpeed(result.playbackSpeed);
    }
  });
});

// Handle dynamically loaded videos
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.addedNodes.length) {
      chrome.storage.sync.get(["playbackSpeed"], (result) => {
        if (result.playbackSpeed) {
          setPlaybackSpeed(result.playbackSpeed);
        }
      });
    }
  });
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});
