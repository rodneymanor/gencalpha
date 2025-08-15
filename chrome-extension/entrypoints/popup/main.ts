document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial; padding: 16px; width: 360px; background: #fafafa;">
    <h1 style="font-size: 18px; margin: 0 0 16px; font-weight: 600; color: #1a1a1a;">GenC Quick Actions</h1>
    
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

    <!-- Idea Inbox Section -->
    <div style="margin-bottom: 16px;">
      <h2 style="font-size: 14px; margin: 0 0 12px; font-weight: 500; color: #666;">Save to Idea Inbox</h2>
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <button id="btn-save-tab" style="padding: 8px 12px; border: 1px solid #ddd; border-radius: 8px; background: white; cursor: pointer; font-size: 14px; transition: all 0.15s ease;">Save current tab</button>
        <button id="btn-save-selection" style="padding: 8px 12px; border: 1px solid #ddd; border-radius: 8px; background: white; cursor: pointer; font-size: 14px; transition: all 0.15s ease;">Save selection</button>
      </div>
    </div>

    <div id="status" style="padding: 8px 12px; font-size: 12px; color: #666; background: #f0f0f0; border-radius: 6px; text-align: center; display: none;"></div>
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

const save = async (content: string, title: string, tags: string[]) => {
  const { baseUrl, apiKey } = await getApiConfig();
  if (!apiKey) return show("Set API key in Options", true);
  
  try {
    await fetch(`${baseUrl}/api/chrome-extension/idea-inbox/text`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey },
      body: JSON.stringify({ title, content, tags }),
    });
    show("Saved to Idea Inbox");
  } catch (error) {
    show("Failed to save", true);
  }
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
  if (url.includes("instagram.com") && (url.includes("/p/") || url.includes("/reel/"))) {
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
  if (instagramMatch && !url.includes("/p/") && !url.includes("/reel/")) {
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
  const videoSection = document.getElementById("video-section")!;
  const creatorSection = document.getElementById("creator-section")!;
  const videoSectionTitle = videoSection.querySelector("h2")!;
  const addVideoButton = document.getElementById("btn-add-video")!;
  const creatorSectionTitle = document.getElementById("creator-section-title")!;
  const creatorUsername = document.getElementById("creator-username")!;
  const creatorPlatform = document.getElementById("creator-platform")!;
  
  // Hide both sections by default
  videoSection.style.display = "none";
  creatorSection.style.display = "none";
  
  if (tab?.url) {
    // Check for video first
    const { isVideo, platform: videoPlatform } = isVideoUrl(tab.url);
    if (isVideo) {
      videoSection.style.display = "block";
      videoSectionTitle.textContent = `Add ${videoPlatform} Video to Collection`;
      addVideoButton.textContent = `Add ${videoPlatform} Video`;
    } else {
      // Check for creator profile if not a video
      const { isCreator, platform: creatorPlatform, username } = isCreatorProfile(tab.url);
      if (isCreator) {
        creatorSection.style.display = "block";
        creatorSectionTitle.textContent = `Add ${creatorPlatform.charAt(0).toUpperCase() + creatorPlatform.slice(1)} Creator`;
        creatorUsername.textContent = `@${username}`;
        creatorPlatform.textContent = `${creatorPlatform.charAt(0).toUpperCase() + creatorPlatform.slice(1)} Profile`;
        
        // Store creator info for button click
        (window as any).currentCreator = { username, platform: creatorPlatform };
      }
    }
  }
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

document.getElementById("btn-save-tab")!.addEventListener("click", async () => {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  const title = (tab?.title ?? "Saved Page").slice(0, 120);
  const url = tab?.url ?? "";
  show("Saving...");
  save(url, title, ["from-extension", "page"]).catch(console.error);
});

document.getElementById("btn-save-selection")!.addEventListener("click", async () => {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  const selection = await browser.scripting.executeScript({
    target: { tabId: tab!.id! },
    func: () => window.getSelection()?.toString() ?? "",
  });
  const selectedText = (selection[0]?.result as string) ?? "";
  const title = (tab?.title ?? "Selected Text").slice(0, 120);
  const url = tab?.url ?? "";
  const content = `${selectedText}\n\nSource: ${url}`.trim();
  show("Saving...");
  save(content, title, ["from-extension", "selection"]).catch(console.error);
});
