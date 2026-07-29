import './index.css';

// --- Types ---
interface NoteTab {
  id: string;
  title: string;
  content: string; // Stored as Rich HTML
  originalContent: string;
  isUnsaved: boolean;
  modifiedAt: number;
}

interface PanelConfig {
  id: string;
  activeTabId: string;
  mode: 'edit' | 'preview' | 'markdown' | 'diff';
  compareTabId?: string;
}

// --- Sample Initial Rich Text Tab ---
const DEFAULT_TABS: NoteTab[] = [
  {
    id: 'welcome-doc',
    title: 'Welcome Document.doc',
    isUnsaved: false,
    modifiedAt: Date.now(),
    originalContent: `<h1>Welcome to Pro Web Notepad 📝</h1>
<p><strong>Pro Web Notepad</strong> is a fast, visual rich-text document editor running entirely in HTML, CSS, and Vanilla JavaScript.</p>
<hr/>
<h2>🌟 Key Features</h2>
<ul>
  <li><strong>Visual Rich Text Editing:</strong> Clean visual text styling with bold, italic, underline, strikethrough, headings (H1-H5), text colors, and alignments.</li>
  <li><strong>Multi-Panel Workspace:</strong> Dynamic workspace splitting into <strong>1, 2, 3, 4, or 6 simultaneous document panels</strong>.</li>
  <li><strong>Markdown & Split Diff:</strong> View clean HTML, generated Markdown code, or side-by-side revision diff comparison.</li>
  <li><strong>Document Exports:</strong> Download your files directly as <strong>.doc</strong> (MS Word), <strong>.pdf</strong>, <strong>.html</strong>, or <strong>.txt</strong>.</li>
</ul>
<h3>🛠️ Formatting & Headings</h3>
<p>Use the Heading dropdown (H1 - H5) or quick toolbar buttons to format headings instantly.</p>
<blockquote>"Simplicity is about subtracting the obvious and adding the meaningful." — John Maeda</blockquote>`,
    content: `<h1>Welcome to Pro Web Notepad 📝</h1>
<p><strong>Pro Web Notepad</strong> is a fast, visual rich-text document editor running entirely in HTML, CSS, and Vanilla JavaScript.</p>
<hr/>
<h2>🌟 Key Features</h2>
<ul>
  <li><strong>Visual Rich Text Editing:</strong> Clean visual text styling with bold, italic, underline, strikethrough, headings (H1-H5), text colors, and alignments.</li>
  <li><strong>Multi-Panel Workspace:</strong> Dynamic workspace splitting into <strong>1, 2, 3, 4, or 6 simultaneous document panels</strong>.</li>
  <li><strong>Markdown & Split Diff:</strong> View clean HTML, generated Markdown code, or side-by-side revision diff comparison.</li>
  <li><strong>Document Exports:</strong> Download your files directly as <strong>.doc</strong> (MS Word), <strong>.pdf</strong>, <strong>.html</strong>, or <strong>.txt</strong>.</li>
</ul>
<h3>🛠️ Formatting & Headings</h3>
<p>Use the Heading dropdown (H1 - H5) or quick toolbar buttons to format headings instantly.</p>
<blockquote>"Simplicity is about subtracting the obvious and adding the meaningful." — John Maeda</blockquote>`
  }
];

const STORAGE_KEY = 'pro_web_notepad_richtext_v5';

// --- Application Engine ---
class AppEngine {
  tabs: NoteTab[] = [];
  activeTabId: string = '';
  panels: PanelConfig[] = [];
  gridLayout: number = 1;
  theme: 'light' | 'dark' = 'light';
  fontFamily: string = 'Segoe UI';
  fontSize: number = 14;

  lastActiveEditor: HTMLElement | null = null;
  savedSelection: Range | null = null;

  constructor() {
    this.loadState();
    this.initDOM();
    this.bindEvents();
    this.renderAll();
  }

  loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        this.tabs = parsed.tabs && parsed.tabs.length > 0 ? parsed.tabs : DEFAULT_TABS;
        this.activeTabId = parsed.activeTabId || this.tabs[0].id;
        this.gridLayout = parsed.gridLayout || 1;
        this.theme = parsed.theme || 'light';
        this.fontFamily = parsed.fontFamily || 'Segoe UI';
        this.fontSize = parsed.fontSize || 14;
      } else {
        this.tabs = DEFAULT_TABS;
        this.activeTabId = DEFAULT_TABS[0].id;
      }
    } catch {
      this.tabs = DEFAULT_TABS;
      this.activeTabId = DEFAULT_TABS[0].id;
    }

    this.panels = [
      { id: 'p1', activeTabId: this.activeTabId, mode: 'edit' },
      { id: 'p2', activeTabId: this.tabs[0]?.id || this.activeTabId, mode: 'preview' },
      { id: 'p3', activeTabId: this.activeTabId, mode: 'markdown' },
      { id: 'p4', activeTabId: this.activeTabId, mode: 'diff' },
      { id: 'p5', activeTabId: this.activeTabId, mode: 'edit' },
      { id: 'p6', activeTabId: this.activeTabId, mode: 'edit' }
    ];
  }

  saveState() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          tabs: this.tabs,
          activeTabId: this.activeTabId,
          gridLayout: this.gridLayout,
          theme: this.theme,
          fontFamily: this.fontFamily,
          fontSize: this.fontSize
        })
      );
    } catch (e) {
      console.warn('Failed to save session:', e);
    }
  }

  getActiveTab(): NoteTab {
    return this.tabs.find((t) => t.id === this.activeTabId) || this.tabs[0];
  }

  initDOM() {
    this.applyTheme();

    try {
      document.execCommand('styleWithCSS', false, 'true');
    } catch {}

    // Global selection tracker
    document.addEventListener('selectionchange', () => {
      const editor = this.getActiveEditor();
      if (!editor) return;
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        if (editor.contains(range.commonAncestorContainer)) {
          this.savedSelection = range.cloneRange();
          this.updateHeadingSelect();
        }
      }
    });

    // CLI hook
    (window as any).openFileFromCLI = (filename: string, content: string) => {
      const isHtml = /<[a-z][\s\S]*>/i.test(content);
      const htmlContent = isHtml ? content : `<p>${this.escapeHTML(content).replace(/\n/g, '<br/>')}</p>`;

      const newTab: NoteTab = {
        id: `cli-${Date.now()}`,
        title: filename || 'Document.doc',
        content: htmlContent,
        originalContent: htmlContent,
        isUnsaved: true,
        modifiedAt: Date.now()
      };
      this.tabs.push(newTab);
      this.activeTabId = newTab.id;
      this.panels[0].activeTabId = newTab.id;
      this.saveState();
      this.renderAll();
    };
  }

  applyTheme() {
    const isDark = this.theme === 'dark';
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }

    const toolTheme = document.getElementById('toolTheme');
    if (toolTheme) {
      toolTheme.innerHTML = isDark
        ? '<i class="fa-solid fa-moon text-blue-400"></i>'
        : '<i class="fa-solid fa-sun text-yellow-500"></i>';
    }
  }

  bindEvents() {
    // Menu toggles
    const menus = ['File', 'Edit', 'Insert', 'View', 'Help'];
    menus.forEach((m) => {
      const btn = document.getElementById(`menuBtn${m}`);
      const dropdown = document.getElementById(`dropdown${m}`);
      if (btn && dropdown) {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          menus.forEach((other) => {
            if (other !== m) document.getElementById(`dropdown${other}`)?.classList.add('hidden');
          });
          dropdown.classList.toggle('hidden');
        });
      }
    });

    document.addEventListener('click', () => {
      menus.forEach((m) => document.getElementById(`dropdown${m}`)?.classList.add('hidden'));
    });

    // File Input Open
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    fileInput?.addEventListener('change', (e: any) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string;
          (window as any).openFileFromCLI(file.name, content);
        };
        reader.readAsText(file);
      }
    });

    // Top Action Handlers
    document.getElementById('actionNew')?.addEventListener('click', () => this.handleNewTab());
    document.getElementById('toolNew')?.addEventListener('click', () => this.handleNewTab());
    document.getElementById('btnNewTab')?.addEventListener('click', () => this.handleNewTab());

    document.getElementById('actionOpen')?.addEventListener('click', () => fileInput?.click());
    document.getElementById('toolOpen')?.addEventListener('click', () => fileInput?.click());

    document.getElementById('actionSave')?.addEventListener('click', () => this.exportCurrent('doc'));
    document.getElementById('toolSave')?.addEventListener('click', () => this.exportCurrent('doc'));

    document.getElementById('actionExportMd')?.addEventListener('click', () => this.exportCurrent('txt'));
    document.getElementById('actionExportDoc')?.addEventListener('click', () => this.exportCurrent('doc'));
    document.getElementById('actionExportPdf')?.addEventListener('click', () => this.exportCurrent('pdf'));
    document.getElementById('actionExportTxt')?.addEventListener('click', () => this.exportCurrent('txt'));

    document.getElementById('actionPrint')?.addEventListener('click', () => this.handlePrint());
    document.getElementById('toolPrint')?.addEventListener('click', () => this.handlePrint());

    document.getElementById('actionCloseTab')?.addEventListener('click', () => this.closeActiveTab());

    // Prevent blur on toolbar button mousedown so text selection is preserved
    const toolbarButtons = document.querySelectorAll(
      '#toolBold, #toolItalic, #toolUnderline, #toolStrikethrough, #toolAlignLeft, #toolAlignCenter, #toolAlignRight, #toolAlignJustify, #toolList, #toolNumList, #toolQuote, #btnFontInc, #btnFontDec, #toolCut, #toolCopy, #toolPaste, #toolUndo, #toolRedo, .btn-format, #lblTextColor, #lblBgColor'
    );
    toolbarButtons.forEach((btn) => {
      btn.addEventListener('mousedown', (e) => e.preventDefault());
    });

    // Rich Text Formatting Handlers
    document.getElementById('toolBold')?.addEventListener('click', () => this.execCmd('bold'));
    document.getElementById('toolItalic')?.addEventListener('click', () => this.execCmd('italic'));
    document.getElementById('toolUnderline')?.addEventListener('click', () => this.execCmd('underline'));
    document.getElementById('toolStrikethrough')?.addEventListener('click', () => this.execCmd('strikeThrough'));

    const headingSelect = document.getElementById('headingSelect') as HTMLSelectElement;
    headingSelect?.addEventListener('change', (e: any) => {
      this.applyBlockFormat(e.target.value);
    });
    headingSelect?.addEventListener('focus', () => {
      const editor = this.getActiveEditor();
      if (editor) {
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0 && editor.contains(sel.getRangeAt(0).commonAncestorContainer)) {
          this.savedSelection = sel.getRangeAt(0).cloneRange();
        }
      }
    });

    document.getElementById('toolAlignLeft')?.addEventListener('click', () => this.execCmd('justifyLeft'));
    document.getElementById('toolAlignCenter')?.addEventListener('click', () => this.execCmd('justifyCenter'));
    document.getElementById('toolAlignRight')?.addEventListener('click', () => this.execCmd('justifyRight'));
    document.getElementById('toolAlignJustify')?.addEventListener('click', () => this.execCmd('justifyFull'));

    document.getElementById('toolList')?.addEventListener('click', () => this.execCmd('insertUnorderedList'));
    document.getElementById('toolNumList')?.addEventListener('click', () => this.execCmd('insertOrderedList'));
    document.getElementById('toolQuote')?.addEventListener('click', () => this.applyBlockFormat('blockquote'));

    // Color Pickers
    const textColorInput = document.getElementById('inputTextColor') as HTMLInputElement;
    textColorInput?.addEventListener('input', (e: any) => {
      this.execCmd('foreColor', e.target.value);
    });

    const bgColorInput = document.getElementById('inputBgColor') as HTMLInputElement;
    bgColorInput?.addEventListener('input', (e: any) => {
      this.execCmd('hiliteColor', e.target.value);
    });

    // Dropdown Format Items
    document.querySelectorAll('.btn-format').forEach((btn) => {
      btn.addEventListener('click', (e: any) => {
        const fmt = e.currentTarget.getAttribute('data-format');
        if (['p', 'h1', 'h2', 'h3', 'h4', 'h5'].includes(fmt)) {
          this.applyBlockFormat(fmt);
        } else if (fmt === 'insertUnorderedList') {
          this.execCmd('insertUnorderedList');
        } else if (fmt === 'insertOrderedList') {
          this.execCmd('insertOrderedList');
        } else if (fmt === 'formatBlockQuote') {
          this.applyBlockFormat('blockquote');
        }
      });
    });

    document.getElementById('actionInsertTable')?.addEventListener('click', () => {
      const tableHtml = `
        <table style="width: 100%; border-collapse: collapse; margin: 12px 0; border: 1px solid #ccc;">
          <thead>
            <tr style="background-color: rgba(0, 120, 212, 0.1);">
              <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">Header 1</th>
              <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">Header 2</th>
              <th style="border: 1px solid #ccc; padding: 8px; text-align: left;">Header 3</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="border: 1px solid #ccc; padding: 8px;">Data 1</td>
              <td style="border: 1px solid #ccc; padding: 8px;">Data 2</td>
              <td style="border: 1px solid #ccc; padding: 8px;">Data 3</td>
            </tr>
          </tbody>
        </table>
      `;
      this.execCmd('insertHTML', tableHtml);
    });

    document.getElementById('actionInsertHR')?.addEventListener('click', () => {
      this.execCmd('insertHorizontalRule');
    });

    // Clipboard & History Actions
    document.getElementById('actionCut')?.addEventListener('click', () => this.execCmd('cut'));
    document.getElementById('toolCut')?.addEventListener('click', () => this.execCmd('cut'));

    document.getElementById('actionCopy')?.addEventListener('click', () => this.execCmd('copy'));
    document.getElementById('toolCopy')?.addEventListener('click', () => this.execCmd('copy'));

    document.getElementById('actionPaste')?.addEventListener('click', () => {
      navigator.clipboard.readText().then((text) => {
        if (text) this.execCmd('insertText', text);
      }).catch(() => {
        this.execCmd('paste');
      });
    });

    document.getElementById('actionUndo')?.addEventListener('click', () => this.execCmd('undo'));
    document.getElementById('toolUndo')?.addEventListener('click', () => this.execCmd('undo'));

    document.getElementById('actionRedo')?.addEventListener('click', () => this.execCmd('redo'));
    document.getElementById('toolRedo')?.addEventListener('click', () => this.execCmd('redo'));

    document.getElementById('actionSelectAll')?.addEventListener('click', () => this.execCmd('selectAll'));

    // Grid Layout Buttons
    document.querySelectorAll('.btn-grid').forEach((btn) => {
      btn.addEventListener('click', (e: any) => {
        const gridNum = Number(e.currentTarget.getAttribute('data-grid'));
        if (gridNum) this.setGrid(gridNum);
      });
    });

    // View Toggles
    document.getElementById('actionTogglePreview')?.addEventListener('click', () => {
      this.panels[0].mode = this.panels[0].mode === 'preview' ? 'edit' : 'preview';
      this.renderWorkspace();
    });

    document.getElementById('actionToggleDiff')?.addEventListener('click', () => {
      this.panels[0].mode = this.panels[0].mode === 'diff' ? 'edit' : 'diff';
      this.renderWorkspace();
    });

    // Theme Toggle
    const toggleTheme = () => {
      this.theme = this.theme === 'dark' ? 'light' : 'dark';
      this.applyTheme();
      this.saveState();
    };
    document.getElementById('actionToggleTheme')?.addEventListener('click', toggleTheme);
    document.getElementById('toolTheme')?.addEventListener('click', toggleTheme);

    // Font Controls
    document.getElementById('btnFontInc')?.addEventListener('click', () => {
      const select = document.getElementById('fontSizeSelect') as HTMLSelectElement;
      if (select) {
        let val = Number(select.value);
        if (val < 7) {
          val += 1;
          select.value = String(val);
          this.execCmd('fontSize', String(val));
        }
      }
    });

    document.getElementById('btnFontDec')?.addEventListener('click', () => {
      const select = document.getElementById('fontSizeSelect') as HTMLSelectElement;
      if (select) {
        let val = Number(select.value);
        if (val > 1) {
          val -= 1;
          select.value = String(val);
          this.execCmd('fontSize', String(val));
        }
      }
    });

    const fontFamilySelect = document.getElementById('fontFamilySelect') as HTMLSelectElement;
    fontFamilySelect?.addEventListener('change', (e: any) => {
      this.execCmd('fontName', e.target.value);
    });

    const fontSizeSelect = document.getElementById('fontSizeSelect') as HTMLSelectElement;
    fontSizeSelect?.addEventListener('change', (e: any) => {
      this.execCmd('fontSize', e.target.value);
    });

    // Find & Replace
    const findBar = document.getElementById('findReplaceBar');
    const toggleFind = () => findBar?.classList.toggle('hidden');
    document.getElementById('actionFind')?.addEventListener('click', toggleFind);
    document.getElementById('toolSearch')?.addEventListener('click', toggleFind);
    document.getElementById('btnCloseFind')?.addEventListener('click', () => findBar?.classList.add('hidden'));

    document.getElementById('btnFindNext')?.addEventListener('click', () => this.handleFindNext());
    document.getElementById('btnReplace')?.addEventListener('click', () => this.handleReplace(false));
    document.getElementById('btnReplaceAll')?.addEventListener('click', () => this.handleReplace(true));

    // Fullscreen
    document.getElementById('toolFullscreen')?.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    });

    // Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
      const isCtrl = e.ctrlKey || e.metaKey;
      if (isCtrl && e.key.toLowerCase() === 's') {
        e.preventDefault();
        this.exportCurrent('doc');
      } else if (isCtrl && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        this.handleNewTab();
      } else if (isCtrl && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        toggleFind();
      } else if (isCtrl && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        this.execCmd('bold');
      } else if (isCtrl && e.key.toLowerCase() === 'i') {
        e.preventDefault();
        this.execCmd('italic');
      } else if (isCtrl && e.key.toLowerCase() === 'u') {
        e.preventDefault();
        this.execCmd('underline');
      } else if (isCtrl && (e.key === '/' || e.key === '?')) {
        e.preventDefault();
        this.showShortcutsModal();
      }
    });

    // Modals
    document.getElementById('actionModalShortcuts')?.addEventListener('click', () => {
      this.showShortcutsModal();
    });

    document.getElementById('actionModalAbout')?.addEventListener('click', () => {
      this.showModal('About Pro Web Notepad', `<div class="text-xs space-y-3 text-center py-2">
        <div class="w-12 h-12 rounded-xl bg-[#0078d4] text-white flex items-center justify-center font-bold text-xl mx-auto shadow-md">N</div>
        <h4 class="font-bold text-sm text-[#0078d4]">Pro Web Notepad (Rich Text Engine)</h4>
        <p class="text-gray-600 dark:text-gray-300">Clean visual rich text document editor built in standard HTML5, CSS3, and Vanilla JavaScript. Features multi-panel splitting, rich typography, colors, table insertion, Markdown views, split diffs, and instant Word/PDF downloads.</p>
        <div class="text-[11px] text-gray-500 border-t border-gray-200 dark:border-gray-700 pt-2">Version 3.2.0 — Visual Document Editor</div>
      </div>`);
    });
  }

  getActiveEditor(): HTMLElement | null {
    if (this.lastActiveEditor && document.body.contains(this.lastActiveEditor)) {
      return this.lastActiveEditor;
    }
    return document.querySelector('.panel-editor') as HTMLElement | null;
  }

  restoreSelection() {
    if (this.savedSelection) {
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(this.savedSelection);
      }
    }
  }

  updateHeadingSelect() {
    const headingSelect = document.getElementById('headingSelect') as HTMLSelectElement;
    if (!headingSelect) return;

    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      let node: Node | null = sel.getRangeAt(0).commonAncestorContainer;
      if (node.nodeType === Node.TEXT_NODE) {
        node = node.parentNode;
      }
      while (node && node instanceof HTMLElement && !['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'BLOCKQUOTE'].includes(node.tagName)) {
        if (node.classList?.contains('panel-editor')) break;
        node = node.parentNode;
      }
      if (node && node instanceof HTMLElement) {
        const tag = node.tagName.toLowerCase();
        if (['p', 'h1', 'h2', 'h3', 'h4', 'h5'].includes(tag)) {
          headingSelect.value = tag;
        }
      }
    }
  }

  applyBlockFormat(tag: string) {
    const editor = this.getActiveEditor();
    if (!editor) return;

    editor.focus();
    this.restoreSelection();

    const targetTag = tag.toLowerCase().trim(); // 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'blockquote'
    const tagArg = `<${targetTag}>`;

    let success = false;
    try {
      success = document.execCommand('formatBlock', false, tagArg);
    } catch (e) {
      console.warn('formatBlock with tags failed:', e);
    }

    if (!success) {
      try {
        success = document.execCommand('formatBlock', false, targetTag);
      } catch (e) {
        console.warn('formatBlock with string failed:', e);
      }
    }

    // Direct DOM replacement fallback if execCommand produced no change
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      let container: Node | null = range.commonAncestorContainer;
      if (container.nodeType === Node.TEXT_NODE) {
        container = container.parentNode;
      }

      let blockNode: HTMLElement | null = null;
      let curr: Node | null = container;
      while (curr && curr !== editor) {
        if (curr instanceof HTMLElement && ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'BLOCKQUOTE', 'DIV'].includes(curr.tagName)) {
          blockNode = curr;
          break;
        }
        curr = curr.parentNode;
      }

      if (blockNode && blockNode.tagName.toLowerCase() !== targetTag) {
        const newBlock = document.createElement(targetTag);
        newBlock.innerHTML = blockNode.innerHTML;
        blockNode.parentNode?.replaceChild(newBlock, blockNode);

        const newRange = document.createRange();
        newRange.selectNodeContents(newBlock);
        newRange.collapse(false);
        sel.removeAllRanges();
        sel.addRange(newRange);
        this.savedSelection = newRange.cloneRange();
      } else if (!blockNode && container === editor) {
        const contents = range.extractContents();
        const newBlock = document.createElement(targetTag);
        if (contents.textContent?.trim().length === 0) {
          newBlock.innerHTML = '<br>';
        } else {
          newBlock.appendChild(contents);
        }
        range.insertNode(newBlock);

        const newRange = document.createRange();
        newRange.selectNodeContents(newBlock);
        newRange.collapse(false);
        sel.removeAllRanges();
        sel.addRange(newRange);
        this.savedSelection = newRange.cloneRange();
      }
    }

    this.updateHeadingSelect();
    this.syncEditorState();
  }

  execCmd(command: string, value: string | undefined = undefined) {
    const editor = this.getActiveEditor();
    if (editor) {
      editor.focus();
    }
    this.restoreSelection();
    document.execCommand(command, false, value);
    this.syncEditorState();
  }

  syncEditorState() {
    const editor = this.getActiveEditor();
    if (!editor) return;

    const tabId = editor.getAttribute('data-tabid');
    const tab = this.tabs.find((t) => t.id === tabId) || this.getActiveTab();
    tab.content = editor.innerHTML;
    tab.isUnsaved = true;

    this.saveState();
    this.updateStatusBar();
    this.syncLivePreviews(tab.id, tab.content);
  }

  showShortcutsModal() {
    this.showModal('Keyboard Shortcuts Guide ⌨️', `
      <div class="space-y-4 text-xs text-gray-700 dark:text-gray-300 max-h-[70vh] overflow-y-auto pr-1">
        <div>
          <h4 class="font-bold text-[#0078d4] text-xs uppercase tracking-wider mb-2 border-b border-gray-200 dark:border-gray-700 pb-1">File Operations</h4>
          <div class="grid grid-cols-2 gap-2">
            <div class="flex items-center justify-between bg-gray-100 dark:bg-[#333] p-1.5 rounded"><span class="font-medium">New Document</span><kbd class="px-1.5 py-0.5 bg-white dark:bg-black rounded shadow-xs text-[10px] font-mono border border-gray-300 dark:border-gray-600">Ctrl + N</kbd></div>
            <div class="flex items-center justify-between bg-gray-100 dark:bg-[#333] p-1.5 rounded"><span class="font-medium">Open File</span><kbd class="px-1.5 py-0.5 bg-white dark:bg-black rounded shadow-xs text-[10px] font-mono border border-gray-300 dark:border-gray-600">Ctrl + O</kbd></div>
            <div class="flex items-center justify-between bg-gray-100 dark:bg-[#333] p-1.5 rounded"><span class="font-medium">Save Document</span><kbd class="px-1.5 py-0.5 bg-white dark:bg-black rounded shadow-xs text-[10px] font-mono border border-gray-300 dark:border-gray-600">Ctrl + S</kbd></div>
            <div class="flex items-center justify-between bg-gray-100 dark:bg-[#333] p-1.5 rounded"><span class="font-medium">Print Document</span><kbd class="px-1.5 py-0.5 bg-white dark:bg-black rounded shadow-xs text-[10px] font-mono border border-gray-300 dark:border-gray-600">Ctrl + P</kbd></div>
          </div>
        </div>

        <div>
          <h4 class="font-bold text-[#0078d4] text-xs uppercase tracking-wider mb-2 border-b border-gray-200 dark:border-gray-700 pb-1">Visual Formatting</h4>
          <div class="grid grid-cols-2 gap-2">
            <div class="flex items-center justify-between bg-gray-100 dark:bg-[#333] p-1.5 rounded"><span class="font-medium">Bold Text</span><kbd class="px-1.5 py-0.5 bg-white dark:bg-black rounded shadow-xs text-[10px] font-mono border border-gray-300 dark:border-gray-600">Ctrl + B</kbd></div>
            <div class="flex items-center justify-between bg-gray-100 dark:bg-[#333] p-1.5 rounded"><span class="font-medium">Italic Text</span><kbd class="px-1.5 py-0.5 bg-white dark:bg-black rounded shadow-xs text-[10px] font-mono border border-gray-300 dark:border-gray-600">Ctrl + I</kbd></div>
            <div class="flex items-center justify-between bg-gray-100 dark:bg-[#333] p-1.5 rounded"><span class="font-medium">Underline Text</span><kbd class="px-1.5 py-0.5 bg-white dark:bg-black rounded shadow-xs text-[10px] font-mono border border-gray-300 dark:border-gray-600">Ctrl + U</kbd></div>
            <div class="flex items-center justify-between bg-gray-100 dark:bg-[#333] p-1.5 rounded"><span class="font-medium">Find & Replace</span><kbd class="px-1.5 py-0.5 bg-white dark:bg-black rounded shadow-xs text-[10px] font-mono border border-gray-300 dark:border-gray-600">Ctrl + F</kbd></div>
            <div class="flex items-center justify-between bg-gray-100 dark:bg-[#333] p-1.5 rounded"><span class="font-medium">Select All</span><kbd class="px-1.5 py-0.5 bg-white dark:bg-black rounded shadow-xs text-[10px] font-mono border border-gray-300 dark:border-gray-600">Ctrl + A</kbd></div>
            <div class="flex items-center justify-between bg-gray-100 dark:bg-[#333] p-1.5 rounded"><span class="font-medium">Undo / Redo</span><kbd class="px-1.5 py-0.5 bg-white dark:bg-black rounded shadow-xs text-[10px] font-mono border border-gray-300 dark:border-gray-600">Ctrl + Z / Y</kbd></div>
          </div>
        </div>
      </div>
    `);
  }

  showModal(title: string, htmlContent: string) {
    const overlay = document.getElementById('modalOverlay');
    const content = document.getElementById('modalContent');
    if (overlay && content) {
      content.innerHTML = `
        <div class="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-700 mb-3">
          <h3 class="font-bold text-sm text-[#0078d4] flex items-center gap-2">${title}</h3>
          <button id="btnCloseModal" class="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-gray-500 hover:text-gray-800 dark:hover:text-white cursor-pointer"><i class="fa-solid fa-xmark"></i></button>
        </div>
        <div>${htmlContent}</div>
      `;
      overlay.classList.remove('hidden');

      const closeBtn = document.getElementById('btnCloseModal');
      closeBtn?.addEventListener('click', () => overlay.classList.add('hidden'));

      overlay.onclick = (e) => {
        if (e.target === overlay) overlay.classList.add('hidden');
      };
    }
  }

  handleNewTab() {
    const count = this.tabs.length + 1;
    const newTab: NoteTab = {
      id: `tab-${Date.now()}`,
      title: `Untitled_${count}.doc`,
      content: '<h2>Untitled Document</h2><p>Start typing your rich document text here...</p>',
      originalContent: '<h2>Untitled Document</h2><p>Start typing your rich document text here...</p>',
      isUnsaved: true,
      modifiedAt: Date.now()
    };
    this.tabs.push(newTab);
    this.activeTabId = newTab.id;
    this.panels[0].activeTabId = newTab.id;
    this.saveState();
    this.renderAll();
  }

  closeActiveTab() {
    if (this.tabs.length <= 1) return;
    this.tabs = this.tabs.filter((t) => t.id !== this.activeTabId);
    this.activeTabId = this.tabs[0].id;
    this.saveState();
    this.renderAll();
  }

  setGrid(gridNum: number) {
    this.gridLayout = gridNum;
    this.saveState();
    this.renderWorkspace();

    document.querySelectorAll('.btn-grid').forEach((b: any) => {
      if (Number(b.getAttribute('data-grid')) === gridNum) {
        b.className = 'btn-grid px-2 py-0.5 text-[11px] rounded font-medium bg-[#0078d4] text-white';
      } else {
        b.className = 'btn-grid px-2 py-0.5 text-[11px] rounded font-medium text-gray-600 dark:text-gray-300';
      }
    });
  }

  handleFindNext() {
    const findVal = (document.getElementById('findInput') as HTMLInputElement)?.value;
    if (!findVal) return;
    (window as any).find(findVal, false, false, true, false, false, false);
  }

  handleReplace(all: boolean) {
    const findVal = (document.getElementById('findInput') as HTMLInputElement)?.value;
    const replaceVal = (document.getElementById('replaceInput') as HTMLInputElement)?.value || '';
    if (!findVal) return;

    const tab = this.getActiveTab();
    if (all) {
      tab.content = tab.content.replaceAll(findVal, replaceVal);
    } else {
      tab.content = tab.content.replace(findVal, replaceVal);
    }
    tab.isUnsaved = true;
    this.saveState();
    this.renderWorkspace();
  }

  exportCurrent(type: 'doc' | 'pdf' | 'txt' | 'html') {
    const tab = this.getActiveTab();
    const title = tab.title.replace(/\.[^/.]+$/, '');
    const htmlContent = tab.content;

    if (type === 'doc') {
      const wordHtml = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head><meta charset='utf-8'><title>${title}</title><style>body { font-family: 'Segoe UI', Arial, sans-serif; padding: 20px; line-height: 1.6; }</style></head>
        <body>${htmlContent}</body>
        </html>
      `;
      const blob = new Blob([wordHtml], { type: 'application/msword' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${title}.doc`;
      a.click();
    } else if (type === 'pdf') {
      import('html2pdf.js').then((html2pdfModule) => {
        const html2pdf = html2pdfModule.default;
        const container = document.createElement('div');
        container.style.padding = '30px';
        container.style.fontFamily = 'Segoe UI, Arial, sans-serif';
        container.innerHTML = htmlContent;
        html2pdf().from(container).save(`${title}.pdf`);
      });
    } else if (type === 'html') {
      const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${title}.html`;
      a.click();
    } else if (type === 'txt') {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlContent;
      const plainText = tempDiv.textContent || tempDiv.innerText || '';
      const blob = new Blob([plainText], { type: 'text/plain;charset=utf-8' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${title}.txt`;
      a.click();
    }

    tab.isUnsaved = false;
    this.saveState();
    this.renderTabs();
  }

  handlePrint() {
    const tab = this.getActiveTab();
    const printWin = window.open('', '_blank');
    if (!printWin) return;
    printWin.document.write(`<html><head><title>${tab.title}</title><style>body{font-family: 'Segoe UI', Arial, sans-serif; padding: 30px; line-height: 1.6;}</style></head><body>${tab.content}<script>setTimeout(() => { window.print(); window.close(); }, 300);</script></body></html>`);
    printWin.document.close();
  }

  renderAll() {
    this.renderTabs();
    this.renderWorkspace();
  }

  renderTabs() {
    const container = document.getElementById('tabContainer');
    if (!container) return;

    container.innerHTML = this.tabs
      .map((tab) => {
        const isActive = tab.id === this.activeTabId;
        return `
        <div data-tabid="${tab.id}" class="tab-item group flex items-center gap-2 px-3 py-1.5 text-xs rounded-t-md cursor-pointer border-t-2 transition-colors ${
          isActive
            ? 'bg-white dark:bg-[#2c2c2c] border-[#0078d4] text-[#1c1c1c] dark:text-[#f0f0f0] font-medium shadow-xs'
            : 'bg-[#f0f0f0]/60 dark:bg-[#252526]/60 border-transparent text-gray-600 dark:text-gray-400 hover:bg-[#e4e4e4] dark:hover:bg-[#333]'
        }">
          <i class="fa-regular fa-file-word text-[#0078d4]"></i>
          <span>${tab.title}${tab.isUnsaved ? '*' : ''}</span>
          ${
            this.tabs.length > 1
              ? `<button data-closeid="${tab.id}" class="btn-close-tab opacity-60 hover:opacity-100 p-0.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600"><i class="fa-solid fa-xmark text-[10px]"></i></button>`
              : ''
          }
        </div>
      `;
      })
      .join('');

    // Tab Click Listeners
    container.querySelectorAll('.tab-item').forEach((el) => {
      el.addEventListener('click', () => {
        const id = el.getAttribute('data-tabid');
        if (id) {
          this.activeTabId = id;
          this.panels[0].activeTabId = id;
          this.saveState();
          this.renderAll();
        }
      });
    });

    container.querySelectorAll('.btn-close-tab').forEach((el) => {
      el.addEventListener('click', (e: Event) => {
        e.stopPropagation();
        const id = (el as HTMLElement).getAttribute('data-closeid');
        if (id && this.tabs.length > 1) {
          this.tabs = this.tabs.filter((t) => t.id !== id);
          this.activeTabId = this.tabs[0].id;
          this.saveState();
          this.renderAll();
        }
      });
    });
  }

  renderWorkspace() {
    const grid = document.getElementById('gridWorkspace');
    if (!grid) return;

    let gridCols = 'grid-cols-1 grid-rows-1';
    if (this.gridLayout === 2) gridCols = 'grid-cols-1 md:grid-cols-2 grid-rows-1';
    if (this.gridLayout === 3) gridCols = 'grid-cols-1 md:grid-cols-3 grid-rows-1';
    if (this.gridLayout === 4) gridCols = 'grid-cols-1 md:grid-cols-2 grid-rows-2';
    if (this.gridLayout === 6) gridCols = 'grid-cols-1 md:grid-cols-3 grid-rows-2';

    grid.className = `grid h-full w-full gap-2 ${gridCols}`;

    const visiblePanels = this.panels.slice(0, this.gridLayout);

    const existingPanelCards = grid.querySelectorAll('.panel-card');
    if (existingPanelCards.length !== visiblePanels.length) {
      grid.innerHTML = visiblePanels
        .map((p) => {
          const tab = this.tabs.find((t) => t.id === p.activeTabId) || this.getActiveTab();
          return `
          <div id="panel-${p.id}" class="panel-card flex flex-col h-full bg-white dark:bg-[#202020] border border-[#e0e0e0] dark:border-[#383838] rounded-md overflow-hidden shadow-xs">
            <!-- Panel Header -->
            <div class="flex items-center justify-between px-2.5 py-1.5 bg-[#f3f3f3] dark:bg-[#2a2a2a] border-b border-[#e0e0e0] dark:border-[#3a3a3a] text-xs shrink-0">
              <select data-panelid="${p.id}" class="panel-tab-select bg-white dark:bg-[#333] border border-gray-300 dark:border-gray-600 rounded px-1.5 py-0.5 text-xs text-gray-800 dark:text-gray-200 focus:outline-none">
                ${this.tabs.map((t) => `<option value="${t.id}" ${t.id === tab.id ? 'selected' : ''}>${t.title}</option>`).join('')}
              </select>

              <div class="flex items-center gap-1">
                <button data-panelid="${p.id}" data-mode="edit" class="btn-panel-mode px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer">Visual Edit</button>
                <button data-panelid="${p.id}" data-mode="preview" class="btn-panel-mode px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer">Clean View</button>
                <button data-panelid="${p.id}" data-mode="markdown" class="btn-panel-mode px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer">Markdown</button>
                <button data-panelid="${p.id}" data-mode="diff" class="btn-panel-mode px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer">Split Diff</button>
              </div>
            </div>

            <!-- Panel Body -->
            <div id="panel-body-${p.id}" class="panel-body flex-1 relative overflow-hidden flex bg-white dark:bg-[#1e1e1e]"></div>
          </div>
        `;
        })
        .join('');

      // Header Listeners
      grid.querySelectorAll('.panel-tab-select').forEach((sel: any) => {
        sel.addEventListener('change', (e: any) => {
          const panelId = sel.getAttribute('data-panelid');
          const tabId = e.target.value;
          const panel = this.panels.find((p) => p.id === panelId);
          if (panel) {
            panel.activeTabId = tabId;
            this.updatePanel(panelId);
          }
        });
      });

      grid.querySelectorAll('.btn-panel-mode').forEach((btn: any) => {
        btn.addEventListener('click', () => {
          const panelId = btn.getAttribute('data-panelid');
          const mode = btn.getAttribute('data-mode');
          const panel = this.panels.find((p) => p.id === panelId);
          if (panel && (mode === 'edit' || mode === 'preview' || mode === 'markdown' || mode === 'diff')) {
            panel.mode = mode;
            this.updatePanel(panelId);
          }
        });
      });
    }

    visiblePanels.forEach((p) => this.updatePanel(p.id));
  }

  updatePanel(panelId: string) {
    const panel = this.panels.find((p) => p.id === panelId);
    if (!panel) return;

    const panelEl = document.getElementById(`panel-${panelId}`);
    if (!panelEl) return;

    const tab = this.tabs.find((t) => t.id === panel.activeTabId) || this.getActiveTab();

    // Select dropdown update
    const selectEl = panelEl.querySelector('.panel-tab-select') as HTMLSelectElement;
    if (selectEl) {
      selectEl.innerHTML = this.tabs.map((t) => `<option value="${t.id}" ${t.id === tab.id ? 'selected' : ''}>${t.title}</option>`).join('');
      selectEl.value = tab.id;
    }

    // Mode buttons styling update
    const modeButtons = panelEl.querySelectorAll('.btn-panel-mode');
    modeButtons.forEach((btn: any) => {
      const btnMode = btn.getAttribute('data-mode');
      const isActive = btnMode === panel.mode;
      btn.className = `btn-panel-mode px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
        isActive
          ? 'bg-[#0078d4] text-white shadow-xs'
          : 'bg-gray-200 dark:bg-[#383838] text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-[#484848]'
      }`;
    });

    // Body container update
    const bodyEl = document.getElementById(`panel-body-${panelId}`);
    if (bodyEl) {
      if (panel.mode === 'edit') {
        bodyEl.innerHTML = `<div contenteditable="true" data-tabid="${tab.id}" class="panel-editor flex-1 h-full w-full p-4 border-none outline-none overflow-auto bg-transparent text-[#1c1c1c] dark:text-[#f0f0f0]" style="font-family: '${this.fontFamily}', sans-serif; line-height: 1.6;">${tab.content}</div>`;
        this.bindEditorEvents(bodyEl.querySelector('.panel-editor') as HTMLElement);
      } else if (panel.mode === 'preview') {
        bodyEl.innerHTML = `<div class="panel-preview-body flex-1 h-full w-full p-5 overflow-auto text-[#1c1c1c] dark:text-[#f0f0f0]">${tab.content}</div>`;
      } else if (panel.mode === 'markdown') {
        bodyEl.innerHTML = this.renderMarkdownView(tab);
        this.bindMarkdownEvents(bodyEl);
      } else if (panel.mode === 'diff') {
        bodyEl.innerHTML = this.renderDiffSideBySide(tab);
        this.bindDiffEvents(bodyEl);
      }
    }

    this.updateStatusBar();
  }

  bindEditorEvents(editor: HTMLElement) {
    if (!editor) return;

    const trackEditor = () => {
      this.lastActiveEditor = editor;
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0);
        if (editor.contains(range.commonAncestorContainer)) {
          this.savedSelection = range.cloneRange();
          this.updateHeadingSelect();
        }
      }
      this.updateCursorInfo();
    };

    editor.addEventListener('focus', trackEditor);
    editor.addEventListener('click', trackEditor);
    editor.addEventListener('keyup', trackEditor);
    editor.addEventListener('mouseup', trackEditor);

    editor.addEventListener('input', () => {
      trackEditor();
      const tabId = editor.getAttribute('data-tabid');
      const tab = this.tabs.find((t) => t.id === tabId);
      if (tab) {
        tab.content = editor.innerHTML;
        tab.isUnsaved = true;
        this.saveState();
        this.updateStatusBar();
        this.syncLivePreviews(tab.id, tab.content);
      }
    });
  }

  bindMarkdownEvents(container: HTMLElement) {
    const copyBtn = container.querySelector('.btn-copy-markdown');
    copyBtn?.addEventListener('click', () => {
      const tabId = copyBtn.getAttribute('data-tabid');
      const tab = this.tabs.find((t) => t.id === tabId);
      if (tab) {
        const mdText = this.htmlToMarkdown(tab.content);
        navigator.clipboard.writeText(mdText).then(() => {
          copyBtn.innerHTML = '<i class="fa-solid fa-check text-green-500"></i> Copied!';
          setTimeout(() => {
            copyBtn.innerHTML = '<i class="fa-regular fa-copy"></i> Copy Markdown';
          }, 2000);
        });
      }
    });
  }

  bindDiffEvents(container: HTMLElement) {
    const resetBtn = container.querySelector('.btn-reset-diff');
    resetBtn?.addEventListener('click', () => {
      const tabId = resetBtn.getAttribute('data-tabid');
      const tab = this.tabs.find((t) => t.id === tabId);
      if (tab) {
        tab.originalContent = tab.content;
        tab.isUnsaved = false;
        this.saveState();
        const panelCard = container.closest('.panel-card');
        const panelId = panelCard?.id.replace('panel-', '') || 'p1';
        this.updatePanel(panelId);
      }
    });
  }

  renderMarkdownView(tab: NoteTab): string {
    const markdownText = this.htmlToMarkdown(tab.content);
    return `
      <div class="flex flex-col h-full w-full bg-[#181818] text-[#d4d4d4] font-mono text-xs overflow-hidden">
        <div class="flex items-center justify-between px-3 py-1.5 bg-[#222] border-b border-[#333] text-[11px]">
          <span class="text-gray-400 font-semibold flex items-center gap-1.5"><i class="fa-brands fa-markdown text-blue-400"></i> Markdown Output</span>
          <button data-tabid="${tab.id}" class="btn-copy-markdown px-2 py-1 rounded bg-[#333] hover:bg-[#444] text-gray-200 transition-colors flex items-center gap-1 text-[11px] cursor-pointer">
            <i class="fa-regular fa-copy"></i> Copy Markdown
          </button>
        </div>
        <div class="flex-1 p-4 overflow-auto font-mono whitespace-pre-wrap select-text leading-relaxed">${this.escapeHTML(markdownText)}</div>
      </div>
    `;
  }

  renderDiffSideBySide(tab: NoteTab): string {
    const tempOrig = document.createElement('div');
    tempOrig.innerHTML = tab.originalContent || '';
    const origLines = tempOrig.innerText.split('\n');

    const tempCurr = document.createElement('div');
    tempCurr.innerHTML = tab.content || '';
    const currLines = tempCurr.innerText.split('\n');

    const maxLen = Math.max(origLines.length, currLines.length);

    let leftRows = '';
    let rightRows = '';
    let additions = 0;
    let deletions = 0;

    for (let i = 0; i < maxLen; i++) {
      const orig = origLines[i] ?? null;
      const curr = currLines[i] ?? null;

      if (orig !== null && curr !== null && orig === curr) {
        leftRows += `<div class="px-2 py-0.5 text-gray-600 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800/40 flex"><span class="w-7 shrink-0 text-right pr-2 text-gray-400 text-[10px] select-none">${i + 1}</span><span class="truncate">${this.escapeHTML(orig) || '&nbsp;'}</span></div>`;
        rightRows += `<div class="px-2 py-0.5 text-gray-600 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800/40 flex"><span class="w-7 shrink-0 text-right pr-2 text-gray-400 text-[10px] select-none">${i + 1}</span><span class="truncate">${this.escapeHTML(curr) || '&nbsp;'}</span></div>`;
      } else {
        if (orig !== null && (curr === null || orig !== curr)) {
          deletions++;
          leftRows += `<div class="px-2 py-0.5 bg-red-100/80 dark:bg-red-950/50 text-red-700 dark:text-red-300 border-b border-red-200 dark:border-red-900/50 flex"><span class="w-7 shrink-0 text-right pr-2 text-red-500 text-[10px] select-none">- ${i + 1}</span><span class="truncate font-semibold">${this.escapeHTML(orig) || '&nbsp;'}</span></div>`;
        } else {
          leftRows += `<div class="px-2 py-0.5 border-b border-transparent opacity-0 flex"><span class="w-7 select-none">&nbsp;</span></div>`;
        }

        if (curr !== null && (orig === null || orig !== curr)) {
          additions++;
          rightRows += `<div class="px-2 py-0.5 bg-green-100/80 dark:bg-green-950/50 text-green-700 dark:text-green-300 border-b border-green-200 dark:border-green-900/50 flex"><span class="w-7 shrink-0 text-right pr-2 text-green-500 text-[10px] select-none">+ ${i + 1}</span><span class="truncate font-semibold">${this.escapeHTML(curr) || '&nbsp;'}</span></div>`;
        } else {
          rightRows += `<div class="px-2 py-0.5 border-b border-transparent opacity-0 flex"><span class="w-7 select-none">&nbsp;</span></div>`;
        }
      }
    }

    return `
      <div class="flex flex-col h-full w-full font-mono text-xs overflow-hidden">
        <!-- Diff Summary Header -->
        <div class="flex items-center justify-between px-3 py-1.5 bg-gray-100 dark:bg-[#252525] border-b border-gray-200 dark:border-gray-700 text-[11px]">
          <div class="flex items-center gap-3">
            <span class="text-gray-700 dark:text-gray-300 font-semibold flex items-center gap-1.5"><i class="fa-solid fa-code-compare text-[#0078d4]"></i> Split Revision Diff</span>
            <span class="px-2 py-0.5 rounded bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 font-medium">+${additions} insertions</span>
            <span class="px-2 py-0.5 rounded bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 font-medium">-${deletions} deletions</span>
          </div>
          <button data-tabid="${tab.id}" class="btn-reset-diff px-2 py-0.5 rounded bg-gray-200 dark:bg-[#3d3d3d] hover:bg-gray-300 dark:hover:bg-[#4d4d4d] text-gray-700 dark:text-gray-200 text-[10px] cursor-pointer">Set Current as Baseline</button>
        </div>

        <!-- Split Columns -->
        <div class="grid grid-cols-2 flex-1 divide-x divide-gray-200 dark:divide-gray-700 overflow-hidden">
          <!-- Original Column (Before) -->
          <div class="flex flex-col h-full overflow-hidden bg-gray-50/50 dark:bg-[#1a1a1a]/50">
            <div class="px-3 py-1 bg-gray-200/60 dark:bg-[#222] font-sans font-semibold text-[11px] text-gray-700 dark:text-gray-300 flex items-center gap-1.5 border-b border-gray-200 dark:border-gray-700">
              <i class="fa-solid fa-clock-rotate-left text-amber-500"></i> Original Version (Before)
            </div>
            <div class="flex-1 overflow-auto p-1 leading-relaxed">${leftRows}</div>
          </div>

          <!-- Current Column (After) -->
          <div class="flex flex-col h-full overflow-hidden bg-white dark:bg-[#1e1e1e]">
            <div class="px-3 py-1 bg-gray-200/60 dark:bg-[#222] font-sans font-semibold text-[11px] text-gray-700 dark:text-gray-300 flex items-center gap-1.5 border-b border-gray-200 dark:border-gray-700">
              <i class="fa-solid fa-pen-to-square text-[#0078d4]"></i> Current Revision (After)
            </div>
            <div class="flex-1 overflow-auto p-1 leading-relaxed">${rightRows}</div>
          </div>
        </div>
      </div>
    `;
  }

  htmlToMarkdown(html: string): string {
    const temp = document.createElement('div');
    temp.innerHTML = html;

    function processNode(node: Node): string {
      if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent || '';
      }
      if (node.nodeType !== Node.ELEMENT_NODE) {
        return '';
      }

      const el = node as HTMLElement;
      const tagName = el.tagName.toLowerCase();
      const childrenMarkdown = Array.from(el.childNodes).map(processNode).join('');

      switch (tagName) {
        case 'h1': return `\n# ${childrenMarkdown.trim()}\n\n`;
        case 'h2': return `\n## ${childrenMarkdown.trim()}\n\n`;
        case 'h3': return `\n### ${childrenMarkdown.trim()}\n\n`;
        case 'h4': return `\n#### ${childrenMarkdown.trim()}\n\n`;
        case 'h5': return `\n##### ${childrenMarkdown.trim()}\n\n`;
        case 'h6': return `\n###### ${childrenMarkdown.trim()}\n\n`;
        case 'p': return `\n${childrenMarkdown.trim()}\n\n`;
        case 'strong':
        case 'b': return `**${childrenMarkdown}**`;
        case 'em':
        case 'i': return `*${childrenMarkdown}*`;
        case 'u': return `<u>${childrenMarkdown}</u>`;
        case 's':
        case 'strike':
        case 'del': return `~~${childrenMarkdown}~~`;
        case 'blockquote': return `\n> ${childrenMarkdown.trim().replace(/\n/g, '\n> ')}\n\n`;
        case 'ul': {
          const items = Array.from(el.children)
            .map((child) => `- ${child.textContent?.trim()}`)
            .join('\n');
          return `\n${items}\n\n`;
        }
        case 'ol': {
          const items = Array.from(el.children)
            .map((child, idx) => `${idx + 1}. ${child.textContent?.trim()}`)
            .join('\n');
          return `\n${items}\n\n`;
        }
        case 'hr': return '\n---\n\n';
        case 'br': return '\n';
        case 'code': return `\`${childrenMarkdown}\``;
        case 'pre': return `\n\`\`\`\n${childrenMarkdown.trim()}\n\`\`\`\n\n`;
        case 'table': {
          const rows = Array.from(el.querySelectorAll('tr'));
          if (rows.length === 0) return childrenMarkdown;
          let tableMd = '\n';
          rows.forEach((row, rowIndex) => {
            const cells = Array.from(row.querySelectorAll('th, td')).map((c) => c.textContent?.trim() || '');
            tableMd += `| ${cells.join(' | ')} |\n`;
            if (rowIndex === 0) {
              tableMd += `| ${cells.map(() => '---').join(' | ')} |\n`;
            }
          });
          return tableMd + '\n';
        }
        case 'div':
        case 'section':
        case 'article': return `${childrenMarkdown}\n`;
        default: return childrenMarkdown;
      }
    }

    const rawMd = processNode(temp);
    return rawMd.replace(/\n{3,}/g, '\n\n').trim();
  }

  escapeHTML(str: string): string {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  syncLivePreviews(tabId: string, content: string) {
    this.panels.forEach((p) => {
      if (p.activeTabId === tabId) {
        const panelEl = document.getElementById(`panel-${p.id}`);
        if (p.mode === 'preview') {
          const previewEl = panelEl?.querySelector('.overflow-auto');
          if (previewEl) previewEl.innerHTML = content;
        } else if (p.mode === 'markdown') {
          if (panelEl) {
            const codeEl = panelEl.querySelector('.whitespace-pre-wrap');
            if (codeEl) codeEl.innerHTML = this.escapeHTML(this.htmlToMarkdown(content));
          }
        } else if (p.mode === 'diff') {
          const tab = this.tabs.find((t) => t.id === tabId);
          if (tab && panelEl) {
            const bodyEl = panelEl.querySelector('.flex-1.relative');
            if (bodyEl) bodyEl.innerHTML = this.renderDiffSideBySide(tab);
          }
        }
      }
    });
  }

  updateCursorInfo() {
    const sel = window.getSelection();
    let line = 1;
    let col = 1;

    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      const node = range.startContainer;
      col = range.startOffset + 1;
      if (node && node.parentElement) {
        const parent = node.parentElement;
        const text = parent.innerText || '';
        line = text.substring(0, range.startOffset).split('\n').length;
      }
    }

    const statusCursor = document.getElementById('statusCursor');
    if (statusCursor) statusCursor.innerText = `Ln ${line}, Col ${col}`;
  }

  updateStatusBar() {
    const tab = this.getActiveTab();
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = tab.content || '';
    const plainText = tempDiv.textContent || tempDiv.innerText || '';

    const words = plainText.trim() ? plainText.trim().split(/\s+/).length : 0;
    const chars = plainText.length;
    const lines = plainText.split('\n').length;

    const statusStats = document.getElementById('statusStats');
    if (statusStats) statusStats.innerText = `${words} words, ${chars} chars, ${lines} lines`;

    const statusFont = document.getElementById('statusFont');
    if (statusFont) statusFont.innerText = `${this.fontFamily}, Normal`;

    const statusLayout = document.getElementById('statusLayout');
    if (statusLayout) statusLayout.innerText = `Layout: ${this.gridLayout} Panel${this.gridLayout > 1 ? 's' : ''}`;
  }
}

// Instantiate engine when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  new AppEngine();
});
