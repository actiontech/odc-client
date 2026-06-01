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
import { conf, language } from './monarch/hana';
import { IHanaModelOptions } from './service';
import HanaAutoComplete from './autoComplete';
import HanaHover from './hover';

export interface IHanaPlugin {
  setup(languages: string[]): void;
  setModelOptions(modelId: string, options: IHanaModelOptions | null): void;
}

const LANGUAGE_ID = 'hana';

class HanaPlugin implements IHanaPlugin {
  private registeredLanguages: string[] = [];
  private autoCompleteProvider: HanaAutoComplete;
  private hoverProvider: HanaHover;
  private isLanguageRegistered = false;

  constructor() {
    this.autoCompleteProvider = new HanaAutoComplete();
    this.hoverProvider = new HanaHover();
  }

  setup(languages: string[]): void {
    languages.forEach((lang) => {
      if (!this.registeredLanguages.includes(lang)) {
        this.registeredLanguages.push(lang);
      }
    });

    if (!this.isLanguageRegistered) {
      monaco.languages.register({
        id: LANGUAGE_ID
      });

      monaco.languages.setMonarchTokensProvider(LANGUAGE_ID, language);
      monaco.languages.setLanguageConfiguration(LANGUAGE_ID, conf);

      monaco.languages.registerCompletionItemProvider(
        LANGUAGE_ID,
        this.autoCompleteProvider
      );

      monaco.languages.registerHoverProvider(LANGUAGE_ID, this.hoverProvider);

      this.isLanguageRegistered = true;
    }
  }

  setModelOptions(modelId: string, options: IHanaModelOptions | null): void {
    this.autoCompleteProvider.setModelOptions(modelId, options);
    this.hoverProvider.setModelOptions(modelId, options);
  }

  getRegisteredLanguages(): string[] {
    return [...this.registeredLanguages];
  }
}

let plugin: HanaPlugin | null = null;

export function register(language: string): IHanaPlugin {
  language = language || 'hana';

  if (!plugin) {
    plugin = new HanaPlugin();
    plugin.setup([language]);
    return plugin;
  }

  const registeredLanguages = (plugin as any).getRegisteredLanguages?.() || [];
  if (language && !registeredLanguages.includes(language)) {
    plugin.setup([language]);
  }

  return plugin;
}
