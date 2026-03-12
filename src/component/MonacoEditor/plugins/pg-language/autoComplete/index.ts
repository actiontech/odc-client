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
import {
  functionItem,
  keywordItem,
  schemaItem,
  snippetItem,
  tableColumnItem,
  tableItem
} from './completionItem';
import { IPGModelOptions } from '../service';
import functions from '../functions';
import { keywords } from '../keywords';
import simpleParser from '../parser/simpleParser';

class PGAutoComplete implements monaco.languages.CompletionItemProvider {
  triggerCharacters?: string[] | undefined = ['.'];
  private modelOptionsMap: Map<string, IPGModelOptions | null> =
    new Map();

  // constructor intentionally empty

  public setModelOptions(
    modelId: string,
    options: IPGModelOptions | null
  ) {
    this.modelOptionsMap.set(modelId, options);
  }

  private getModelOptions(modelId: string): IPGModelOptions | null {
    let options = this.modelOptionsMap.get(modelId);
    // 如果找不到匹配的 modelId，尝试使用第一个可用的 modelOptions
    // 这可以处理模型 ID 变化的情况
    if (!options && this.modelOptionsMap.size > 0) {
      const firstEntry = this.modelOptionsMap.values().next();
      if (firstEntry.value) {
        options = firstEntry.value;
      }
    }
    return options || null;
  }

  async getColumnList(
    model: monaco.editor.ITextModel,
    item: { tableName: string; schemaName?: string },
    range: monaco.IRange
  ): Promise<monaco.languages.CompletionItem[]> {
    const modelOptions = this.getModelOptions(model.id);
    const suggestions: monaco.languages.CompletionItem[] = [];
    const autoNext = modelOptions?.autoNext ?? true;
    const columns = await modelOptions?.getTableColumns?.(
      item.tableName,
      item.schemaName
    );
    if (columns && Array.isArray(columns) && columns.length > 0) {
      columns.forEach((column) => {
        suggestions.push(
          tableColumnItem(
            column.columnName,
            item.tableName,
            item.schemaName || '',
            range,
            autoNext
          )
        );
      });
    }
    return suggestions;
  }

  async getSchemaList(
    model: monaco.editor.ITextModel,
    range: monaco.IRange
  ): Promise<monaco.languages.CompletionItem[]> {
    const modelOptions = this.getModelOptions(model.id);
    const suggestions: monaco.languages.CompletionItem[] = [];
    const schemaList = await modelOptions?.getSchemaList?.();
    if (schemaList && Array.isArray(schemaList) && schemaList.length > 0) {
      schemaList.forEach((schema) => {
        suggestions.push(schemaItem(schema, range));
      });
    }
    return suggestions;
  }

  async getTableList(
    model: monaco.editor.ITextModel,
    schema: string | undefined,
    range: monaco.IRange
  ): Promise<monaco.languages.CompletionItem[]> {
    const modelOptions = this.getModelOptions(model.id);
    const suggestions: monaco.languages.CompletionItem[] = [];
    const tables = await modelOptions?.getTableList?.(schema || '');
    if (tables && Array.isArray(tables) && tables.length > 0) {
      tables.forEach((table) => {
        // table 现在是 { name: string, type: string } 格式
        suggestions.push(
          tableItem(table.name, schema || '', false, range, table.type)
        );
      });
    }
    return suggestions;
  }

