// Function to set video playback speed
function setPlaybackSpeed(speed: number): void {
  const videoElements = document.getElementsByTagName("video");
  for (const video of videoElements) {
    video.playbackRate = speed;
  }
  updateSpeedIndicator(speed);
}

// Function to create and inject speed indicator into player controls
function createSpeedIndicator(): HTMLElement | null {
  // First check if indicator already exists
  const existing = document.getElementById("nrk-speed-indicator");
  if (existing) {
    return existing;
  }

  // Look for the specific NRK player controls bar
  const controlSelectors = [
    'tv-player-controls [style*="order: 1"] .display-flex.align-items-baseline',
    "#player-controls .display-flex.align-items-baseline",
    "tv-player-controls .display-flex.align-items-baseline",
    ".display-flex.align-items-baseline.padding-y-xs",
  ];

  let controlBar: HTMLElement | null = null;

  for (const selector of controlSelectors) {
    controlBar = document.querySelector(selector);
    if (controlBar) break;
  }

  // Fallback: look for the controls container with buttons
  if (!controlBar) {
    const playerControls = document.querySelector("tv-player-controls");
    if (playerControls) {
      const buttonContainers = playerControls.querySelectorAll(".display-flex");
      for (const container of buttonContainers) {
        if (
          container.querySelector('button[type*="button"]') &&
          container.querySelector(".flex-grow-1")
        ) {
          controlBar = container as HTMLElement;
          break;
        }
      }
    }
  }

  if (!controlBar) return null;

  // Create speed indicator element
  const speedIndicator = document.createElement("div");
  speedIndicator.id = "nrk-speed-indicator";
  speedIndicator.style.cssText = `
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 40px;
    height: 32px;
    padding: 0 8px;
    margin: 0 4px;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    border-radius: 4px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 12px;
    font-weight: 500;
    opacity: 0;
    transition: opacity 0.2s ease;
    pointer-events: none;
    user-select: none;
    z-index: 1000;
    order: 0;
  `;

  // Insert before the flex-grow-1 spacer element
  const spacer = controlBar.querySelector(".flex-grow-1");
  if (spacer) {
    controlBar.insertBefore(speedIndicator, spacer);
  } else {
    // Fallback: insert at the beginning
    controlBar.insertBefore(speedIndicator, controlBar.firstChild);
  }

  return speedIndicator;
}

// Function to update speed indicator text
function updateSpeedIndicator(speed: number): void {
  let indicator = document.getElementById("nrk-speed-indicator");

  if (!indicator) {
    const newIndicator = createSpeedIndicator();
    if (!newIndicator) return;
    indicator = newIndicator;
  }

  indicator.textContent = `${speed}×`;

  // Show indicator briefly when speed changes
  indicator.style.opacity = "1";
  setTimeout(() => {
    indicator.style.opacity = "0";
  }, 2000);
}

// Function to setup hover behavior for controls
function setupControlsHover(): void {
  const indicator = document.getElementById("nrk-speed-indicator");
  if (!indicator) return;

  // Find the main video container or player
  const videoElement = document.querySelector("video");
  if (!videoElement) return;

  const videoContainer = videoElement.closest(
    'tv-player-container, tv-player, [class*="player"]'
  );
  if (!videoContainer) return;

  // Show speed indicator when hovering over video area
  const showIndicator = () => {
    indicator.style.opacity = "1";
  };

  const hideIndicator = () => {
    indicator.style.opacity = "0";
  };

  (videoContainer as HTMLElement).addEventListener("mouseenter", showIndicator);
  (videoContainer as HTMLElement).addEventListener("mouseleave", hideIndicator);

  // Also show when hovering over controls specifically
  const controlsArea = document.querySelector("tv-player-controls");
  if (controlsArea) {
    controlsArea.addEventListener("mouseenter", showIndicator);
    controlsArea.addEventListener("mouseleave", hideIndicator);
  }
}

// Enhanced function to initialize speed indicator
function initializeSpeedIndicator(): void {
  // Remove any existing duplicate indicators first
  const existingIndicators = document.querySelectorAll("#nrk-speed-indicator");
  existingIndicators.forEach((indicator, index) => {
    if (index > 0) {
      // Keep only the first one
      indicator.remove();
    }
  });

  // Wait a bit for the player to fully load
  setTimeout(() => {
    chrome.storage.sync.get(["playbackSpeed", "rate"], (result) => {
      const speed = result.playbackSpeed || result.rate || 1;
      const indicator = createSpeedIndicator();
      if (indicator) {
        updateSpeedIndicator(parseFloat(speed));
        setupControlsHover();
      }
    });
  }, 1000);
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
  chrome.storage.sync.get(["playbackSpeed", "rate"], (result) => {
    const speed = result.playbackSpeed || result.rate || 1;
    if (speed !== 1) {
      setPlaybackSpeed(parseFloat(speed));
    }
    initializeSpeedIndicator();
  });
});

// Handle dynamically loaded videos and player changes
const observer = new MutationObserver((mutations) => {
  let shouldReinitialize = false;

  mutations.forEach((mutation) => {
    if (mutation.addedNodes.length) {
      // Check if new video elements or player controls were added
      for (const node of mutation.addedNodes) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element;
          if (
            element.tagName === "VIDEO" ||
            element.querySelector("video") ||
            element.matches("tv-player-controls, tv-player") ||
            element.querySelector("tv-player-controls, tv-player")
          ) {
            shouldReinitialize = true;
            break;
          }
        }
      }
    }
  });

  if (shouldReinitialize) {
    chrome.storage.sync.get(["playbackSpeed", "rate"], (result) => {
      const speed = result.playbackSpeed || result.rate || 1;
      if (speed !== 1) {
        setPlaybackSpeed(parseFloat(speed));
      }
      // Reinitialize indicator after a short delay
      setTimeout(initializeSpeedIndicator, 500);
    });
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});

// Also try to initialize when the page is fully loaded
window.addEventListener("load", () => {
  setTimeout(initializeSpeedIndicator, 2000);
});
