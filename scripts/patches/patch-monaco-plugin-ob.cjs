const fs = require('fs');
const path = require('path');

const packageRoot =
  process.env.MONACO_PLUGIN_OB_ROOT ||
  path.join(
    __dirname,
    '..',
    '..',
    'node_modules',
    '@oceanbase-odc',
    'monaco-plugin-ob'
  );

function read(file) {
  return fs.readFileSync(path.join(packageRoot, file), 'utf8');
}

function write(file, content) {
  fs.writeFileSync(path.join(packageRoot, file), content);
}

const joinAliasColumnCompletion = `function getJoinAliasColumnCompletion(text, offset, objectName) {
    if (!objectName) {
        return null;
    }
    function maskSqlNonCodeForAliasScan(input) {
        let out = '';
        let index = 0;
        while (index < input.length) {
            const ch = input[index];
            if (ch === "'" || ch === '"') {
                const quote = ch;
                out += ' ';
                index += 1;
                while (index < input.length) {
                    out += ' ';
                    if (input[index] === '\\\\') {
                        out += ' ';
                        index += 2;
                        continue;
                    }
                    if (input[index] === quote) {
                        index += 1;
                        break;
                    }
                    index += 1;
                }
                continue;
            }
            if (ch === '-' && input[index + 1] === '-') {
                while (index < input.length && input[index] !== String.fromCharCode(10)) {
                    out += ' ';
                    index += 1;
                }
                continue;
            }
            if (ch === '/' && input[index + 1] === '*') {
                out += '  ';
                index += 2;
                while (index < input.length && !(input[index] === '*' && input[index + 1] === '/')) {
                    out += ' ';
                    index += 1;
                }
                if (index < input.length) {
                    out += '  ';
                    index += 2;
                }
                continue;
            }
            out += ch;
            index += 1;
        }
        return out;
    }
    // Scan the whole statement (not only the current physical line) so SELECT-list
    // completion still sees a later FROM. Strings/comments are masked to avoid false FROM hits.
    const scan = maskSqlNonCodeForAliasScan(text).replaceAll('\`', '');
    const reserved = new Set(['AS', 'LEFT', 'RIGHT', 'INNER', 'FULL', 'CROSS', 'JOIN', 'WHERE', 'ON', 'ORDER', 'GROUP', 'LIMIT', 'UNION', 'SELECT', 'BY', 'HAVING', 'SET']);
    // UPDATE target alias has no FROM; DELETE still hits FROM. Keep JOIN for ON/FROM paths.
    const fromJoinRe = /(?:^|[^A-Za-z0-9_\`$])((?:FROM|JOIN|UPDATE))\\s+/gi;
    let match;
    let found = null;
    while ((match = fromJoinRe.exec(scan)) !== null) {
        let cursor = match.index + match[0].length;
        while (cursor < scan.length && /\\s/.test(scan[cursor])) {
            cursor += 1;
        }
        if (scan[cursor] === '(') {
            let depth = 0;
            const subqueryStart = cursor;
            for (; cursor < scan.length; cursor += 1) {
                if (scan[cursor] === '(') {
                    depth += 1;
                }
                else if (scan[cursor] === ')') {
                    depth -= 1;
                    if (depth === 0) {
                        cursor += 1;
                        break;
                    }
                }
            }
            while (cursor < scan.length && /\\s/.test(scan[cursor])) {
                cursor += 1;
            }
            if (/^as\\b/i.test(scan.slice(cursor))) {
                cursor += 2;
                while (cursor < scan.length && /\\s/.test(scan[cursor])) {
                    cursor += 1;
                }
            }
            let alias = '';
            while (cursor < scan.length && /[A-Za-z0-9_$]/.test(scan[cursor])) {
                alias += scan[cursor];
                cursor += 1;
            }
            if (alias && alias === objectName && !reserved.has(alias.toUpperCase())) {
                const inner = scan.slice(subqueryStart, cursor);
                const innerFromMatches = Array.from(inner.matchAll(/\\bFROM\\s+([A-Za-z0-9_$]+(?:\\.[A-Za-z0-9_$]+)?)/gi));
                const lastInner = innerFromMatches[innerFromMatches.length - 1];
                if (lastInner) {
                    const parts = lastInner[1].split('.');
                    const tableName = parts.length > 1 ? parts[1] : parts[0];
                    const schemaName = parts.length > 1 ? parts[0] : undefined;
                    found = { type: 'tableColumns', tableName, schemaName };
                }
            }
            continue;
        }
        const rest = scan.slice(cursor);
        const tableMatch = rest.match(/^([A-Za-z0-9_$]+(?:\\.[A-Za-z0-9_$]+)?)(?:\\s+(?:AS\\s+)?([A-Za-z0-9_$]+))?/i);
        if (!tableMatch) {
            continue;
        }
        const tableRef = tableMatch[1];
        const alias = tableMatch[2];
        const parts = tableRef.split('.');
        const tableName = parts.length > 1 ? parts[1] : parts[0];
        const schemaName = parts.length > 1 ? parts[0] : undefined;
        const names = [tableName, [schemaName, tableName].filter(Boolean).join('.')];
        if (alias && !reserved.has(alias.toUpperCase())) {
            names.push(alias);
        }
        if (names.includes(objectName)) {
            found = { type: 'tableColumns', tableName, schemaName };
        }
    }
    return found;
}
`;

