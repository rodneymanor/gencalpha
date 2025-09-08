document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial; padding: 16px; width: 360px; background: #fafafa;">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
      <h1 style="font-size: 18px; margin: 0; font-weight: 600; color: #1a1a1a;">GenC Quick Actions</h1>
      <button id="btn-settings" style="padding: 6px 12px; border: 1px solid #ddd; border-radius: 6px; background: white; cursor: pointer; font-size: 13px; font-weight: 500; transition: all 0.15s ease; display: flex; align-items: center; gap: 6px;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24"></path>
        </svg>
        Settings
      </button>
    </div>
    
    <!-- Video Section -->
    <div id="video-section" style="margin-bottom: 24px; display: none;">
      <h2 style="font-size: 14px; margin: 0 0 12px; font-weight: 500; color: #666;">Add Video to Collection</h2>
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <select id="collection-select" style="padding: 8px 12px; border: 1px solid #ddd; border-radius: 8px; background: white; font-size: 14px;">
          <option value="">Select a collection...</option>
        </select>
        <input id="new-collection-input" type="text" placeholder="Or create new collection..." style="padding: 8px 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px;">
        <button id="btn-add-video" style="padding: 10px 16px; border: none; border-radius: 8px; background: #0081F2; color: white; cursor: pointer; font-weight: 500; transition: all 0.15s ease;">Add Current Video</button>
      </div>
    </div>

    <!-- Creator Section -->
    <div id="creator-section" style="margin-bottom: 24px; display: none;">
      <h2 id="creator-section-title" style="font-size: 14px; margin: 0 0 12px; font-weight: 500; color: #666;">Add Creator to Database</h2>
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <div id="creator-info" style="padding: 8px 12px; background: #f8f9fa; border-radius: 8px; border: 1px solid #e9ecef;">
          <div style="font-size: 14px; font-weight: 500; color: #495057;" id="creator-username"></div>
          <div style="font-size: 12px; color: #6c757d; margin-top: 2px;" id="creator-platform"></div>
        </div>
        <button id="btn-add-creator" style="padding: 10px 16px; border: none; border-radius: 8px; background: #28a745; color: white; cursor: pointer; font-weight: 500; transition: all 0.15s ease;">Add Creator</button>
      </div>
    </div>

    <!-- Default message when not on a supported page -->
    <div id="default-message" style="padding: 24px 12px; text-align: center; color: #666; font-size: 14px; display: none;">
      <p style="margin: 0 0 8px;">Navigate to a TikTok or Instagram video to add it to your collections.</p>
      <p style="margin: 0; font-size: 13px; color: #999;">You can also visit creator profiles to add them to your database.</p>
    </div>

    <div id="status" style="padding: 8px 12px; font-size: 12px; color: #666; background: #f0f0f0; border-radius: 6px; text-align: center; display: none; margin-top: 16px;"></div>
  </div>
