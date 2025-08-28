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

import { IPage, PageType } from '@/d.ts';
import ResourceTreeContext from '@/page/Workspace/context/ResourceTreeContext';
import { movePagePostion, openNewDefaultPLPage } from '@/store/helper/page';
import { SQLStore } from '@/store/sql';
import { formatMessage } from '@/util/intl';
import tracert from '@/util/tracert';
import { CloseOutlined, EllipsisOutlined } from '@ant-design/icons';
import { Badge, Dropdown, MenuProps, Space } from 'antd';
import { inject, observer } from 'mobx-react';
import { MenuInfo } from 'rc-menu/lib/interface';
import { ReactNode, useContext, useState } from 'react';
import { pageMap } from './config';
import DefaultPage from './components/DefaultPage';
import CustomAddTabTrigger from './components/CustomAddTabTrigger';
import { getPageTitleText } from './helper';
import {
  PageTitleStyleWrapper,
  TitleTextStyleWrapper,
  IconStyleWrapper,
  ExtraStatusBoxStyleWrapper,
  CloseButtonStyleWrapper,
  TooltipTitleStyleWrapper,
  TabBarExtraContentStyleWrapper
} from './style';
import { isGroupNode } from '@/page/Workspace/SideBar/ResourceTree/const';
import { isLogicalDatabase } from '@/util/database';
import { isString } from 'lodash';
import { ResourceNodeType } from '@/page/Workspace/SideBar/ResourceTree/type';
import DraggableTabs from './DraggableTabs';
import { BasicToolTip, EmptyBox } from '@actiontech/dms-kit';

interface IProps {
  pages: IPage[];
  activeKey: string;
  sqlStore?: SQLStore;
  onActivatePage: (activePageKey: string) => void;
  onOpenPage: () => void;
  onOpenPageAfterTarget: (targetPage: IPage) => void;
  onClosePage: (targetPageKey: string) => void;
  onCloseOtherPage: (targetPageKey: string) => void;
  onCopySQLPage: (targetPage: IPage) => void;
  onCloseAllPage: () => void;
  onSavePage: (targetPageKey: string) => void;
  onStartSavingPage: (targetPageKey: string) => void;
  onUnsavedChangePage: (pageKey: string) => void;
}

