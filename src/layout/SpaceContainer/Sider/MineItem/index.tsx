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

import ChangePasswordModal from '@/component/ChangePasswordModal';
import ChangeLockPwd from '@/component/LoginMenus/ChangeLockPwdModal';
import RecordPopover, { RecordRef } from '@/component/RecordPopover';
import { UserStore } from '@/store/login';
import { SettingStore } from '@/store/setting';
import { haveOCP, isClient } from '@/util/env';
import { formatMessage } from '@/util/intl';
import { Menu, message } from 'antd';
import { inject, observer } from 'mobx-react';
import React, { useRef, useState } from 'react';
import DropMenu from '../DropMenu';

import { ModalStore } from '@/store/modal';
import tracert from '@/util/tracert';
import { ItemType } from 'antd/es/menu/interface';
import styles from './index.less';
import Locale from './Locale';
import odc from '@/plugins/odc';
import { BasicToolTip, PopoverInnerStyleWrapper } from '@actiontech/dms-kit';
import classNames from 'classnames';

interface IProps {
  userStore?: UserStore;
  settingStore?: SettingStore;
  modalStore?: ModalStore;
}

const MineItem: React.FC<IProps> = function ({ children, userStore, settingStore, modalStore }) {
  const { user } = userStore;
  const [changePasswordModalVisible, setChangePasswordModalVisible] = useState(false);
  const [changeLockPwdModalVisible, setChangeLockPwdModalVisible] = useState(false);
  const [changePasswordLoading, setChangePasswordLoading] = useState(false);
  const recordRef = useRef<RecordRef>();
  const havePasswordLogin = !!settingStore.serverSystemInfo?.passwordLoginEnabled;
  const showUserInfo = !isClient();
  const allowEditUser = !haveOCP() && showUserInfo;
  const RoleNames = user?.roles?.length
    ? user?.roles
        ?.filter((item) => item.enabled)
        ?.map((role) => role.name)
        ?.join(' | ')
    : '-';
  const userName = `${user?.name}(${user?.accountName})`;

  const onChangePassword = async (data: { currentPassword: string; newPassword: string }) => {
    setChangePasswordLoading(true);

    const success = await userStore.changePassword(data);
    if (success) {
      setChangePasswordModalVisible(false);
      message.success(
        formatMessage({
          id: 'password.change.success',
          defaultMessage: '修改密码成功',
        }),
      );
    }
    setChangePasswordLoading(false);
  };

  const handleLogout = async () => {
    try {
      await userStore.logout();
      message.success(formatMessage({ id: 'login.logout.success', defaultMessage: '登出成功' }));
      // 专有云 - 重新获取登录定向地址
      userStore.gotoLogoutPage();
    } catch (e) {}
  };
  function getMenu() {
    let menu: Array<{
      label: React.ReactNode;
      key: string;
      onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
      // type?: 'divider';
    }> = [];
    if (showUserInfo) {
      menu = menu.concat([
        {
          label: (
            <BasicToolTip placement="right" title={userName}>
              <span className={styles.userName}>{userName}</span>
            </BasicToolTip>
          ),

          key: 'username',
        },
        {
          key: 'user-role',
          label: (
            <BasicToolTip placement="right" title={RoleNames}>
              <span className={styles.userRoles}>
                {formatMessage({
                  id: 'src.layout.SpaceContainer.Sider.MineItem.642BE38F' /*角色：*/,
                  defaultMessage: '角色：',
                })}
                {RoleNames}
              </span>
            </BasicToolTip>
          ),
        },
        // {
        //   type: 'divider',
        // },
      ]);
    }
    if (allowEditUser && havePasswordLogin) {
      menu.push({
        key: 'change-password',
        label: formatMessage({
          id: 'odc.component.GlobalHeader.ChangePassword',
          defaultMessage: '修改密码',
        }),
        onClick: () => {
          setChangePasswordModalVisible(true);
        },
      });
    }

    if (isClient()) {
      menu.push({
        key: 'change-lock-password',
        label: formatMessage({
          id: 'odc.component.LoginMenus.ApplicationPassword',
          defaultMessage: '应用密码',
        }),
        onClick: () => {
          setChangeLockPwdModalVisible(true);
        },
      });
    }
    if (odc.appConfig.locale.menu) {
      menu.push({
        label: <Locale />,
        key: 'locale',
      });
    }

    if (settingStore.enablePersonalRecord) {
      menu.push({
        key: 'record',
        label: formatMessage({
          id: 'odc.Sider.MineItem.OperationRecord',
          defaultMessage: '操作记录',
        }),
        onClick: () => {
          tracert.click('a3112.b46782.c330850.d367366');
          recordRef.current?.handleOpenDrawer();
        },
      });
    }

    // menu.push({
    //   type: 'divider',
    // });
    if (allowEditUser) {
      menu.push({
        key: 'exit',
        label: formatMessage({
          id: 'odc.Sider.MineItem.Exit',
          defaultMessage: '退出',
        }),
        onClick: handleLogout,
      });
    }
    return menu;
  }

  return (
    <>
      <DropMenu
        onOpenChange={(v) => {
          if (v) {
            tracert.expo('a3112.b46782.c330850');
          }
        }}
        menu={
          // <Menu
          //   selectedKeys={null}
          //   key="user"
          //   className={!isClient() ? styles.userMenu : ''}
          //   items={getMenu()}
          // />
          <PopoverInnerStyleWrapper>
            <div className="content">
              {getMenu().map((menu) => {
                return (
                  <div
                    key={menu.key}
                    className={classNames('content-item')}
                    onClick={(e) => {
                      menu.onClick?.(e);
                    }}
                  >
                    <div className="content-item-text">{menu.label}</div>
                  </div>
                );
              })}
            </div>
          </PopoverInnerStyleWrapper>
        }
      >
        {children}
      </DropMenu>

      {!isClient() && havePasswordLogin ? (
        <ChangePasswordModal
          visible={changePasswordModalVisible}
          onCancel={() => {
            setChangePasswordModalVisible(false);
          }}
          onSave={onChangePassword}
          confirmLoading={changePasswordLoading}
        />
      ) : null}
      {isClient() ? (
        <ChangeLockPwd
          visible={changeLockPwdModalVisible}
          onCloseModal={() => {
            setChangeLockPwdModalVisible(false);
          }}
        />
      ) : null}
      {settingStore.enablePersonalRecord && <RecordPopover ref={recordRef} />}
    </>
  );
};

export default inject('userStore', 'settingStore', 'modalStore')(observer(MineItem));
