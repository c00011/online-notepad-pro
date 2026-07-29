import React from 'react';
import { AppState, NoteTab } from '../types';
import { Type, Sparkles, Grid, Globe, Layers } from 'lucide-react';

interface StatusBarProps {
  appState: AppState;
  activeTab: NoteTab;
  cursorLine: number;
  cursorCol: number;
  selectedText: string;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  appState,
  activeTab,
  cursorLine,
  cursorCol,
  selectedText
}) => {
  if (!appState.showStatusBar) return null;

  const content = activeTab?.content || '';
  const words = content.trim() ? content.trim().split(/\s+/).length : 0;
  const chars = content.length;
  const lines = content.split('\n').length;
  const selectedChars = selectedText.length;

  return (
    <footer className="fluent-editor-app select-none flex items-center justify-between px-3 py-1 bg-[#eaeaea] dark:bg-[#1f1f1f] border-t border-[#e0e0e0] dark:border-[#333333] text-[11px] text-gray-600 dark:text-gray-400 font-mono">
      {/* Left Info: Cursor Line/Col, Selection, Word & Char Count */}
      <div className="flex items-center gap-4">
        <span>
          Ln {cursorLine}, Col {cursorCol}
        </span>
        {selectedChars > 0 && (
          <span className="text-[#0078d4] font-medium">({selectedChars} selected)</span>
        )}
        <div className="h-3 w-px bg-gray-300 dark:bg-gray-700" />
        <span>
          {words} words, {chars} chars, {lines} lines
        </span>
      </div>

      {/* Right Info: Font, Layout, Encoding, EOL */}
      <div className="hidden sm:flex items-center gap-4">
        <span className="flex items-center gap-1">
          <Type size={11} className="text-[#0078d4]" />
          {appState.fontSettings.fontFamily}, {appState.fontSettings.fontSize}px
        </span>
        <div className="h-3 w-px bg-gray-300 dark:bg-gray-700" />
        <span className="flex items-center gap-1">
          <Grid size={11} />
          Layout: {appState.gridLayout} Panel{appState.gridLayout > 1 ? 's' : ''}
        </span>
        <div className="h-3 w-px bg-gray-300 dark:bg-gray-700" />
        <span>UTF-8</span>
        <span>Windows (CRLF)</span>
        <span className="uppercase px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-800 text-[10px] font-semibold text-[#0078d4]">
          {activeTab?.language || 'Markdown'}
        </span>
      </div>
    </footer>
  );
};
