const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const repoRoot = path.join(__dirname, '..', '..');
const patchScript = path.join(repoRoot, 'scripts', 'patches', 'patch-monaco-plugin-ob.cjs');
const fixturePackage = '/tmp/monaco-plugin-ob-1.4.2/package';

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(from, to);
    } else if (entry.isFile()) {
      fs.copyFileSync(from, to);
    }
  }
}

function assertIncludes(content, needle, message) {
  if (!content.includes(needle)) {
    throw new Error(message);
  }
}

function assertNotIncludes(content, needle, message) {
  if (content.includes(needle)) {
    throw new Error(message);
  }
}

if (!fs.existsSync(fixturePackage)) {
  throw new Error(`Missing fixture package: ${fixturePackage}`);
}

const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'monaco-left-join-'));
const packageRoot = path.join(tempRoot, 'node_modules', '@oceanbase-odc', 'monaco-plugin-ob');
copyDir(fixturePackage, packageRoot);
execFileSync(process.execPath, [patchScript], {
  cwd: tempRoot,
  env: { ...process.env, MONACO_PLUGIN_OB_ROOT: packageRoot },
  stdio: 'pipe'
});
execFileSync(process.execPath, [patchScript], {
  cwd: tempRoot,
  env: { ...process.env, MONACO_PLUGIN_OB_ROOT: packageRoot },
  stdio: 'pipe'
});

const query = fs.readFileSync(path.join(packageRoot, 'dist/model/query.js'), 'utf8');
assertIncludes(query, 'fromMaxIndex = Math.max(stop, fromMaxIndex);', 'V1/V2: FROM/JOIN max range fix is missing');
assertNotIncludes(query, 'fromMaxIndex = Math.max(stop, fromMinIndex);', 'V1/V2: old max range bug still exists');

const dialect = fs.readFileSync(path.join(packageRoot, 'dist/model/dialect/obmysql.js'), 'utf8');
assertIncludes(dialect, 'function flatten_table_references(table)', 'V4/V5/V6: JOIN table flatten helper is missing');
assertIncludes(dialect, 'return resolve_table_references(subTableReferences).concat(tables);', 'V4/V5/V6: JOIN right table is not included in fromTables');

const mysqlDialect = fs.readFileSync(path.join(packageRoot, 'dist/model/dialect/mysql.js'), 'utf8');
assertIncludes(mysqlDialect, 'function flatten_table_sources(table)', 'MySQL: JOIN table flatten helper is missing');
assertIncludes(mysqlDialect, 'const fromTables = flatten_table_sources(leftFrom);', 'MySQL: JOIN right table is not included in fromTables');
if (mysqlDialect.match(/function flatten_table_sources\(table\)/g).length !== 1) {
  throw new Error('MySQL: JOIN table flatten patch is not idempotent');
}

const autoComplete = fs.readFileSync(path.join(packageRoot, 'dist/obmysql/autoComplete/index.js'), 'utf8');
assertIncludes(autoComplete, 'getTableList(model, schema, range, namePrefix)', 'V2/V8: table prefix is not accepted by autocomplete');
assertIncludes(autoComplete, 'getSchemaList(model, range, item.namePrefix)', 'V2/V8: schema prefix is not passed by autocomplete');

const parser = fs.readFileSync(path.join(packageRoot, 'dist/obmysql/worker/parser.js'), 'utf8');
assertIncludes(parser, 'function getTableReferenceTrigger(text, offset)', 'V1/V2/V3: JOIN table fallback is missing');
assertIncludes(parser, 'function getJoinAliasColumnCompletion(text, offset, objectName)', 'V9: JOIN alias column fallback is missing');
assertIncludes(parser, 'String.fromCharCode(10)', 'V9: JOIN alias fallback should avoid newline-sensitive regex source');
assertIncludes(parser, "tail.replaceAll(',', ' ')", 'V9: JOIN alias fallback token scanner is missing');
if (parser.match(/function getTableReferenceTrigger\(text, offset\)/g).length !== 1) {
  throw new Error('V1/V2/V3: JOIN table fallback patch is not idempotent');
}
if (parser.match(/function getJoinAliasColumnCompletion\(text, offset, objectName\)/g).length !== 1) {
  throw new Error('V9: JOIN alias column fallback patch is not idempotent');
}
assertIncludes(parser, "type: 'allSchemas',", 'V1/V2: schema suggestions are missing for JOIN table input');
assertIncludes(parser, 'namePrefix: trigger.namePrefix', 'V2/V8: prefix propagation is missing');
assertIncludes(parser, 'return getTableReferenceCompletions(tableReferenceTrigger);', 'V1/V2: non-dot JOIN table fallback is missing');
assertIncludes(parser, 'return getTableReferenceCompletions(Object.assign', 'V3: schema dot table fallback is missing');
assertIncludes(parser, 'return [aliasColumnCompletion];', 'V9: ON a./ON b. should return tableColumns before objectAccess fallback');

for (const workerName of ['obmysql.js', 'mysql.js']) {
  const workerPath = path.join(packageRoot, 'worker-dist', workerName);
  const bundle = fs.readFileSync(workerPath, 'utf8');
  assertIncludes(bundle, 'E=Math.max(n,E)', `${workerName}: runtime worker bundle range fix is missing`);
  assertIncludes(bundle, 'function $odcJoinTableTrigger(e,t){const E=e.substring(0,t)', `${workerName}: runtime worker bundle JOIN fallback is missing`);
  assertIncludes(bundle, 'function $odcJoinAliasColumn(e,t,E){if(!E)return null;', `${workerName}: runtime worker bundle JOIN alias column fallback is missing`);
  assertIncludes(bundle, 'String.fromCharCode(10)', `${workerName}: runtime worker bundle alias fallback should be newline safe`);
  assertIncludes(bundle, 'if(M)return[M];const q=$odcJoinTableTrigger', `${workerName}: ON a./ON b. alias fallback must run before JOIN table fallback`);
  assertIncludes(bundle, 'if(q)return $odcJoinCompletions(Object.assign', `${workerName}: dot JOIN table fallback is missing`);
  assertIncludes(bundle, 'if(L)return $odcJoinCompletions(L);', `${workerName}: table-position JOIN fallback is missing`);
  if (workerName === 'obmysql.js') {
    assertIncludes(bundle, 'function $odcFlattenJoin(e){if(!e)return[];', `${workerName}: runtime worker bundle JOIN flatten fix is missing`);
  } else {
    assertIncludes(bundle, 'function $odcFlattenMysqlJoin(e){if(!e)return[];', `${workerName}: runtime worker bundle JOIN flatten fix is missing`);
    assertIncludes(bundle, 'const i=$odcFlattenMysqlJoin(T);return s?i.concat(Rt(s)):i', `${workerName}: ON b. alias scope cannot include right JOIN table`);
  }
  execFileSync(process.execPath, ['--check', workerPath], {
    stdio: 'pipe'
  });
}

console.log('monaco LEFT JOIN completion patch checks passed');
