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
 * Simple SQL parser for HANA code completion context detection.
 * HANA uses two-level naming: schema.object (not three-level like SQL Server).
 * HANA uses double-quoted identifiers (not square brackets).
 */
export class SimpleHanaSQLParser {
  getCompletionContext(
    sql: string,
    offset: number,
    delimiter: string = ';'
  ): CompletionContext[] {
    const contexts: CompletionContext[] = [];

    const currentStatement = this.getCurrentStatement(sql, offset, delimiter);
    if (!currentStatement) {
      return [{ type: 'keyword' }];
    }

    const textBeforeCursor = currentStatement.text.substring(
      0,
      currentStatement.offset
    );

    // Check if after a dot (object access) - HANA uses two-level: schema.object
    const dotMatch = textBeforeCursor.match(
      /((?:[\w"]+\s*\.\s*)*[\w"]+)\s*\.\s*$/
    );
    if (dotMatch) {
      const objectName = dotMatch[1];
      const parts = objectName
        .split('.')
        .map((part) => this.unquoteIdentifier(part.trim()));

      if (parts.length >= 2) {
        // schema.table. -> suggest columns
        return [
          {
            type: 'column',
            schemaName: parts[0],
            tableName: parts[1]
          }
        ];
      } else {
        // schema. or table. -> need to determine
        return [
          {
            type: 'objectAccess',
            objectName: parts[0]
          }
        ];
      }
    }

    // FROM clause
    const fromMatch = textBeforeCursor.match(/\bFROM\s+([\w".\s,]*)$/i);
    if (fromMatch) {
      contexts.push({ type: 'allTables' });
      contexts.push({ type: 'allSchemas' });
      return contexts;
    }

    // JOIN clause
    const joinMatch = textBeforeCursor.match(
      /\b(INNER|LEFT|RIGHT|FULL|CROSS)?\s*JOIN\s+([\w".\s,]*)$/i
    );
    if (joinMatch) {
      contexts.push({ type: 'allTables' });
      contexts.push({ type: 'allSchemas' });
      return contexts;
    }

    // SELECT list
    const selectMatch = textBeforeCursor.match(/\bSELECT\s+([\w".\s,]*)$/i);
    if (selectMatch) {
      contexts.push({ type: 'allFunctions' });
      const fromIndex = currentStatement.text
        .toUpperCase()
        .lastIndexOf('FROM', currentStatement.offset);
      if (fromIndex > 0) {
        contexts.push({ type: 'allTables' });
        const fromClause = currentStatement.text.substring(
          fromIndex + 4,
          currentStatement.offset
        );
        const tableMatch = fromClause.match(/([\w"]+)(?:\s+AS\s+([\w"]+))?/i);
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

    // WHERE clause
    const whereMatch = textBeforeCursor.match(/\bWHERE\s+([\w".\s,]*)$/i);
    if (whereMatch) {
      contexts.push({ type: 'allFunctions' });
      const fromIndex = currentStatement.text.toUpperCase().indexOf('FROM');
      if (fromIndex > 0) {
        const fromClause = currentStatement.text.substring(fromIndex + 4);
        const whereIndex = fromClause.toUpperCase().indexOf('WHERE');
        const fromPart =
          whereIndex > 0 ? fromClause.substring(0, whereIndex) : fromClause;
        const tableMatch = fromPart.match(/([\w"]+)(?:\s+AS\s+([\w"]+))?/i);
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

    // INSERT INTO
    const insertMatch = textBeforeCursor.match(
      /\bINSERT\s+INTO\s+([\w".\s,]*)$/i
    );
    if (insertMatch) {
      contexts.push({ type: 'allTables' });
      contexts.push({ type: 'allSchemas' });
      return contexts;
    }

    // UPDATE
    const updateMatch = textBeforeCursor.match(/\bUPDATE\s+([\w".\s,]*)$/i);
    if (updateMatch) {
      contexts.push({ type: 'allTables' });
      contexts.push({ type: 'allSchemas' });
      return contexts;
    }

    // UPSERT (HANA-specific)
    const upsertMatch = textBeforeCursor.match(/\bUPSERT\s+([\w".\s,]*)$/i);
    if (upsertMatch) {
      contexts.push({ type: 'allTables' });
      contexts.push({ type: 'allSchemas' });
      return contexts;
    }

    // DELETE FROM
    const deleteMatch = textBeforeCursor.match(
      /\bDELETE\s+FROM\s+([\w".\s,]*)$/i
    );
    if (deleteMatch) {
      contexts.push({ type: 'allTables' });
      contexts.push({ type: 'allSchemas' });
      return contexts;
    }

    // CALL (HANA stored procedures)
    const callMatch = textBeforeCursor.match(/\bCALL\s+([\w".\s,]*)$/i);
    if (callMatch) {
      contexts.push({ type: 'allFunctions' });
      contexts.push({ type: 'allSchemas' });
      return contexts;
    }

    // Start of statement
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

    return [{ type: 'keyword' }];
  }

  private getCurrentStatement(sql: string, offset: number, delimiter: string) {
    const statements: Array<{ start: number; end: number; text: string }> = [];
    let start = 0;
    let inString = false;
    let stringChar = '';
    let inComment = false;
    let commentType: 'line' | 'block' | null = null;

    for (let i = 0; i < sql.length; i++) {
      const char = sql[i];
      const nextChar = sql[i + 1];

      if (!inComment && (char === "'" || char === '"')) {
        if (!inString) {
          inString = true;
          stringChar = char;
        } else if (char === stringChar) {
          if (char === "'" && nextChar === "'") {
            i++;
            continue;
          }
          if (char === '"' && nextChar === '"') {
            i++;
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

    if (start < sql.length) {
      statements.push({
        start,
        end: sql.length,
        text: sql.substring(start).trim()
      });
    }

    for (const stmt of statements) {
      if (offset >= stmt.start && offset <= stmt.end) {
        return {
          text: stmt.text,
          offset: offset - stmt.start
        };
      }
    }

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
   * Unquote HANA identifiers (double-quoted)
   */
  private unquoteIdentifier(identifier: string): string {
    if (!identifier) {
      return '';
    }
    if (identifier.startsWith('"') && identifier.endsWith('"')) {
      return identifier.slice(1, -1);
    }
    return identifier;
  }

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

    const fromMatch = textBeforeCursor.match(/\bFROM\s+([\w".]+)/i);
    if (fromMatch) {
      const tableRef = this.unquoteIdentifier(fromMatch[1]);
      const parts = tableRef.split('.');
      if (parts.length === 2) {
        return {
          schema: parts[0],
          name: parts[1]
        };
      }
      return { name: tableRef };
    }

    const updateMatch = textBeforeCursor.match(/\bUPDATE\s+([\w".]+)/i);
    if (updateMatch) {
      const tableRef = this.unquoteIdentifier(updateMatch[1]);
      const parts = tableRef.split('.');
      if (parts.length === 2) {
        return { schema: parts[0], name: parts[1] };
      }
      return { name: tableRef };
    }

    const insertMatch = textBeforeCursor.match(/\bINSERT\s+INTO\s+([\w".]+)/i);
    if (insertMatch) {
      const tableRef = this.unquoteIdentifier(insertMatch[1]);
      const parts = tableRef.split('.');
      if (parts.length === 2) {
        return { schema: parts[0], name: parts[1] };
      }
      return { name: tableRef };
    }

    return null;
  }
}

const simpleParser = new SimpleHanaSQLParser();
export default simpleParser;
