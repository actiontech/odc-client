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
import { IPGModelOptions } from '../service';
import simpleParser from '../parser/simpleParser';

class PGHover implements monaco.languages.HoverProvider {
  private modelOptionsMap: Map<string, IPGModelOptions | null> =
    new Map();

  constructor() {}

  public setModelOptions(
    modelId: string,
    options: IPGModelOptions | null
  ) {
    this.modelOptionsMap.set(modelId, options);
  }

  private getModelOptions(modelId: string): IPGModelOptions | null {
    return this.modelOptionsMap.get(modelId) || null;
  }

  provideHover(
    model: monaco.editor.ITextModel,
    position: monaco.Position,
    token: monaco.CancellationToken
  ): monaco.languages.ProviderResult<monaco.languages.Hover> {
    const modelOptions = this.getModelOptions(model.id);
    if (!modelOptions?.getTableDDL) {
      return;
    }

    return new Promise(async (resolve) => {
      const word = model.getWordAtPosition(position);
      if (!word) {
        return resolve(null);
      }

      const delimiter = modelOptions.delimiter || ';';
      const offset = model.getOffsetAt(position);
      const value = model.getValue();

      // 使用简单解析器获取表信息
      const tableInfo = simpleParser.getTableAtOffset(value, offset, delimiter);
      if (!tableInfo || !tableInfo.name) {
        resolve(null);
        return;
      }

      const ddl = await modelOptions.getTableDDL(
        tableInfo.name,
        tableInfo.schema
      );
      if (!ddl) {
        resolve(null);
        return;
      }

      resolve({
        contents: [
          {
            value: '```sql\n' + ddl + '\n```'
          }
        ]
      });
    });
  }
}

export default PGHover;
