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

import * as monaco from 'monaco-editor';
import { conf, language } from './monarch/sqlserver';
import { ISQLServerModelOptions } from './service';
import SQLServerAutoComplete from './autoComplete';
import SQLServerHover from './hover';

// SQL Server 插件接口，提供与 ob-language 插件类似的 API
export interface ISQLServerPlugin {
  setup(languages: string[]): void;
  setModelOptions(
    modelId: string,
    options: ISQLServerModelOptions | null
  ): void;
}

const LANGUAGE_ID = 'sqlserver';

class SQLServerPlugin implements ISQLServerPlugin {
  private registeredLanguages: string[] = [];
  private autoCompleteProvider: SQLServerAutoComplete;
  private hoverProvider: SQLServerHover;
  private isLanguageRegistered = false;

  constructor() {
    this.autoCompleteProvider = new SQLServerAutoComplete();
    this.hoverProvider = new SQLServerHover();
  }

  setup(languages: string[]): void {
    languages.forEach((lang) => {
      if (!this.registeredLanguages.includes(lang)) {
        this.registeredLanguages.push(lang);
      }
    });

    // 只注册一次语言
    if (!this.isLanguageRegistered) {
      // 注册 SQL Server 语言
      monaco.languages.register({
        id: LANGUAGE_ID
      });

      // 设置 Monarch 语法高亮
      monaco.languages.setMonarchTokensProvider(LANGUAGE_ID, language);

      // 设置语言配置
      monaco.languages.setLanguageConfiguration(LANGUAGE_ID, conf);

      // 注册代码补全 Provider
      monaco.languages.registerCompletionItemProvider(
        LANGUAGE_ID,
        this.autoCompleteProvider
      );

      // 注册悬停提示 Provider
      monaco.languages.registerHoverProvider(LANGUAGE_ID, this.hoverProvider);

      this.isLanguageRegistered = true;
    }
  }

  setModelOptions(
    modelId: string,
    options: ISQLServerModelOptions | null
  ): void {
    this.autoCompleteProvider.setModelOptions(modelId, options);
    this.hoverProvider.setModelOptions(modelId, options);
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
