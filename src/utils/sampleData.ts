import { NoteTab } from '../types';

export const DEFAULT_SAMPLE_TABS: NoteTab[] = [
  {
    id: 'welcome-doc',
    title: 'Welcome to Pro Web Notepad.md',
    language: 'markdown',
    isUnsaved: false,
    createdAt: Date.now() - 3600000,
    modifiedAt: Date.now() - 1800000,
    content: `# Welcome to Pro Web Notepad 📝

**Pro Web Notepad** is a high-performance, Windows 11 Fluent UI text editor running entirely in your browser.

---

## 🌟 Key Features

* **Fluent UI Aesthetics:** Clean, minimalist design with rounded corners, subtle acrylic cards, and dark/light themes.
* **Multi-Panel Workspace:** Dynamic CSS Grid splitting into **1, 2, 3, 4, or 6 simultaneous text panels**.
* **Live Markdown Preview:** Real-time side-by-side rendering with tables, task lists, and syntax highlights.
* **Diff Comparison:** Line-by-line diff mode to compare two tabs or revisions.
* **Client-Side Exports:** Download your work as **.md**, **.doc** (MS Word), or **.pdf**.
* **Session Persistence:** Auto-saves your open tabs and layout options to \`localStorage\`.

---

## 🛠️ Markdown Syntax Demo

### Checklist & Tasks
- [x] Launch Pro Web Notepad
- [x] Test multi-panel grid splitting (View -> Grid Layout)
- [ ] Try exporting to PDF or MS Word

### Code Snippet
\`\`\`typescript
// Global CLI Hook support
window.openFileFromCLI("demo.ts", "console.log('Hello from CLI!');");
\`\`\`

### Formatted Data Table

| Action | Keyboard Shortcut | Function |
| :--- | :---: | :--- |
| Save File | \`Ctrl + S\` | Export current tab content |
| Find & Replace | \`Ctrl + F\` | Open search bar |
| Switch Tab | \`Ctrl + Tab\` | Navigate open files |
| Fullscreen | \`F11\` / Icon | Toggle fullscreen mode |

> *"Simplicity is about subtracting the obvious and adding the meaningful."* — John Maeda
`
  },
  {
    id: 'shortcuts-doc',
    title: 'Keyboard Shortcuts Guide.md',
    language: 'markdown',
    isUnsaved: false,
    createdAt: Date.now() - 7200000,
    modifiedAt: Date.now() - 3600000,
    content: `# Pro Web Notepad Keyboard Shortcuts ⌨️

Master the editor with standard Windows desktop shortcuts.

## File Operations
* \`Ctrl + N\` — Create a new file tab
* \`Ctrl + O\` — Open local file from computer
* \`Ctrl + S\` — Save / Download active file
* \`Ctrl + P\` — Print active document

## Editing & History
* \`Ctrl + Z\` — Undo change
* \`Ctrl + Y\` / \`Ctrl + Shift + Z\` — Redo change
* \`Ctrl + X\` — Cut text
* \`Ctrl + C\` — Copy text
* \`Ctrl + V\` — Paste text
* \`Ctrl + A\` — Select all text
* \`Ctrl + F\` — Open Find & Replace panel

## Navigation & View
* \`Ctrl + Tab\` — Switch to next tab
* \`Ctrl + Shift + Tab\` — Switch to previous tab
* \`Ctrl + Shift + L\` — Toggle Live Markdown Preview
* \`Ctrl + Shift + D\` — Toggle Side-by-Side Diff Mode
* \`Ctrl + Shift + G\` — Switch Grid Layout
`
  },
  {
    id: 'notes-sample',
    title: 'Project Roadmap Notes.txt',
    language: 'text',
    isUnsaved: false,
    createdAt: Date.now() - 86400000,
    modifiedAt: Date.now() - 43200000,
    content: `PROJECT ROADMAP & MEETING NOTES
Date: July 2026
Author: Engineering Team

1. OVERVIEW
--------------------------------------------------
Pro Web Notepad delivers a native Windows 11 Fluent UI text editing environment in the browser.
Key architectural goals: zero server latency, instant loading (<0.2ms initialization), and 100% client-side data privacy.

2. IMMEDIATE TASKS
--------------------------------------------------
- Verify multi-panel grid support across 1, 2, 3, 4, and 6 views.
- Test export features: .md, .doc (MS Word HTML compatibility), and .pdf generation.
- Ensure handwriting / pen input support works smoothly on touchscreen and Windows Ink devices.

3. REVISION NOTES
--------------------------------------------------
All tab states and editor configurations automatically sync to browser local storage.
`
  }
];
