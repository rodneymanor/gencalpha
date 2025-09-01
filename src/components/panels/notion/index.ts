// Main exports
export { default as NotionPanel } from './NotionPanel';
export { default as NotionPanelWrapper } from './NotionPanelWrapper';

// Sub-components (for advanced use cases)
export { default as NotionPanelHeader } from './NotionPanelHeader';
export { default as NotionPanelProperties } from './NotionPanelProperties';
export { default as NotionPanelTabs } from './NotionPanelTabs';
export { default as NotionPanelResize } from './NotionPanelResize';

// Export all types
export type { 
  PageProperty,
  TabType, 
  TabData,
  PanelMode,
  NotionPanelConfig,
  NotionPanelProps
} from './types';

// Export presets for quick setup
export { PanelPresets } from './types';