  public provideCompletionItems(
    model: monaco.editor.ITextModel,
    position: monaco.Position,
    context: monaco.languages.CompletionContext,
    _token: monaco.CancellationToken
  ): monaco.languages.ProviderResult<monaco.languages.CompletionList> {
    const triggerCharacter = context.triggerCharacter;
    const modelOptions = this.getModelOptions(model.id);
    const delimiter = modelOptions?.delimiter || ';';
    const word = model.getWordUntilPosition(position);
    const range: monaco.IRange = {
      startLineNumber: position.lineNumber,
      endLineNumber: position.lineNumber,
      startColumn: word.startColumn,
      endColumn: word.endColumn
    };

    /**
     * 自动触发补全，需要补一个字符来让解析顺利
     * 增加一个字符并不会对补全造成正确性的问题
     * 关键字补全：会自动去除当前的token
     * 表名补全：不会访问当前的token
     */
    let value = model.getValue();
    const offset = model.getOffsetAt(position);
    if (word?.word?.trim() === '' && !triggerCharacter) {
      value = value.substring(0, offset) + 's' + value.substring(offset);
    }

    // 获取补全上下文
    const contexts = simpleParser.getCompletionContext(
      value,
      offset,
      delimiter
    );

    // 如果没有上下文，返回关键字补全
    if (!contexts || contexts.length === 0) {
      return this.getCompletionItems(
        [{ type: 'keyword' }],
        model,
        range,
        triggerCharacter
      );
    }

    return this.getCompletionItems(contexts, model, range, triggerCharacter);
  }

  private async getCompletionItems(
    contexts: Array<{
      type: string;
      schemaName?: string;
      tableName?: string;
      objectName?: string;
    }>,
    model: monaco.editor.ITextModel,
    range: monaco.IRange,
    _triggerCharacter?: string
  ): Promise<monaco.languages.CompletionList> {
    const suggestions: monaco.languages.CompletionItem[] = [];
    const modelOptions = this.getModelOptions(model.id);
    const autoNext = modelOptions?.autoNext ?? true;
    for (const context of contexts) {
      switch (context.type) {
        case 'keyword': {
          // 添加关键字
          keywords.forEach((keyword) => {
            suggestions.push(keywordItem(keyword, range, autoNext));
          });
          // 添加函数
          functions.forEach((func) => {
            suggestions.push(functionItem(func, range));
          });
          // 添加 snippets
          const snippets = await modelOptions?.getSnippets?.();
          if (snippets) {
            snippets.forEach((snippet) => {
              suggestions.push(snippetItem(snippet, range));
            });
          }
          break;
        }
        case 'allTables': {
          // 获取表列表
          // PostgreSQL 使用 schema.table 格式
          const tableSuggestions = await this.getTableList(
            model,
            context.schemaName,
            range
          );
          suggestions.push(...tableSuggestions);
          break;
        }
        case 'allSchemas': {
          // 获取 schema 列表
          const schemaSuggestions = await this.getSchemaList(model, range);
          suggestions.push(...schemaSuggestions);
          break;
        }
        case 'column': {
          // 获取列列表
          const tableName = context.tableName;
          const schemaName = context.schemaName;
          if (tableName) {
            const columnSuggestions = await this.getColumnList(
              model,
              { tableName, schemaName },
              range
            );
            suggestions.push(...columnSuggestions);
          }
          break;
        }
        case 'objectAccess': {
          // 对象访问，可能是 schema.table 或 table.column
          // PostgreSQL 使用 schema.table 格式
          const objectName = context.objectName;
          if (objectName) {
            const schemaList = await modelOptions?.getSchemaList?.();

            // 检查是否是 schema
            const isSchema = schemaList?.includes(objectName);

            if (isSchema) {
              // 是 schema，获取该 schema 下的表列表
              const tableSuggestions = await this.getTableList(
                model,
                objectName,
                range
              );
              suggestions.push(...tableSuggestions);
            } else {
              // 可能是 table，尝试获取字段
              const columnSuggestions = await this.getColumnList(
                model,
                { tableName: objectName },
                range
              );
              if (columnSuggestions && columnSuggestions.length > 0) {
                suggestions.push(...columnSuggestions);
              } else {
                // 如果没有字段，返回该表的 schema 名作为备选
                const tableSuggestions = await this.getTableList(
                  model,
                  objectName,
                  range
                );
                suggestions.push(...tableSuggestions);
              }
            }
          }
          break;
        }
        case 'allFunctions': {
          // 添加函数
          const udf = await modelOptions?.getFunctions?.();
          const allFunctions = (udf || []).concat(functions);
          allFunctions.forEach((func) => {
            suggestions.push(functionItem(func, range));
          });
          break;
        }
      }
    }

    return {
      suggestions,
      incomplete: false
    };
  }
}

export default PGAutoComplete;
