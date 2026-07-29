/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  AppState,
  NoteTab,
  PanelConfig,
  GridLayout,
  ThemeMode,
  FindReplaceState,
  PanelMode
} from './types';
import { DEFAULT_SAMPLE_TABS } from './utils/sampleData';
import { exportAsMarkdown, exportAsText, exportAsWordDoc, exportAsPDF, printContent } from './utils/exporter';
import { FluentHeader } from './components/FluentHeader';
import { TabBar } from './components/TabBar';
import { GridWorkspace } from './components/GridWorkspace';
import { FindReplaceBar } from './components/FindReplaceBar';
import { StatusBar } from './components/StatusBar';
import { Dialogs } from './components/Dialogs';

const STORAGE_KEY = 'pro_web_notepad_session_v1';

export default function App() {
  // Initial State Setup with localStorage Memory
  const [appState, setAppState] = useState<AppState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.tabs && parsed.tabs.length > 0) {
          return {
            ...parsed,
            findReplace: {
              isOpen: false,
              findText: '',
              replaceText: '',
              matchCase: false,
              wholeWord: false,
              useRegex: false,
              matchIndex: 0,
              totalMatches: 0
            }
          };
        }
      }
    } catch (e) {
      console.warn('Failed to restore session from localStorage:', e);
    }

    // Default Initial State
    const defaultTabs = DEFAULT_SAMPLE_TABS;
    const defaultActiveId = defaultTabs[0].id;

    return {
      tabs: defaultTabs,
      activeTabId: defaultActiveId,
      panels: [
        { id: 'panel-1', activeTabId: defaultActiveId, mode: 'edit' },
        { id: 'panel-2', activeTabId: defaultTabs[1]?.id || defaultActiveId, mode: 'preview' },
        { id: 'panel-3', activeTabId: defaultTabs[2]?.id || defaultActiveId, mode: 'edit' },
        { id: 'panel-4', activeTabId: defaultActiveId, mode: 'diff' },
        { id: 'panel-5', activeTabId: defaultActiveId, mode: 'edit' },
        { id: 'panel-6', activeTabId: defaultActiveId, mode: 'edit' }
      ],
      gridLayout: 1,
      theme: 'light',
      fontSettings: {
        fontFamily: 'Segoe UI',
        fontSize: 14,
        lineHeight: 1.6,
        wordWrap: true,
        showLineNumbers: true
      },
      showStatusBar: true,
      showToolbar: true,
      zoomLevel: 100,
      findReplace: {
        isOpen: false,
        findText: '',
        replaceText: '',
        matchCase: false,
        wholeWord: false,
        useRegex: false,
        matchIndex: 0,
        totalMatches: 0
      }
    };
  });

  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1, selectedText: '' });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeModal, setActiveModal] = useState<'shortcuts' | 'about' | 'markdown' | 'table' | null>(null);

  // Active Tab Object
  const activeTab = appState.tabs.find((t) => t.id === appState.activeTabId) || appState.tabs[0];

  // Sync theme class with HTML root element
  useEffect(() => {
    if (appState.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [appState.theme]);

  // Session Memory: Auto-save state to localStorage
  useEffect(() => {
    try {
      const toSave = {
        tabs: appState.tabs,
        activeTabId: appState.activeTabId,
        panels: appState.panels,
        gridLayout: appState.gridLayout,
        theme: appState.theme,
        fontSettings: appState.fontSettings,
        showStatusBar: appState.showStatusBar,
        zoomLevel: appState.zoomLevel
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (err) {
      console.warn('Failed to save session to localStorage:', err);
    }
  }, [
    appState.tabs,
    appState.activeTabId,
    appState.panels,
    appState.gridLayout,
    appState.theme,
    appState.fontSettings,
    appState.showStatusBar,
    appState.zoomLevel
  ]);

  // Global Command Line Hook: window.openFileFromCLI(filename, content)
  useEffect(() => {
    (window as any).openFileFromCLI = (filename: string, content: string) => {
      const newTabId = `cli-${Date.now()}`;
      const newTab: NoteTab = {
        id: newTabId,
        title: filename || 'CLI_File.txt',
        content: content || '',
        isUnsaved: true,
        createdAt: Date.now(),
        modifiedAt: Date.now(),
        language: filename?.endsWith('.md') ? 'markdown' : 'text'
      };

      setAppState((prev) => ({
        ...prev,
        tabs: [...prev.tabs, newTab],
        activeTabId: newTabId,
        panels: prev.panels.map((p, idx) => (idx === 0 ? { ...p, activeTabId: newTabId } : p))
      }));
    };
  }, []);

  // Handlers for File & Tab Operations
  const handleNewTab = useCallback(() => {
    const count = appState.tabs.length + 1;
    const newTabId = `tab-${Date.now()}`;
    const newTab: NoteTab = {
      id: newTabId,
      title: `Untitled_${count}.md`,
      content: '# New Document\n\nStart typing your notes...',
      isUnsaved: true,
      createdAt: Date.now(),
      modifiedAt: Date.now(),
      language: 'markdown'
    };

    setAppState((prev) => ({
      ...prev,
      tabs: [...prev.tabs, newTab],
      activeTabId: newTabId,
      panels: prev.panels.map((p, idx) => (idx === 0 ? { ...p, activeTabId: newTabId } : p))
    }));
  }, [appState.tabs.length]);

  const handleSelectTab = useCallback((tabId: string) => {
    setAppState((prev) => ({
      ...prev,
      activeTabId: tabId,
      panels: prev.panels.map((p, idx) => (idx === 0 ? { ...p, activeTabId: tabId } : p))
    }));
  }, []);

  const handleCloseTab = useCallback(
    (tabId: string, e?: React.MouseEvent) => {
      if (e) e.stopPropagation();
      if (appState.tabs.length <= 1) return; // Keep at least 1 tab open

      const newTabs = appState.tabs.filter((t) => t.id !== tabId);
      const nextActiveId = appState.activeTabId === tabId ? newTabs[0].id : appState.activeTabId;

      setAppState((prev) => ({
        ...prev,
        tabs: newTabs,
        activeTabId: nextActiveId,
        panels: prev.panels.map((p) => (p.activeTabId === tabId ? { ...p, activeTabId: nextActiveId } : p))
      }));
    },
    [appState.tabs, appState.activeTabId]
  );

  const handleRenameTab = useCallback((tabId: string, newTitle: string) => {
    setAppState((prev) => ({
      ...prev,
      tabs: prev.tabs.map((t) => (t.id === tabId ? { ...t, title: newTitle } : t))
    }));
  }, []);

  const handleUpdateTabContent = useCallback((tabId: string, newContent: string) => {
    setAppState((prev) => ({
      ...prev,
      tabs: prev.tabs.map((t) =>
        t.id === tabId ? { ...t, content: newContent, isUnsaved: true, modifiedAt: Date.now() } : t
      )
    }));
  }, []);

  // Export handlers
  const handleExportFile = (type: 'md' | 'doc' | 'pdf' | 'txt') => {
    if (!activeTab) return;
    if (type === 'md') exportAsMarkdown(activeTab.title, activeTab.content);
    if (type === 'txt') exportAsText(activeTab.title, activeTab.content);
    if (type === 'doc') exportAsWordDoc(activeTab.title, activeTab.content);
    if (type === 'pdf') exportAsPDF(activeTab.title, activeTab.content);

    // Mark as saved
    setAppState((prev) => ({
      ...prev,
      tabs: prev.tabs.map((t) => (t.id === activeTab.id ? { ...t, isUnsaved: false } : t))
    }));
  };

  const handleSaveFile = () => {
    if (!activeTab) return;
    handleExportFile(activeTab.title.endsWith('.md') ? 'md' : 'txt');
  };

  const handlePrint = () => {
    if (activeTab) printContent(activeTab.title, activeTab.content);
  };

  // Layout & View Actions
  const handleSetGridLayout = (layout: GridLayout) => {
    setAppState((prev) => ({ ...prev, gridLayout: layout }));
  };

  const handleToggleTheme = () => {
    setAppState((prev) => ({ ...prev, theme: prev.theme === 'dark' ? 'light' : 'dark' }));
  };

  const handleTogglePreview = () => {
    setAppState((prev) => ({
      ...prev,
      panels: prev.panels.map((p, idx) =>
        idx === 0 ? { ...p, mode: p.mode === 'preview' ? 'edit' : 'preview' } : p
      )
    }));
  };

  const handleToggleDiff = () => {
    setAppState((prev) => ({
      ...prev,
      panels: prev.panels.map((p, idx) =>
        idx === 0 ? { ...p, mode: p.mode === 'diff' ? 'edit' : 'diff' } : p
      )
    }));
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const handleFontChange = (family?: string, size?: number) => {
    setAppState((prev) => ({
      ...prev,
      fontSettings: {
        ...prev.fontSettings,
        fontFamily: family !== undefined ? family : prev.fontSettings.fontFamily,
        fontSize: size !== undefined ? size : prev.fontSettings.fontSize
      }
    }));
  };

  const handleInsertText = (textToInsert: string) => {
    if (!activeTab) return;
    const newContent = activeTab.content + textToInsert;
    handleUpdateTabContent(activeTab.id, newContent);
  };

  // Panel updates
  const handleUpdatePanelMode = (panelId: string, mode: PanelMode, compareTabId?: string) => {
    setAppState((prev) => ({
      ...prev,
      panels: prev.panels.map((p) =>
        p.id === panelId ? { ...p, mode, compareTabId: compareTabId || p.compareTabId } : p
      )
    }));
  };

  const handleSelectTabForPanel = (panelId: string, tabId: string) => {
    setAppState((prev) => ({
      ...prev,
      panels: prev.panels.map((p) => (p.id === panelId ? { ...p, activeTabId: tabId } : p))
    }));
  };

  // Find & Replace Search Logic
  const handleFindNext = () => {
    if (!appState.findReplace.findText || !activeTab) return;
    const query = appState.findReplace.findText;
    const content = activeTab.content;

    let regex: RegExp;
    try {
      const flags = appState.findReplace.matchCase ? 'g' : 'gi';
      regex = appState.findReplace.useRegex ? new RegExp(query, flags) : new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags);
    } catch {
      return;
    }

    const matches = Array.from(content.matchAll(regex));
    if (matches.length === 0) {
      setAppState((prev) => ({
        ...prev,
        findReplace: { ...prev.findReplace, totalMatches: 0, matchIndex: 0 }
      }));
      return;
    }

    const nextIdx = (appState.findReplace.matchIndex + 1) % matches.length;
    setAppState((prev) => ({
      ...prev,
      findReplace: { ...prev.findReplace, totalMatches: matches.length, matchIndex: nextIdx }
    }));
  };

  const handleReplaceCurrent = () => {
    if (!appState.findReplace.findText || !activeTab) return;
    const query = appState.findReplace.findText;
    const replacement = appState.findReplace.replaceText;

    const updated = activeTab.content.replace(
      appState.findReplace.matchCase ? query : new RegExp(query, 'i'),
      replacement
    );
    handleUpdateTabContent(activeTab.id, updated);
  };

  const handleReplaceAll = () => {
    if (!appState.findReplace.findText || !activeTab) return;
    const query = appState.findReplace.findText;
    const replacement = appState.findReplace.replaceText;
    const flags = appState.findReplace.matchCase ? 'g' : 'gi';

    const updated = activeTab.content.replace(new RegExp(query, flags), replacement);
    handleUpdateTabContent(activeTab.id, updated);
  };

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrl = e.ctrlKey || e.metaKey;

      if (isCtrl && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSaveFile();
      } else if (isCtrl && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        handleNewTab();
      } else if (isCtrl && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setAppState((prev) => ({
          ...prev,
          findReplace: { ...prev.findReplace, isOpen: !prev.findReplace.isOpen }
        }));
      } else if (isCtrl && e.key === 'Tab') {
        e.preventDefault();
        const currentIdx = appState.tabs.findIndex((t) => t.id === appState.activeTabId);
        const nextIdx = e.shiftKey
          ? (currentIdx - 1 + appState.tabs.length) % appState.tabs.length
          : (currentIdx + 1) % appState.tabs.length;
        handleSelectTab(appState.tabs[nextIdx].id);
      } else if (isCtrl && (e.key === '=' || e.key === '+')) {
        e.preventDefault();
        setAppState((prev) => ({ ...prev, zoomLevel: Math.min(200, prev.zoomLevel + 10) }));
      } else if (isCtrl && e.key === '-') {
        e.preventDefault();
        setAppState((prev) => ({ ...prev, zoomLevel: Math.max(50, prev.zoomLevel - 10) }));
      } else if (isCtrl && e.key === '0') {
        e.preventDefault();
        setAppState((prev) => ({ ...prev, zoomLevel: 100 }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, appState.tabs, appState.activeTabId, handleSaveFile, handleNewTab, handleSelectTab]);

  return (
    <div
      className={`fluent-editor-app ${appState.theme} h-screen w-screen flex flex-col overflow-hidden bg-[#f3f3f3] dark:bg-[#1f1f1f] text-[#1c1c1c] dark:text-[#f0f0f0]`}
    >
      {/* Tier 1 & Tier 2: Classic Menu Bar + Icon Toolbar */}
      <FluentHeader
        appState={appState}
        onNewFile={handleNewTab}
        onOpenFile={() => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = '.txt,.md,.json,.js,.ts,.html,.css';
          input.onchange = (e: any) => {
            const file = e.target.files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = (event) => {
                const content = event.target?.result as string;
                (window as any).openFileFromCLI?.(file.name, content);
              };
              reader.readAsText(file);
            }
          };
          input.click();
        }}
        onSaveFile={handleSaveFile}
        onExportFile={handleExportFile}
        onPrint={handlePrint}
        onCloseTab={() => handleCloseTab(appState.activeTabId)}
        onUndo={() => document.execCommand('undo')}
        onRedo={() => document.execCommand('redo')}
        onCut={() => document.execCommand('cut')}
        onCopy={() => document.execCommand('copy')}
        onPaste={() => navigator.clipboard.readText().then((text) => handleInsertText(text))}
        onOpenFind={() =>
          setAppState((prev) => ({
            ...prev,
            findReplace: { ...prev.findReplace, isOpen: !prev.findReplace.isOpen }
          }))
        }
        onSelectAll={() => document.execCommand('selectAll')}
        onInsertText={handleInsertText}
        onSetGridLayout={handleSetGridLayout}
        onToggleTheme={handleToggleTheme}
        onTogglePreview={handleTogglePreview}
        onToggleDiff={handleToggleDiff}
        onToggleFullscreen={handleToggleFullscreen}
        onFontChange={handleFontChange}
        onToggleWordWrap={() =>
          setAppState((prev) => ({
            ...prev,
            fontSettings: { ...prev.fontSettings, wordWrap: !prev.fontSettings.wordWrap }
          }))
        }
        onToggleLineNumbers={() =>
          setAppState((prev) => ({
            ...prev,
            fontSettings: { ...prev.fontSettings, showLineNumbers: !prev.fontSettings.showLineNumbers }
          }))
        }
        onToggleStatusBar={() => setAppState((prev) => ({ ...prev, showStatusBar: !prev.showStatusBar }))}
        onZoom={(delta) =>
          setAppState((prev) => ({
            ...prev,
            zoomLevel: Math.max(50, Math.min(200, prev.zoomLevel + delta))
          }))
        }
        onResetZoom={() => setAppState((prev) => ({ ...prev, zoomLevel: 100 }))}
        onShowHelpModal={(modal) => setActiveModal(modal)}
        isFullscreen={isFullscreen}
      />

      {/* Tab Bar */}
      <TabBar
        tabs={appState.tabs}
        activeTabId={appState.activeTabId}
        onSelectTab={handleSelectTab}
        onNewTab={handleNewTab}
        onCloseTab={handleCloseTab}
        onRenameTab={handleRenameTab}
      />

      {/* Workspace Area: Multi-Panel Grid Container */}
      <main className="flex-1 relative overflow-hidden flex flex-col">
        {/* Floating Find & Replace Bar */}
        <FindReplaceBar
          findReplaceState={appState.findReplace}
          onUpdateState={(newState) =>
            setAppState((prev) => ({
              ...prev,
              findReplace: { ...prev.findReplace, ...newState }
            }))
          }
          onFindNext={handleFindNext}
          onFindPrev={handleFindNext}
          onReplaceCurrent={handleReplaceCurrent}
          onReplaceAll={handleReplaceAll}
          onClose={() =>
            setAppState((prev) => ({
              ...prev,
              findReplace: { ...prev.findReplace, isOpen: false }
            }))
          }
        />

        <GridWorkspace
          panels={appState.panels}
          tabs={appState.tabs}
          activeTabId={appState.activeTabId}
          gridLayout={appState.gridLayout}
          fontSettings={appState.fontSettings}
          zoomLevel={appState.zoomLevel}
          onUpdatePanelMode={handleUpdatePanelMode}
          onSelectTabForPanel={handleSelectTabForPanel}
          onUpdateContent={handleUpdateTabContent}
          onCursorChange={(line, col, selectedText) => setCursorPos({ line, col, selectedText })}
        />
      </main>

      {/* Status Bar */}
      <StatusBar
        appState={appState}
        activeTab={activeTab}
        cursorLine={cursorPos.line}
        cursorCol={cursorPos.col}
        selectedText={cursorPos.selectedText}
      />

      {/* Dialogs & Modals */}
      <Dialogs
        activeModal={activeModal}
        onClose={() => setActiveModal(null)}
        onInsertText={handleInsertText}
      />
    </div>
  );
}
