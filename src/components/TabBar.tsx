import React, { useState } from 'react';
import { Plus, X, FileText, Code, FileCode, Check, Edit2 } from 'lucide-react';
import { NoteTab } from '../types';

interface TabBarProps {
  tabs: NoteTab[];
  activeTabId: string;
  onSelectTab: (tabId: string) => void;
  onNewTab: () => void;
  onCloseTab: (tabId: string, e: React.MouseEvent) => void;
  onRenameTab: (tabId: string, newTitle: string) => void;
}

export const TabBar: React.FC<TabBarProps> = ({
  tabs,
  activeTabId,
  onSelectTab,
  onNewTab,
  onCloseTab,
  onRenameTab
}) => {
  const [editingTabId, setEditingTabId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const handleStartRename = (tab: NoteTab, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTabId(tab.id);
    setEditTitle(tab.title);
  };

  const handleSaveRename = (tabId: string) => {
    if (editTitle.trim()) {
      onRenameTab(tabId, editTitle.trim());
    }
    setEditingTabId(null);
  };

  const getTabIcon = (title: string) => {
    if (title.endsWith('.md') || title.endsWith('.markdown')) {
      return <FileCode size={13} className="text-[#0078d4]" />;
    }
    if (title.endsWith('.js') || title.endsWith('.ts') || title.endsWith('.json')) {
      return <Code size={13} className="text-amber-500" />;
    }
    return <FileText size={13} className="text-gray-500" />;
  };

  return (
    <div className="fluent-editor-app flex items-center bg-[#eaeaea] dark:bg-[#1f1f1f] border-b border-[#e0e0e0] dark:border-[#333333] px-2 pt-1.5 overflow-x-auto no-scrollbar select-none">
      <div className="flex items-center space-x-1 min-w-max">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          const isEditing = editingTabId === tab.id;

          return (
            <div
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`group relative flex items-center gap-2 px-3 py-1.5 text-xs rounded-t-md transition-all cursor-pointer border-t-2 ${
                isActive
                  ? 'bg-[#ffffff] dark:bg-[#2c2c2c] border-[#0078d4] text-[#1c1c1c] dark:text-[#f0f0f0] font-medium shadow-xs'
                  : 'bg-[#f0f0f0]/60 dark:bg-[#252526]/60 border-transparent text-gray-600 dark:text-gray-400 hover:bg-[#e4e4e4] dark:hover:bg-[#333333]'
              }`}
            >
              {/* Tab Icon */}
              {getTabIcon(tab.title)}

              {/* Title or Rename Input */}
              {isEditing ? (
                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveRename(tab.id);
                      if (e.key === 'Escape') setEditingTabId(null);
                    }}
                    autoFocus
                    className="w-28 px-1 py-0.5 text-xs bg-white dark:bg-[#1e1e1e] border border-[#0078d4] rounded focus:outline-none"
                  />
                  <button
                    onClick={() => handleSaveRename(tab.id)}
                    className="p-0.5 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded"
                  >
                    <Check size={12} />
                  </button>
                </div>
              ) : (
                <span
                  onDoubleClick={(e) => handleStartRename(tab, e)}
                  title={tab.title}
                  className="max-w-[140px] truncate"
                >
                  {tab.title}
                  {tab.isUnsaved && <span className="ml-1 text-amber-500 font-bold">*</span>}
                </span>
              )}

              {/* Quick Rename Button on Hover */}
              {!isEditing && (
                <button
                  onClick={(e) => handleStartRename(tab, e)}
                  title="Rename Tab"
                  className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 text-gray-400 transition-opacity"
                >
                  <Edit2 size={10} />
                </button>
              )}

              {/* Close Tab Button */}
              {tabs.length > 1 && (
                <button
                  onClick={(e) => onCloseTab(tab.id, e)}
                  title="Close Tab"
                  className="p-0.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          );
        })}

        {/* New Tab Button */}
        <button
          onClick={onNewTab}
          title="New Tab (Ctrl+N)"
          className="p-1.5 ml-1 rounded-md bg-[#f0f0f0] dark:bg-[#2c2c2c] hover:bg-[#e0e0e0] dark:hover:bg-[#3a3a3a] text-gray-600 dark:text-gray-300 transition-colors cursor-pointer"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
};
