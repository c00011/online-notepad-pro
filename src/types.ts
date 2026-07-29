export type ThemeMode = 'light' | 'dark';

export type GridLayout = 1 | 2 | 3 | 4 | 6;

export type PanelMode = 'edit' | 'preview' | 'diff';

export interface FontSettings {
  fontFamily: string;
  fontSize: number; // in px
  lineHeight: number;
  wordWrap: boolean;
  showLineNumbers: boolean;
}

export interface NoteTab {
  id: string;
  title: string;
  content: string;
  isUnsaved: boolean;
  createdAt: number;
  modifiedAt: number;
  language: 'markdown' | 'text' | 'code';
}

export interface PanelConfig {
  id: string;
  activeTabId: string;
  mode: PanelMode;
  compareTabId?: string; // For diff comparison against another tab or previous saved state
}

export interface FindReplaceState {
  isOpen: boolean;
  findText: string;
  replaceText: string;
  matchCase: boolean;
  wholeWord: boolean;
  useRegex: boolean;
  matchIndex: number;
  totalMatches: number;
}

export interface AppState {
  tabs: NoteTab[];
  activeTabId: string;
  panels: PanelConfig[];
  gridLayout: GridLayout;
  theme: ThemeMode;
  fontSettings: FontSettings;
  showStatusBar: boolean;
  showToolbar: boolean;
  zoomLevel: number; // e.g. 100 for 100%
  findReplace: FindReplaceState;
}

export interface MenuItem {
  id: string;
  label: string;
  icon?: string;
  shortcut?: string;
  action?: () => void;
  disabled?: boolean;
  divider?: boolean;
  children?: MenuItem[];
}
