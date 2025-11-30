// YouTube Playback Speed Control
// Content script for controlling playback speed on YouTube

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

  // Function to create and inject speed indicator into YouTube player controls
  function createSpeedIndicator(): HTMLElement | null {
    // First check if indicator already exists
    const existing = document.getElementById("yt-speed-indicator");
    if (existing) {
      return existing;
    }

    // Look for YouTube's right controls area
    const controlSelectors = [
      ".ytp-right-controls",
      ".ytp-chrome-controls .ytp-right-controls",
    ];

    let controlBar: HTMLElement | null = null;

    for (const selector of controlSelectors) {
      controlBar = document.querySelector(selector);
      if (controlBar) break;
    }

    if (!controlBar) return null;

    // Create speed indicator button
    const speedIndicator = document.createElement("button");
    speedIndicator.id = "yt-speed-indicator";
    speedIndicator.classList.add("ytp-button");
    speedIndicator.setAttribute("aria-label", "Playback speed");
    speedIndicator.setAttribute("title", "Playback speed (click to cycle)");
    speedIndicator.style.cssText = `
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: auto;
    min-width: 48px;
    height: 100%;
    padding: 0 8px;
    background: none;
    border: none;
    color: #fff;
    font-family: 'YouTube Sans', 'Roboto', sans-serif;
    font-size: 18px;
    font-weight: 500;
    line-height: 1;
    cursor: pointer;
    opacity: 0.9;
    transition: opacity 0.1s ease;
    vertical-align: top;
  `; // Add hover effects
    speedIndicator.addEventListener("mouseenter", () => {
      speedIndicator.style.opacity = "1";
    });

    speedIndicator.addEventListener("mouseleave", () => {
      speedIndicator.style.opacity = "0.9";
    });

    // Find insertion point - insert before settings button
    const settingsBtn = controlBar.querySelector(".ytp-settings-button");
    const subtitlesBtn = controlBar.querySelector(".ytp-subtitles-button");

    if (settingsBtn && settingsBtn.parentNode) {
      settingsBtn.parentNode.insertBefore(speedIndicator, settingsBtn);
    } else if (subtitlesBtn && subtitlesBtn.parentNode) {
      subtitlesBtn.parentNode.insertBefore(speedIndicator, subtitlesBtn);
    } else {
      // Fallback: prepend to control bar
      controlBar.insertBefore(speedIndicator, controlBar.firstChild);
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

    return speedIndicator;
  }

  // Function to update speed indicator text
  function updateSpeedIndicator(speed: number): void {
    let indicator = document.getElementById("yt-speed-indicator");

    if (!indicator) {
      const newIndicator = createSpeedIndicator();
      if (!newIndicator) return;
      indicator = newIndicator;
    }

    indicator.textContent = `${speed}×`;
    indicator.setAttribute(
      "title",
      `Playback speed: ${speed}× (click to cycle)`
    );
  }

  // Enhanced function to initialize speed indicator
  function initializeSpeedIndicator(): void {
    // Remove any existing duplicate indicators first
    const existingIndicators = document.querySelectorAll("#yt-speed-indicator");
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

  // Handle dynamically loaded videos and player changes (YouTube is a SPA)
  const youtubeObserver = new MutationObserver((mutations) => {
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
              element.matches(
                ".ytp-chrome-bottom, #movie_player, .html5-video-player"
              ) ||
              element.querySelector(
                ".ytp-chrome-bottom, #movie_player, .html5-video-player"
              )
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

  youtubeObserver.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // Also try to initialize when the page is fully loaded
  window.addEventListener("load", () => {
    setTimeout(initializeSpeedIndicator, 2000);
  });

  // YouTube-specific: Listen for navigation events (yt-navigate-finish)
  // YouTube uses a custom event when navigating between videos
  window.addEventListener("yt-navigate-finish", () => {
    setTimeout(() => {
      chrome.storage.sync.get(["playbackSpeed", "rate"], (result) => {
        const speed = result.playbackSpeed || result.rate || 1;
        if (speed !== 1) {
          setPlaybackSpeed(parseFloat(speed));
        }
        initializeSpeedIndicator();
      });
    }, 1000);
  });

  // Also handle popstate for browser back/forward navigation
  window.addEventListener("popstate", () => {
    setTimeout(() => {
      chrome.storage.sync.get(["playbackSpeed", "rate"], (result) => {
        const speed = result.playbackSpeed || result.rate || 1;
        if (speed !== 1) {
          setPlaybackSpeed(parseFloat(speed));
        }
        initializeSpeedIndicator();
      });
    }, 1000);
  });
})(); // End of IIFE
