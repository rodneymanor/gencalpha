async function init() {
  const { genc_api_key, genc_base_url } = await browser.storage.sync.get(["genc_api_key", "genc_base_url"]);
  (document.getElementById("apiKey") as HTMLInputElement).value = genc_api_key ?? "";
  (document.getElementById("baseUrl") as HTMLInputElement).value = genc_base_url ?? "http://localhost:3000";
}

async function save() {
  const apiKey = (document.getElementById("apiKey") as HTMLInputElement).value.trim();
  const baseUrl = (document.getElementById("baseUrl") as HTMLInputElement).value.trim() || "http://localhost:3000";
  await browser.storage.sync.set({ genc_api_key: apiKey, genc_base_url: baseUrl });
  const status = document.getElementById("status")!;
  status.textContent = "Saved";
  setTimeout(() => (status.textContent = ""), 1500);
}

document.getElementById("saveBtn")!.addEventListener("click", () => {
  save().catch(console.error);
});

init().catch(console.error);
