const { readdirSync, statSync, renameSync, readFileSync, writeFileSync } = require('fs');
const { join, dirname } = require('path');

function isDirectory(path) {
  try {
    return statSync(path).isDirectory();
  } catch {
    return false;
  }
}

function walk(dir, predicate) {
  const results = [];
  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        results.push(...walk(fullPath, predicate));
      } else if (entry.isFile() && (!predicate || predicate(fullPath))) {
        results.push(fullPath);
      }
    }
  } catch {
    // ignore
  }
  return results;
}

function findDtsFiles(rootDir) {
  return walk(rootDir, (p) => p.endsWith('.d.ts'));
}

function findTsFiles(rootDir) {
  return walk(rootDir, (p) => p.endsWith('.ts'));
}

function renameDtsToType(dtsFiles) {
  for (const file of dtsFiles) {
    const newPath = file.replace(/\.d\.ts$/, '.type.ts');
    try {
      renameSync(file, newPath);
      // eslint-disable-next-line no-console
      console.log(`重命名: ${file} -> ${newPath}`);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn(`重命名失败: ${file}`, e.message);
    }
  }
}

function fixDImportsInTsFiles(tsFiles, rootDir) {
  for (const file of tsFiles) {
    let content;
    try {
      content = readFileSync(file, 'utf8');
    } catch {
      continue;
    }

    const updated = content.replace(/from\s+['"`]([^'"`]*?)\.d['"`]/g, "from '$1.type'");
    if (updated !== content) {
      try {
        writeFileSync(file, updated);
        // eslint-disable-next-line no-console
        console.log(`修复导入语句: ${file.replace(rootDir + '/', '')}`);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn(`写入失败: ${file}`, e.message);
      }
    }
  }
}

function addTsNocheckToTypeFiles(typeFiles) {
  for (const file of typeFiles) {
    let content;
    try {
      content = readFileSync(file, 'utf8');
    } catch {
      continue;
    }

    if (!content.includes('// @ts-nocheck')) {
      const withHeader = '/* eslint-disable */\n// @ts-nocheck\n' + content;
      try {
        writeFileSync(file, withHeader);
        // eslint-disable-next-line no-console
        console.log(`添加 @ts-nocheck: ${file}`);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn(`添加 @ts-nocheck 失败: ${file}`, e.message);
      }
    }
  }
}

/**
 * 处理 API 生成后的类型文件：
 * 1) 重命名 .d.ts 为 .type.ts
 * 2) 修复 TS 文件中对 .d 的导入为 .type
 * 3) 为所有 .type.ts 添加 @ts-nocheck 头
 * @param {string} servicesPath - 例如: /.../src/api/sqle/service
 */
function fixApiTypes(servicesPath) {
  try {
    if (!isDirectory(servicesPath)) {
      throw new Error(`Invalid services path: ${servicesPath}`);
    }

    // 以 service 的上级作为根，覆盖 service 内及同级可能生成的类型
    const rootDir = dirname(servicesPath);

    // 1) 重命名 .d.ts -> .type.ts
    const dtsFiles = findDtsFiles(rootDir);
    renameDtsToType(dtsFiles);

    // 2) 修复所有 .ts 中的 import 'xxx.d' -> 'xxx.type'
    const tsFiles = findTsFiles(rootDir);
    fixDImportsInTsFiles(tsFiles, rootDir);

    // 3) 为 .type.ts 添加 @ts-nocheck
    const typeFiles = tsFiles.filter((f) => f.endsWith('.type.ts'));
    addTsNocheckToTypeFiles(typeFiles);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('处理 API 类型产物失败:', error);
    throw error;
  }
}

module.exports = fixApiTypes;


