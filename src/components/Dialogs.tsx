import React, { useState } from 'react';
import { X, Keyboard, HelpCircle, Info, Sparkles, Table, Check } from 'lucide-react';

interface DialogsProps {
  activeModal: 'shortcuts' | 'about' | 'markdown' | 'table' | null;
  onClose: () => void;
  onInsertText: (text: string) => void;
}

export const Dialogs: React.FC<DialogsProps> = ({ activeModal, onClose, onInsertText }) => {
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);

  if (!activeModal) return null;

  const handleInsertTable = () => {
    let tableMd = '\n| ' + Array.from({ length: cols }, (_, i) => `Header ${i + 1}`).join(' | ') + ' |\n';
    tableMd += '| ' + Array.from({ length: cols }, () => '---').join(' | ') + ' |\n';
    for (let r = 0; r < rows; r++) {
      tableMd += '| ' + Array.from({ length: cols }, (_, c) => `Row ${r + 1} Cell ${c + 1}`).join(' | ') + ' |\n';
    }
    onInsertText(tableMd + '\n');
    onClose();
  };

  return (
    <div className="fluent-editor-app fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 select-none">
      <div className="bg-white dark:bg-[#2c2c2c] border border-[#e0e0e0] dark:border-[#3a3a3a] shadow-2xl rounded-xl w-full max-w-lg p-5 animate-in fade-in zoom-in-95 duration-150 text-[#1c1c1c] dark:text-[#f0f0f0]">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-base flex items-center gap-2 text-[#0078d4]">
            {activeModal === 'shortcuts' && <Keyboard size={18} />}
            {activeModal === 'markdown' && <HelpCircle size={18} />}
            {activeModal === 'about' && <Info size={18} />}
            {activeModal === 'table' && <Table size={18} />}

            {activeModal === 'shortcuts' && 'Keyboard Shortcuts Guide'}
            {activeModal === 'markdown' && 'Markdown Quick Reference'}
            {activeModal === 'about' && 'About Pro Web Notepad'}
            {activeModal === 'table' && 'Insert Markdown Table'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="py-4 text-xs max-h-[65vh] overflow-y-auto">
          {activeModal === 'shortcuts' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 bg-gray-50 dark:bg-[#222] rounded border border-gray-200 dark:border-gray-800">
                  <div className="font-semibold text-[#0078d4]">Ctrl + N</div>
                  <div className="text-gray-500">Create New Tab</div>
                </div>
                <div className="p-2 bg-gray-50 dark:bg-[#222] rounded border border-gray-200 dark:border-gray-800">
                  <div className="font-semibold text-[#0078d4]">Ctrl + O</div>
                  <div className="text-gray-500">Open Local File</div>
                </div>
                <div className="p-2 bg-gray-50 dark:bg-[#222] rounded border border-gray-200 dark:border-gray-800">
                  <div className="font-semibold text-[#0078d4]">Ctrl + S</div>
                  <div className="text-gray-500">Save Document</div>
                </div>
                <div className="p-2 bg-gray-50 dark:bg-[#222] rounded border border-gray-200 dark:border-gray-800">
                  <div className="font-semibold text-[#0078d4]">Ctrl + F</div>
                  <div className="text-gray-500">Find & Replace</div>
                </div>
                <div className="p-2 bg-gray-50 dark:bg-[#222] rounded border border-gray-200 dark:border-gray-800">
                  <div className="font-semibold text-[#0078d4]">Ctrl + Tab</div>
                  <div className="text-gray-500">Switch File Tab</div>
                </div>
                <div className="p-2 bg-gray-50 dark:bg-[#222] rounded border border-gray-200 dark:border-gray-800">
                  <div className="font-semibold text-[#0078d4]">F11 / Button</div>
                  <div className="text-gray-500">Toggle Fullscreen</div>
                </div>
              </div>
            </div>
          )}

          {activeModal === 'markdown' && (
            <div className="space-y-2 font-mono text-xs">
              <div className="p-2 bg-gray-100 dark:bg-[#222] rounded">
                <code># Heading 1</code> <span className="text-gray-400 font-sans">→ Title H1</span>
              </div>
              <div className="p-2 bg-gray-100 dark:bg-[#222] rounded">
                <code>**Bold text**</code> <span className="text-gray-400 font-sans">→ Bold text</span>
              </div>
              <div className="p-2 bg-gray-100 dark:bg-[#222] rounded">
                <code>- [x] Task completed</code> <span className="text-gray-400 font-sans">→ Interactive checklist</span>
              </div>
              <div className="p-2 bg-gray-100 dark:bg-[#222] rounded">
                <code>```ts ... ```</code> <span className="text-gray-400 font-sans">→ Code block</span>
              </div>
            </div>
          )}

          {activeModal === 'table' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium mb-1">Columns:</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={cols}
                    onChange={(e) => setCols(Number(e.target.value))}
                    className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-[#1a1a1a]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Rows:</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={rows}
                    onChange={(e) => setRows(Number(e.target.value))}
                    className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-[#1a1a1a]"
                  />
                </div>
              </div>

              <button
                onClick={handleInsertTable}
                className="w-full py-2 bg-[#0078d4] text-white rounded font-medium flex items-center justify-center gap-2 hover:bg-[#106ebe] transition-colors"
              >
                <Check size={14} />
                Insert Table Template
              </button>
            </div>
          )}

          {activeModal === 'about' && (
            <div className="space-y-3 text-center">
              <div className="w-12 h-12 mx-auto rounded-xl bg-[#0078d4] text-white flex items-center justify-center font-bold text-xl shadow-md">
                N
              </div>
              <h4 className="font-bold text-base text-[#0078d4]">Pro Web Notepad</h4>
              <p className="text-gray-600 dark:text-gray-300">
                A serverless, client-side Windows 11 Fluent UI text editor engineered for ultra-fast performance, zero-latency text rendering, and complete offline capability.
              </p>
              <div className="pt-2 text-[11px] text-gray-400">
                Build Version: 2026.1.0 • Client-Side Only • No Data Tracked
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
