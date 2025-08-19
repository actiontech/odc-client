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

import Icon from '@ant-design/icons';
import { Badge } from 'antd';
import classNames from 'classnames';
import { BasicToolTip } from '@actiontech/dms-kit';
import { MenuItemIconStyleWrapper, MenuItemStyleWrapper } from './style';

interface IProps {
  collapsed: boolean;
  icon: any;
  label: React.ReactNode;
  selected?: boolean;
  disableTip?: boolean;
  showDot?: boolean;
  onClick?: () => void;
}

const MenuItem: React.FC<IProps> = ({
  collapsed,
  icon,
  label,
  selected,
  disableTip,
  showDot,
  onClick,
  ...rest
}) => {
  if (collapsed) {
    if (disableTip) {
      return (
        <MenuItemIconStyleWrapper
          {...rest}
          onClick={onClick}
          className={classNames('collapsedIcon', {
            selected: selected
          })}
          component={icon}
        />
      );
    }
    return (
      <BasicToolTip title={label} placement="right">
        <Badge dot={showDot}>
          <MenuItemIconStyleWrapper
            {...rest}
            onClick={onClick}
            className={classNames('collapsedIcon', {
              selected: selected
            })}
            component={icon}
          />
        </Badge>
      </BasicToolTip>
    );
  }
  return (
    <MenuItemStyleWrapper
      {...rest}
      onClick={onClick}
      className={classNames('item', { selected: selected })}
    >
      <Icon style={{ fontSize: 14 }} component={icon} />
      <span style={{ marginLeft: 12, lineHeight: 1, flex: 1 }}>{label}</span>
    </MenuItemStyleWrapper>
  );
};

export default MenuItem;
