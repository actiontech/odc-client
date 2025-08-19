const generateApiExports = require('./plugin/generateAPIExports');
const fixApiTypes = require('./plugin/fixAPITypes');

module.exports = {
  name: 'api-client-plugin',
  generateComplete(outputPath) {
    // 修复 .d.ts/.type.ts 与导入语句，并为 .type.ts 添加 @ts-nocheck
    fixApiTypes(outputPath);
    // 生成服务导出索引
    generateApiExports(outputPath);
  }
};
