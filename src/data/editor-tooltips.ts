// Editor tooltips and help resources for UI components

export interface EditorTooltip {
  id: string;
  title: string;
  description: string;
  shortcut?: string;
  category: "formatting" | "blocks" | "navigation" | "general";
}

export interface SlashCommand {
  command: string;
  description: string;
  icon: string;
  category: "script-blocks" | "formatting" | "structure";
  example?: string;
}

// Script Editor Tooltips
export const scriptEditorTooltips: EditorTooltip[] = [
  {
    id: "bold",
    title: "Bold Text",
    description: "Make text bold with markdown formatting",
    shortcut: "Ctrl+B / Cmd+B",
    category: "formatting",
  },
  {
    id: "italic",
    title: "Italic Text",
    description: "Make text italic with markdown formatting",
    shortcut: "Ctrl+I / Cmd+I",
    category: "formatting",
  },
  {
    id: "line-break",
    title: "Line Break",
    description: "Insert double line break for paragraph separation",
    shortcut: "Ctrl+Enter / Cmd+Enter",
    category: "formatting",
  },
  {
    id: "auto-resize",
    title: "Auto Resize",
    description: "Editor automatically grows with your content",
    category: "general",
  },
  {
    id: "character-count",
    title: "Character Counter",
    description: "Live character count displayed in toolbar",
    category: "general",
  },
];

// Custom Block Editor Slash Commands
export const customBlockSlashCommands: SlashCommand[] = [
  {
    command: "/hook",
    description: "Add a hook block for attention-grabbing opening statements",
    icon: "🪝",
    category: "script-blocks",
    example: "Perfect for script openings that capture audience attention",
  },
  {
    command: "/bridge",
    description: "Add a bridge block for smooth transitions between topics",
    icon: "🌉",
    category: "script-blocks",
    example: "Connect different sections and maintain flow",
  },
  {
    command: "/golden-nugget",
    description: "Add a golden nugget block for key insights and takeaways",
    icon: "💡",
    category: "script-blocks",
    example: "Highlight the most valuable information",
  },
  {
    command: "/nugget",
    description: "Shorthand for golden nugget block",
    icon: "💡",
    category: "script-blocks",
    example: "Quick access to golden nugget block",
  },
  {
    command: "/cta",
    description: "Add a call-to-action block for directing audience actions",
    icon: "🎯",
    category: "script-blocks",
    example: "Clear next steps and action items",
  },
  {
    command: "/paragraph",
    description: "Add a standard paragraph block",
    icon: "📝",
    category: "structure",
    example: "Basic text content",
  },
  {
    command: "/heading",
    description: "Add a heading block for section titles",
    icon: "📋",
    category: "structure",
    example: "Structure your content with headings",
  },
];

// General Editor Tips
export const editorTips = {
  scriptEditor: [
    "Use Ctrl/Cmd + B for **bold** text formatting",
    "Press Ctrl/Cmd + I for *italic* text formatting",
    "Ctrl/Cmd + Enter adds proper paragraph breaks",
    "The character counter helps track script length",
    "Plain text output is perfect for AI processing",
    "Auto-resize keeps your content visible as you type",
  ],
  customBlockEditor: [
    'Type "/" to see all available custom blocks',
    "Use Hook blocks for strong script openings",
    "Bridge blocks help maintain flow between topics",
    "Golden Nugget blocks highlight key takeaways",
    "CTA blocks provide clear calls-to-action",
    "Each block has visual styling for easy identification",
    "Blocks can contain rich text and formatting",
  ],
  general: [
    "Content is preserved when switching between editors",
    "Script Editor is recommended for AI integration",
    "Custom Block Editor is ideal for structured content",
    "All editors support copy/paste functionality",
    "Use the editor comparison page to test features",
  ],
};

// Keyboard Shortcuts Reference
export const keyboardShortcuts = {
  scriptEditor: [
    { keys: ["Ctrl", "B"], action: "Bold text", mac: ["Cmd", "B"] },
    { keys: ["Ctrl", "I"], action: "Italic text", mac: ["Cmd", "I"] },
    { keys: ["Ctrl", "Enter"], action: "Line break", mac: ["Cmd", "Enter"] },
  ],
  customBlockEditor: [
    { keys: ["/"], action: "Open slash commands" },
    { keys: ["Enter"], action: "Create new line in block" },
    { keys: ["Backspace"], action: "Delete empty blocks" },
  ],
  universal: [
    { keys: ["Ctrl", "A"], action: "Select all", mac: ["Cmd", "A"] },
    { keys: ["Ctrl", "C"], action: "Copy", mac: ["Cmd", "C"] },
    { keys: ["Ctrl", "V"], action: "Paste", mac: ["Cmd", "V"] },
    { keys: ["Ctrl", "Z"], action: "Undo", mac: ["Cmd", "Z"] },
  ],
};

// Error Messages and Solutions
export const editorErrorSolutions = {
  "Position -1 out of range": {
    description: "ProseMirror position error in BlockNote editors",
    solution: "Switch to Script Editor for reliable editing",
    severity: "warning",
  },
  "BlockNote initialization failed": {
    description: "Editor failed to load properly",
    solution: "Try refreshing the page or use Script Editor fallback",
    severity: "error",
  },
  "Content parsing error": {
    description: "Invalid content format detected",
    solution: "Content will be converted to plain text automatically",
    severity: "info",
  },
};

// Help Resources
export const helpResources = {
  documentation: "/docs/editor-guide.md",
  videoTutorials: [
    {
      title: "Getting Started with Script Editor",
      url: "#",
      description: "Learn the basics of script writing with keyboard shortcuts",
    },
    {
      title: "Using Custom Blocks for Script Structure",
      url: "#",
      description: "Master hook, bridge, golden nugget, and CTA blocks",
    },
  ],
  commonQuestions: [
    {
      question: "Which editor should I use?",
      answer:
        "Script Editor for AI integration and reliability, Custom Block Editor for structured content with visual blocks.",
    },
    {
      question: "How do I add custom blocks?",
      answer: 'Type "/" in the Custom Block Editor to see all available slash commands for blocks.',
    },
    {
      question: "Can I switch between editors?",
      answer: "Yes, content is preserved when switching. Use the test page to compare different editors.",
    },
    {
      question: "What if I encounter errors?",
      answer: "Script Editor is the most reliable option. BlockNote editors may have occasional issues.",
    },
  ],
};

export default {
  scriptEditorTooltips,
  customBlockSlashCommands,
  editorTips,
  keyboardShortcuts,
  editorErrorSolutions,
  helpResources,
};
