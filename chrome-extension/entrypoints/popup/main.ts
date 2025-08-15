document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial; padding: 16px; width: 360px; background: #fafafa;">
    <h1 style="font-size: 18px; margin: 0 0 16px; font-weight: 600; color: #1a1a1a;">GenC Quick Actions</h1>
    
    <!-- Video Section -->
    <div id="video-section" style="margin-bottom: 24px;">
      <h2 style="font-size: 14px; margin: 0 0 12px; font-weight: 500; color: #666;">Add Video to Collection</h2>
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <select id="collection-select" style="padding: 8px 12px; border: 1px solid #ddd; border-radius: 8px; background: white; font-size: 14px;">
          <option value="">Select a collection...</option>
        </select>
        <input id="new-collection-input" type="text" placeholder="Or create new collection..." style="padding: 8px 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 14px;">
        <button id="btn-add-video" style="padding: 10px 16px; border: none; border-radius: 8px; background: #0081F2; color: white; cursor: pointer; font-weight: 500; transition: all 0.15s ease;">Add Current Video</button>
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

const isYouTubeUrl = (url: string): boolean => {
  return url.includes("youtube.com") || url.includes("youtu.be");
};

// Load collections when popup opens
loadCollections();

// Check if current tab is a YouTube video and show/hide video section
browser.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
  const videoSection = document.getElementById("video-section")!;
  if (tab?.url && isYouTubeUrl(tab.url)) {
    videoSection.style.display = "block";
  } else {
    videoSection.style.display = "none";
  }
});

// Add video to collection
document.getElementById("btn-add-video")!.addEventListener("click", async () => {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  const videoUrl = tab?.url ?? "";
  const videoTitle = tab?.title ?? "";
  
  if (!videoUrl || !isYouTubeUrl(videoUrl)) {
    show("This is not a YouTube video", true);
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
  
  show("Adding video...");
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
