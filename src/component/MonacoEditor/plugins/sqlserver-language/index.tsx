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

// SQL Server 插件接口，提供与 ob-language 插件类似的 API
export interface ISQLServerPlugin {
  setup(languages: string[]): void;
  setModelOptions(modelId: string, options: any): void;
}

class SQLServerPlugin implements ISQLServerPlugin {
  private registeredLanguages: string[] = [];

  setup(languages: string[]): void {
    languages.forEach((lang) => {
      if (!this.registeredLanguages.includes(lang)) {
        this.registeredLanguages.push(lang);
      }
    });
    // SQL Server 使用 Monaco Editor 原生的 SQL 语言支持
    // Monaco Editor 原生支持 'sql' 语言，提供基本的语法高亮和语言服务
    // 这里主要是为了保持 API 一致性
  }

  setModelOptions(modelId: string, options: any): void {
    // SQL Server 插件使用 Monaco Editor 原生的 SQL 语言支持
    // 数据服务接口将通过 Monaco Editor 的 completion provider 等方式提供
    // 这里暂时保留接口，实际的数据服务将在 service.ts 中通过 Monaco API 注册
    // 注意：由于不使用 @oceanbase-odc/monaco-plugin-ob，数据服务的注册方式可能不同
  }

  getRegisteredLanguages(): string[] {
    return [...this.registeredLanguages];
  }
}

let plugin: SQLServerPlugin | null = null;

export function register(language: string): ISQLServerPlugin {
  language = language || 'sqlserver';

  if (!plugin) {
    plugin = new SQLServerPlugin();
    plugin.setup([language]);
    return plugin;
  }

  const registeredLanguages = (plugin as any).getRegisteredLanguages?.() || [];
  if (language && !registeredLanguages.includes(language)) {
    plugin.setup([language]);
  }

  return plugin;
}
