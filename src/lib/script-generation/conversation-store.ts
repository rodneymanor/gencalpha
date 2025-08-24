// Conversation store for managing script iteration sessions
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  ConversationContext, 
  ConversationMessage, 
  ScriptIteration, 
  ActionType 
} from './conversation-types';

interface ConversationStore {
  // Current active conversation
  activeConversation: ConversationContext | null;
  
  // All conversation sessions (for history)
  sessions: Map<string, ConversationContext>;
  
  // Actions
  startNewConversation: (idea: string, initialScript?: ScriptIteration) => string;
  addMessage: (sessionId: string, message: ConversationMessage) => void;
  updateScript: (sessionId: string, script: ScriptIteration) => void;
  loadSession: (sessionId: string) => void;
  clearCurrentSession: () => void;
  
  // Undo/Redo capability
  undoLastChange: (sessionId: string) => void;
  
  // Quick actions
  suggestNextActions: () => ActionType[];
  
  // Export/Import
  exportConversation: (sessionId: string) => string;
  importConversation: (data: string) => void;
}

export const useConversationStore = create<ConversationStore>()(
  persist(
    (set, get) => ({
      activeConversation: null,
      sessions: new Map(),
      
      startNewConversation: (idea: string, initialScript?: ScriptIteration) => {
        const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const newContext: ConversationContext = {
          sessionId,
          originalIdea: idea,
          currentScript: initialScript || {
            version: 1,
            content: '',
            elements: {
              hook: '',
              bridge: '',
              goldenNugget: '',
              wta: ''
            },
            metadata: {
              tone: 'casual',
              duration: '0:00',
              wordCount: 0,
              lastModified: new Date(),
              changeLog: ['Session started']
            }
          },
          history: [{
            id: `msg_${Date.now()}`,
            role: 'system',
            content: `New script writing session started for: "${idea}"`,
            timestamp: new Date()
          }],
          preferences: {}
        };
        
        set((state) => {
          const newSessions = new Map(state.sessions);
          newSessions.set(sessionId, newContext);
          return {
            activeConversation: newContext,
            sessions: newSessions
          };
        });
        
        return sessionId;
      },
      
      addMessage: (sessionId: string, message: ConversationMessage) => {
        set((state) => {
          const session = state.sessions.get(sessionId);
          if (!session) return state;
          
          const updatedSession = {
            ...session,
            history: [...session.history, message]
          };
          
          const newSessions = new Map(state.sessions);
          newSessions.set(sessionId, updatedSession);
          
          return {
            sessions: newSessions,
            activeConversation: state.activeConversation?.sessionId === sessionId 
              ? updatedSession 
              : state.activeConversation
          };
        });
      },
      
      updateScript: (sessionId: string, script: ScriptIteration) => {
        set((state) => {
          const session = state.sessions.get(sessionId);
          if (!session) return state;
          
          // Store previous version for undo
          const updatedSession = {
            ...session,
            currentScript: {
              ...script,
              version: session.currentScript.version + 1,
              metadata: {
                ...script.metadata,
                lastModified: new Date()
              }
            }
          };
          
          const newSessions = new Map(state.sessions);
          newSessions.set(sessionId, updatedSession);
          
          return {
            sessions: newSessions,
            activeConversation: state.activeConversation?.sessionId === sessionId 
              ? updatedSession 
              : state.activeConversation
          };
        });
      },
      
      loadSession: (sessionId: string) => {
        set((state) => {
          const session = state.sessions.get(sessionId);
          if (!session) return state;
          
          return { activeConversation: session };
        });
      },
      
      clearCurrentSession: () => {
        set({ activeConversation: null });
      },
      
      undoLastChange: (sessionId: string) => {
        // Implementation for undo - would need to store version history
        const session = get().sessions.get(sessionId);
        if (!session || session.currentScript.version <= 1) return;
        
        // Find previous script version from messages with scriptSnapshot
        const messagesWithSnapshots = session.history
          .filter(msg => msg.scriptSnapshot)
          .reverse();
          
        if (messagesWithSnapshots.length > 1) {
          const previousSnapshot = messagesWithSnapshots[1].scriptSnapshot;
          if (previousSnapshot) {
            // Parse and restore previous version
            try {
              const previousScript = JSON.parse(previousSnapshot);
              get().updateScript(sessionId, previousScript);
            } catch (e) {
              console.error('Failed to restore previous version:', e);
            }
          }
        }
      },
      
      suggestNextActions: () => {
        const conversation = get().activeConversation;
        if (!conversation) return [];
        
        const script = conversation.currentScript;
        const suggestions: ActionType[] = [];
        
        // Suggest based on current script state
        if (!script.elements.hook) {
          suggestions.push('refine_hook');
        }
        if (script.wordCount > 150) {
          suggestions.push('shorten_content');
        }
        if (script.wordCount < 60) {
          suggestions.push('expand_section');
        }
        
        // Always available actions
        suggestions.push('change_tone', 'add_cta', 'generate_variations');
        
        return suggestions;
      },
      
      exportConversation: (sessionId: string) => {
        const session = get().sessions.get(sessionId);
        if (!session) return '';
        
        return JSON.stringify(session, null, 2);
      },
      
      importConversation: (data: string) => {
        try {
          const session: ConversationContext = JSON.parse(data);
          
          // Convert date strings back to Date objects
          session.history.forEach(msg => {
            msg.timestamp = new Date(msg.timestamp);
          });
          session.currentScript.metadata.lastModified = new Date(session.currentScript.metadata.lastModified);
          
          set((state) => {
            const newSessions = new Map(state.sessions);
            newSessions.set(session.sessionId, session);
            return {
              sessions: newSessions,
              activeConversation: session
            };
          });
        } catch (e) {
          console.error('Failed to import conversation:', e);
        }
      }
    }),
    {
      name: 'script-conversations',
      // Custom serialization to handle Map
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          const { state } = JSON.parse(str);
          return {
            state: {
              ...state,
              sessions: new Map(state.sessions || [])
            }
          };
        },
        setItem: (name, value) => {
          const { state } = value as { state: ConversationStore };
          const serialized = {
            state: {
              ...state,
              sessions: Array.from(state.sessions.entries())
            }
          };
          localStorage.setItem(name, JSON.stringify(serialized));
        },
        removeItem: (name) => localStorage.removeItem(name)
      }
    }
  )
);