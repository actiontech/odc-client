/*
 * Copyright 2023 OceanBase
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as monaco from 'monaco-editor';
import { IFunction } from '../functions';
import functions from '../functions';
import { keywords } from '../keywords';

export const conf: monaco.languages.LanguageConfiguration = {
  comments: {
    lineComment: '-- ',
    blockComment: ['/*', '*/']
  },
  brackets: [
    ['{', '}'],
    ['[', ']'],
    ['(', ')']
  ],
  wordPattern: /[\w$]+/i,
  autoClosingPairs: [
    { open: '{', close: '}' },
    { open: '[', close: ']' },
    { open: '(', close: ')' },
    { open: '"', close: '"' },
    { open: "'", close: "'" }
  ],
  surroundingPairs: [
    { open: '{', close: '}' },
    { open: '[', close: ']' },
    { open: '(', close: ')' },
    { open: '"', close: '"' },
    { open: "'", close: "'" }
  ]
};

//@ts-ignore
export const language: monaco.languages.IMonarchLanguage = {
  defaultToken: '',
  tokenPostfix: '.sql',
  ignoreCase: true,
  brackets: [
    { open: '[', close: ']', token: 'delimiter.square' },
    { open: '(', close: ')', token: 'delimiter.parenthesis' }
  ],
  //@ts-ignore
  keywords: Array.from(new Set(keywords)),
  operators: [
    '=',
    '>',
    '<',
    '<=',
    '>=',
    '<>',
    '!=',
    '+',
    '-',
    '*',
    '/',
    '%',
    '^',
    '||',
    '~~',
    '~~*',
    '!~~',
    '!~~*',
    '@>',
    '<@',
    '->',
    '->>',
    '#>',
    '#>>',
    '&&',
    '|/',
    '||/',
    '<<',
    '>>',
    '!!'
  ],
  builtinVariables: [],
  builtinFunctions: functions.map((func: IFunction) => {
    return func.name;
  }),
  pseudoColumns: [],
  escapes:
    /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,
  tokenizer: {
    root: [
      { include: '@comments' },
      { include: '@whitespace' },
      { include: '@dollarQuotedStrings' },
      { include: '@numbers' },
      { include: '@strings' },
      { include: '@complexIdentifiers' },
      { include: '@scopes' },
      [/[;,.]/, 'delimiter'],
      [/[()]/, '@brackets'],
      [
        /[\w$]+/,
        {
          cases: {
            '@keywords': 'keyword',
            '@operators': 'operator',
            '@builtinVariables': 'string',
            '@builtinFunctions': 'type.identifier',
            '@default': 'identifier'
          }
        }
      ],
      [/[<>=!%&+\-*/|~^]+/, 'operator'],
      // Dollar-quoted string start (如 $$ 或 $tag$)
      [/\$[\w$]*\$/, { token: 'string', next: '@dollarQuoted' }]
    ],
    whitespace: [[/\s+/, 'white']],
    comments: [
      [/--+\s.*/, 'comment'],
      [/\/\*/, { token: 'comment.quote', next: '@comment' }]
    ],
    comment: [
      [/[^*/]+/, 'comment'],
      [/\*\//, { token: 'comment.quote', next: '@pop' }],
      [/./, 'comment']
    ],
    numbers: [
      [/0[xX][0-9a-fA-F]*/, 'number'],
      [/0[oO][0-7]*/, 'number'],
      [/0[bB][01]*/, 'number'],
      [/[$][+-]*\d*(\.\d*)?/, 'number'],
      [/((\d+(\.\d*)?)|(\.\d+))([eE][\-+]?\d+)?/, 'number']
    ],
    strings: [
      // E-string (PostgreSQL 扩展字符串)
      [/E'/, { token: 'string', next: '@eString' }],
      // 普通单引号字符串
      [/'/, { token: 'string', next: '@string' }]
    ],
    string: [
      [/[^\\']+/, 'string'],
      [/@escapes/, 'string.escape'],
      [/\\./, 'string.escape.invalid'],
      [/''/, 'string'],
      [/'/, { token: 'string', next: '@pop' }]
    ],
    eString: [
      // E-string 支持反斜杠转义
      [/[^\\']+/, 'string'],
      [/\\./, 'string.escape'],
      [/''/, 'string'],
      [/'/, { token: 'string', next: '@pop' }]
    ],
    dollarQuotedStrings: [
      // Dollar-quoted strings 用于 PL/pgSQL 等情况
      // 由主 tokenizer 中的规则处理
    ],
    dollarQuoted: [
      // 匹配结束标记
      [/\$[\w$]*\$/, { token: 'string', next: '@pop' }],
      // 匹配内容（不包含 $ 符号）
      [/[^$]+/, 'string'],
      // 单个 $ 不是结束标记
      [/\$/, 'string']
    ],
    complexIdentifiers: [
      // PostgreSQL 双引号标识符
      [/"/, { token: 'identifier.quote', next: '@quotedIdentifier' }],
      // 方括号（用于数组访问）
      [/\[/, { token: 'delimiter.square', next: '@bracketedIdentifier' }]
    ],
    quotedIdentifier: [
      [/[^"]+/, 'identifier'],
      [/""/, 'identifier'],
      [/"/, { token: 'identifier.quote', next: '@pop' }]
    ],
    bracketedIdentifier: [
      [/[^\]]+/, 'identifier'],
      [/\]/, { token: 'delimiter.square', next: '@pop' }]
    ],
    scopes: [
      // BEGIN ... END 块
      [/BEGIN\b/i, { token: 'keyword.block' }],
      [/END\b/i, { token: 'keyword.block' }],
      // CASE ... END
      [/CASE\b/i, { token: 'keyword.block' }],
      // WHEN ... THEN
      [/WHEN\b/i, { token: 'keyword.choice' }],
      [/THEN\b/i, { token: 'keyword.choice' }],
      [/ELSE\b/i, { token: 'keyword.choice' }],
      // IF ... THEN ... END IF
      [/IF\b/i, { token: 'keyword.block' }],
      [/ELSIF\b/i, { token: 'keyword.block' }],
      // LOOP ... END LOOP
      [/LOOP\b/i, { token: 'keyword.block' }],
      // WHILE ... LOOP
      [/WHILE\b/i, { token: 'keyword.block' }],
      // FOR ... LOOP
      [/FOR\b/i, { token: 'keyword.block' }],
      // EXCEPTION
      [/EXCEPTION\b/i, { token: 'keyword.exception' }]
    ]
  }
};
