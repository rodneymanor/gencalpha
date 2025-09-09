async function init() {
  const isProduction = process.env.NODE_ENV === 'production';
  const { genc_api_key, genc_base_url } = await browser.storage.sync.get(["genc_api_key", "genc_base_url"]);
  (document.getElementById("apiKey") as HTMLInputElement).value = genc_api_key ?? "";
  
  const baseUrlInput = document.getElementById("baseUrl") as HTMLInputElement;
  const baseUrlContainer = document.getElementById("baseUrlContainer");
  
  if (isProduction) {
    // In production, hide the URL field and show fixed URL
    baseUrlInput.value = "https://www.gencapp.pro";
    baseUrlInput.disabled = true;
    if (baseUrlContainer) {
      const label = baseUrlContainer.querySelector("label");
      if (label) {
        label.innerHTML = `<strong>Server URL:</strong> <span style="color: #666;">https://www.gencapp.pro (Production)</span>`;
      }
      baseUrlInput.style.display = "none";
    }
  } else {
    // In development, allow URL customization
    baseUrlInput.value = genc_base_url ?? "http://localhost:3000";
  }
}

async function save() {
  const isProduction = process.env.NODE_ENV === 'production';
  const apiKey = (document.getElementById("apiKey") as HTMLInputElement).value.trim();
  
  // In production, always use the fixed URL
  const baseUrl = isProduction 
    ? "https://www.gencapp.pro" 
    : (document.getElementById("baseUrl") as HTMLInputElement).value.trim() || "http://localhost:3000";
    
  await browser.storage.sync.set({ genc_api_key: apiKey, genc_base_url: baseUrl });
  const status = document.getElementById("status")!;
  status.textContent = "Saved";
  setTimeout(() => (status.textContent = ""), 1500);
}

document.getElementById("saveBtn")!.addEventListener("click", () => {
  save().catch(console.error);
});

init().catch(console.error);
