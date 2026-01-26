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

export interface ISnippet {
  label: string;
  documentation: string;
  insertText: string;
}

export enum CompletionItemSort {
  Star = '37',
  Keyword = '50',
  Table = '39',
  Column = '38',
  Function = '51',
  Schema = '40',
  Snippet = '52'
}

export function keywordItem(
  keyword: string,
  range: monaco.languages.CompletionItemRanges | monaco.IRange,
  autoNext: boolean
): monaco.languages.CompletionItem {
  return {
    label: keyword,
    range,
    insertText: keyword + ' ',
    kind: monaco.languages.CompletionItemKind.Keyword,
    command: autoNext
      ? { id: 'editor.action.triggerSuggest', title: '' }
      : undefined,
    sortText:
      keyword === '*' ? CompletionItemSort.Star : CompletionItemSort.Keyword
  };
}

export function tableItem(
  tableName: string,
  schemaName: string = '',
  insertSchema: boolean = false,
  range: monaco.languages.CompletionItemRanges | monaco.IRange,
  type: string = 'TABLE'
): monaco.languages.CompletionItem {
  const name = !insertSchema
    ? tableName
    : [schemaName, tableName].filter(Boolean).join('.');

  // 根据类型显示不同的描述
  let description = 'Table';
  if (type === 'VIEW') {
    description = 'View';
  } else if (type === 'EXTERNAL_TABLE') {
    description = 'External Table';
  } else if (type === 'MATERIALIZED_VIEW') {
    description = 'Materialized View';
  }

  return {
    label: { label: name, description, detail: ' ' + schemaName },
    range,
    insertText: name,
    kind: monaco.languages.CompletionItemKind.Class,
    sortText: CompletionItemSort.Table
  };
}

export function tableColumnItem(
  columnName: string,
  tableName: string,
  schemaName: string = '',
  range: monaco.languages.CompletionItemRanges | monaco.IRange,
  autoNext: boolean = true
): monaco.languages.CompletionItem {
  const tableFullName = [schemaName, tableName].filter(Boolean).join('.');
  return {
    label: {
      label: columnName,
      description: 'Column',
      detail: ' ' + tableFullName
    },
    range,
    insertText: columnName + ' ',
    kind: monaco.languages.CompletionItemKind.Field,
    command: autoNext
      ? { id: 'editor.action.triggerSuggest', title: '' }
      : undefined,
    sortText: CompletionItemSort.Column
  };
}

export function functionItem(
  func: IFunction,
  range: monaco.languages.CompletionItemRanges | monaco.IRange
): monaco.languages.CompletionItem {
  if (func.body) {
    return {
      label: {
        label: func.name,
        description: 'Function',
        detail: ' ' + func.desc
      },
      kind: monaco.languages.CompletionItemKind.Function,
      documentation: func.desc,
      insertText: func.body,
      insertTextRules:
        monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range,
      sortText: CompletionItemSort.Function
    };
  }

  const params =
    func.params
      ?.map(
        (param, index) =>
          `${'$'}{${index + 1}:${
            typeof param === 'string' ? param : param.name
          }}`
      )
      .join(', ') || '';
  const paramsDocument =
    func.params
      ?.map((param) => `${typeof param === 'string' ? param : param.name}`)
      .join(', ') || '';

  return {
    label: {
      label: func.name,
      description: 'Function',
      detail: ' ' + func.desc
    },
    kind: monaco.languages.CompletionItemKind.Function,
    documentation: `${func.name}(${paramsDocument})`,
    insertText: `${func.name}(${params}) `,
    insertTextRules:
      monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    range,
    sortText: CompletionItemSort.Function
  };
}

export function snippetItem(
  s: ISnippet,
  range: monaco.languages.CompletionItemRanges | monaco.IRange
): monaco.languages.CompletionItem {
  return {
    label: s.label,
    kind: monaco.languages.CompletionItemKind.Snippet,
    documentation: s.documentation,
    insertText: s.insertText,
    insertTextRules:
      monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    range,
    sortText: CompletionItemSort.Snippet
  };
}

export function schemaItem(
  schemaName: string,
  range: monaco.languages.CompletionItemRanges | monaco.IRange
): monaco.languages.CompletionItem {
  return {
    label: schemaName,
    kind: monaco.languages.CompletionItemKind.Module,
    detail: 'Schema',
    insertText: schemaName,
    range,
    sortText: CompletionItemSort.Schema
  };
}
