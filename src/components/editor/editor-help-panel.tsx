"use client";

import React from "react";

import { HelpCircle, Keyboard, Zap, BookOpen, X } from "lucide-react";

import { customBlockSlashCommands, editorTips, keyboardShortcuts, helpResources } from "@/data/editor-tooltips";

interface EditorHelpPanelProps {
  editorType: "script" | "custom" | "blocknote";
  isOpen: boolean;
  onClose: () => void;
}

export function EditorHelpPanel({ editorType, isOpen, onClose }: EditorHelpPanelProps) {
  if (!isOpen) return null;

  const getEditorIcon = () => {
    switch (editorType) {
      case "script":
        return "🚀";
      case "custom":
        return "🎨";
      case "blocknote":
        return "📝";
      default:
        return "📝";
    }
  };

  const getEditorName = () => {
    switch (editorType) {
      case "script":
        return "Script Editor";
      case "custom":
        return "Custom Block Editor";
      case "blocknote":
        return "BlockNote Editor";
      default:
        return "Editor";
    }
  };

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="max-h-[80vh] max-w-4xl overflow-hidden rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{getEditorIcon()}</span>
            <div>
              <h2 className="text-lg font-semibold">{getEditorName()} Help</h2>
              <p className="text-sm text-gray-500">Shortcuts, commands, and tips</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-full p-2 transition-colors hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[calc(80vh-80px)] overflow-y-auto p-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Keyboard Shortcuts */}
            <div className="space-y-4">
              <div className="mb-3 flex items-center gap-2">
                <Keyboard className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-blue-800">Keyboard Shortcuts</h3>
              </div>

              {editorType === "script" && (
                <div className="space-y-2">
                  {keyboardShortcuts.scriptEditor.map((shortcut, index) => (
                    <div key={index} className="flex items-center justify-between rounded bg-gray-50 p-2">
                      <span className="text-sm">{shortcut.action}</span>
                      <div className="flex gap-1">
                        {(shortcut.mac || shortcut.keys).map((key, i) => (
                          <kbd key={i} className="rounded border bg-white px-2 py-1 text-xs">
                            {key}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {editorType === "custom" && (
                <div className="space-y-2">
                  {keyboardShortcuts.customBlockEditor.map((shortcut, index) => (
                    <div key={index} className="flex items-center justify-between rounded bg-gray-50 p-2">
                      <span className="text-sm">{shortcut.action}</span>
                      <div className="flex gap-1">
                        {shortcut.keys.map((key, i) => (
                          <kbd key={i} className="rounded border bg-white px-2 py-1 text-xs">
                            {key}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Universal Shortcuts */}
              <div className="border-t pt-3">
                <h4 className="mb-2 text-sm font-medium text-gray-700">Universal</h4>
                <div className="space-y-1">
                  {keyboardShortcuts.universal.slice(0, 4).map((shortcut, index) => (
                    <div key={index} className="flex items-center justify-between p-1 text-xs">
                      <span className="text-gray-600">{shortcut.action}</span>
                      <div className="flex gap-1">
                        {(shortcut.mac || shortcut.keys).map((key, i) => (
                          <kbd key={i} className="rounded border bg-gray-100 px-1 py-0.5 text-xs">
                            {key}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Slash Commands (Custom Editor Only) */}
            {editorType === "custom" && (
              <div className="space-y-4">
                <div className="mb-3 flex items-center gap-2">
                  <Zap className="h-5 w-5 text-purple-600" />
                  <h3 className="font-semibold text-purple-800">Slash Commands</h3>
                </div>

                <div className="space-y-2">
                  {customBlockSlashCommands
                    .filter((cmd) => cmd.category === "script-blocks")
                    .map((command, index) => (
                      <div key={index} className="rounded-lg border border-purple-200 bg-purple-50 p-3">
                        <div className="mb-1 flex items-center gap-2">
                          <span className="text-lg">{command.icon}</span>
                          <code className="rounded bg-purple-100 px-2 py-1 font-mono text-sm">{command.command}</code>
                        </div>
                        <p className="text-sm text-purple-700">{command.description}</p>
                        {command.example && <p className="mt-1 text-xs text-purple-600 italic">{command.example}</p>}
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Tips Section */}
            <div className="space-y-4">
              <div className="mb-3 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold text-green-800">Tips & Best Practices</h3>
              </div>

              <div className="space-y-2">
                {(editorType === "script"
                  ? editorTips.scriptEditor
                  : editorType === "custom"
                    ? editorTips.customBlockEditor
                    : editorTips.general
                ).map((tip, index) => (
                  <div key={index} className="flex items-start gap-2 rounded bg-green-50 p-2">
                    <span className="mt-0.5 text-sm text-green-600">💡</span>
                    <p className="text-sm text-green-700">{tip}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Common Questions */}
            <div className="space-y-4">
              <div className="mb-3 flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-orange-600" />
                <h3 className="font-semibold text-orange-800">Common Questions</h3>
              </div>

              <div className="space-y-3">
                {helpResources.commonQuestions.slice(0, 3).map((qa, index) => (
                  <div key={index} className="rounded-lg border border-orange-200 bg-orange-50 p-3">
                    <h4 className="mb-1 text-sm font-medium text-orange-800">{qa.question}</h4>
                    <p className="text-sm text-orange-700">{qa.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 border-t pt-4 text-center">
            <p className="text-xs text-gray-500">
              For complete documentation, see the{" "}
              <a href="/docs/editor-guide.md" className="text-blue-600 hover:underline">
                Editor Guide
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditorHelpPanel;
