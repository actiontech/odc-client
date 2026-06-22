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
  }

  write(file, content);
}

function patchWorkerBundle(file) {
  let content = read(file);
  const helper = "function $odcJoinTableTrigger(e,t){const E=e.substring(0,t).split(/;|\\n/).pop()||\"\",a=E.match(/(?:^|\\s)(?:from|(?:left|right|inner|full|cross|straight_join)(?:\\s+outer)?\\s+join|join)\\s+([`\\w$]*(?:\\.[`\\w$]*)?)?$/i);if(!a)return null;const s=(a[1]||\"\").replace(/`/g,\"\"),n=s.indexOf(\".\");return n>-1?{schema:s.substring(0,n),namePrefix:s.substring(n+1)}:{namePrefix:s}}function $odcJoinCompletions(e,t=!0){const E=[];return E.push({type:\"allTables\",schema:e.schema,namePrefix:e.namePrefix}),t&&!e.schema&&E.push({type:\"allSchemas\",namePrefix:e.namePrefix}),E}function $odcJoinAliasColumn(e,t,E){if(!E)return null;let a=e.substring(0,t).replaceAll(\"`\",\"\");a.endsWith(\".\")&&(a=a.slice(0,-1)),a=(a.split(String.fromCharCode(10)).pop()||\"\").split(\";\").pop()||\"\";const s=new Set([\"AS\",\"LEFT\",\"RIGHT\",\"INNER\",\"FULL\",\"CROSS\",\"JOIN\",\"WHERE\",\"ON\",\"ORDER\",\"GROUP\",\"LIMIT\",\"UNION\"]),n=a.replaceAll(\",\",\" \").replaceAll(\"(\",\" \").replaceAll(\")\",\" \").split(\" \").filter(Boolean);for(let e=0;e<n.length-1;e+=1){const t=n[e].toUpperCase();if(\"FROM\"!==t&&\"JOIN\"!==t)continue;const a=n[e+1],c=\"AS\"===(n[e+2]?.toUpperCase())?n[e+3]:n[e+2],r=a.split(\".\"),T=r.length>1?r[1]:r[0],i=r.length>1?r[0]:void 0,o=[T,[i,T].filter(Boolean).join(\".\")];if(c&&!s.has(c.toUpperCase())&&o.push(c),o.includes(E))return{type:\"tableColumns\",tableName:T,schemaName:i}}return null}";
  const aliasHelper = "function $odcJoinAliasColumn(e,t,E){if(!E)return null;let a=e.substring(0,t).replaceAll(\"`\",\"\");a.endsWith(\".\")&&(a=a.slice(0,-1)),a=(a.split(String.fromCharCode(10)).pop()||\"\").split(\";\").pop()||\"\";const s=new Set([\"AS\",\"LEFT\",\"RIGHT\",\"INNER\",\"FULL\",\"CROSS\",\"JOIN\",\"WHERE\",\"ON\",\"ORDER\",\"GROUP\",\"LIMIT\",\"UNION\"]),n=a.replaceAll(\",\",\" \").replaceAll(\"(\",\" \").replaceAll(\")\",\" \").split(\" \").filter(Boolean);for(let e=0;e<n.length-1;e+=1){const t=n[e].toUpperCase();if(\"FROM\"!==t&&\"JOIN\"!==t)continue;const a=n[e+1],c=\"AS\"===(n[e+2]?.toUpperCase())?n[e+3]:n[e+2],r=a.split(\".\"),T=r.length>1?r[1]:r[0],i=r.length>1?r[0]:void 0,o=[T,[i,T].filter(Boolean).join(\".\")];if(c&&!s.has(c.toUpperCase())&&o.push(c),o.includes(E))return{type:\"tableColumns\",tableName:T,schemaName:i}}return null}";
  const mysqlFlattenHelper = 'function $odcFlattenMysqlJoin(e){if(!e)return[];const t=[e];return e.join&&t.push(...$odcFlattenMysqlJoin(e.join)),e.joins&&e.joins.forEach((e=>{t.push(...$odcFlattenMysqlJoin(e))})),t}';
  if (content.includes('$odcJoinTableTrigger')) {
    if (!content.includes('$odcJoinAliasColumn')) {
      content = replaceOnce(
        content,
        'function $odcJoinCompletions(e,t=!0){const E=[];return E.push({type:"allTables",schema:e.schema,namePrefix:e.namePrefix}),t&&!e.schema&&E.push({type:"allSchemas",namePrefix:e.namePrefix}),E}',
        `function $odcJoinCompletions(e,t=!0){const E=[];return E.push({type:"allTables",schema:e.schema,namePrefix:e.namePrefix}),t&&!e.schema&&E.push({type:"allSchemas",namePrefix:e.namePrefix}),E}${aliasHelper}`,
        file
      );
    }
    if (!content.includes('if(M)return[M];const q=$odcJoinTableTrigger')) {
      content = content.replace(
        'const q=$odcJoinTableTrigger(B,E);if(q)return $odcJoinCompletions(Object.assign(Object.assign({},q),{schema:q.schema||e}),!1);',
        'const M=$odcJoinAliasColumn(B,E,e);if(M)return[M];const q=$odcJoinTableTrigger(B,E);if(q)return $odcJoinCompletions(Object.assign(Object.assign({},q),{schema:q.schema||e}),!1);'
      );
    }
    if (file.includes('mysql.js') && !file.includes('obmysql.js') && !content.includes('$odcFlattenMysqlJoin')) {
      content = replaceOnce(content, `${helper}let s=`, `${helper}${mysqlFlattenHelper}let s=`, file);
      content = replaceOnce(
        content,
        'let T=ot(n);return T.join=r,s?[T].concat(Rt(s)):[T]}function Nt(e){return Rt(Tt(e.children,"tableSources"))}',
        'let T=ot(n);T.join=r;const i=$odcFlattenMysqlJoin(T);return s?i.concat(Rt(s)):i}function Nt(e){return Rt(Tt(e.children,"tableSources"))}',
        file
      );
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
  const helpers = file.includes('mysql.js') && !file.includes('obmysql.js') ? `${helper}${mysqlFlattenHelper}` : helper;
  if (content.includes('const a={NULLX:"NULL",STAR:"*"};let s=')) {
    content = replaceOnce(
      content,
      'const a={NULLX:"NULL",STAR:"*"};let s=',
      `const a={NULLX:"NULL",STAR:"*"};${helpers}let s=`,
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
      'const B=e.text,N=e.parse(E,(function(e,t,E,a){T=e,i=t,_=E,S=a}));if(R){',
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
      'const L=$odcJoinTableTrigger(B,E);if(L)return $odcJoinCompletions(L);let O;console.log(T),T=null==T?void 0:T.filter((e=>dt.has(e))),T&&(o=T.map((e=>a[e]||e)));const I=_t(N.result);',
      file
    );
  } else {
    content = replaceOnce(
      content,
      'const a={NULLX:"NULL"};let s=',
      `const a={NULLX:"NULL"};${helpers}let s=`,
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
      'const B=e.text,o=e.parse(E,(function(e,t,E,a){T=e,_=t,i=E,S=a}));if(console.log(o),N){',
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
      'const L=$odcJoinTableTrigger(B,E);if(L)return $odcJoinCompletions(L);let O;console.log(T),T=null==T?void 0:T.filter((e=>Yt.has(e))),T&&(R=T.map((e=>a[e]||e)));const I=dt(o.result);',
      file
    );
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