const normalizeComparisonOperatorsForParse = `function normalizeComparisonOperatorsForParse(statement) {
    const text = statement && statement.text;
    const tokens = statement && statement.tokens;
    if (!text || !tokens) {
        return text;
    }
    const base = statement.start || 0;
    const defaultTokens = tokens.filter(token => token.channel === 0 && token.type !== -1);
    const replacements = [];
    for (let index = 0; index < defaultTokens.length; index += 1) {
        const token = defaultTokens[index];
        const rel = token.start - base;
        const next = defaultTokens[index + 1];
        const next2 = defaultTokens[index + 2];
        if (token.text === '<' && next && next.text === '=' && next2 && next2.text === '>' && next.start === token.stop + 1 && next2.start === next.stop + 1) {
            replacements.push({ rel, from: '<=>', to: '!= ' });
            index += 2;
            continue;
        }
        if (token.text === '>' && next && next.text === '=' && next.start === token.stop + 1) {
            replacements.push({ rel, from: '>=', to: '!=' });
            index += 1;
            continue;
        }
        if (token.text === '<' && next && next.text === '=' && next.start === token.stop + 1) {
            replacements.push({ rel, from: '<=', to: '!=' });
            index += 1;
            continue;
        }
        if (token.text === '<>') {
            replacements.push({ rel, from: '<>', to: '!=' });
            continue;
        }
        if (token.text === '>' || token.text === '<') {
            replacements.push({ rel, from: token.text, to: '=' });
        }
    }
    if (!replacements.length) {
        return text;
    }
    let out = text;
    replacements.sort((left, right) => right.rel - left.rel).forEach(item => {
        out = out.slice(0, item.rel) + item.to + out.slice(item.rel + item.from.length);
    });
    return out;
}
`;

function replaceFunction(content, functionName, replacement) {
  const start = content.indexOf(`function ${functionName}(`);
  if (start === -1) {
    return content;
  }
  let depth = 0;
  let end = -1;
  for (let index = content.indexOf('{', start); index < content.length; index += 1) {
    if (content[index] === '{') {
      depth += 1;
    } else if (content[index] === '}') {
      depth -= 1;
      if (depth === 0) {
        end = index + 1;
        break;
      }
    }
  }
  if (end === -1) {
    throw new Error(`Cannot replace ${functionName}`);
  }
  return content.slice(0, start) + replacement.trimEnd() + content.slice(end);
}

function replaceOnce(content, search, replacement, file) {
  if (!content.includes(search)) {
    if (content.includes(replacement)) {
      return content;
    }
    throw new Error(`Cannot find patch target in ${file}: ${search.slice(0, 120)}`);
  }
  return content.replace(search, replacement);
}

