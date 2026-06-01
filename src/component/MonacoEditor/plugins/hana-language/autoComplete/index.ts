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
import { IHanaModelOptions } from '../service';
import functions from '../functions';
import { keywords } from '../keywords';
import simpleParser from '../parser/simpleParser';

class HanaAutoComplete implements monaco.languages.CompletionItemProvider {
  triggerCharacters?: string[] | undefined = ['.'];
  private modelOptionsMap: Map<string, IHanaModelOptions | null> = new Map();

  public setModelOptions(modelId: string, options: IHanaModelOptions | null) {
    this.modelOptionsMap.set(modelId, options);
  }

  private getModelOptions(modelId: string): IHanaModelOptions | null {
    let options = this.modelOptionsMap.get(modelId);
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

    let value = model.getValue();
    const offset = model.getOffsetAt(position);
    if (word?.word?.trim() === '' && !triggerCharacter) {
      value = value.substring(0, offset) + 's' + value.substring(offset);
    }

    const contexts = simpleParser.getCompletionContext(
      value,
      offset,
      delimiter
    );

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
          keywords.forEach((keyword) => {
            suggestions.push(keywordItem(keyword, range, autoNext));
          });
          functions.forEach((func) => {
            suggestions.push(functionItem(func, range));
          });
          const snippets = await modelOptions?.getSnippets?.();
          if (snippets) {
            snippets.forEach((snippet) => {
              suggestions.push(snippetItem(snippet, range));
            });
          }
          break;
        }
        case 'allTables': {
          const tableSuggestions = await this.getTableList(
            model,
            context.schemaName,
            range
          );
          suggestions.push(...tableSuggestions);
          break;
        }
        case 'allSchemas': {
          const schemaSuggestions = await this.getSchemaList(model, range);
          suggestions.push(...schemaSuggestions);
          break;
        }
        case 'column': {
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
          // HANA uses two-level naming: schema.object
          const objectName = context.objectName;
          if (objectName) {
            const schemaList = await modelOptions?.getSchemaList?.();
            const isSchema = schemaList?.find((s) => s === objectName);

            if (isSchema) {
              // It is a schema, suggest tables under it
              const tableSuggestions = await this.getTableList(
                model,
                objectName,
                range
              );
              suggestions.push(...tableSuggestions);
            } else {
              // It might be a table, suggest columns
              const columnSuggestions = await this.getColumnList(
                model,
                { tableName: objectName },
                range
              );
              if (columnSuggestions && columnSuggestions.length > 0) {
                suggestions.push(...columnSuggestions);
              }
            }
          }
          break;
        }
        case 'allFunctions': {
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

export default HanaAutoComplete;
