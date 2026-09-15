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

import type {
  ContextMenuConfig,
  ContextMenuRenderProps
} from '@oceanbase-odc/ob-react-data-grid/lib/types';
import settingStore from '@/store/setting';
import { Menu } from 'antd';
import React, { useContext, useEffect, useMemo } from 'react';
import ResultContext from './ResultContext';

function renderConfigMenuItems<R>(
  items: ContextMenuConfig<R>[] | undefined,
  row: R,
  onClose: () => void
) {
  if (!items?.length) {
    return [];
  }
  return items.map((item) => {
    if (item.children?.length) {
      return (
        <Menu.SubMenu key={item.key} title={item.text}>
          {item.children.map((child) => (
            <Menu.Item
              key={child.key}
              disabled={child.disabled}
              onClick={() => {
                child.onClick?.(row);
                onClose();
              }}
            >
              {child.text}
            </Menu.Item>
          ))}
        </Menu.SubMenu>
      );
    }
    return (
      <Menu.Item
        key={item.key}
        disabled={item.disabled}
        onClick={() => {
          item.onClick?.(row);
          onClose();
        }}
      >
        {item.text}
      </Menu.Item>
    );
  });
}

function ResultSetContextMenu<R>(props: ContextMenuRenderProps<R>) {
  const { config, isRowSelected, setContextMenuVisible, row } = props;
  const { gridRef, isEditing } = useContext(ResultContext);

  const selectedRowCount = gridRef?.current?.selectedRows?.size || 0;
  const isSelectMultiRow = selectedRowCount > 1;

  const visibleConfig = !isRowSelected
    ? config
    : config?.filter((item) => item?.isShowRowSelected);

  const closeMenu = () => {
    setContextMenuVisible(false);
  };

  // 与格子复制共用 enableResultSetCopy：开态允许行选中/多行渲染 isShowRowSelected（clipMenu）
  const enableResultSetCopy = settingStore.enableResultSetCopy;

  const menuItems = useMemo(() => {
    if (
      !enableResultSetCopy &&
      (isSelectMultiRow || (isRowSelected && !isEditing))
    ) {
      return [];
    }
    return renderConfigMenuItems(visibleConfig, row, closeMenu);
  }, [
    enableResultSetCopy,
    isSelectMultiRow,
    isRowSelected,
    isEditing,
    visibleConfig,
    row
  ]);

  useEffect(() => {
    if (!menuItems.length) {
      setContextMenuVisible(false);
    }
  }, [menuItems.length, setContextMenuVisible]);

  if (!menuItems.length) {
    return null;
  }

  return (
    <Menu
      data-role="cellMenu"
      getPopupContainer={(triggerNode) =>
        triggerNode.closest('.rdg') || document.body
      }
    >
      {menuItems}
    </Menu>
  );
}

export default ResultSetContextMenu;
