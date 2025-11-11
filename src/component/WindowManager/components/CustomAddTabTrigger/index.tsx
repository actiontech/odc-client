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
import { DownOutlined, PlusOutlined } from '@ant-design/icons';
import { Dropdown, DropdownProps, MenuProps } from 'antd';
import { AddTabTriggerWrapper, AddMoreIconWrapper } from './style';

interface CustomAddTabTriggerProps {
  onNewSQL: () => void;
  onNewPL: () => void;
}

const CustomAddTabTrigger: React.FC<CustomAddTabTriggerProps> = ({
  onNewSQL,
  onNewPL
}) => {
  const handleMenuClick: DropdownProps['menu']['onClick'] = (info) => {
    info.domEvent.stopPropagation();

    switch (info.key) {
      case 'newSQL':
        onNewSQL();
        break;
      case 'newPL':
        onNewPL();
        break;
      default:
        break;
    }
  };

  const menuItems: MenuProps['items'] = [
    {
      label: formatMessage({
        id: 'odc.src.component.WindowManager.NewSQLWindow',
        defaultMessage: '新建 SQL 窗口'
      }),
      key: 'newSQL'
    }
  ];

  return (
    <AddTabTriggerWrapper>
      <PlusOutlined />
      <Dropdown
        trigger={['click']}
        menu={{
          items: menuItems,
          onClick: handleMenuClick
        }}
      >
        <AddMoreIconWrapper
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <DownOutlined />
        </AddMoreIconWrapper>
      </Dropdown>
    </AddTabTriggerWrapper>
  );
};

export default CustomAddTabTrigger;