function patchTextFile(file) {
  let content = read(file);

  if (file.endsWith('model/query.js')) {
    content = replaceOnce(
      content,
      'fromMaxIndex = Math.max(stop, fromMinIndex);',
      'fromMaxIndex = Math.max(stop, fromMaxIndex);',
      file
    );
  }

  if (file.includes('model/dialect')) {
    if (file.includes('model/dialect/obmysql') && !content.includes('function flatten_table_references(table)')) {
      content = replaceOnce(
        content,
        `function resolve_from_list(node) {\n    const tableReferences = node.children[0];\n    return resolve_table_references(tableReferences);\n}\n`,
        `function flatten_table_references(table) {\n    if (!table) {\n        return [];\n    }\n    const join = table.join;\n    const tables = [table];\n    if (join) {\n        tables.push(...flatten_table_references(join));\n    }\n    return tables;\n}\nfunction resolve_from_list(node) {\n    const tableReferences = node.children[0];\n    return resolve_table_references(tableReferences);\n}\n`,
        file
      );
      content = replaceOnce(
        content,
        `    if (subTableReferences) {\n        return resolve_table_references(subTableReferences).concat(table);\n    }\n    return [table];\n}\n`,
        `    const tables = flatten_table_references(table);\n    if (subTableReferences) {\n        return resolve_table_references(subTableReferences).concat(tables);\n    }\n    return tables;\n}\n`,
        file
      );
    }
    if (file.includes('model/dialect/mysql') && !content.includes('function flatten_table_sources(table)')) {
      content = replaceOnce(
        content,
        `function resolve_tableSources(node) {
    var _a, _b;
    const tableSource = getChildByType(node.children, "tableSource");
`,
        `function flatten_table_sources(table) {
    if (!table) {
        return [];
    }
    const tables = [table];
    if (table.join) {
        tables.push(...flatten_table_sources(table.join));
    }
    if (table.joins) {
        table.joins.forEach(join => {
            tables.push(...flatten_table_sources(join));
        });
    }
    return tables;
}
function resolve_tableSources(node) {
    var _a, _b;
    const tableSource = getChildByType(node.children, "tableSource");
`,
        file
      );
      content = replaceOnce(
        content,
        `    let leftFrom = resolve_tableSourceItem(tableSourceItem);
    leftFrom.join = join;
    if (tableSources) {
        return [leftFrom].concat(resolve_tableSources(tableSources));
    }
    return [leftFrom];
}
`,
        `    let leftFrom = resolve_tableSourceItem(tableSourceItem);
    leftFrom.join = join;
    const fromTables = flatten_table_sources(leftFrom);
    if (tableSources) {
        return fromTables.concat(resolve_tableSources(tableSources));
    }
    return fromTables;
}
`,
        file
      );
    }
  }


  if (file.includes('/autoComplete/index.js')) {
    content = replaceOnce(
      content,
      '    getSchemaList(model, range) {',
      '    getSchemaList(model, range, namePrefix) {',
      file
    );
    content = replaceOnce(
      content,
      '            const schemaList = yield ((_a = modelOptions === null || modelOptions === void 0 ? void 0 : modelOptions.getSchemaList) === null || _a === void 0 ? void 0 : _a.call(modelOptions));',
      '            const schemaList = yield ((_a = modelOptions === null || modelOptions === void 0 ? void 0 : modelOptions.getSchemaList) === null || _a === void 0 ? void 0 : _a.call(modelOptions, namePrefix));',
      file
    );
    content = replaceOnce(
      content,
      '    getTableList(model, schema, range) {',
      '    getTableList(model, schema, range, namePrefix) {',
      file
    );
    content = replaceOnce(
      content,
      '            const tables = yield ((_a = modelOptions === null || modelOptions === void 0 ? void 0 : modelOptions.getTableList) === null || _a === void 0 ? void 0 : _a.call(modelOptions, schema));',
      '            const tables = yield ((_a = modelOptions === null || modelOptions === void 0 ? void 0 : modelOptions.getTableList) === null || _a === void 0 ? void 0 : _a.call(modelOptions, schema, namePrefix));',
      file
    );
    content = replaceOnce(
      content,
      '                        suggestions = suggestions.concat(yield this.getTableList(model, item.schema, range));',
      '                        suggestions = suggestions.concat(yield this.getTableList(model, item.schema, range, item.namePrefix));',
      file
    );
    content = replaceOnce(
      content,
      '                        suggestions = suggestions.concat(yield this.getSchemaList(model, range));',
      '                        suggestions = suggestions.concat(yield this.getSchemaList(model, range, item.namePrefix));',
      file
    );
  }

  if (file.includes('/worker/parser.js')) {
    if (!content.includes('function getTableReferenceTrigger(text, offset)')) {
      content = replaceOnce(
      content,
      `const convertMap = {\n    BEGI: "BEGIN",\n    ENGINE_: 'ENGINE',\n    ERROR_P: 'ERROR',\n    FILEX: 'FILE',\n    NULLX: 'NULL'\n};\n`,
      `const convertMap = {\n    BEGI: "BEGIN",\n    ENGINE_: 'ENGINE',\n    ERROR_P: 'ERROR',\n    FILEX: 'FILE',\n    NULLX: 'NULL'\n};\nfunction getTableReferenceTrigger(text, offset) {\n    const leftText = text.substring(0, offset);\n    const tail = leftText.split(/;|\\n/).pop() || '';\n    const match = tail.match(/(?:^|\\s)(?:from|(?:left|right|inner|full|cross|straight_join)(?:\\s+outer)?\\s+join|join)\\s+([\`\\w$]*(?:\\.[\`\\w$]*)?)?$/i);\n    if (!match) {\n        return null;\n    }\n    const word = (match[1] || '').replace(/\`/g, '');\n    const dotIndex = word.indexOf('.');\n    if (dotIndex > -1) {\n        return { schema: word.substring(0, dotIndex), namePrefix: word.substring(dotIndex + 1) };\n    }\n    return { namePrefix: word };\n}\nfunction getTableReferenceCompletions(trigger, includeSchemas = true) {\n    const completions = [];\n    completions.push({\n        type: 'allTables',\n        schema: trigger.schema,\n        namePrefix: trigger.namePrefix\n    });\n    if (includeSchemas && !trigger.schema) {\n        completions.push({\n            type: 'allSchemas',\n            namePrefix: trigger.namePrefix\n        });\n    }\n    return completions;\n}
function getJoinAliasColumnCompletion(text, offset, objectName) {
    if (!objectName) {
        return null;
    }
    let tail = text.substring(0, offset).replaceAll('\`', '');
    if (tail.endsWith('.')) {
        tail = tail.slice(0, -1);
    }
    tail = (tail.split(String.fromCharCode(10)).pop() || '').split(';').pop() || '';
    const reserved = new Set(['AS', 'LEFT', 'RIGHT', 'INNER', 'FULL', 'CROSS', 'JOIN', 'WHERE', 'ON', 'ORDER', 'GROUP', 'LIMIT', 'UNION']);
    const words = tail.replaceAll(',', ' ').replaceAll('(', ' ').replaceAll(')', ' ').split(' ').filter(Boolean);
    for (let index = 0; index < words.length - 1; index += 1) {
        const keyword = words[index].toUpperCase();
        if (keyword !== 'FROM' && keyword !== 'JOIN') {
            continue;
        }
        const tableRef = words[index + 1];
        const alias = words[index + 2]?.toUpperCase() === 'AS' ? words[index + 3] : words[index + 2];
        const parts = tableRef.split('.');
        const tableName = parts.length > 1 ? parts[1] : parts[0];
        const schemaName = parts.length > 1 ? parts[0] : undefined;
        const names = [tableName, [schemaName, tableName].filter(Boolean).join('.')];
        if (alias && !reserved.has(alias.toUpperCase())) {
            names.push(alias);
        }
        if (names.includes(objectName)) {
            return { type: 'tableColumns', tableName, schemaName };
        }
    }
    return null;
}
`,
      file
      );
      content = replaceOnce(
      content,
      `                if (result.error) {\n                    /**\n                     * 出错了，就当做对象访问，交给上层来处理\n                     */\n                    completions.push({\n                        type: 'objectAccess',\n                        objectName: triggerWord\n                    });\n                    return completions;\n                }\n`,
      `                const aliasColumnCompletion = getJoinAliasColumnCompletion(statement.text, offset, triggerWord);\n                if (aliasColumnCompletion) {\n                    return [aliasColumnCompletion];\n                }\n                const tableReferenceTrigger = getTableReferenceTrigger(statement.text, offset);\n                if (tableReferenceTrigger) {\n                    return getTableReferenceCompletions(Object.assign(Object.assign({}, tableReferenceTrigger), { schema: tableReferenceTrigger.schema || triggerWord }), false);\n                }\n                if (result.error) {\n                    /**\n                     * 出错了，就当做对象访问，交给上层来处理\n                     */\n                    completions.push({\n                        type: 'objectAccess',\n                        objectName: triggerWord\n                    });\n                    return completions;\n                }\n`,
      file
      );
      content = replaceOnce(
      content,
      `            let tableContext;\n            const queryMap = createFromASTTree(result.result);\n`,
      `            const tableReferenceTrigger = getTableReferenceTrigger(statement.text, offset);\n            if (tableReferenceTrigger) {\n                return getTableReferenceCompletions(tableReferenceTrigger);\n            }\n            let tableContext;\n            const queryMap = createFromASTTree(result.result);\n`,
      file
      );
    }
    if (
      content.includes('function getTableReferenceTrigger(text, offset)') &&
      !content.includes('function getJoinAliasColumnCompletion(text, offset, objectName)')
    ) {
      content = replaceOnce(
        content,
        `function getTableReferenceCompletions(trigger, includeSchemas = true) {
    const completions = [];
    completions.push({
        type: 'allTables',
        schema: trigger.schema,
        namePrefix: trigger.namePrefix
    });
    if (includeSchemas && !trigger.schema) {
        completions.push({
            type: 'allSchemas',
            namePrefix: trigger.namePrefix
        });
    }
    return completions;
}
`,
        `function getTableReferenceCompletions(trigger, includeSchemas = true) {
    const completions = [];
    completions.push({
        type: 'allTables',
        schema: trigger.schema,
        namePrefix: trigger.namePrefix
    });
    if (includeSchemas && !trigger.schema) {
        completions.push({
            type: 'allSchemas',
            namePrefix: trigger.namePrefix
        });
    }
    return completions;
}
${joinAliasColumnCompletion}`,
        file
      );
    }
    if (content.includes('function getJoinAliasColumnCompletion(text, offset, objectName)')) {
      content = replaceFunction(content, 'getJoinAliasColumnCompletion', joinAliasColumnCompletion);
    }
    if (!content.includes('function normalizeComparisonOperatorsForParse(statement)')) {
      content = replaceOnce(
        content,
        'function getJoinAliasColumnCompletion(text, offset, objectName)',
        `${normalizeComparisonOperatorsForParse}function getJoinAliasColumnCompletion(text, offset, objectName)`,
        file
      );
    } else {
      content = replaceFunction(
        content,
        'normalizeComparisonOperatorsForParse',
        normalizeComparisonOperatorsForParse
      );
    }
    if (!content.includes('const normalizedText = normalizeComparisonOperatorsForParse(statement);')) {
      content = replaceOnce(
        content,
        `            const result = statement.parse(offset, function (_tokens, _currentRules, _followRules, _tokenStack) {
`,
        `            const normalizedText = normalizeComparisonOperatorsForParse(statement);
            if (normalizedText !== statement.text) {
                statement = (getSQLDocument(normalizedText, delimiter).statements || [])[0] || statement;
            }
            const result = statement.parse(offset, function (_tokens, _currentRules, _followRules, _tokenStack) {
`,
        file
      );
    }
    if (
      content.includes('function getJoinAliasColumnCompletion(text, offset, objectName)') &&
      !content.includes('const aliasColumnCompletion = getJoinAliasColumnCompletion(statement.text, offset, triggerWord);')
    ) {
      content = replaceOnce(
        content,
        `                const tableReferenceTrigger = getTableReferenceTrigger(statement.text, offset);
                if (tableReferenceTrigger) {
                    return getTableReferenceCompletions(Object.assign(Object.assign({}, tableReferenceTrigger), { schema: tableReferenceTrigger.schema || triggerWord }), false);
                }
`,
        `                const aliasColumnCompletion = getJoinAliasColumnCompletion(statement.text, offset, triggerWord);
                if (aliasColumnCompletion) {
                    return [aliasColumnCompletion];
                }
                const tableReferenceTrigger = getTableReferenceTrigger(statement.text, offset);
                if (tableReferenceTrigger) {
                    return getTableReferenceCompletions(Object.assign(Object.assign({}, tableReferenceTrigger), { schema: tableReferenceTrigger.schema || triggerWord }), false);
                }
`,
        file
      );
    }
    // Non-isDot / pre-parse alias.prefix fallback.
    // IMPORTANT: run BEFORE parse — MySQL DELETE/UPDATE parse can throw and skip later fallbacks.
    if (
      content.includes('function getJoinAliasColumnCompletion(text, offset, objectName)') &&
      !content.includes(
        'const leftTextForAlias = statement.text.substring(0, offset);\n            const aliasPrefixMatch = leftTextForAlias.match(/([A-Za-z0-9_$]+)\\.([A-Za-z0-9_$]*)$/);\n            if (aliasPrefixMatch) {\n                const aliasColumnCompletion = getJoinAliasColumnCompletion(statement.text, offset, aliasPrefixMatch[1]);\n                if (aliasColumnCompletion) {\n                    return [aliasColumnCompletion];\n                }\n            }\n            const isDot ='
      )
    ) {
      content = replaceOnce(
        content,
        `            let completions = [];
            let tokens, currentRules, followRules, tokenStack;
            const isDot = ((_a = statement.text) === null || _a === void 0 ? void 0 : _a[offset - 1]) === '.';
`,
        `            let completions = [];
            let tokens, currentRules, followRules, tokenStack;
            const leftTextForAlias = statement.text.substring(0, offset);
            const aliasPrefixMatch = leftTextForAlias.match(/([A-Za-z0-9_$]+)\\.([A-Za-z0-9_$]*)$/);
            if (aliasPrefixMatch) {
                const aliasColumnCompletion = getJoinAliasColumnCompletion(statement.text, offset, aliasPrefixMatch[1]);
                if (aliasColumnCompletion) {
                    return [aliasColumnCompletion];
                }
            }
            const isDot = ((_a = statement.text) === null || _a === void 0 ? void 0 : _a[offset - 1]) === '.';
`,
        file
      );
      // Drop obsolete post-parse duplicate if present (keep single pre-parse fallback).
      content = content.replace(
        `            const leftTextForAlias = statement.text.substring(0, offset);
            const aliasPrefixMatch = leftTextForAlias.match(/([A-Za-z0-9_$]+)\\.([A-Za-z0-9_$]*)$/);
            if (aliasPrefixMatch) {
                const aliasColumnCompletion = getJoinAliasColumnCompletion(statement.text, offset, aliasPrefixMatch[1]);
                if (aliasColumnCompletion) {
                    return [aliasColumnCompletion];
                }
            }
            console.log(tokens);
`,
        `            console.log(tokens);
`
      );
    }
  }

  write(file, content);
}

