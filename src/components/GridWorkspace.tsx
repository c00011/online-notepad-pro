import React, { useState } from 'react';
import { NoteTab, PanelConfig, FontSettings, GridLayout, PanelMode } from '../types';
import { TextEditorPanel } from './TextEditorPanel';

interface GridWorkspaceProps {
  panels: PanelConfig[];
  tabs: NoteTab[];
  activeTabId: string;
  gridLayout: GridLayout;
  fontSettings: FontSettings;
  zoomLevel: number;
  onUpdatePanelMode: (panelId: string, mode: PanelMode, compareTabId?: string) => void;
  onSelectTabForPanel: (panelId: string, tabId: string) => void;
  onUpdateContent: (tabId: string, newContent: string) => void;
  onCursorChange: (line: number, col: number, selectedText: string) => void;
}

export const GridWorkspace: React.FC<GridWorkspaceProps> = ({
  panels,
  tabs,
  activeTabId,
  gridLayout,
  fontSettings,
  zoomLevel,
  onUpdatePanelMode,
  onSelectTabForPanel,
  onUpdateContent,
  onCursorChange
}) => {
  const [maximizedPanelId, setMaximizedPanelId] = useState<string | null>(null);

  // Active tab fallback
  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  // Slice panels based on gridLayout count (1, 2, 3, 4, or 6)
  const visiblePanels = panels.slice(0, gridLayout);

  const handleToggleMaximize = (panelId: string) => {
    setMaximizedPanelId(maximizedPanelId === panelId ? null : panelId);
  };

  // Determine grid container CSS classes
  const getGridClass = () => {
    switch (gridLayout) {
      case 1:
        return 'grid-cols-1 grid-rows-1';
      case 2:
        return 'grid-cols-1 md:grid-cols-2 grid-rows-1';
      case 3:
        return 'grid-cols-1 md:grid-cols-3 grid-rows-1';
      case 4:
        return 'grid-cols-1 md:grid-cols-2 grid-rows-2';
      case 6:
        return 'grid-cols-1 md:grid-cols-3 grid-rows-2';
      default:
        return 'grid-cols-1 grid-rows-1';
    }
  };

  return (
    <div className="fluent-editor-app flex-1 w-full h-full p-2 bg-[#f3f3f3] dark:bg-[#1f1f1f] overflow-hidden">
      <div className={`grid h-full w-full gap-2 ${getGridClass()}`}>
        {visiblePanels.map((panel) => {
          // Identify panel tab
          const panelTab = tabs.find((t) => t.id === panel.activeTabId) || activeTab;

          return (
            <TextEditorPanel
              key={panel.id}
              panel={panel}
              tabs={tabs}
              activeTab={panelTab}
              fontSettings={fontSettings}
              zoomLevel={zoomLevel}
              onUpdatePanelMode={onUpdatePanelMode}
              onSelectTabForPanel={onSelectTabForPanel}
              onUpdateContent={onUpdateContent}
              onCursorChange={onCursorChange}
              isMaximized={maximizedPanelId === panel.id}
              onToggleMaximizePanel={handleToggleMaximize}
            />
          );
        })}
      </div>
    </div>
  );
};
