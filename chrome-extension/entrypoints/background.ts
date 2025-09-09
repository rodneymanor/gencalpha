export default defineBackground(() => {
  console.log("🔧 GenC Extension background ready", { id: browser.runtime.id });

  browser.runtime.onInstalled.addListener(() => {
    console.log("🧩 Installed");
  });

  // Context menu: Save page/selection to idea inbox
  const MENU_SAVE_PAGE = "genc_save_page";
  const MENU_SAVE_SELECTION = "genc_save_selection";

  if (browser.contextMenus) {
    try {
      browser.contextMenus.create({ id: MENU_SAVE_PAGE, title: "GenC: Save page to Idea Inbox", contexts: ["page"] });
      browser.contextMenus.create({
        id: MENU_SAVE_SELECTION,
        title: "GenC: Save selection to Idea Inbox",
        contexts: ["selection"],
      });
    } catch {
      // ignore duplicate menu errors on reload
    }

    const getAuthHeaders = async (): Promise<{ baseUrl: string; headers: Record<string, string> } | null> => {
      // In production, use fixed URL. In dev, allow custom URL from storage
      const isProduction = process.env.NODE_ENV === 'production';
      let baseUrl: string;
      
      if (isProduction) {
        baseUrl = "https://www.gencapp.pro";
      } else {
        baseUrl = (await browser.storage.sync.get("genc_base_url")).genc_base_url ?? "http://localhost:3000";
      }
      
      const apiKey = (await browser.storage.sync.get("genc_api_key")).genc_api_key;
      if (!apiKey) {
        console.warn("No API key set");
        return null;
      }
      return { baseUrl, headers: { "Content-Type": "application/json", "x-api-key": apiKey } };
    };

    const savePage = async (tab?: browser.Tabs.Tab) => {
      const auth = await getAuthHeaders();
      if (!auth) return;
      const title = (tab?.title ?? "Saved Page").slice(0, 120);
      const url = tab?.url ?? "";
      await fetch(`${auth.baseUrl}/api/chrome-extension/idea-inbox/text`, {
        method: "POST",
        headers: auth.headers,
        body: JSON.stringify({ title, content: url, tags: ["from-extension", "page"] }),
      }).catch(console.error);
    };

    const saveSelection = async (info: browser.Menus.OnClickData, tab?: browser.Tabs.Tab) => {
      const auth = await getAuthHeaders();
      if (!auth) return;
      const title = (tab?.title ?? "Selected Text").slice(0, 120);
      const url = tab?.url ?? "";
      const selected = info.selectionText ?? "";
      const content = `${selected}\n\nSource: ${url}`.trim();
      await fetch(`${auth.baseUrl}/api/chrome-extension/idea-inbox/text`, {
        method: "POST",
        headers: auth.headers,
        body: JSON.stringify({ title, content, tags: ["from-extension", "selection"] }),
      }).catch(console.error);
    };

    browser.contextMenus.onClicked.addListener(async (info, tab) => {
      if (info.menuItemId === MENU_SAVE_PAGE) return savePage(tab);
      if (info.menuItemId === MENU_SAVE_SELECTION) return saveSelection(info, tab);
    });
  }
});
