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
    content = replaceOnce(
      content,
      `const convertMap = {\n    BEGI: "BEGIN",\n    ENGINE_: 'ENGINE',\n    ERROR_P: 'ERROR',\n    FILEX: 'FILE',\n    NULLX: 'NULL'\n};\n`,
      `const convertMap = {\n    BEGI: "BEGIN",\n    ENGINE_: 'ENGINE',\n    ERROR_P: 'ERROR',\n    FILEX: 'FILE',\n    NULLX: 'NULL'\n};\nfunction getTableReferenceTrigger(text, offset) {\n    const leftText = text.substring(0, offset);\n    const tail = leftText.split(/;|\\n/).pop() || '';\n    const match = tail.match(/(?:^|\\s)(?:from|(?:left|right|inner|full|cross|straight_join)(?:\\s+outer)?\\s+join|join)\\s+([\`\\w$]*(?:\\.[\`\\w$]*)?)?$/i);\n    if (!match) {\n        return null;\n    }\n    const word = (match[1] || '').replace(/\`/g, '');\n    const dotIndex = word.indexOf('.');\n    if (dotIndex > -1) {\n        return { schema: word.substring(0, dotIndex), namePrefix: word.substring(dotIndex + 1) };\n    }\n    return { namePrefix: word };\n}\nfunction getTableReferenceCompletions(trigger, includeSchemas = true) {\n    const completions = [];\n    completions.push({\n        type: 'allTables',\n        schema: trigger.schema,\n        namePrefix: trigger.namePrefix\n    });\n    if (includeSchemas && !trigger.schema) {\n        completions.push({\n            type: 'allSchemas',\n            namePrefix: trigger.namePrefix\n        });\n    }\n    return completions;\n}\n`,
      file
    );
    content = replaceOnce(
      content,
      `                if (result.error) {\n                    /**\n                     * 出错了，就当做对象访问，交给上层来处理\n                     */\n                    completions.push({\n                        type: 'objectAccess',\n                        objectName: triggerWord\n                    });\n                    return completions;\n                }\n`,
      `                const tableReferenceTrigger = getTableReferenceTrigger(statement.text, offset);\n                if (tableReferenceTrigger) {\n                    return getTableReferenceCompletions(Object.assign(Object.assign({}, tableReferenceTrigger), { schema: tableReferenceTrigger.schema || triggerWord }), false);\n                }\n                if (result.error) {\n                    /**\n                     * 出错了，就当做对象访问，交给上层来处理\n                     */\n                    completions.push({\n                        type: 'objectAccess',\n                        objectName: triggerWord\n                    });\n                    return completions;\n                }\n`,
      file
    );
    content = replaceOnce(
      content,
      `            let tableContext;\n            const queryMap = createFromASTTree(result.result);\n`,
      `            const tableReferenceTrigger = getTableReferenceTrigger(statement.text, offset);\n            if (tableReferenceTrigger) {\n                return getTableReferenceCompletions(tableReferenceTrigger);\n            }\n            let tableContext;\n            const queryMap = createFromASTTree(result.result);\n`,
      file
    );
  }

  write(file, content);
}

function patchWorkerBundle(file) {
  let content = read(file);
  content = replaceOnce(content, 'E=Math.max(n,t)', 'E=Math.max(n,E)', file);
  content = replaceOnce(
    content,
    'function Ut(e){const t=Tt(e.children,"table_reference"),E=Tt(e.children,"table_references");let a=Dt(t);return E?Ut(E).concat(a):[a]}',
    'function $odcFlattenJoin(e){if(!e)return[];const t=e.join,E=[e];return t&&E.push(...$odcFlattenJoin(t)),E}function Ut(e){const t=Tt(e.children,"table_reference"),E=Tt(e.children,"table_references");let a=$odcFlattenJoin(Dt(t));return E?Ut(E).concat(a):a}',
    file
  );
  const helper = 'function $odcJoinTableTrigger(e,t){const E=e.substring(0,t).split(/;|\\n/).pop()||"",a=E.match(/(?:^|\\s)(?:from|(?:left|right|inner|full|cross|straight_join)(?:\\s+outer)?\\s+join|join)\\s+([\`\\w$]*(?:\\.[\`\\w$]*)?)?$/i);if(!a)return null;const s=(a[1]||"").replace(/`/g,""),n=s.indexOf(".");return n>-1?{schema:s.substring(0,n),namePrefix:s.substring(n+1)}:{namePrefix:s}}function $odcJoinCompletions(e,t=!0){const E=[];return E.push({type:"allTables",schema:e.schema,namePrefix:e.namePrefix}),t&&!e.schema&&E.push({type:"allSchemas",namePrefix:e.namePrefix}),E}';
  content = replaceOnce(
    content,
    'const a={NULLX:"NULL"};let s=',
    `const a={NULLX:"NULL"};${helper}let s=`,
    file
  );
  content = replaceOnce(
    content,
    'const o=e.parse(E,(function(e,t,E,a){T=e,_=t,i=E,S=a}));if(console.log(o),N){',
    'const B=e.text,o=e.parse(E,(function(e,t,E,a){T=e,_=t,i=E,S=a}));if(console.log(o),N){',
    file
  );
  content = replaceOnce(
    content,
    'if(o.error)return R.push({type:"objectAccess",objectName:e}),R;let s=nt(dt(o.result),E-1);',
    'const q=$odcJoinTableTrigger(B,E);if(q)return $odcJoinCompletions(Object.assign(Object.assign({},q),{schema:q.schema||e}),!1);if(o.error)return R.push({type:"objectAccess",objectName:e}),R;let s=nt(dt(o.result),E-1);',
    file
  );
  content = replaceOnce(
    content,
    'let O;console.log(T),T=null==T?void 0:T.filter((e=>Yt.has(e))),T&&(R=T.map((e=>a[e]||e)));const I=dt(o.result);',
    'const L=$odcJoinTableTrigger(B,E);if(L)return $odcJoinCompletions(L);let O;console.log(T),T=null==T?void 0:T.filter((e=>Yt.has(e))),T&&(R=T.map((e=>a[e]||e)));const I=dt(o.result);',
    file
  );
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
  'dist/obmysql/autoComplete/index.js',
  'dist/mysql/autoComplete/index.js',
  'dist/obmysql/worker/parser.js',
  'dist/mysql/worker/parser.js'
].forEach(patchTextFile);

['worker-dist/obmysql.js'].forEach(patchWorkerBundle);
console.log('[patch-monaco-plugin-ob] patched @oceanbase-odc/monaco-plugin-ob@1.4.2');