function patchWorkerBundle(file) {
  let content = read(file);
  const aliasHelper = "function $odcJoinAliasColumn(e,t,E){if(!E)return null;let a=\"\";for(let i=0;i<e.length;){const c=e[i];if(c===\"'\"||c==='\"'){const q=c;a+=\" \";i++;while(i<e.length){a+=\" \";if(e[i]===\"\\\\\"){a+=\" \";i+=2;continue}if(e[i]===q){i++;break}i++}continue}if(c===\"-\"&&e[i+1]===\"-\"){while(i<e.length&&e[i]!==String.fromCharCode(10)){a+=\" \";i++}continue}if(c===\"/\"&&e[i+1]===\"*\"){a+=\"  \";i+=2;while(i<e.length&&!(e[i]===\"*\"&&e[i+1]===\"/\")){a+=\" \";i++}if(i<e.length){a+=\"  \";i+=2}continue}a+=e[i];i++}a=a.replaceAll(\"`\",\"\");const s=new Set([\"AS\",\"LEFT\",\"RIGHT\",\"INNER\",\"FULL\",\"CROSS\",\"JOIN\",\"WHERE\",\"ON\",\"ORDER\",\"GROUP\",\"LIMIT\",\"UNION\",\"SELECT\",\"BY\",\"HAVING\",\"SET\"]);const re=/(?:^|[^A-Za-z0-9_`$])((?:FROM|JOIN|UPDATE))\\s+/gi;let m,found=null;while((m=re.exec(a))!==null){let i=m.index+m[0].length;while(i<a.length&&/\\s/.test(a[i]))i++;if(a[i]===\"(\"){let d=0,start=i;for(;i<a.length;i++){if(a[i]===\"(\")d++;else if(a[i]===\")\"){d--;if(d===0){i++;break}}}while(i<a.length&&/\\s/.test(a[i]))i++;if(/^as\\b/i.test(a.slice(i))){i+=2;while(i<a.length&&/\\s/.test(a[i]))i++}let alias=\"\";while(i<a.length&&/[A-Za-z0-9_$]/.test(a[i]))alias+=a[i++];if(alias&&alias===E&&!s.has(alias.toUpperCase())){const inner=a.slice(start,i);const inners=[...inner.matchAll(/\\bFROM\\s+([A-Za-z0-9_$]+(?:\\.[A-Za-z0-9_$]+)?)/gi)];const last=inners[inners.length-1];if(last){const r=last[1].split(\".\"),T=r.length>1?r[1]:r[0],i2=r.length>1?r[0]:void 0;found={type:\"tableColumns\",tableName:T,schemaName:i2}}}continue}const rest=a.slice(i);const tm=rest.match(/^([A-Za-z0-9_$]+(?:\\.[A-Za-z0-9_$]+)?)(?:\\s+(?:AS\\s+)?([A-Za-z0-9_$]+))?/i);if(!tm)continue;const tableRef=tm[1],alias=tm[2],r=tableRef.split(\".\"),T=r.length>1?r[1]:r[0],i2=r.length>1?r[0]:void 0,o=[T,[i2,T].filter(Boolean).join(\".\")];if(alias&&!s.has(alias.toUpperCase()))o.push(alias);if(o.includes(E))found={type:\"tableColumns\",tableName:T,schemaName:i2}}return found}";
  const aliasPrefixFallbackMysql =
    'var _am=B.substring(0,E).match(/([A-Za-z0-9_$]+)\\.([A-Za-z0-9_$]*)$/);if(_am){var _ac=$odcJoinAliasColumn(B,E,_am[1]);if(_ac)return[_ac]}const L=$odcJoinTableTrigger(B,E);if(L)return $odcJoinCompletions(L);let O;console.log(T),T=null==T?void 0:T.filter((e=>dt.has(e))),T&&(o=T.map((e=>a[e]||e)));const I=_t(N.result);';
  const aliasPrefixFallbackObmysql =
    'var _am=B.substring(0,E).match(/([A-Za-z0-9_$]+)\\.([A-Za-z0-9_$]*)$/);if(_am){var _ac=$odcJoinAliasColumn(B,E,_am[1]);if(_ac)return[_ac]}const L=$odcJoinTableTrigger(B,E);if(L)return $odcJoinCompletions(L);let O;console.log(T),T=null==T?void 0:T.filter((e=>Yt.has(e))),T&&(R=T.map((e=>a[e]||e)));const I=dt(o.result);';
  // Must run BEFORE parse: MySQL DELETE/UPDATE parse can throw and skip post-parse fallbacks.
  const earlyAliasFallback =
    'var _pre=(e.text||"").substring(0,E).match(/([A-Za-z0-9_$]+)\\.([A-Za-z0-9_$]*)$/);if(_pre){var _pc=$odcJoinAliasColumn(e.text,E,_pre[1]);if(_pc)return[_pc]}';
  const earlyAliasNeedle = 'let T,i,_,S,o=[];const R="."===(null===(s=e.text)||void 0===s?void 0:s[E-1]);';
  const earlyAliasReplacement =
    'let T,i,_,S,o=[];' + earlyAliasFallback + 'const R="."===(null===(s=e.text)||void 0===s?void 0:s[E-1]);';
  const normalizeHelpers = "function $odcNormalizeCmpText(e){if(!e||!e.text||!e.tokens)return e&&e.text;const t=e.text,E=e.start||0,a=e.tokens.filter(e=>0===e.channel&&-1!==e.type),s=[];for(let i=0;i<a.length;i++){const n=a[i],c=n.start-E,r=a[i+1],T=a[i+2];if(\"<\"===n.text&&r&&\"=\"===r.text&&T&&\">\"===T.text&&r.start===n.stop+1&&T.start===r.stop+1){s.push({c:c,f:\"<=>\",t:\"!= \"});i+=2;continue}if(\">\"===n.text&&r&&\"=\"===r.text&&r.start===n.stop+1){s.push({c:c,f:\">=\",t:\"!=\"});i+=1;continue}if(\"<\"===n.text&&r&&\"=\"===r.text&&r.start===n.stop+1){s.push({c:c,f:\"<=\",t:\"!=\"});i+=1;continue}if(\"<>\"===n.text){s.push({c:c,f:\"<>\",t:\"!=\"});continue}if(\">\"===n.text||\"<\"===n.text)s.push({c:c,f:n.text,t:\"=\"})}if(!s.length)return t;let n=t;s.sort((e,t)=>t.c-e.c).forEach(e=>{n=n.slice(0,e.c)+e.t+n.slice(e.c+e.f.length)});return n}function $odcWithNormalizedCmp(e,docFn,delim){const t=$odcNormalizeCmpText(e);return t===e.text?e:(docFn(t,delim).statements||[])[0]||e}";
  const normalizeCmpText = "function $odcNormalizeCmpText(e){if(!e||!e.text||!e.tokens)return e&&e.text;const t=e.text,E=e.start||0,a=e.tokens.filter(e=>0===e.channel&&-1!==e.type),s=[];for(let i=0;i<a.length;i++){const n=a[i],c=n.start-E,r=a[i+1],T=a[i+2];if(\"<\"===n.text&&r&&\"=\"===r.text&&T&&\">\"===T.text&&r.start===n.stop+1&&T.start===r.stop+1){s.push({c:c,f:\"<=>\",t:\"!= \"});i+=2;continue}if(\">\"===n.text&&r&&\"=\"===r.text&&r.start===n.stop+1){s.push({c:c,f:\">=\",t:\"!=\"});i+=1;continue}if(\"<\"===n.text&&r&&\"=\"===r.text&&r.start===n.stop+1){s.push({c:c,f:\"<=\",t:\"!=\"});i+=1;continue}if(\"<>\"===n.text){s.push({c:c,f:\"<>\",t:\"!=\"});continue}if(\">\"===n.text||\"<\"===n.text)s.push({c:c,f:n.text,t:\"=\"})}if(!s.length)return t;let n=t;s.sort((e,t)=>t.c-e.c).forEach(e=>{n=n.slice(0,e.c)+e.t+n.slice(e.c+e.f.length)});return n}";
  const withNormalizedCmp = "function $odcWithNormalizedCmp(e,docFn,delim){const t=$odcNormalizeCmpText(e);return t===e.text?e:(docFn(t,delim).statements||[])[0]||e}";
  const helperPrefix = "function $odcJoinTableTrigger(e,t){const E=e.substring(0,t).split(/;|\\n/).pop()||\"\",a=E.match(/(?:^|\\s)(?:from|(?:left|right|inner|full|cross|straight_join)(?:\\s+outer)?\\s+join|join)\\s+([`\\w$]*(?:\\.[`\\w$]*)?)?$/i);if(!a)return null;const s=(a[1]||\"\").replace(/`/g,\"\"),n=s.indexOf(\".\");return n>-1?{schema:s.substring(0,n),namePrefix:s.substring(n+1)}:{namePrefix:s}}function $odcJoinCompletions(e,t=!0){const E=[];return E.push({type:\"allTables\",schema:e.schema,namePrefix:e.namePrefix}),t&&!e.schema&&E.push({type:\"allSchemas\",namePrefix:e.namePrefix}),E}";
  const helper = helperPrefix + aliasHelper + normalizeHelpers;
  const mysqlFlattenHelper = 'function $odcFlattenMysqlJoin(e){if(!e)return[];const t=[e];return e.join&&t.push(...$odcFlattenMysqlJoin(e.join)),e.joins&&e.joins.forEach((e=>{t.push(...$odcFlattenMysqlJoin(e))})),t}';
  const withNormalizedMysql =
    'e=$odcWithNormalizedCmp(e,Ht,t);const B=e.text,N=e.parse(E,(function(e,t,E,a){T=e,i=t,_=E,S=a}));if(R){';
  const withNormalizedObmysql =
    'e=$odcWithNormalizedCmp(e,mt,t);const B=e.text,o=e.parse(E,(function(e,t,E,a){T=e,_=t,i=E,S=a}));if(console.log(o),N){';
  if (content.includes('$odcJoinTableTrigger')) {
    if (!content.includes('$odcJoinAliasColumn')) {
      content = replaceOnce(
        content,
        'function $odcJoinCompletions(e,t=!0){const E=[];return E.push({type:"allTables",schema:e.schema,namePrefix:e.namePrefix}),t&&!e.schema&&E.push({type:"allSchemas",namePrefix:e.namePrefix}),E}',
        'function $odcJoinCompletions(e,t=!0){const E=[];return E.push({type:"allTables",schema:e.schema,namePrefix:e.namePrefix}),t&&!e.schema&&E.push({type:"allSchemas",namePrefix:e.namePrefix}),E}' +
          aliasHelper +
          normalizeHelpers,
        file
      );
    } else {
      content = replaceFunction(content, '$odcJoinAliasColumn', aliasHelper);
      if (!content.includes('function $odcNormalizeCmpText(')) {
        content = replaceOnce(
          content,
          'function $odcJoinAliasColumn(',
          normalizeHelpers + 'function $odcJoinAliasColumn(',
          file
        );
      } else {
        content = replaceFunction(content, '$odcNormalizeCmpText', normalizeCmpText);
        if (content.includes('function $odcWithNormalizedCmp(')) {
          content = replaceFunction(content, '$odcWithNormalizedCmp', withNormalizedCmp);
        } else {
          content = replaceOnce(
            content,
            'function $odcNormalizeCmpText(',
            withNormalizedCmp + 'function $odcNormalizeCmpText(',
            file
          );
        }
      }
    }
    if (!content.includes('if(M)return[M];const q=$odcJoinTableTrigger')) {
      content = content.replace(
        'const q=$odcJoinTableTrigger(B,E);if(q)return $odcJoinCompletions(Object.assign(Object.assign({},q),{schema:q.schema||e}),!1);',
        'const M=$odcJoinAliasColumn(B,E,e);if(M)return[M];const q=$odcJoinTableTrigger(B,E);if(q)return $odcJoinCompletions(Object.assign(Object.assign({},q),{schema:q.schema||e}),!1);'
      );
    }
    if (!content.includes('$odcWithNormalizedCmp(e,')) {
      if (content.includes('const B=e.text,N=e.parse(E,')) {
        content = replaceOnce(
          content,
          'const B=e.text,N=e.parse(E,(function(e,t,E,a){T=e,i=t,_=E,S=a}));if(R){',
          withNormalizedMysql,
          file
        );
      }
      if (content.includes('const B=e.text,o=e.parse(E,')) {
        content = replaceOnce(
          content,
          'const B=e.text,o=e.parse(E,(function(e,t,E,a){T=e,_=t,i=E,S=a}));if(console.log(o),N){',
          withNormalizedObmysql,
          file
        );
      }
      if (content.includes('const N=e.parse(E,(function(e,t,E,a){T=e,i=t,_=E,S=a}));if(R){') && !content.includes('$odcWithNormalizedCmp(e,Ht,t)')) {
        content = replaceOnce(
          content,
          'const N=e.parse(E,(function(e,t,E,a){T=e,i=t,_=E,S=a}));if(R){',
          withNormalizedMysql,
          file
        );
      }
      if (content.includes('const o=e.parse(E,(function(e,t,E,a){T=e,_=t,i=E,S=a}));if(console.log(o),N){') && !content.includes('$odcWithNormalizedCmp(e,mt,t)')) {
        content = replaceOnce(
          content,
          'const o=e.parse(E,(function(e,t,E,a){T=e,_=t,i=E,S=a}));if(console.log(o),N){',
          withNormalizedObmysql,
          file
        );
      }
    }
    if (file.includes('mysql.js') && !file.includes('obmysql.js') && !content.includes('$odcFlattenMysqlJoin')) {
      content = replaceOnce(content, helper + 'let s=', helper + mysqlFlattenHelper + 'let s=', file);
      content = replaceOnce(
        content,
        'let T=ot(n);return T.join=r,s?[T].concat(Rt(s)):[T]}function Nt(e){return Rt(Tt(e.children,"tableSources"))}',
        'let T=ot(n);T.join=r;const i=$odcFlattenMysqlJoin(T);return s?i.concat(Rt(s)):i}function Nt(e){return Rt(Tt(e.children,"tableSources"))}',
        file
      );
    }
    if (!content.includes('var _am=B.substring(0,E).match(/([A-Za-z0-9_$]+)\\.([A-Za-z0-9_$]*)$/)')) {
      if (
        content.includes(
          'const L=$odcJoinTableTrigger(B,E);if(L)return $odcJoinCompletions(L);let O;console.log(T),T=null==T?void 0:T.filter((e=>dt.has(e))),T&&(o=T.map((e=>a[e]||e)));const I=_t(N.result);'
        )
      ) {
        content = replaceOnce(
          content,
          'const L=$odcJoinTableTrigger(B,E);if(L)return $odcJoinCompletions(L);let O;console.log(T),T=null==T?void 0:T.filter((e=>dt.has(e))),T&&(o=T.map((e=>a[e]||e)));const I=_t(N.result);',
          aliasPrefixFallbackMysql,
          file
        );
      }
      if (
        content.includes(
          'const L=$odcJoinTableTrigger(B,E);if(L)return $odcJoinCompletions(L);let O;console.log(T),T=null==T?void 0:T.filter((e=>Yt.has(e))),T&&(R=T.map((e=>a[e]||e)));const I=dt(o.result);'
        )
      ) {
        content = replaceOnce(
          content,
          'const L=$odcJoinTableTrigger(B,E);if(L)return $odcJoinCompletions(L);let O;console.log(T),T=null==T?void 0:T.filter((e=>Yt.has(e))),T&&(R=T.map((e=>a[e]||e)));const I=dt(o.result);',
          aliasPrefixFallbackObmysql,
          file
        );
      }
    }
    if (!content.includes('var _pre=(e.text||"").substring(0,E).match') && content.includes(earlyAliasNeedle)) {
      // replaceAll: mysql + obmysql bundles both use the same preamble
      content = content.split(earlyAliasNeedle).join(earlyAliasReplacement);
    }
    write(file, content);
    return;
  }
  content = replaceOnce(content, 'E=Math.max(n,t)', 'E=Math.max(n,E)', file);
  if (content.includes('function Ut(e){const t=Tt(e.children,"table_reference")')) {
    content = replaceOnce(
      content,
      'function Ut(e){const t=Tt(e.children,"table_reference"),E=Tt(e.children,"table_references");let a=Dt(t);return E?Ut(E).concat(a):[a]}',
      'function $odcFlattenJoin(e){if(!e)return[];const t=e.join,E=[e];return t&&E.push(...$odcFlattenJoin(t)),E}function Ut(e){const t=Tt(e.children,"table_reference"),E=Tt(e.children,"table_references");let a=$odcFlattenJoin(Dt(t));return E?Ut(E).concat(a):a}',
      file
    );
  }
  const helpers = file.includes('mysql.js') && !file.includes('obmysql.js') ? helper + mysqlFlattenHelper : helper;
  if (content.includes('const a={NULLX:"NULL",STAR:"*"};let s=')) {
    content = replaceOnce(
      content,
      'const a={NULLX:"NULL",STAR:"*"};let s=',
      'const a={NULLX:"NULL",STAR:"*"};' + helpers + 'let s=',
      file
    );
    if (content.includes('let T=ot(n);return T.join=r,s?[T].concat(Rt(s)):[T]}function Nt(e){return Rt(Tt(e.children,"tableSources"))}')) {
      content = replaceOnce(
        content,
        'let T=ot(n);return T.join=r,s?[T].concat(Rt(s)):[T]}function Nt(e){return Rt(Tt(e.children,"tableSources"))}',
        'let T=ot(n);T.join=r;const i=$odcFlattenMysqlJoin(T);return s?i.concat(Rt(s)):i}function Nt(e){return Rt(Tt(e.children,"tableSources"))}',
        file
      );
    }
    content = replaceOnce(
      content,
      'const N=e.parse(E,(function(e,t,E,a){T=e,i=t,_=E,S=a}));if(R){',
      withNormalizedMysql,
      file
    );
    content = replaceOnce(
      content,
      'if(N.error)return o.push({type:"objectAccess",objectName:e}),o;let s=nt(_t(N.result),E-1);',
      'const M=$odcJoinAliasColumn(B,E,e);if(M)return[M];const q=$odcJoinTableTrigger(B,E);if(q)return $odcJoinCompletions(Object.assign(Object.assign({},q),{schema:q.schema||e}),!1);if(N.error)return o.push({type:"objectAccess",objectName:e}),o;let s=nt(_t(N.result),E-1);',
      file
    );
    content = replaceOnce(
      content,
      'let O;console.log(T),T=null==T?void 0:T.filter((e=>dt.has(e))),T&&(o=T.map((e=>a[e]||e)));const I=_t(N.result);',
      aliasPrefixFallbackMysql,
      file
    );
  } else {
    content = replaceOnce(
      content,
      'const a={NULLX:"NULL"};let s=',
      'const a={NULLX:"NULL"};' + helpers + 'let s=',
      file
    );
    if (content.includes('let T=ot(n);return T.join=r,s?[T].concat(Rt(s)):[T]}function Nt(e){return Rt(Tt(e.children,"tableSources"))}')) {
      content = replaceOnce(
        content,
        'let T=ot(n);return T.join=r,s?[T].concat(Rt(s)):[T]}function Nt(e){return Rt(Tt(e.children,"tableSources"))}',
        'let T=ot(n);T.join=r;const i=$odcFlattenMysqlJoin(T);return s?i.concat(Rt(s)):i}function Nt(e){return Rt(Tt(e.children,"tableSources"))}',
        file
      );
    }
    content = replaceOnce(
      content,
      'const o=e.parse(E,(function(e,t,E,a){T=e,_=t,i=E,S=a}));if(console.log(o),N){',
      withNormalizedObmysql,
      file
    );
    content = replaceOnce(
      content,
      'if(o.error)return R.push({type:"objectAccess",objectName:e}),R;let s=nt(dt(o.result),E-1);',
      'const M=$odcJoinAliasColumn(B,E,e);if(M)return[M];const q=$odcJoinTableTrigger(B,E);if(q)return $odcJoinCompletions(Object.assign(Object.assign({},q),{schema:q.schema||e}),!1);if(o.error)return R.push({type:"objectAccess",objectName:e}),R;let s=nt(dt(o.result),E-1);',
      file
    );
    content = replaceOnce(
      content,
      'let O;console.log(T),T=null==T?void 0:T.filter((e=>Yt.has(e))),T&&(R=T.map((e=>a[e]||e)));const I=dt(o.result);',
      aliasPrefixFallbackObmysql,
      file
    );
  }
  if (!content.includes('var _pre=(e.text||"").substring(0,E).match') && content.includes(earlyAliasNeedle)) {
    content = content.split(earlyAliasNeedle).join(earlyAliasReplacement);
  }
  write(file, content);
}


if (!fs.existsSync(packageRoot)) {
  console.warn('[patch-monaco-plugin-ob] package not installed, skip');
  process.exit(0);
}

const pkg = JSON.parse(read('package.json'));
if (pkg.version !== '1.4.2') {
  console.warn(`[patch-monaco-plugin-ob] expected 1.4.2, got ${pkg.version}; skip`);
  process.exit(0);
}

[
  'dist/model/query.js',
  'dist/model/dialect/obmysql.js',
  'dist/model/dialect/mysql.js',
  'dist/obmysql/autoComplete/index.js',
  'dist/mysql/autoComplete/index.js',
  'dist/obmysql/worker/parser.js',
  'dist/mysql/worker/parser.js'
].forEach(patchTextFile);

['worker-dist/obmysql.js', 'worker-dist/mysql.js'].forEach(patchWorkerBundle);
console.log('[patch-monaco-plugin-ob] patched @oceanbase-odc/monaco-plugin-ob@1.4.2');
