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

const query = fs.readFileSync(path.join(packageRoot, 'dist/model/query.js'), 'utf8');
assertIncludes(query, 'fromMaxIndex = Math.max(stop, fromMaxIndex);', 'V1/V2: FROM/JOIN max range fix is missing');
assertNotIncludes(query, 'fromMaxIndex = Math.max(stop, fromMinIndex);', 'V1/V2: old max range bug still exists');

const dialect = fs.readFileSync(path.join(packageRoot, 'dist/model/dialect/obmysql.js'), 'utf8');
assertIncludes(dialect, 'function flatten_table_references(table)', 'V4/V5/V6: JOIN table flatten helper is missing');
assertIncludes(dialect, 'return resolve_table_references(subTableReferences).concat(tables);', 'V4/V5/V6: JOIN right table is not included in fromTables');

const autoComplete = fs.readFileSync(path.join(packageRoot, 'dist/obmysql/autoComplete/index.js'), 'utf8');
assertIncludes(autoComplete, 'getTableList(model, schema, range, namePrefix)', 'V2/V8: table prefix is not accepted by autocomplete');
assertIncludes(autoComplete, 'getSchemaList(model, range, item.namePrefix)', 'V2/V8: schema prefix is not passed by autocomplete');

const parser = fs.readFileSync(path.join(packageRoot, 'dist/obmysql/worker/parser.js'), 'utf8');
assertIncludes(parser, 'function getTableReferenceTrigger(text, offset)', 'V1/V2/V3: JOIN table fallback is missing');
assertIncludes(parser, "type: 'allSchemas',", 'V1/V2: schema suggestions are missing for JOIN table input');
assertIncludes(parser, 'namePrefix: trigger.namePrefix', 'V2/V8: prefix propagation is missing');
assertIncludes(parser, 'return getTableReferenceCompletions(tableReferenceTrigger);', 'V1/V2: non-dot JOIN table fallback is missing');
assertIncludes(parser, 'return getTableReferenceCompletions(Object.assign', 'V3: schema dot table fallback is missing');

const bundle = fs.readFileSync(path.join(packageRoot, 'worker-dist/obmysql.js'), 'utf8');
assertIncludes(bundle, 'E=Math.max(n,E)', 'Runtime worker bundle range fix is missing');
assertIncludes(bundle, 'function $odcFlattenJoin(e){if(!e)return[];', 'Runtime worker bundle JOIN flatten fix is missing');
assertIncludes(bundle, 'function $odcJoinTableTrigger(e,t){const E=e.substring(0,t)', 'Runtime worker bundle JOIN fallback is missing');
execFileSync(process.execPath, ['--check', path.join(packageRoot, 'worker-dist/obmysql.js')], {
  stdio: 'pipe'
});

console.log('monaco LEFT JOIN completion patch checks passed');