`;

const show = (msg: string, isError = false) => {
  const el = document.getElementById("status")!;
  el.textContent = msg;
  el.style.display = "block";
  el.style.backgroundColor = isError ? "#fee" : "#eff6ff";
  el.style.color = isError ? "#c53030" : "#2563eb";
  setTimeout(() => {
    el.style.display = "none";
  }, 2500);
};

const getApiConfig = async () => {
  const { genc_base_url, genc_api_key } = await browser.storage.sync.get(["genc_base_url", "genc_api_key"]);
  const baseUrl = genc_base_url ?? "http://localhost:3000";
  const apiKey = genc_api_key as string | undefined;
  return { baseUrl, apiKey };
};

// Settings button click handler
const openSettings = () => {
  browser.runtime.openOptionsPage();
};

const loadCollections = async () => {
  const { baseUrl, apiKey } = await getApiConfig();
  if (!apiKey) return;

  try {
    const response = await fetch(`${baseUrl}/api/chrome-extension/collections`, {
      method: "GET",
      headers: { "x-api-key": apiKey },
    });
    
    if (!response.ok) return;
    
    const data = await response.json();
    const collections = data.collections || [];
    
    const selectEl = document.getElementById("collection-select") as HTMLSelectElement;
    // Clear existing options except the first one
    while (selectEl.children.length > 1) {
      selectEl.removeChild(selectEl.lastChild!);
    }
    
    // Add collections as options
    collections.forEach((collection: { id: string; title: string }) => {
      const option = document.createElement("option");
      option.value = collection.title;
      option.textContent = collection.title;
      selectEl.appendChild(option);
    });
  } catch (error) {
    console.error("Failed to load collections:", error);
  }
};

const addVideoToCollection = async (videoUrl: string, collectionTitle: string, videoTitle?: string) => {
  const { baseUrl, apiKey } = await getApiConfig();
  if (!apiKey) return show("Set API key in Options", true);

  try {
    const response = await fetch(`${baseUrl}/api/chrome-extension/collections/add-video`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "x-api-key": apiKey 
      },
      body: JSON.stringify({ 
        videoUrl, 
        collectionTitle: collectionTitle.trim(),
        title: videoTitle 
      }),
    });

    const result = await response.json();
    
    if (response.ok && result.success) {
      show(`Added to "${collectionTitle}"`);
      // Clear the new collection input
      const newCollectionInput = document.getElementById("new-collection-input") as HTMLInputElement;
      newCollectionInput.value = "";
      // Reset collection select
      const selectEl = document.getElementById("collection-select") as HTMLSelectElement;
      selectEl.selectedIndex = 0;
      // Reload collections to include any newly created ones
      setTimeout(() => loadCollections(), 500);
    } else {
      show(result.error || "Failed to add video", true);
    }
  } catch (error) {
    console.error("Add video error:", error);
    show("Failed to add video", true);
  }
};

const isVideoUrl = (url: string): { isVideo: boolean; platform: string } => {
  if (url.includes("youtube.com") || url.includes("youtu.be")) {
    return { isVideo: true, platform: "YouTube" };
  }
  if (url.includes("tiktok.com")) {
    return { isVideo: true, platform: "TikTok" };
  }
  if (url.includes("instagram.com") && (url.includes("/p/") || url.includes("/reel/") || url.includes("/reels/"))) {
    return { isVideo: true, platform: "Instagram" };
  }
  return { isVideo: false, platform: "" };
};

const isCreatorProfile = (url: string): { isCreator: boolean; platform: string; username: string } => {
  // TikTok profile: tiktok.com/@username or tiktok.com/@username/
  const tiktokMatch = url.match(/tiktok\.com\/@([^\/\?]+)/);
  if (tiktokMatch) {
    return { isCreator: true, platform: "tiktok", username: tiktokMatch[1] };
  }
  
  // Instagram profile: instagram.com/username (but not posts/reels)
  const instagramMatch = url.match(/instagram\.com\/([^\/\?]+)\/?$/);
  if (instagramMatch && !url.includes("/p/") && !url.includes("/reel/") && !url.includes("/reels/")) {
    // Exclude common non-profile paths
    const username = instagramMatch[1];
    if (!["explore", "accounts", "stories", "direct", "tv"].includes(username)) {
      return { isCreator: true, platform: "instagram", username };
    }
  }
  
  return { isCreator: false, platform: "", username: "" };
};

const addCreatorToDatabase = async (username: string, platform: string) => {
  const { baseUrl, apiKey } = await getApiConfig();
  if (!apiKey) return show("Set API key in Options", true);

  try {
    const response = await fetch(`${baseUrl}/api/chrome-extension/creators/add`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "x-api-key": apiKey 
      },
      body: JSON.stringify({ 
        username: username.replace('@', ''), // Remove @ if present
        platform: platform.toLowerCase() as "instagram" | "tiktok"
      }),
    });

    const result = await response.json();
    
    if (response.ok && result.success) {
      show(`Added @${username} to creators database`);
    } else {
      show(result.error || "Failed to add creator", true);
    }
  } catch (error) {
    console.error("Add creator error:", error);
    show("Failed to add creator", true);
  }
};

// Load collections when popup opens
loadCollections();

// Check current tab and show appropriate sections
browser.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
  console.log("Tab info:", tab);
  console.log("Tab URL:", tab?.url);
  
  const videoSection = document.getElementById("video-section")!;
  const creatorSection = document.getElementById("creator-section")!;
  const defaultMessage = document.getElementById("default-message")!;
  const videoSectionTitle = videoSection.querySelector("h2")!;
  const addVideoButton = document.getElementById("btn-add-video")!;
  const creatorSectionTitle = document.getElementById("creator-section-title")!;
  const creatorUsername = document.getElementById("creator-username")!;
  const creatorPlatform = document.getElementById("creator-platform")!;
  
  // Hide all sections by default
  videoSection.style.display = "none";
  creatorSection.style.display = "none";
  defaultMessage.style.display = "none";
  
  if (tab?.url) {
    console.log("Processing URL:", tab.url);
    
    // Check for video first
    const { isVideo, platform: videoPlatform } = isVideoUrl(tab.url);
    console.log("Video check result:", { isVideo, platform: videoPlatform });
    
    if (isVideo) {
      console.log("Showing video section for", videoPlatform);
      videoSection.style.display = "block";
      videoSectionTitle.textContent = `Add ${videoPlatform} Video to Collection`;
      addVideoButton.textContent = `Add ${videoPlatform} Video`;
    } else {
      // Check for creator profile if not a video
      const { isCreator, platform: creatorPlatform, username } = isCreatorProfile(tab.url);
      console.log("Creator check result:", { isCreator, platform: creatorPlatform, username });
      
      if (isCreator) {
        console.log("Showing creator section for", creatorPlatform, username);
        creatorSection.style.display = "block";
        creatorSectionTitle.textContent = `Add ${creatorPlatform.charAt(0).toUpperCase() + creatorPlatform.slice(1)} Creator`;
        creatorUsername.textContent = `@${username}`;
        creatorPlatform.textContent = `${creatorPlatform.charAt(0).toUpperCase() + creatorPlatform.slice(1)} Profile`;
        
        // Store creator info for button click
        (window as any).currentCreator = { username, platform: creatorPlatform };
      } else {
        // Show default message if not on a supported page
        console.log("Not on a supported page, showing default message");
        defaultMessage.style.display = "block";
      }
    }
  } else {
    console.log("No tab URL found, showing default message");
    defaultMessage.style.display = "block";
  }
}).catch(error => {
  console.error("Error querying tab:", error);
});

// Add video to collection
document.getElementById("btn-add-video")!.addEventListener("click", async () => {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  const videoUrl = tab?.url ?? "";
  const videoTitle = tab?.title ?? "";
  
  if (!videoUrl) {
    show("No video URL found", true);
    return;
  }
  
  const { isVideo, platform } = isVideoUrl(videoUrl);
  if (!isVideo) {
    show("This is not a supported video platform", true);
    return;
  }
  
  const selectEl = document.getElementById("collection-select") as HTMLSelectElement;
  const newCollectionInput = document.getElementById("new-collection-input") as HTMLInputElement;
  
  let collectionTitle = "";
  
  // Check if user entered a new collection name
  if (newCollectionInput.value.trim()) {
    collectionTitle = newCollectionInput.value.trim();
  } else if (selectEl.value) {
    collectionTitle = selectEl.value;
  } else {
    show("Please select or create a collection", true);
    return;
  }
  
  show(`Adding ${platform} video...`);
  addVideoToCollection(videoUrl, collectionTitle, videoTitle);
});

// Clear new collection input when selecting existing collection
document.getElementById("collection-select")!.addEventListener("change", () => {
  const newCollectionInput = document.getElementById("new-collection-input") as HTMLInputElement;
  newCollectionInput.value = "";
});

// Clear collection select when typing new collection
document.getElementById("new-collection-input")!.addEventListener("input", () => {
  const selectEl = document.getElementById("collection-select") as HTMLSelectElement;
  selectEl.selectedIndex = 0;
});

// Add creator to database
document.getElementById("btn-add-creator")!.addEventListener("click", async () => {
  const currentCreator = (window as any).currentCreator;
  if (!currentCreator) {
    show("No creator information found", true);
    return;
  }
  
  show(`Adding @${currentCreator.username}...`);
  addCreatorToDatabase(currentCreator.username, currentCreator.platform);
});

// Settings button click handler
document.getElementById("btn-settings")!.addEventListener("click", () => {
  openSettings();
});
