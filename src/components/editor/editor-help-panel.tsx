'use client';

import React from 'react';
import { HelpCircle, Keyboard, Zap, BookOpen, X } from 'lucide-react';
import { 
  scriptEditorTooltips, 
  customBlockSlashCommands, 
  editorTips, 
  keyboardShortcuts,
  helpResources 
} from '@/data/editor-tooltips';

interface EditorHelpPanelProps {
  editorType: 'script' | 'custom' | 'blocknote';
  isOpen: boolean;
  onClose: () => void;
}

export function EditorHelpPanel({ editorType, isOpen, onClose }: EditorHelpPanelProps) {
  if (!isOpen) return null;

  const getEditorIcon = () => {
    switch (editorType) {
      case 'script': return '🚀';
      case 'custom': return '🎨';
      case 'blocknote': return '📝';
      default: return '📝';
    }
  };

  const getEditorName = () => {
    switch (editorType) {
      case 'script': return 'Script Editor';
      case 'custom': return 'Custom Block Editor';
      case 'blocknote': return 'BlockNote Editor';
      default: return 'Editor';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{getEditorIcon()}</span>
            <div>
              <h2 className="text-lg font-semibold">{getEditorName()} Help</h2>
              <p className="text-sm text-gray-500">Shortcuts, commands, and tips</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
          <div className="grid md:grid-cols-2 gap-6">
            
            {/* Keyboard Shortcuts */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <Keyboard className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-blue-800">Keyboard Shortcuts</h3>
              </div>
              
              {editorType === 'script' && (
                <div className="space-y-2">
                  {keyboardShortcuts.scriptEditor.map((shortcut, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">{shortcut.action}</span>
                      <div className="flex gap-1">
                        {(shortcut.mac || shortcut.keys).map((key, i) => (
                          <kbd key={i} className="px-2 py-1 text-xs bg-white border rounded">
                            {key}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {editorType === 'custom' && (
                <div className="space-y-2">
                  {keyboardShortcuts.customBlockEditor.map((shortcut, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">{shortcut.action}</span>
                      <div className="flex gap-1">
                        {shortcut.keys.map((key, i) => (
                          <kbd key={i} className="px-2 py-1 text-xs bg-white border rounded">
                            {key}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Universal Shortcuts */}
              <div className="pt-3 border-t">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Universal</h4>
                <div className="space-y-1">
                  {keyboardShortcuts.universal.slice(0, 4).map((shortcut, index) => (
                    <div key={index} className="flex items-center justify-between p-1 text-xs">
                      <span className="text-gray-600">{shortcut.action}</span>
                      <div className="flex gap-1">
                        {(shortcut.mac || shortcut.keys).map((key, i) => (
                          <kbd key={i} className="px-1 py-0.5 bg-gray-100 border rounded text-xs">
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
            {editorType === 'custom' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="h-5 w-5 text-purple-600" />
                  <h3 className="font-semibold text-purple-800">Slash Commands</h3>
                </div>
                
                <div className="space-y-2">
                  {customBlockSlashCommands.filter(cmd => cmd.category === 'script-blocks').map((command, index) => (
                    <div key={index} className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{command.icon}</span>
                        <code className="text-sm font-mono bg-purple-100 px-2 py-1 rounded">
                          {command.command}
                        </code>
                      </div>
                      <p className="text-sm text-purple-700">{command.description}</p>
                      {command.example && (
                        <p className="text-xs text-purple-600 mt-1 italic">{command.example}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tips Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold text-green-800">Tips & Best Practices</h3>
              </div>
              
              <div className="space-y-2">
                {(editorType === 'script' ? editorTips.scriptEditor : 
                  editorType === 'custom' ? editorTips.customBlockEditor :
                  editorTips.general).map((tip, index) => (
                  <div key={index} className="flex items-start gap-2 p-2 bg-green-50 rounded">
                    <span className="text-green-600 text-sm mt-0.5">💡</span>
                    <p className="text-sm text-green-700">{tip}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Common Questions */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <HelpCircle className="h-5 w-5 text-orange-600" />
                <h3 className="font-semibold text-orange-800">Common Questions</h3>
              </div>
              
              <div className="space-y-3">
                {helpResources.commonQuestions.slice(0, 3).map((qa, index) => (
                  <div key={index} className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <h4 className="text-sm font-medium text-orange-800 mb-1">{qa.question}</h4>
                    <p className="text-sm text-orange-700">{qa.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t text-center">
            <p className="text-xs text-gray-500">
              For complete documentation, see the{' '}
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