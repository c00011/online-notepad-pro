import React, { useRef, useEffect, useState } from 'react';
import { marked } from 'marked';
import {
  Eye,
  Edit3,
  GitCompare,
  Bold,
  Italic,
  List,
  Heading1,
  Code,
  Maximize2,
  Minimize2,
  Copy,
  Check,
  FileText
} from 'lucide-react';
import { NoteTab, PanelConfig, FontSettings, PanelMode } from '../types';
import { computeLineDiff } from '../utils/diff';

interface TextEditorPanelProps {
  panel: PanelConfig;
  tabs: NoteTab[];
  activeTab: NoteTab;
  fontSettings: FontSettings;
  zoomLevel: number;
  onUpdatePanelMode: (panelId: string, mode: PanelMode, compareTabId?: string) => void;
  onSelectTabForPanel: (panelId: string, tabId: string) => void;
  onUpdateContent: (tabId: string, newContent: string) => void;
  onCursorChange: (line: number, col: number, selectedText: string) => void;
  isMaximized: boolean;
  onToggleMaximizePanel: (panelId: string) => void;
}

export const TextEditorPanel: React.FC<TextEditorPanelProps> = ({
  panel,
  tabs,
  activeTab,
  fontSettings,
  zoomLevel,
  onUpdatePanelMode,
  onSelectTabForPanel,
  onUpdateContent,
  onCursorChange,
  isMaximized,
  onToggleMaximizePanel
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  // Compute line count
  const lines = (activeTab?.content || '').split('\n');
  const lineCount = lines.length;

  // Sync scroll between textarea and line number gutter
  const handleScroll = () => {
    if (textareaRef.current && gutterRef.current) {
      gutterRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  // Cursor position tracking
  const handleCursorSelection = () => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const textBefore = activeTab.content.substring(0, start);
    const line = textBefore.split('\n').length;
    const col = start - textBefore.lastIndexOf('\n');
    const selected = activeTab.content.substring(start, end);

    onCursorChange(line, col, selected);
  };

  // Tab key handling (indentation)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const val = textarea.value;

      if (e.shiftKey) {
        // Outdent
        const before = val.substring(0, start);
        const lastNewLine = before.lastIndexOf('\n');
        const lineStart = lastNewLine === -1 ? 0 : lastNewLine + 1;
        if (val.substring(lineStart, lineStart + 2) === '  ') {
          const newContent = val.substring(0, lineStart) + val.substring(lineStart + 2);
          onUpdateContent(activeTab.id, newContent);
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = Math.max(lineStart, start - 2);
          }, 0);
        }
      } else {
        // Indent 2 spaces
        const newContent = val.substring(0, start) + '  ' + val.substring(end);
        onUpdateContent(activeTab.id, newContent);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 2;
        }, 0);
      }
    }
  };

  // Markdown formatting insertion helpers
  const insertFormatting = (prefix: string, suffix: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = activeTab.content.substring(start, end) || 'text';
    const replacement = `${prefix}${selectedText}${suffix}`;

    const newContent =
      activeTab.content.substring(0, start) + replacement + activeTab.content.substring(end);

    onUpdateContent(activeTab.id, newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
    }, 0);
  };

  // Render Live Markdown HTML
  const getRenderedMarkdown = () => {
    try {
      return marked.parse(activeTab?.content || '');
    } catch {
      return '<p class="text-red-500">Error parsing Markdown</p>';
    }
  };

  // Copy Rendered Markdown or Text
  const handleCopyContent = () => {
    navigator.clipboard.writeText(activeTab.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // Compute Diff comparison if in Diff mode
  const compareTab = tabs.find((t) => t.id === panel.compareTabId) || tabs[0];
  const diffLines = panel.mode === 'diff' ? computeLineDiff(compareTab?.content || '', activeTab?.content || '') : [];

  return (
    <div
      className={`fluent-editor-app flex flex-col h-full bg-[#ffffff] dark:bg-[#202020] border border-[#e0e0e0] dark:border-[#383838] rounded-md overflow-hidden shadow-xs relative transition-all ${
        isMaximized ? 'fixed inset-2 z-50 shadow-2xl' : ''
      }`}
    >
      {/* Panel Top Header Control Bar */}
      <div className="flex items-center justify-between px-2.5 py-1.5 bg-[#f3f3f3] dark:bg-[#2a2a2a] border-b border-[#e0e0e0] dark:border-[#3a3a3a] text-xs">
        <div className="flex items-center gap-2">
          {/* Active Tab Selector Dropdown for this Panel */}
          <select
            value={activeTab.id}
            onChange={(e) => onSelectTabForPanel(panel.id, e.target.value)}
            className="bg-[#ffffff] dark:bg-[#333333] border border-gray-300 dark:border-gray-600 rounded px-2 py-0.5 text-xs font-medium text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-[#0078d4]"
          >
            {tabs.map((tab) => (
              <option key={tab.id} value={tab.id}>
                {tab.title} {tab.isUnsaved ? '*' : ''}
              </option>
            ))}
          </select>

          {/* Quick Formatting Buttons (in Edit mode) */}
          {panel.mode === 'edit' && (
            <div className="hidden md:flex items-center gap-0.5 border-l border-gray-300 dark:border-gray-600 pl-2">
              <button
                onClick={() => insertFormatting('**', '**')}
                title="Bold (**text**)"
                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                <Bold size={13} />
              </button>
              <button
                onClick={() => insertFormatting('*', '*')}
                title="Italic (*text*)"
                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                <Italic size={13} />
              </button>
              <button
                onClick={() => insertFormatting('# ')}
                title="Heading 1"
                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                <Heading1 size={13} />
              </button>
              <button
                onClick={() => insertFormatting('- ')}
                title="Bullet List"
                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                <List size={13} />
              </button>
              <button
                onClick={() => insertFormatting('`', '`')}
                title="Inline Code"
                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                <Code size={13} />
              </button>
            </div>
          )}
        </div>

        {/* Center/Right Panel View Modes & Actions */}
        <div className="flex items-center gap-2">
          {/* If in Diff mode, show Compare Tab selector */}
          {panel.mode === 'diff' && (
            <div className="flex items-center gap-1 text-[11px] text-gray-600 dark:text-gray-400">
              <span>Compare vs:</span>
              <select
                value={compareTab.id}
                onChange={(e) => onUpdatePanelMode(panel.id, 'diff', e.target.value)}
                className="bg-[#ffffff] dark:bg-[#333333] border border-gray-300 dark:border-gray-600 rounded px-1.5 py-0.5 text-[11px]"
              >
                {tabs.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Mode Switcher Buttons */}
          <div className="flex items-center bg-gray-200 dark:bg-[#383838] p-0.5 rounded border border-gray-300 dark:border-gray-600">
            <button
              onClick={() => onUpdatePanelMode(panel.id, 'edit')}
              title="Edit Mode"
              className={`px-2 py-0.5 rounded text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                panel.mode === 'edit'
                  ? 'bg-[#0078d4] text-white shadow-xs'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              <Edit3 size={12} />
              Edit
            </button>
            <button
              onClick={() => onUpdatePanelMode(panel.id, 'preview')}
              title="Markdown Live Preview"
              className={`px-2 py-0.5 rounded text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                panel.mode === 'preview'
                  ? 'bg-[#0078d4] text-white shadow-xs'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              <Eye size={12} />
              Preview
            </button>
            <button
              onClick={() => onUpdatePanelMode(panel.id, 'diff')}
              title="Side-by-Side Diff Mode"
              className={`px-2 py-0.5 rounded text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                panel.mode === 'diff'
                  ? 'bg-[#0078d4] text-white shadow-xs'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              <GitCompare size={12} />
              Diff
            </button>
          </div>

          {/* Copy Button */}
          <button
            onClick={handleCopyContent}
            title="Copy Panel Content"
            className="p-1 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
          >
            {copied ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
          </button>

          {/* Maximize Panel Toggle Button */}
          <button
            onClick={() => onToggleMaximizePanel(panel.id)}
            title={isMaximized ? 'Restore Panel Size' : 'Maximize Panel'}
            className="p-1 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
          >
            {isMaximized ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          </button>
        </div>
      </div>

      {/* Panel Editor / View Area */}
      <div className="flex-1 relative overflow-hidden flex bg-white dark:bg-[#1e1e1e]">
        {/* MODE 1: Standard Text Editor Mode */}
        {panel.mode === 'edit' && (
          <div className="flex-1 flex w-full h-full relative">
            {/* Synced Line Numbers Gutter */}
            {fontSettings.showLineNumbers && (
              <div
                ref={gutterRef}
                className="w-12 select-none py-3 text-right pr-2 text-xs font-mono text-gray-400 dark:text-gray-600 bg-[#f8f9fa] dark:bg-[#252526] border-r border-[#e0e0e0] dark:border-[#333333] overflow-hidden"
                style={{
                  fontSize: `${fontSettings.fontSize * (zoomLevel / 100)}px`,
                  lineHeight: fontSettings.lineHeight
                }}
              >
                {Array.from({ length: lineCount }).map((_, idx) => (
                  <div key={idx}>{idx + 1}</div>
                ))}
              </div>
            )}

            {/* Native Textarea with Handwriting / Pen Support */}
            <textarea
              ref={textareaRef}
              value={activeTab?.content || ''}
              onChange={(e) => onUpdateContent(activeTab.id, e.target.value)}
              onScroll={handleScroll}
              onSelect={handleCursorSelection}
              onKeyUp={handleCursorSelection}
              onClick={handleCursorSelection}
              onKeyDown={handleKeyDown}
              spellCheck={true}
              autoCorrect="off"
              autoCapitalize="off"
              wrap={fontSettings.wordWrap ? 'soft' : 'off'}
              placeholder="Type or paste text here... (Handwriting / Stylus supported)"
              className="flex-1 h-full w-full py-3 px-3 border-none outline-none resize-none bg-transparent text-[#1c1c1c] dark:text-[#f0f0f0] selection:bg-[#0078d4]/30"
              style={{
                fontFamily: fontSettings.fontFamily,
                fontSize: `${fontSettings.fontSize * (zoomLevel / 100)}px`,
                lineHeight: fontSettings.lineHeight,
                whiteSpace: fontSettings.wordWrap ? 'pre-wrap' : 'pre'
              }}
            />
          </div>
        )}

        {/* MODE 2: Live Markdown Preview Mode */}
        {panel.mode === 'preview' && (
          <div className="flex-1 h-full w-full p-6 overflow-auto markdown-body text-[#1c1c1c] dark:text-[#f0f0f0] bg-white dark:bg-[#1e1e1e]">
            <div dangerouslySetInnerHTML={{ __html: getRenderedMarkdown() as string }} />
          </div>
        )}

        {/* MODE 3: Side-by-Side Diff Comparison Mode */}
        {panel.mode === 'diff' && (
          <div className="flex-1 h-full w-full p-3 overflow-auto font-mono text-xs bg-[#fdfdfd] dark:bg-[#1a1a1a]">
            <div className="mb-2 pb-2 border-b border-gray-200 dark:border-gray-800 text-gray-500 flex justify-between text-[11px]">
              <span>
                Comparing <strong className="text-red-500">{compareTab.title}</strong> (Red) vs{' '}
                <strong className="text-green-500">{activeTab.title}</strong> (Green)
              </span>
              <span>{diffLines.length} lines analyzed</span>
            </div>

            <div className="space-y-0.5">
              {diffLines.map((line, idx) => (
                <div
                  key={idx}
                  className={`flex items-start px-2 py-0.5 rounded-xs leading-relaxed ${
                    line.type === 'added'
                      ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-l-2 border-emerald-500'
                      : line.type === 'removed'
                      ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-l-2 border-rose-500'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <span className="w-8 select-none text-gray-400 text-right pr-2">
                    {line.newLineNumber || line.oldLineNumber || ''}
                  </span>
                  <span className="w-4 select-none font-bold">
                    {line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' '}
                  </span>
                  <span className="flex-1 whitespace-pre-wrap break-all">{line.text || ' '}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