const WindowManager: React.FC<IProps> = function (props) {
  const [closePageKey, setClosePageKey] = useState<string>(null);
  const treeContext = useContext(ResourceTreeContext);

  const { pages, activeKey, onActivatePage } = props;

  const handleSwitchTab = (clickParam: MenuInfo) => {
    const { onActivatePage } = props;
    onActivatePage(clickParam.key?.toString());
  };

  const handleNewSQL = () => {
    tracert.click('a3112.b41896.c330993.d367629');
    props.onOpenPage();
  };

  const handleNewPL = () => {
    const { value, type } = treeContext.currentObject || {};
    let dbId;
    if (!isGroupNode(type)) {
      if (type === ResourceNodeType.Database) {
        dbId = value;
      }
      if (isString(value)) {
        dbId = Number(value.split('-')?.[0]);
      }
    }
    const isLogicalDb = isLogicalDatabase(
      treeContext?.databaseList?.find((_db) => _db?.id === dbId)
    );
    openNewDefaultPLPage(undefined, isLogicalDb ? null : dbId);
  };

  const handleEditPage = (targetKey: any, action: string) => {
    const { onOpenPage } = props;
    if (action === 'add') {
      tracert.click('a3112.b41896.c330993.d367629');
      onOpenPage();
    }
  };

  /** 处理 Tab 关闭事件 */
  const handleCloseTab = (pageKey: string) => {
    const { pages } = props;
    const targetPage = pages.find((p) => p.key === pageKey);
    if (targetPage && targetPage.isSaved) {
      handleClosePage(pageKey);
    } else {
      setClosePageKey(pageKey);
      props.onActivatePage(pageKey);
    }
  };
  const handleClosePage = (targetKey: string) => {
    const { onClosePage } = props;
    onClosePage(targetKey);
    setClosePageKey('');
  };
  function doTabAction(page: IPage, params: MenuInfo) {
    params.domEvent.stopPropagation();
    const { key } = params;
    switch (key) {
      case 'closePage': {
        return handleCloseTab(page.key);
      }
      case 'closeOtherPage': {
        return props.onCloseOtherPage(page.key);
      }
      case 'closeAllPage': {
        return props.onCloseAllPage();
      }
      case 'openNewPage': {
        return props.onOpenPageAfterTarget(page);
      }
      case 'copyPage': {
        return props.onCopySQLPage(page);
      }
      default: {
      }
    }
  }

  // 处理未保存的修改
  const handleUnsavedChange = (targetKey: string) => {
    const { onUnsavedChangePage } = props;
    onUnsavedChangePage(targetKey);
  };
  const handleChangeSaved = (targetKey: string) => {
    const { onSavePage } = props;
    onSavePage(targetKey);
  };

  /** 未保存弹框点击保存触发的事件 */
  const handleSaveAndClosePage = (
    targetKey: string,
    closeImmediately?: boolean
  ) => {
    const { onStartSavingPage } = props;
    onStartSavingPage(targetKey);
    setClosePageKey('');
    if (closeImmediately) {
      handleClosePage(targetKey);
    }
  };

  // 计算页面状态的辅助函数
  const getPageState = (page: IPage) => {
    const iconColor = page?.params?.isDisabled
      ? '#bfbfbf'
      : pageMap[page.type]?.color;
    const isDocked = page.params.isDocked;
    const pageTitle = getPageTitleText(page);
    const isPageProcessing = props.sqlStore.runningPageKey.has(page.key);
    const isCompiler = [
      PageType.BATCH_COMPILE_FUNCTION,
      PageType.BATCH_COMPILE_PACKAGE,
      PageType.BATCH_COMPILE_PROCEDURE,
      PageType.BATCH_COMPILE_TRIGGER,
      PageType.BATCH_COMPILE_TYPE
    ].includes(page.type);

    return {
      iconColor,
      isDocked,
      pageTitle,
      isPageProcessing,
      isCompiler
    };
  };

  // 页面状态提示内容组件
  const PageTooltipContent = ({
    page,
    pageTitle,
    isCompiler,
    isPageProcessing
  }) => (
    <TooltipTitleStyleWrapper>
      <div>{pageTitle}</div>
      {!page.isSaved && !isCompiler && !isPageProcessing && (
        <Badge
          className="not-saved-badge"
          status="default"
          text={formatMessage({
            id: 'odc.component.WindowManager.NotSaved',
            defaultMessage: '未保存'
          })}
        />
      )}
      {isPageProcessing && (
        <Badge
          className="running-badge"
          status="processing"
          text={formatMessage({
            id: 'odc.component.WindowManager.Running',
            defaultMessage: '运行中'
          })}
        />
      )}
    </TooltipTitleStyleWrapper>
  );

  // 页面状态徽章组件
  const PageStatusBadge = ({ page, isPageProcessing }) => {
    if (isPageProcessing) {
      return <Badge status="processing" />;
    } else if (!page.isSaved) {
      return <Badge status="default" />;
    }
    return null;
  };

  // 页面关闭按钮组件
  const PageCloseButton = ({ page, isDocked, onClose }) => {
    if (isDocked) {
      return <span style={{ width: '8px' }} />;
    }
    return (
      <CloseButtonStyleWrapper
        className="close-btn"
        onClick={(e) => {
          e.stopPropagation();
          onClose(page.key);
        }}
      >
        <CloseOutlined />
      </CloseButtonStyleWrapper>
    );
  };

  // 上下文菜单配置
  const getContextMenuItems = (page, isDocked): MenuProps['items'] =>
    [
      !isDocked && {
        key: 'closePage',
        label: formatMessage({
          id: 'odc.component.WindowManager.CloseThisWindow',
          defaultMessage: '关闭该窗口'
        })
      },
      {
        key: 'closeOtherPage',
        label: formatMessage({
          id: 'odc.component.WindowManager.CloseOtherWindows',
          defaultMessage: '关闭其它窗口'
        })
      },
      !isDocked && {
        key: 'closeAllPage',
        label: formatMessage({
          id: 'odc.component.WindowManager.CloseAllWindows',
          defaultMessage: '关闭所有窗口'
        })
      },
      {
        type: 'divider' as const
      },
      page.type === PageType.SQL && {
        key: 'copyPage',
        label: formatMessage({
          id: 'odc.src.component.WindowManager.CopyTheSQLWindow',
          defaultMessage: '复制 SQL 窗口'
        })
      },
      {
        key: 'openNewPage',
        label: formatMessage({
          id: 'odc.component.WindowManager.OpenANewSqlWindow',
          defaultMessage: '打开新的 SQL 窗口'
        })
      }
    ].filter(Boolean);

  function getPageTitle(page: IPage): ReactNode {
    const { iconColor, isDocked, pageTitle, isPageProcessing, isCompiler } =
      getPageState(page);

    return (
      <Dropdown
        trigger={['contextMenu']}
        menu={{
          onClick: doTabAction.bind(null, page),
          items: getContextMenuItems(page, isDocked)
        }}
      >
        <BasicToolTip
          placement="bottom"
          title={
            <PageTooltipContent
              page={page}
              pageTitle={pageTitle}
              isCompiler={isCompiler}
              isPageProcessing={isPageProcessing}
            />
          }
        >
          <PageTitleStyleWrapper>
            <IconStyleWrapper style={{ color: iconColor }}>
              {pageMap[page.type].icon}
            </IconStyleWrapper>
            <TitleTextStyleWrapper>{pageTitle}</TitleTextStyleWrapper>
            <ExtraStatusBoxStyleWrapper className="extra-status-box">
              <PageStatusBadge
                page={page}
                isPageProcessing={isPageProcessing}
              />
            </ExtraStatusBoxStyleWrapper>
            <PageCloseButton
              page={page}
              isDocked={isDocked}
              onClose={handleCloseTab}
            />
          </PageTitleStyleWrapper>
        </BasicToolTip>
      </Dropdown>
    );
  }

  const existPagesMenu: MenuProps = {
    style: {
      width: 320
    },
    selectedKeys: [activeKey],
    onClick: handleSwitchTab,
    items: pages.map((page) => {
      return {
        key: page.key,
        label: (
          <Space>
            <IconStyleWrapper style={{ color: pageMap[page.type]?.color }}>
              {pageMap[page.type].icon}
            </IconStyleWrapper>
            {getPageTitleText(page)}
          </Space>
        )
      };
    })
  };

  return (
    <EmptyBox if={!!activeKey && !!pages?.length} defaultNode={<DefaultPage />}>
      <DraggableTabs
        className="window-manager-wrapper-tabs"
        onChange={onActivatePage}
        activeKey={activeKey}
        type="editable-card"
        onEdit={handleEditPage}
        moveTabNode={(d, h) => {
          movePagePostion(d, h);
        }}
        tabBarGutter={0}
        addIcon={
          <CustomAddTabTrigger onNewSQL={handleNewSQL} onNewPL={handleNewPL} />
        }
        tabBarExtraContent={
          <Dropdown
            menu={existPagesMenu}
            trigger={['click']}
            placement="bottomRight"
          >
            <TabBarExtraContentStyleWrapper>
              <EllipsisOutlined className="tab-bar-extra-content-icon" />
            </TabBarExtraContentStyleWrapper>
          </Dropdown>
        }
        items={pages
          .map((page) => {
            const Page = pageMap[page.type].component;
            const pageParams = Object.assign(
              {},
              pageMap[page.type].params || {},
              page.params
            );
            if (!Page) {
              return null;
            }
            return {
              key: page.key,
              label: getPageTitle(page),
              closable: false, // hide close btn
              children: (
                <Page
                  page={page}
                  pageKey={page.key}
                  isSaved={page.isSaved}
                  params={pageParams}
                  isShow={activeKey == page.key}
                  showUnsavedModal={closePageKey === page.key}
                  startSaving={page.startSaving}
                  onUnsavedChange={handleUnsavedChange}
                  onChangeSaved={handleChangeSaved}
                  onCloseUnsavedModal={handleClosePage}
                  onCancelUnsavedModal={() => setClosePageKey('')}
                  onSaveAndCloseUnsavedModal={handleSaveAndClosePage}
                  closeSelf={handleCloseTab.bind(null, page.key)}
                />
              )
            };
          })
          .filter(Boolean)}
      />
    </EmptyBox>
  );
};
export default inject('sqlStore')(observer(WindowManager));
