import React, { useState, useEffect } from 'react';
import { Search, X, ChevronUp, ChevronDown, Replace, ReplaceAll } from 'lucide-react';
import { FindReplaceState } from '../types';

interface FindReplaceBarProps {
  findReplaceState: FindReplaceState;
  onUpdateState: (newState: Partial<FindReplaceState>) => void;
  onFindNext: () => void;
  onFindPrev: () => void;
  onReplaceCurrent: () => void;
  onReplaceAll: () => void;
  onClose: () => void;
}

export const FindReplaceBar: React.FC<FindReplaceBarProps> = ({
  findReplaceState,
  onUpdateState,
  onFindNext,
  onFindPrev,
  onReplaceCurrent,
  onReplaceAll,
  onClose
}) => {
  const [showReplace, setShowReplace] = useState(true);

  if (!findReplaceState.isOpen) return null;

  return (
    <div className="fluent-editor-app absolute top-2 right-4 z-40 bg-[#ffffff] dark:bg-[#2d2d2d] border border-[#e0e0e0] dark:border-[#3a3a3a] shadow-xl rounded-lg p-2.5 w-80 text-xs animate-in slide-in-from-top-2 duration-150">
      <div className="flex items-center justify-between mb-2 pb-1 border-b border-gray-200 dark:border-gray-700">
        <span className="font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-1.5">
          <Search size={14} className="text-[#0078d4]" />
          Find & Replace
        </span>
        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded"
        >
          <X size={14} />
        </button>
      </div>

      {/* Find Input Row */}
      <div className="flex items-center gap-1 mb-2">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Find text..."
            value={findReplaceState.findText}
            onChange={(e) => onUpdateState({ findText: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onFindNext();
              if (e.key === 'Escape') onClose();
            }}
            autoFocus
            className="w-full px-2 py-1 pr-12 text-xs bg-[#f8f9fa] dark:bg-[#1f1f1f] border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-[#0078d4]"
          />
          {findReplaceState.findText && (
            <span className="absolute right-2 top-1 text-[10px] text-gray-400">
              {findReplaceState.totalMatches > 0
                ? `${findReplaceState.matchIndex + 1}/${findReplaceState.totalMatches}`
                : '0 matches'}
            </span>
          )}
        </div>

        <button
          onClick={onFindPrev}
          title="Previous Match (Shift+Enter)"
          className="p-1 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
        >
          <ChevronUp size={14} />
        </button>
        <button
          onClick={onFindNext}
          title="Next Match (Enter)"
          className="p-1 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
        >
          <ChevronDown size={14} />
        </button>
      </div>

      {/* Replace Input Row */}
      {showReplace && (
        <div className="flex items-center gap-1 mb-2">
          <input
            type="text"
            placeholder="Replace with..."
            value={findReplaceState.replaceText}
            onChange={(e) => onUpdateState({ replaceText: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onReplaceCurrent();
            }}
            className="flex-1 px-2 py-1 text-xs bg-[#f8f9fa] dark:bg-[#1f1f1f] border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-[#0078d4]"
          />
          <button
            onClick={onReplaceCurrent}
            title="Replace Match"
            className="px-2 py-1 bg-[#0078d4] text-white rounded text-[11px] hover:bg-[#106ebe] transition-colors flex items-center gap-1"
          >
            <Replace size={12} />
            Replace
          </button>
          <button
            onClick={onReplaceAll}
            title="Replace All Matches"
            className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded text-[11px] hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center gap-1"
          >
            <ReplaceAll size={12} />
            All
          </button>
        </div>
      )}

      {/* Search Toggles */}
      <div className="flex items-center justify-between text-[11px] text-gray-600 dark:text-gray-400 pt-1 border-t border-gray-100 dark:border-gray-800">
        <label className="flex items-center gap-1 cursor-pointer">
          <input
            type="checkbox"
            checked={findReplaceState.matchCase}
            onChange={(e) => onUpdateState({ matchCase: e.target.checked })}
            className="rounded text-[#0078d4]"
          />
          Match Case
        </label>

        <label className="flex items-center gap-1 cursor-pointer">
          <input
            type="checkbox"
            checked={findReplaceState.wholeWord}
            onChange={(e) => onUpdateState({ wholeWord: e.target.checked })}
            className="rounded text-[#0078d4]"
          />
          Whole Word
        </label>

        <label className="flex items-center gap-1 cursor-pointer">
          <input
            type="checkbox"
            checked={findReplaceState.useRegex}
            onChange={(e) => onUpdateState({ useRegex: e.target.checked })}
            className="rounded text-[#0078d4]"
          />
          Regex
        </label>
      </div>
    </div>
  );
};
