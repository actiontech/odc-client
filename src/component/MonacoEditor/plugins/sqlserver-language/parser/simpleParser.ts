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

export interface CompletionContext {
  type:
    | 'keyword'
    | 'table'
    | 'column'
    | 'schema'
    | 'function'
    | 'objectAccess'
    | 'allTables'
    | 'allSchemas'
    | 'allFunctions';
  schemaName?: string;
  tableName?: string;
  objectName?: string;
}

/**
 * 简化的 SQL 解析器，用于判断代码补全的上下文
 * 由于没有 SQL Server 的专用 parser，使用基于规则的简单解析
 */
export class SimpleSQLParser {
  /**
   * 获取代码补全的上下文
   * @param sql SQL 文本
   * @param offset 光标位置
   * @param delimiter SQL 分隔符
   */
  getCompletionContext(
    sql: string,
    offset: number,
    delimiter: string = ';'
  ): CompletionContext[] {
    const contexts: CompletionContext[] = [];

    // 获取当前语句
    const currentStatement = this.getCurrentStatement(sql, offset, delimiter);
    if (!currentStatement) {
      return [{ type: 'keyword' }];
    }

    const textBeforeCursor = currentStatement.text.substring(
      0,
      currentStatement.offset
    );

    // 检查是否在对象访问符（.）之后
    const dotMatch = textBeforeCursor.match(/([\w\[\]"]+)\s*\.\s*$/);
    if (dotMatch) {
      const objectName = this.unquoteIdentifier(dotMatch[1]);
      // 检查是否是 schema.table 格式
      const parts = objectName.split('.');
      if (parts.length === 2) {
        return [
          {
            type: 'column',
            schemaName: parts[0],
            tableName: parts[1]
          }
        ];
      } else {
        return [
          {
            type: 'objectAccess',
            objectName: objectName
          }
        ];
      }
    }

    // 检查是否在 FROM 子句中
    // 匹配 FROM 关键字后可能跟着表名、别名等
    const fromMatch = textBeforeCursor.match(/\bFROM\s+([\w\[\]".\s,]*)$/i);
    if (fromMatch) {
      contexts.push({ type: 'allTables' });
      contexts.push({ type: 'allSchemas' });
      return contexts;
    }

    // 检查是否在 JOIN 子句中
    const joinMatch = textBeforeCursor.match(
      /\b(INNER|LEFT|RIGHT|FULL|CROSS)?\s*JOIN\s+([\w\[\]".\s,]*)$/i
    );
    if (joinMatch) {
      contexts.push({ type: 'allTables' });
      contexts.push({ type: 'allSchemas' });
      return contexts;
    }

    // 检查是否在 SELECT 列表中
    const selectMatch = textBeforeCursor.match(/\bSELECT\s+([\w\[\]".\s,]*)$/i);
    if (selectMatch) {
      contexts.push({ type: 'allFunctions' });
      // 如果前面有 FROM，可以提示表和列
      const fromIndex = currentStatement.text
        .toUpperCase()
        .lastIndexOf('FROM', currentStatement.offset);
      if (fromIndex > 0) {
        contexts.push({ type: 'allTables' });
        // 尝试提取表名
        const fromClause = currentStatement.text.substring(
          fromIndex + 4,
          currentStatement.offset
        );
        const tableMatch = fromClause.match(
          /([\w\[\]"]+)(?:\s+AS\s+([\w\[\]"]+))?/i
        );
        if (tableMatch) {
          const tableName = this.unquoteIdentifier(tableMatch[1]);
          contexts.push({
            type: 'column',
            tableName: tableName
          });
        }
      }
      return contexts;
    }

    // 检查是否在 WHERE 子句中
    const whereMatch = textBeforeCursor.match(/\bWHERE\s+([\w\[\]".\s,]*)$/i);
    if (whereMatch) {
      contexts.push({ type: 'allFunctions' });
      // 尝试从 FROM 子句提取表名
      const fromIndex = currentStatement.text.toUpperCase().indexOf('FROM');
      if (fromIndex > 0) {
        const fromClause = currentStatement.text.substring(fromIndex + 4);
        const whereIndex = fromClause.toUpperCase().indexOf('WHERE');
        const fromPart =
          whereIndex > 0 ? fromClause.substring(0, whereIndex) : fromClause;
        const tableMatch = fromPart.match(
          /([\w\[\]"]+)(?:\s+AS\s+([\w\[\]"]+))?/i
        );
        if (tableMatch) {
          const tableName = this.unquoteIdentifier(tableMatch[1]);
          contexts.push({
            type: 'column',
            tableName: tableName
          });
        }
      }
      return contexts;
    }

    // 检查是否在 INSERT INTO 中
    const insertMatch = textBeforeCursor.match(
      /\bINSERT\s+INTO\s+([\w\[\]".\s,]*)$/i
    );
    if (insertMatch) {
      contexts.push({ type: 'allTables' });
      contexts.push({ type: 'allSchemas' });
      return contexts;
    }

    // 检查是否在 UPDATE 中
    const updateMatch = textBeforeCursor.match(/\bUPDATE\s+([\w\[\]".\s,]*)$/i);
    if (updateMatch) {
      contexts.push({ type: 'allTables' });
      contexts.push({ type: 'allSchemas' });
      return contexts;
    }

    // 检查是否在 DELETE FROM 中
    const deleteMatch = textBeforeCursor.match(
      /\bDELETE\s+FROM\s+([\w\[\]".\s,]*)$/i
    );
    if (deleteMatch) {
      contexts.push({ type: 'allTables' });
      contexts.push({ type: 'allSchemas' });
      return contexts;
    }

    // 如果没有任何匹配，检查是否在语句开始位置
    // 如果光标前只有空白或注释，返回关键字和表名
    const trimmedBefore = textBeforeCursor.trim();
    if (
      trimmedBefore === '' ||
      /^--/.test(trimmedBefore) ||
      /^\/\*/.test(trimmedBefore)
    ) {
      contexts.push({ type: 'keyword' });
      contexts.push({ type: 'allTables' });
      contexts.push({ type: 'allSchemas' });
      return contexts;
    }

    // 默认返回关键字
    return [{ type: 'keyword' }];
  }

  /**
   * 获取当前语句
   */
  private getCurrentStatement(sql: string, offset: number, delimiter: string) {
    // 按分隔符分割 SQL
    const statements: Array<{ start: number; end: number; text: string }> = [];
    let start = 0;
    let inString = false;
    let stringChar = '';
    let inComment = false;
    let commentType: 'line' | 'block' | null = null;

    for (let i = 0; i < sql.length; i++) {
      const char = sql[i];
      const nextChar = sql[i + 1];

      // 处理字符串
      if (!inComment && (char === "'" || char === '"')) {
        if (!inString) {
          inString = true;
          stringChar = char;
        } else if (char === stringChar) {
          // 检查是否是转义的引号
          if (char === "'" && nextChar === "'") {
            i++; // 跳过转义的引号
            continue;
          }
          inString = false;
          stringChar = '';
        }
        continue;
      }

      if (inString) {
        continue;
      }

      // 处理注释
      if (char === '-' && nextChar === '-') {
        inComment = true;
        commentType = 'line';
        i++;
        continue;
      }

      if (char === '/' && nextChar === '*') {
        inComment = true;
        commentType = 'block';
        i++;
        continue;
      }

      if (
        inComment &&
        commentType === 'block' &&
        char === '*' &&
        nextChar === '/'
      ) {
        inComment = false;
        commentType = null;
        i++;
        continue;
      }

      if (inComment && commentType === 'line' && char === '\n') {
        inComment = false;
        commentType = null;
        continue;
      }

      if (inComment) {
        continue;
      }

      // 检查分隔符
      if (delimiter.length === 1 && char === delimiter) {
        statements.push({
          start,
          end: i,
          text: sql.substring(start, i).trim()
        });
        start = i + 1;
      } else if (
        delimiter.length > 1 &&
        sql.substring(i, i + delimiter.length) === delimiter
      ) {
        statements.push({
          start,
          end: i,
          text: sql.substring(start, i).trim()
        });
        start = i + delimiter.length;
        i += delimiter.length - 1;
      }
    }

    // 添加最后一个语句
    if (start < sql.length) {
      statements.push({
        start,
        end: sql.length,
        text: sql.substring(start).trim()
      });
    }

    // 找到包含 offset 的语句
    for (const stmt of statements) {
      if (offset >= stmt.start && offset <= stmt.end) {
        return {
          text: stmt.text,
          offset: offset - stmt.start
        };
      }
    }

    // 如果没找到，返回最后一个语句
    if (statements.length > 0) {
      const lastStmt = statements[statements.length - 1];
      return {
        text: lastStmt.text,
        offset: Math.min(offset - lastStmt.start, lastStmt.text.length)
      };
    }

    return null;
  }

  /**
   * 去除标识符的引号
   */
  private unquoteIdentifier(identifier: string): string {
    if (!identifier) {
      return '';
    }
    // 去除方括号 [identifier]
    if (identifier.startsWith('[') && identifier.endsWith(']')) {
      return identifier.slice(1, -1);
    }
    // 去除双引号 "identifier"
    if (identifier.startsWith('"') && identifier.endsWith('"')) {
      return identifier.slice(1, -1);
    }
    return identifier;
  }

  /**
   * 获取表名和 schema 名（用于悬停提示）
   */
  getTableAtOffset(
    sql: string,
    offset: number,
    delimiter: string = ';'
  ): { name: string; schema?: string } | null {
    const currentStatement = this.getCurrentStatement(sql, offset, delimiter);
    if (!currentStatement) {
      return null;
    }

    const textBeforeCursor = currentStatement.text.substring(
      0,
      currentStatement.offset
    );

    // 尝试从 FROM 子句提取表名
    const fromMatch = textBeforeCursor.match(/\bFROM\s+([\w\[\]".]+)/i);
    if (fromMatch) {
      const tableRef = this.unquoteIdentifier(fromMatch[1]);
      const parts = tableRef.split('.');
      if (parts.length === 2) {
        return {
          schema: parts[0],
          name: parts[1]
        };
      }
      return {
        name: tableRef
      };
    }

    // 尝试从 UPDATE 提取表名
    const updateMatch = textBeforeCursor.match(/\bUPDATE\s+([\w\[\]".]+)/i);
    if (updateMatch) {
      const tableRef = this.unquoteIdentifier(updateMatch[1]);
      const parts = tableRef.split('.');
      if (parts.length === 2) {
        return {
          schema: parts[0],
          name: parts[1]
        };
      }
      return {
        name: tableRef
      };
    }

    // 尝试从 INSERT INTO 提取表名
    const insertMatch = textBeforeCursor.match(
      /\bINSERT\s+INTO\s+([\w\[\]".]+)/i
    );
    if (insertMatch) {
      const tableRef = this.unquoteIdentifier(insertMatch[1]);
      const parts = tableRef.split('.');
      if (parts.length === 2) {
        return {
          schema: parts[0],
          name: parts[1]
        };
      }
      return {
        name: tableRef
      };
    }

    return null;
  }
}

const simpleParser = new SimpleSQLParser();
export default simpleParser;
