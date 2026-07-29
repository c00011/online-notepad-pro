import React, { useState, useRef, useEffect } from 'react';
import {
  FileText,
  FolderOpen,
  Save,
  Printer,
  Scissors,
  Copy,
  Clipboard,
  Undo,
  Redo,
  Search,
  Maximize2,
  Minimize2,
  Grid,
  Columns,
  LayoutGrid,
  Eye,
  GitCompare,
  Sun,
  Moon,
  Plus,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  List,
  ListOrdered,
  CheckSquare,
  Table,
  Code,
  Quote,
  Minus,
  HelpCircle,
  Info,
  ChevronDown,
  FileDown,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { AppState, GridLayout, ThemeMode } from '../types';

interface FluentHeaderProps {
  appState: AppState;
  onNewFile: () => void;
  onOpenFile: () => void;
  onSaveFile: () => void;
  onExportFile: (type: 'md' | 'doc' | 'pdf' | 'txt') => void;
  onPrint: () => void;
  onCloseTab: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onCut: () => void;
  onCopy: () => void;
  onPaste: () => void;
  onOpenFind: () => void;
  onSelectAll: () => void;
  onInsertText: (textToInsert: string) => void;
  onSetGridLayout: (layout: GridLayout) => void;
  onToggleTheme: () => void;
  onTogglePreview: () => void;
  onToggleDiff: () => void;
  onToggleFullscreen: () => void;
  onFontChange: (family?: string, size?: number) => void;
  onToggleWordWrap: () => void;
  onToggleLineNumbers: () => void;
  onToggleStatusBar: () => void;
  onZoom: (delta: number) => void;
  onResetZoom: () => void;
  onShowHelpModal: (modal: 'shortcuts' | 'about' | 'markdown' | 'table') => void;
  isFullscreen: boolean;
}

export const FluentHeader: React.FC<FluentHeaderProps> = ({
  appState,
  onNewFile,
  onOpenFile,
  onSaveFile,
  onExportFile,
  onPrint,
  onCloseTab,
  onUndo,
  onRedo,
  onCut,
  onCopy,
  onPaste,
  onOpenFind,
  onSelectAll,
  onInsertText,
  onSetGridLayout,
  onToggleTheme,
  onTogglePreview,
  onToggleDiff,
  onToggleFullscreen,
  onFontChange,
  onToggleWordWrap,
  onToggleLineNumbers,
  onToggleStatusBar,
  onZoom,
  onResetZoom,
  onShowHelpModal,
  isFullscreen
}) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        // Inject into global handler or new tab
        if ((window as any).openFileFromCLI) {
          (window as any).openFileFromCLI(file.name, content);
        }
      };
      reader.readAsText(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const fontFamilies = [
    'Segoe UI',
    'Fira Code',
    'Consolas',
    'Arial',
    'Times New Roman',
    'Courier New',
    'Georgia',
    'Verdana'
  ];

  const fontSizes = [12, 14, 16, 18, 20, 24, 28, 32];

  return (
    <header ref={navRef} className="fluent-editor-app select-none border-b border-[#e0e0e0] dark:border-[#3a3a3a] bg-[#f8f9fa] dark:bg-[#252526] text-[#1c1c1c] dark:text-[#f0f0f0]">
      {/* Hidden File Input for Native Open */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept=".txt,.md,.markdown,.js,.ts,.json,.html,.css,.doc,.csv"
        className="hidden"
      />

      {/* Tier 1: Windows 11 Fluent Classic Menu Bar */}
      <div className="flex items-center justify-between px-3 py-1 bg-[#eaeaea]/80 dark:bg-[#1f1f1f]/80 text-xs font-normal border-b border-[#e0e0e0] dark:border-[#333333]">
        <div className="flex items-center space-x-1">
          {/* App Branding Icon */}
          <div className="flex items-center gap-1.5 pr-2 mr-1 border-r border-[#d0d0d0] dark:border-[#383838]">
            <div className="w-4 h-4 rounded bg-[#0078d4] flex items-center justify-center text-white font-bold text-[10px] shadow-xs">
              N
            </div>
            <span className="font-semibold text-xs tracking-tight text-[#0078d4] dark:text-[#41a5ff]">
              Pro Web Notepad
            </span>
          </div>

          {/* Menu Dropdowns: File, Edit, Insert, View, Help */}
          {[
            {
              key: 'File',
              items: [
                { label: 'New File', shortcut: 'Ctrl+N', icon: <Plus size={14} />, onClick: onNewFile },
                { label: 'Open File...', shortcut: 'Ctrl+O', icon: <FolderOpen size={14} />, onClick: () => fileInputRef.current?.click() },
                { label: 'Save', shortcut: 'Ctrl+S', icon: <Save size={14} />, onClick: onSaveFile },
                { divider: true },
                { label: 'Export as .MD (Markdown)', icon: <FileDown size={14} />, onClick: () => onExportFile('md') },
                { label: 'Export as .DOC (MS Word)', icon: <FileText size={14} />, onClick: () => onExportFile('doc') },
                { label: 'Export as .PDF', icon: <FileDown size={14} />, onClick: () => onExportFile('pdf') },
                { label: 'Export as .TXT (Plain Text)', icon: <FileText size={14} />, onClick: () => onExportFile('txt') },
                { divider: true },
                { label: 'Print Document', shortcut: 'Ctrl+P', icon: <Printer size={14} />, onClick: onPrint },
                { label: 'Close Active Tab', shortcut: 'Ctrl+W', icon: <Minus size={14} />, onClick: onCloseTab }
              ]
            },
            {
              key: 'Edit',
              items: [
                { label: 'Undo', shortcut: 'Ctrl+Z', icon: <Undo size={14} />, onClick: onUndo },
                { label: 'Redo', shortcut: 'Ctrl+Y', icon: <Redo size={14} />, onClick: onRedo },
                { divider: true },
                { label: 'Cut', shortcut: 'Ctrl+X', icon: <Scissors size={14} />, onClick: onCut },
                { label: 'Copy', shortcut: 'Ctrl+C', icon: <Copy size={14} />, onClick: onCopy },
                { label: 'Paste', shortcut: 'Ctrl+V', icon: <Clipboard size={14} />, onClick: onPaste },
                { divider: true },
                { label: 'Find & Replace', shortcut: 'Ctrl+F', icon: <Search size={14} />, onClick: onOpenFind },
                { label: 'Select All', shortcut: 'Ctrl+A', onClick: onSelectAll },
                { label: 'Insert Current Date/Time', onClick: () => onInsertText(new Date().toLocaleString()) }
              ]
            },
            {
              key: 'Insert',
              items: [
                { label: 'Heading 1 (H1)', icon: <Heading1 size={14} />, onClick: () => onInsertText('# ') },
                { label: 'Heading 2 (H2)', icon: <Heading2 size={14} />, onClick: () => onInsertText('## ') },
                { label: 'Heading 3 (H3)', icon: <Heading3 size={14} />, onClick: () => onInsertText('### ') },
                { label: 'Heading 4 (H4)', icon: <Heading4 size={14} />, onClick: () => onInsertText('#### ') },
                { divider: true },
                { label: 'Bullet List (-)', icon: <List size={14} />, onClick: () => onInsertText('- ') },
                { label: 'Numbered List (1.)', icon: <ListOrdered size={14} />, onClick: () => onInsertText('1. ') },
                { label: 'Task Checklist (- [ ])', icon: <CheckSquare size={14} />, onClick: () => onInsertText('- [ ] ') },
                { divider: true },
                { label: 'Insert Table Template', icon: <Table size={14} />, onClick: () => onShowHelpModal('table') },
                { label: 'Code Block (```)', icon: <Code size={14} />, onClick: () => onInsertText('```\n\n```') },
                { label: 'Blockquote (>)', icon: <Quote size={14} />, onClick: () => onInsertText('> ') },
                { label: 'Horizontal Divider (---)', icon: <Minus size={14} />, onClick: () => onInsertText('\n---\n') }
              ]
            },
            {
              key: 'View',
              items: [
                { label: '1 Panel (Single)', icon: <Grid size={14} />, onClick: () => onSetGridLayout(1) },
                { label: '2 Panels (Split)', icon: <Columns size={14} />, onClick: () => onSetGridLayout(2) },
                { label: '3 Panels (Grid)', icon: <Grid size={14} />, onClick: () => onSetGridLayout(3) },
                { label: '4 Panels (2x2 Grid)', icon: <LayoutGrid size={14} />, onClick: () => onSetGridLayout(4) },
                { label: '6 Panels (3x2 Grid)', icon: <Grid size={14} />, onClick: () => onSetGridLayout(6) },
                { divider: true },
                { label: `Toggle Markdown Live Preview`, icon: <Eye size={14} />, onClick: onTogglePreview },
                { label: `Toggle Side-by-Side Diff View`, icon: <GitCompare size={14} />, onClick: onToggleDiff },
                { label: `Switch Theme (${appState.theme === 'dark' ? 'Light' : 'Dark'})`, icon: appState.theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />, onClick: onToggleTheme },
                { divider: true },
                { label: `Word Wrap: ${appState.fontSettings.wordWrap ? 'ON' : 'OFF'}`, onClick: onToggleWordWrap },
                { label: `Line Numbers: ${appState.fontSettings.showLineNumbers ? 'ON' : 'OFF'}`, onClick: onToggleLineNumbers },
                { label: `Status Bar: ${appState.showStatusBar ? 'VISIBLE' : 'HIDDEN'}`, onClick: onToggleStatusBar },
                { divider: true },
                { label: `Zoom In (${appState.zoomLevel}%)`, onClick: () => onZoom(10) },
                { label: `Zoom Out`, onClick: () => onZoom(-10) },
                { label: `Reset Zoom (100%)`, onClick: onResetZoom },
                { label: `Toggle Fullscreen (${isFullscreen ? 'Exit' : 'Enter'})`, icon: isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />, onClick: onToggleFullscreen }
              ]
            },
            {
              key: 'Help',
              items: [
                { label: 'Keyboard Shortcuts', icon: <HelpCircle size={14} />, onClick: () => onShowHelpModal('shortcuts') },
                { label: 'Markdown Syntax Reference', icon: <FileText size={14} />, onClick: () => onShowHelpModal('markdown') },
                { divider: true },
                { label: 'About Pro Web Notepad', icon: <Info size={14} />, onClick: () => onShowHelpModal('about') }
              ]
            }
          ].map((menu) => (
            <div key={menu.key} className="relative">
              <button
                onClick={() => setActiveMenu(activeMenu === menu.key ? null : menu.key)}
                onMouseEnter={() => activeMenu && setActiveMenu(menu.key)}
                className={`px-2.5 py-1 rounded cursor-pointer transition-colors ${
                  activeMenu === menu.key
                    ? 'bg-[#d0d0d0] dark:bg-[#3d3d3d] font-medium text-[#0078d4] dark:text-[#41a5ff]'
                    : 'hover:bg-[#e0e0e0] dark:hover:bg-[#333333]'
                }`}
              >
                {menu.key}
              </button>

              {/* Dropdown Menu */}
              {activeMenu === menu.key && (
                <div className="absolute left-0 top-full mt-0.5 w-56 rounded-md shadow-lg bg-[#ffffff] dark:bg-[#2c2c2c] border border-[#e0e0e0] dark:border-[#3a3a3a] py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                  {menu.items.map((item, idx) =>
                    item.divider ? (
                      <div key={idx} className="my-1 border-t border-[#e5e5e5] dark:border-[#3d3d3d]" />
                    ) : (
                      <button
                        key={idx}
                        onClick={() => {
                          item.onClick?.();
                          setActiveMenu(null);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-[#0078d4] hover:text-white dark:hover:bg-[#0078d4] transition-colors cursor-pointer group"
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-gray-500 dark:text-gray-400 group-hover:text-white">
                            {item.icon}
                          </span>
                          {item.label}
                        </span>
                        {item.shortcut && (
                          <span className="text-[10px] text-gray-400 group-hover:text-gray-200">
                            {item.shortcut}
                          </span>
                        )}
                      </button>
                    )
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Right Status Badges */}
        <div className="hidden sm:flex items-center gap-3 text-[11px] text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1 bg-[#e0e0e0]/60 dark:bg-[#333]/60 px-2 py-0.5 rounded text-[10px]">
            <Sparkles size={10} className="text-[#0078d4]" />
            Fluent Windows 11 Engine
          </span>
          <span>Zoom: {appState.zoomLevel}%</span>
        </div>
      </div>

      {/* Tier 2: Icon Toolbar (Action Groups separated by vertical dividers) */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#f3f3f3] dark:bg-[#252526] overflow-x-auto no-scrollbar">
        <div className="flex items-center space-x-1 sm:space-x-1.5 flex-nowrap">
          {/* File Actions */}
          <div className="flex items-center gap-0.5">
            <button
              onClick={onNewFile}
              title="New File (Ctrl+N)"
              className="p-1.5 rounded hover:bg-[#e2e2e2] dark:hover:bg-[#3a3a3a] text-gray-700 dark:text-gray-200 transition-colors cursor-pointer"
            >
              <FileText size={16} />
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              title="Open File (Ctrl+O)"
              className="p-1.5 rounded hover:bg-[#e2e2e2] dark:hover:bg-[#3a3a3a] text-gray-700 dark:text-gray-200 transition-colors cursor-pointer"
            >
              <FolderOpen size={16} />
            </button>
            <button
              onClick={onSaveFile}
              title="Save File (Ctrl+S)"
              className="p-1.5 rounded hover:bg-[#e2e2e2] dark:hover:bg-[#3a3a3a] text-[#0078d4] dark:text-[#41a5ff] transition-colors cursor-pointer"
            >
              <Save size={16} />
            </button>
            <button
              onClick={onPrint}
              title="Print Document (Ctrl+P)"
              className="p-1.5 rounded hover:bg-[#e2e2e2] dark:hover:bg-[#3a3a3a] text-gray-700 dark:text-gray-200 transition-colors cursor-pointer"
            >
              <Printer size={16} />
            </button>
          </div>

          <div className="h-4 w-px bg-[#d0d0d0] dark:bg-[#3d3d3d] mx-1" />

          {/* Clipboard Actions */}
          <div className="flex items-center gap-0.5">
            <button
              onClick={onCut}
              title="Cut (Ctrl+X)"
              className="p-1.5 rounded hover:bg-[#e2e2e2] dark:hover:bg-[#3a3a3a] text-gray-700 dark:text-gray-200 transition-colors cursor-pointer"
            >
              <Scissors size={16} />
            </button>
            <button
              onClick={onCopy}
              title="Copy (Ctrl+C)"
              className="p-1.5 rounded hover:bg-[#e2e2e2] dark:hover:bg-[#3a3a3a] text-gray-700 dark:text-gray-200 transition-colors cursor-pointer"
            >
              <Copy size={16} />
            </button>
            <button
              onClick={onPaste}
              title="Paste (Ctrl+V)"
              className="p-1.5 rounded hover:bg-[#e2e2e2] dark:hover:bg-[#3a3a3a] text-gray-700 dark:text-gray-200 transition-colors cursor-pointer"
            >
              <Clipboard size={16} />
            </button>
          </div>

          <div className="h-4 w-px bg-[#d0d0d0] dark:bg-[#3d3d3d] mx-1" />

          {/* History Actions */}
          <div className="flex items-center gap-0.5">
            <button
              onClick={onUndo}
              title="Undo (Ctrl+Z)"
              className="p-1.5 rounded hover:bg-[#e2e2e2] dark:hover:bg-[#3a3a3a] text-gray-700 dark:text-gray-200 transition-colors cursor-pointer"
            >
              <Undo size={16} />
            </button>
            <button
              onClick={onRedo}
              title="Redo (Ctrl+Y)"
              className="p-1.5 rounded hover:bg-[#e2e2e2] dark:hover:bg-[#3a3a3a] text-gray-700 dark:text-gray-200 transition-colors cursor-pointer"
            >
              <Redo size={16} />
            </button>
          </div>

          <div className="h-4 w-px bg-[#d0d0d0] dark:bg-[#3d3d3d] mx-1" />

          {/* Search */}
          <div className="flex items-center gap-0.5">
            <button
              onClick={onOpenFind}
              title="Find & Replace (Ctrl+F)"
              className="p-1.5 rounded hover:bg-[#e2e2e2] dark:hover:bg-[#3a3a3a] text-gray-700 dark:text-gray-200 transition-colors cursor-pointer flex items-center gap-1 text-xs"
            >
              <Search size={16} />
            </button>
          </div>

          <div className="h-4 w-px bg-[#d0d0d0] dark:bg-[#3d3d3d] mx-1" />

          {/* Typography Controls: Font Family & Font Size Selects */}
          <div className="flex items-center gap-1.5">
            <select
              value={appState.fontSettings.fontFamily}
              onChange={(e) => onFontChange(e.target.value, undefined)}
              className="text-xs bg-[#ffffff] dark:bg-[#2d2d2d] border border-[#ccc] dark:border-[#444] rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#0078d4]"
              title="Font Family"
            >
              {fontFamilies.map((font) => (
                <option key={font} value={font}>
                  {font}
                </option>
              ))}
            </select>

            <select
              value={appState.fontSettings.fontSize}
              onChange={(e) => onFontChange(undefined, Number(e.target.value))}
              className="text-xs bg-[#ffffff] dark:bg-[#2d2d2d] border border-[#ccc] dark:border-[#444] rounded px-1.5 py-1 focus:outline-none focus:ring-1 focus:ring-[#0078d4]"
              title="Font Size"
            >
              {fontSizes.map((size) => (
                <option key={size} value={size}>
                  {size}px
                </option>
              ))}
            </select>
          </div>

          <div className="h-4 w-px bg-[#d0d0d0] dark:bg-[#3d3d3d] mx-1" />

          {/* View Controls: Fullscreen toggle */}
          <button
            onClick={onToggleFullscreen}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen (F11)'}
            className="p-1.5 rounded hover:bg-[#e2e2e2] dark:hover:bg-[#3a3a3a] text-gray-700 dark:text-gray-200 transition-colors cursor-pointer"
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>

        {/* Right Toolbar Action Controls: Grid Layout Switcher & View Toggles */}
        <div className="flex items-center gap-1.5 ml-2">
          {/* Quick Grid View Dropdown / Buttons */}
          <div className="flex items-center bg-[#e5e5e5] dark:bg-[#303030] p-0.5 rounded border border-[#d0d0d0] dark:border-[#3a3a3a]">
            {[1, 2, 3, 4, 6].map((gridNum) => (
              <button
                key={gridNum}
                onClick={() => onSetGridLayout(gridNum as GridLayout)}
                title={`Grid Layout: ${gridNum} Panel${gridNum > 1 ? 's' : ''}`}
                className={`px-2 py-0.5 text-[11px] rounded font-medium transition-colors cursor-pointer ${
                  appState.gridLayout === gridNum
                    ? 'bg-[#0078d4] text-white shadow-xs'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-[#d0d0d0] dark:hover:bg-[#3d3d3d]'
                }`}
              >
                {gridNum}P
              </button>
            ))}
          </div>

          {/* Live Markdown Preview Toggle */}
          <button
            onClick={onTogglePreview}
            title="Toggle Live Markdown Preview"
            className="p-1.5 rounded hover:bg-[#e2e2e2] dark:hover:bg-[#3a3a3a] text-gray-700 dark:text-gray-200 transition-colors cursor-pointer"
          >
            <Eye size={16} />
          </button>

          {/* Side-by-Side Diff View Toggle */}
          <button
            onClick={onToggleDiff}
            title="Toggle Side-by-Side Diff Comparison"
            className="p-1.5 rounded hover:bg-[#e2e2e2] dark:hover:bg-[#3a3a3a] text-gray-700 dark:text-gray-200 transition-colors cursor-pointer"
          >
            <GitCompare size={16} />
          </button>

          {/* Light / Dark Mode Toggle */}
          <button
            onClick={onToggleTheme}
            title={`Switch to ${appState.theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            className="p-1.5 rounded hover:bg-[#e2e2e2] dark:hover:bg-[#3a3a3a] text-yellow-600 dark:text-yellow-400 transition-colors cursor-pointer"
          >
            {appState.theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </div>
    </header>
  );
};
