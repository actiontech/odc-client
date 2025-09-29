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

import { localeList } from '@/constant';
import { defaultLocale, formatMessage } from '@/util/intl';
import { getLocale, setLocale } from '@umijs/max';
import { Radio } from 'antd';
import React from 'react';
import ContextMenu from '../ContextMenu';
import { ArrowRightOutlined } from '@actiontech/icons';
import { LocalLabelStyleWrapper } from './style';
import { useRequest } from 'ahooks';
import {
  LocalStorageWrapper,
  ResponseCode,
  StorageKey,
  SupportLanguage
} from '@actiontech/dms-kit';
import { UserService } from '../../../../external_api/base';

interface IProps {}

const Locale: React.FC<IProps> = function () {
  const locale = getLocale();
  const localeObj =
    localeList.find(
      (item) => item.value.toLowerCase() === locale?.toLowerCase()
    ) ||
    localeList.find(
      (item) => item.value?.toLowerCase() === defaultLocale?.toLowerCase()
    );

  const { run: updateLanguage, loading: updateLanguagePending } = useRequest(
    (language: SupportLanguage) =>
      UserService.UpdateCurrentUser({
        current_user: {
          language
        }
      }).then((res) => {
        if (res.data.code === ResponseCode.SUCCESS) {
          LocalStorageWrapper.set(StorageKey.Language, language);
        }
      }),
    {
      manual: true
    }
  );

  return (
    <ContextMenu
      popoverProps={{
        getPopupContainer: () =>
          document.getElementById('change-language-trigger-node')!,
        placement: 'right'
      }}
      items={localeList.map((item) => ({
        key: item.value,
        text: (
          <Radio
            className="full-width-element"
            checked={localeObj?.value === item.value}
            disabled={updateLanguagePending}
          >
            {item.label}
          </Radio>
        ),
        onClick: () => {
          if (localeObj?.value === item.value) {
            return;
          }
          window._forceRefresh = true;
          setLocale(item.value);
          updateLanguage(item.value as SupportLanguage);

          window._forceRefresh = false;
        }
      }))}
    >
      <LocalLabelStyleWrapper id="change-language-trigger-node">
        <span>
          {formatMessage({
            id: 'odc.Sider.MineItem.Locale.Language',
            defaultMessage: '语言'
          })}
        </span>
        <ArrowRightOutlined />
      </LocalLabelStyleWrapper>
    </ContextMenu>
  );
};

export default Locale;
