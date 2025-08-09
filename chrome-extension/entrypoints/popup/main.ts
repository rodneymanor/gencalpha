document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial; padding: 12px; width: 320px;">
    <h1 style="font-size:16px; margin:0 0 12px;">GenC Quick Actions</h1>
    <div style="display:flex; flex-direction:column; gap:8px;">
      <button id="btn-save-tab" style="padding:8px 12px; border:1px solid #eee; border-radius:999px; background:#fafafa; cursor:pointer;">Save current tab to Idea Inbox</button>
      <button id="btn-save-selection" style="padding:8px 12px; border:1px solid #eee; border-radius:999px; background:#fafafa; cursor:pointer;">Save selection to Idea Inbox</button>
    </div>
    <div id="status" style="margin-top:10px; font-size:12px; color:#555;"></div>
  </div>
`;

const show = (msg: string) => {
  const el = document.getElementById("status")!;
  el.textContent = msg;
  setTimeout(() => (el.textContent = ""), 1500);
};

const save = async (content: string, title: string, tags: string[]) => {
  const { genc_base_url, genc_api_key } = await browser.storage.sync.get(["genc_base_url", "genc_api_key"]);
  const baseUrl = genc_base_url ?? "http://localhost:3000";
  const apiKey = genc_api_key as string | undefined;
  if (!apiKey) return show("Set API key in Options");
  await fetch(`${baseUrl}/api/chrome-extension/idea-inbox/text`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": apiKey },
    body: JSON.stringify({ title, content, tags }),
  });
  show("Saved");
};

document.getElementById("btn-save-tab")!.addEventListener("click", async () => {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  const title = (tab?.title ?? "Saved Page").slice(0, 120);
  const url = tab?.url ?? "";
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
  save(content, title, ["from-extension", "selection"]).catch(console.error);
});
