// NRK Playback Speed Control
// Content script for controlling playback speed on NRK TV

// Use IIFE to avoid global scope pollution and conflicts with other scripts
(function () {
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
        const buttonContainers =
          playerControls.querySelectorAll(".display-flex");
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
    speedIndicator.classList.add("tv-player-button");
    speedIndicator.style.cssText = `
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    padding: 0;
    margin: 0 4px;
    background: none;
    color: rgb(var(--color-theme-white));
    border-radius: .375rem;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 20px;
    font-weight: 500;
    line-height: 1;
    opacity: 1;
    cursor: pointer;
    transition: all 0.2s ease;
    pointer-events: auto;
    user-select: none;
    z-index: 1000;
    order: 0;
    vertical-align: middle;
    align-self: center;
  `;

    // Add hover effects
    speedIndicator.addEventListener("mouseenter", () => {
      speedIndicator.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
      speedIndicator.style.color = "#4A9EFF";
    });

    speedIndicator.addEventListener("mouseleave", () => {
      speedIndicator.style.backgroundColor = "transparent";
      speedIndicator.style.color = "rgb(var(--color-theme-white))";
    });

    // Place indicator at bottom-right control bar, just left of subtitle/settings and fullscreen buttons
    const subtitleBtn = controlBar.querySelector(
      'button[value="settings"], button[type="settings-button"], [aria-label*="Innstillinger" i]'
    );
    const fullscreenBtn = controlBar.querySelector(
      'button[type="fullscreen-button"], [aria-label*="Fullskjerm" i]'
    );

    if (subtitleBtn && subtitleBtn.parentNode) {
      subtitleBtn.parentNode.insertBefore(speedIndicator, subtitleBtn);
    } else if (fullscreenBtn && fullscreenBtn.parentNode) {
      fullscreenBtn.parentNode.insertBefore(speedIndicator, fullscreenBtn);
    } else {
      // Fallback: append at end of control bar
      controlBar.appendChild(speedIndicator);
    }

    // Click handler to cycle through speeds
    const speeds = [1, 1.25, 1.5, 1.75, 2, 2.5, 3];
    speedIndicator.addEventListener("click", (event) => {
      event.stopPropagation();
      event.preventDefault();
      const currentRate = parseFloat(
        speedIndicator.textContent?.replace("×", "") || "1"
      );
      const currentIndex = speeds.indexOf(currentRate);
      const nextIndex =
        currentIndex === -1 ? 0 : (currentIndex + 1) % speeds.length;
      const nextRate = speeds[nextIndex];

      // Persist and apply new speed
      chrome.storage.sync.set({
        playbackSpeed: nextRate.toString(),
        rate: nextRate.toString(),
      });
      setPlaybackSpeed(nextRate);
    });

    // Hover behavior to follow NRK control bar visibility
    const videoContainer = document.querySelector(
      "tv-player-container"
    ) as HTMLElement | null;
    const controlsArea = document.querySelector("tv-player-controls");

    const showIndicator = () => {
      speedIndicator.style.opacity = "1";
      speedIndicator.style.pointerEvents = "auto";
    };

    const hideIndicator = () => {
      speedIndicator.style.opacity = "0";
      speedIndicator.style.pointerEvents = "none";
    };

    if (videoContainer) {
      videoContainer.addEventListener("mouseenter", showIndicator);
      videoContainer.addEventListener("mouseleave", hideIndicator);
    }

    if (controlsArea) {
      controlsArea.addEventListener("mouseenter", showIndicator);
      controlsArea.addEventListener("mouseleave", hideIndicator);
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
  }

  // Enhanced function to initialize speed indicator
  function initializeSpeedIndicator(): void {
    // Remove any existing duplicate indicators first
    const existingIndicators = document.querySelectorAll(
      "#nrk-speed-indicator"
    );
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
})(); // End of IIFE
