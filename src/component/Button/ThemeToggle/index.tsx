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

import { SunOutlined, MoonOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import { inject, observer } from 'mobx-react';
import React from 'react';
import { SettingStore, EThemeConfigKey } from '@/store/setting';
import { formatMessage } from '@/util/intl';

interface IProps {
  size?: string;
  style?: React.CSSProperties;
  settingStore?: SettingStore;
}

const ThemeToggle: React.FC<IProps> = ({
  size = '13px',
  style,
  settingStore
}) => {
  const handleClick = () => {
    if (settingStore) {
      const currentTheme = settingStore.theme.key;
      const newTheme =
        currentTheme === EThemeConfigKey.ODC_DARK
          ? EThemeConfigKey.ODC_WHITE
          : EThemeConfigKey.ODC_DARK;
      settingStore.setTheme(newTheme);
    }
  };

  if (!settingStore) {
    return null;
  }

  const isDark = settingStore.theme.key === EThemeConfigKey.ODC_DARK;
  const IconComponent = isDark ? MoonOutlined : SunOutlined;
  const tooltipTitle = isDark
    ? formatMessage({
        id: 'src.component.Button.ThemeToggle.SwitchToLightTheme',
        defaultMessage: '切换到浅色主题'
      })
    : formatMessage({
        id: 'src.component.Button.ThemeToggle.SwitchToDarkTheme',
        defaultMessage: '切换到深色主题'
      });

  return (
    <Tooltip title={tooltipTitle} placement="bottom">
      <IconComponent
        onClick={handleClick}
        style={{
          fontSize: size,
          cursor: 'pointer',
          color: 'var(--icon-color-normal)',
          ...style
        }}
      />
    </Tooltip>
  );
};

export default inject('settingStore')(observer(ThemeToggle));
