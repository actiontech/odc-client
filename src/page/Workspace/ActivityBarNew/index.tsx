/*
 * Copyright 2025
 */

import React, { useMemo, useState, useContext, useCallback } from 'react';
import { Space } from 'antd';
import Icon from '@ant-design/icons';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BulbOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { inject, observer } from 'mobx-react';

import { ReactComponent as DBSvg } from '@/svgr/database_outline.svg';
import { ReactComponent as TaskSvg } from '@/svgr/icon_task.svg';
import { ReactComponent as ManagerSvg } from '@/svgr/operate.svg';
import { ReactComponent as CodeSvg } from '@/svgr/Snippet.svg';

import { ActivityBarItemType, ActivityBarItemTypeText } from '../ActivityBar/type';
import ActivityBarContext from '../context/ActivityBarContext';

import { formatMessage } from '@/util/intl';
import { getFirstEnabledTask } from '@/component/Task/helper';
import { openTasksPage } from '@/store/helper/page';

import Logo from '../ActivityBar/Logo';
import SettingItem from '@/layout/SpaceContainer/Sider/SettingItem';
import HelpItem from '@/layout/SpaceContainer/Sider/HelpItem';
import MineItem from '@/layout/SpaceContainer/Sider/MineItem';
import MenuItem from '@/layout/SpaceContainer/Sider/MenuItem';
import {
  ActivityBarRootStyleWrapper,
  TopSectionStyleWrapper,
  BottomSectionStyleWrapper,
  HeaderStyleWrapper,
  ItemsWrapperStyleWrapper,
  NavItemStyleWrapper,
  ItemLabelStyleWrapper,
  ToggleButtonStyleWrapper,
  DividerLineStyleWrapper,
} from './style';
import { BasicToolTip } from '@actiontech/dms-kit';

interface IItem {
  title: string;
  key: ActivityBarItemType;
  icon: React.ComponentType;
  isVisible?: boolean;
}

interface IProps {}

const ActivityBarNew: React.FC<IProps> = () => {
  const context = useContext(ActivityBarContext);
  const [collapsed, setCollapsed] = useState<boolean>(true);

  const items: IItem[] = useMemo(
    () => [
      {
        title: ActivityBarItemTypeText[ActivityBarItemType.Database],
        key: ActivityBarItemType.Database,
        icon: DBSvg,
        isVisible: true,
      },
      {
        title: ActivityBarItemTypeText[ActivityBarItemType.Script],
        key: ActivityBarItemType.Script,
        icon: CodeSvg,
        isVisible: true,
      },
      {
        title: ActivityBarItemTypeText[ActivityBarItemType.Task],
        key: ActivityBarItemType.Task,
        icon: TaskSvg,
        isVisible: true,
      },
      {
        title: ActivityBarItemTypeText[ActivityBarItemType.Manager],
        key: ActivityBarItemType.Manager,
        icon: ManagerSvg,
        isVisible: true,
      },
    ],
    [],
  );

  const handleItemClick = useCallback(
    async (item: IItem) => {
      if (item.key === context?.activeKey) {
        (context?.setActiveKey as any)?.(null);
        return;
      }
      if (item.key === ActivityBarItemType.Task) {
        const firstEnabledTask = getFirstEnabledTask();
        if (firstEnabledTask) {
          openTasksPage(firstEnabledTask?.value);
        }
      }
      context?.setActiveKey?.(item.key);
    },
    [context],
  );

  return (
    <ActivityBarRootStyleWrapper $collapsed={collapsed}>
      <TopSectionStyleWrapper>
        <HeaderStyleWrapper>
          <Logo />
        </HeaderStyleWrapper>
        <ItemsWrapperStyleWrapper>
          <Space size={8} direction="vertical">
            {items
              .filter((i) => i.isVisible)
              .map((item) => {
                const ActiveIcon = item.icon as any;
                const isActive = context?.activeKey === item.key;
                return (
                  <BasicToolTip key={item.key} title={item.title} placement="right">
                    <NavItemStyleWrapper
                      $active={isActive}
                      $collapsed={collapsed}
                      onClick={() => handleItemClick(item)}
                    >
                      <Icon component={ActiveIcon} style={{ fontSize: 16 }} />
                      <ItemLabelStyleWrapper hidden={collapsed}>{item.title}</ItemLabelStyleWrapper>
                    </NavItemStyleWrapper>
                  </BasicToolTip>
                );
              })}
          </Space>
        </ItemsWrapperStyleWrapper>
      </TopSectionStyleWrapper>

      <BottomSectionStyleWrapper>
        {/* <ToggleButtonStyleWrapper onClick={() => setCollapsed((v) => !v)}>
          <Icon
            component={collapsed ? MenuUnfoldOutlined : MenuFoldOutlined}
            style={{ fontSize: 16 }}
          />
          <ItemLabelStyleWrapper>
            {collapsed
              ? formatMessage({ id: 'odc.Workspace.ActivityBarNew.Expand', defaultMessage: '展开' })
              : formatMessage({
                  id: 'odc.Workspace.ActivityBarNew.Collapse',
                  defaultMessage: '折叠',
                })}
          </ItemLabelStyleWrapper>
        </ToggleButtonStyleWrapper> */}
        <DividerLineStyleWrapper />
        <Space size={8} direction="vertical">
          <SettingItem collapsed={collapsed} />
          <HelpItem>
            <MenuItem
              disableTip={true}
              icon={BulbOutlined}
              collapsed={collapsed}
              label={formatMessage({ id: 'odc.Index.Sider.Help', defaultMessage: '帮助' })}
            />
          </HelpItem>
          <MineItem>
            <MenuItem
              disableTip={true}
              icon={UserOutlined}
              collapsed={collapsed}
              label={formatMessage({ id: 'odc.Index.Sider.Mine', defaultMessage: '我的' })}
            />
          </MineItem>
        </Space>
      </BottomSectionStyleWrapper>
    </ActivityBarRootStyleWrapper>
  );
};

export default inject()(observer(ActivityBarNew));
