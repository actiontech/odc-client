import * as monaco from 'monaco-editor';

export const editorDefaultThemeData: monaco.editor.IStandaloneThemeData = {
  base: 'vs',
  inherit: true,
  rules: [
    // 基础代码样式 - 保留原有配色，去除过多的粗体
    { token: '', foreground: '71717a' },
    { token: 'keyword', foreground: 'd73a49' }, // 移除 bold，保持正常字重
    { token: 'string', foreground: 'dc2626' },
    { token: 'number', foreground: '16a34a' },
    { token: 'comment', foreground: '999988', fontStyle: 'italic' },

    // 新增 SQL 特定语法高亮规则 - 只在重要的地方使用粗体
    { token: 'keyword.sql', foreground: 'd73a49' }, // 移除 bold，保持正常字重
    { token: 'predefined.sql', foreground: '7c3aed' }, // SQL 函数，移除 bold
    { token: 'string.sql', foreground: 'dc2626' },
    { token: 'string.quoted.sql', foreground: 'dc2626' },
    { token: 'number.sql', foreground: '16a34a' },
    { token: 'comment.sql', foreground: '999988', fontStyle: 'italic' },
    { token: 'operator.sql', foreground: 'd73a49' }, // SQL 操作符
    { token: 'identifier.sql', foreground: '71717a' },
    { token: 'identifier.quote.sql', foreground: '0891b2' }, // 引号标识符
    { token: 'type.sql', foreground: '0891b2' }, // 表名、列名等
    { token: 'delimiter.sql', foreground: '71717a' },
    { token: 'delimiter.parenthesis.sql', foreground: '71717a' },
    { token: 'delimiter.bracket.sql', foreground: '71717a' }
  ],
  colors: {
    // 编辑器背景色 - 保留原有配色
    'editor.background': '#fcfbf9',
    'editor.foreground': '#333333',

    // 行号样式 - 保留原有配色
    'editorLineNumber.foreground': '#999999',
    'editorLineNumber.activeForeground': '#333333',
    'editorGutter.background': '#f7f6f4',

    // 当前行高亮 - 保留原有配色
    'editor.lineHighlightBackground': '#F8F9FA',
    'editor.lineHighlightBorder': '#00000000',

    // 差异对比颜色 - 保留原有配色
    'diffEditor.insertedTextBackground': '#C8E6C9AA', // 浅绿色，添加的内容
    'diffEditor.removedTextBackground': '#FFCDD2AA', // 浅红色，删除的内容
    'diffEditor.insertedLineBackground': '#E8F5E9BB', // 整行添加的背景
    'diffEditor.removedLineBackground': '#FFEBEE99', // 整行删除的背景

    // 滚动条样式 - 保留原有配色
    'scrollbar.shadow': '#00000000',
    'scrollbarSlider.background': '#E0E0E0',
    'scrollbarSlider.hoverBackground': '#BDBDBD',
    'scrollbarSlider.activeBackground': '#9E9E9E',

    // 光标样式 - 保留原有配色
    'editorCursor.foreground': '#64748b',
    'editorCursor.background': '#FFFFFF00',

    // 新增的 SQL 相关增强功能
    'editor.selectionBackground': '#CCDDFF', // 选择背景
    'editor.selectionForeground': '#333333', // 选择文字颜色
    'editor.inactiveSelectionBackground': '#F3F4F6', // 非活动选择背景
    'editor.selectionHighlightBackground': '#E0F2FE', // 选择高亮背景

    // 搜索相关
    'editor.findMatchBackground': '#FFFF00', // 搜索匹配背景
    'editor.findMatchBorder': '#FF8C00', // 搜索匹配边框
    'editor.findMatchHighlightBackground': '#FFF8DC', // 搜索匹配高亮背景
    'editor.findRangeHighlightBackground': '#F0F9FF', // 搜索范围高亮背景

    // 括号匹配
    'editorBracketMatch.background': '#E0F2FE', // 括号匹配背景
    'editorBracketMatch.border': '#0EA5E9', // 括号匹配边框

    // 缩进辅助线
    'editorIndentGuide.background': '#F3F4F6', // 缩进线背景
    'editorIndentGuide.activeBackground': '#D1D5DB', // 活动缩进线背景

    // 智能提示窗口
    'editorSuggestWidget.background': '#FFFFFF', // 提示窗口背景
    'editorSuggestWidget.border': '#E5E7EB', // 提示窗口边框
    'editorSuggestWidget.foreground': '#1f2937', // 提示窗口文字
    'editorSuggestWidget.selectedBackground': '#3b82f6', // 提示窗口选中背景

    // 悬停提示
    'editorHoverWidget.background': '#FFFFFF', // 悬停提示背景
    'editorHoverWidget.border': '#E5E7EB', // 悬停提示边框
    'editorHoverWidget.foreground': '#333333', // 悬停提示文字

    // 错误和警告提示
    'editorError.foreground': '#DC2626', // 错误文字颜色
    'editorWarning.foreground': '#D97706', // 警告文字颜色
    'editorInfo.foreground': '#2563EB' // 信息文字颜色
  }
};

export const CUSTOM_DIFF_EDITOR_THEME_NAME = 'DMSEditorCustomTheme';
