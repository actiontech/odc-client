import { formatMessage } from '@/util/intl';
import React from 'react';
import { inject, observer } from 'mobx-react';
import { UserStore } from '@/store/login';
import { ReactComponent as GroupSvg } from '@/svgr/group.svg';
import { Dropdown, type MenuProps } from 'antd';
import { DatabaseGroup } from '@/d.ts/database';
import { DatabaseGroupTriggerStyleWrapper } from './style';

const items: MenuProps['items'] = [
  {
    key: DatabaseGroup.none,
    label: formatMessage({
      id: 'src.page.Workspace.SideBar.ResourceTree.DatabaseGroup.3C8E637D',
      defaultMessage: '不分组'
    })
  },
  {
    key: DatabaseGroup.project,
    label: formatMessage({
      id: 'src.page.Workspace.SideBar.ResourceTree.DatabaseGroup.EE74D94F',
      defaultMessage: '按项目分组'
    })
  },
  {
    key: DatabaseGroup.dataSource,
    label: formatMessage({
      id: 'src.page.Workspace.SideBar.ResourceTree.DatabaseGroup.14AB54E9',
      defaultMessage: '按数据源分组'
    })
  },
  {
    key: DatabaseGroup.environment,
    label: formatMessage({
      id: 'src.page.Workspace.SideBar.ResourceTree.DatabaseGroup.499C395F',
      defaultMessage: '按环境分组'
    })
  },
  {
    key: DatabaseGroup.connectType,
    label: formatMessage({
      id: 'src.page.Workspace.SideBar.ResourceTree.DatabaseGroup.347628AC',
      defaultMessage: '按类型分组'
    })
  },
  {
    key: DatabaseGroup.cluster,
    label: formatMessage({
      id: 'src.page.Workspace.SideBar.ResourceTree.DatabaseGroup.BD2C3E80',
      defaultMessage: '按集群分组'
    })
  },
  {
    key: DatabaseGroup.tenant,
    label: formatMessage({
      id: 'src.page.Workspace.SideBar.ResourceTree.DatabaseGroup.63870CFD',
      defaultMessage: '按租户分组'
    })
  }
];

interface IProps {
  userStore?: UserStore;
  groupMode: DatabaseGroup;
  setGroupMode: React.Dispatch<React.SetStateAction<DatabaseGroup>>;
}

const Group: React.FC<IProps> = function (props) {
  const { userStore, groupMode, setGroupMode } = props;
  const handleSelectGroupBy = (e) => {
    setGroupMode(e.key as DatabaseGroup);
  };
  const usesItems = items.filter((menuItem) => {
    if (
      userStore?.isPrivateSpace() &&
      [DatabaseGroup.project, DatabaseGroup.none].includes(
        menuItem.key as DatabaseGroup
      )
    ) {
      return false;
    }
    return true;
  });
  return (
    <Dropdown
      menu={{
        selectedKeys: [groupMode],
        items: usesItems,
        onClick: handleSelectGroupBy
      }}
    >
      <DatabaseGroupTriggerStyleWrapper
        component={GroupSvg}
        $selected={groupMode !== DatabaseGroup.none}
      />
    </Dropdown>
  );
};
export default inject('userStore')(observer(Group));
