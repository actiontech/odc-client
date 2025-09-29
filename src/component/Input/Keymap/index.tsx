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

import { useControllableValue } from 'ahooks';
import React, { useMemo } from 'react';
import { KEY_CODE_MAP, getKeyCodeText } from './keycodemap';
import { KeyCode, KeyMod } from 'monaco-editor';
import { CustomTagProps } from 'rc-select/lib/BaseSelect';
import { BasicSelect, BasicTag } from '@actiontech/dms-kit';

interface IProps {
  className?: string;
  style?: React.CSSProperties;
  value?: string;
  onChange?: (value: string) => void;
}

const KeymapInput: React.FC<IProps> = (props) => {
  const [value, setValue] = useControllableValue(props, {
    defaultValue: ''
  });

  const displayValue = useMemo(() => {
    return getKeyCodeText(value);
  }, [value]);

  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    const { keyCode, metaKey, ctrlKey, shiftKey, altKey } = e;
    e.preventDefault();
    e.stopPropagation();
    if (keyCode === 8) {
      // del
      setValue('');
      return;
    }
    const monacoKeyCode = KEY_CODE_MAP[keyCode];
    const mod = [];
    metaKey && mod.push(KeyCode.Meta);
    ctrlKey && mod.push(KeyCode.Ctrl);
    shiftKey && mod.push(KeyCode.Shift);
    altKey && mod.push(KeyCode.Alt);
    const isSpecialKey = [
      KeyCode.Ctrl,
      KeyCode.Shift,
      KeyCode.Alt,
      KeyCode.Meta
    ].includes(monacoKeyCode);

    console.log(mod, keyCode, monacoKeyCode);
    const value = isSpecialKey ? [...mod] : [...mod, monacoKeyCode];
    setValue(value.join(','));
  }

  function tagRender(props: CustomTagProps) {
    const { value, onClose } = props;
    const onPreventMouseDown = (event: React.MouseEvent<HTMLSpanElement>) => {
      event.preventDefault();
      event.stopPropagation();
    };
    return (
      <BasicTag
        onMouseDown={onPreventMouseDown}
        closable={false}
        onClose={onClose}
        style={{ marginRight: 3 }}
      >
        {value}
      </BasicTag>
    );
  }
  return (
    <BasicSelect
      mode="multiple"
      value={displayValue}
      allowClear
      onClear={() => {
        setValue('');
      }}
      placeholder=""
      options={[]}
      onKeyDown={onKeyDown}
      tagRender={tagRender}
      open={false}
      style={props.style}
      className={props.className}
    />
  );
};

export default KeymapInput;
