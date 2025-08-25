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

import { formatMessage } from '@/util/intl';
import { Form, Radio, Space } from 'antd';
import { ShardingStrategy } from '@/d.ts';
import HelpDoc from '@/component/helpDoc';

export const shardingStrategyOptions = [
  {
    label: '程序自动匹配',
    value: ShardingStrategy.AUTO,
  },
  {
    label: formatMessage({
      id: 'src.component.Task.component.ShardingStrategyItem.E5A6B481',
      defaultMessage: '全表扫描',
    }),
    value: ShardingStrategy.FIXED_LENGTH,
  },
  {
    label: formatMessage({
      id: 'src.component.Task.component.ShardingStrategyItem.F91EEC6C',
      defaultMessage: '条件匹配',
    }),
    value: ShardingStrategy.MATCH,
  },
];

const ShardingStrategyItem = () => {
  return (
    <Form.Item
      label={
        <Space size={2}>
          <span>
            {formatMessage({
              id: 'src.component.Task.component.ShardingStrategyItem.3BD95C1A',
              defaultMessage: '搜索策略',
            })}
          </span>
          <HelpDoc leftText isTip doc="TaskShardingStrategy" />
        </Space>
      }
      name="shardingStrategy"
      rules={[
        {
          required: true,
          message: formatMessage({
            id: 'src.component.Task.component.ShardingStrategyItem.D5F45B7A',
            defaultMessage: '请选择搜索策略',
          }),
        },
      ]}
    >
      <Radio.Group options={shardingStrategyOptions} />
    </Form.Item>
  );
};

export default ShardingStrategyItem;
