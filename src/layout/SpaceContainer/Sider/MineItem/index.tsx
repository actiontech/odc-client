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
import { message } from 'antd';
import { inject, observer } from 'mobx-react';
import React, { useMemo, useRef, useState } from 'react';
import { ModalStore } from '@/store/modal';
import tracert from '@/util/tracert';
import Locale from './Locale';
import odc from '@/plugins/odc';
import { BasicToolTip, EmptyBox } from '@actiontech/dms-kit';
import ContextMenu from '../ContextMenu';
import { ContextMenuItem } from '../ContextMenu/index.type';
import {
  ArrowRightCircleFilled,
  EditFilled,
  LanguageFilled,
  ProfileEditFilled
} from '@actiontech/icons';

interface IProps {
  userStore?: UserStore;
  settingStore?: SettingStore;
  modalStore?: ModalStore;
}

const MineItem: React.FC<IProps> = function ({
  children,
  userStore,
  settingStore
}) {
  const { user } = userStore;
  const [changePasswordModalVisible, setChangePasswordModalVisible] =
    useState(false);
  const [changeLockPwdModalVisible, setChangeLockPwdModalVisible] =
    useState(false);
  const [changePasswordLoading, setChangePasswordLoading] = useState(false);
  const recordRef = useRef<RecordRef>();
  const havePasswordLogin =
    !!settingStore.serverSystemInfo?.passwordLoginEnabled;
  const showUserInfo = !isClient();
  const allowEditUser = !haveOCP() && showUserInfo;
  const userName = `${user?.name}(${user?.accountName})`;

  const onChangePassword = async (data: {
    currentPassword: string;
    newPassword: string;
  }) => {
    setChangePasswordLoading(true);

    const success = await userStore.changePassword(data);
    if (success) {
      setChangePasswordModalVisible(false);
      message.success(
        formatMessage({
          id: 'password.change.success',
          defaultMessage: '修改密码成功'
        })
      );
    }
    setChangePasswordLoading(false);
  };

  const menuItems: ContextMenuItem[] = useMemo(() => {
    const menus: ContextMenuItem[] = [];

    const handleLogout = async () => {
      try {
        await userStore.logout();
        message.success(
          formatMessage({
            id: 'login.logout.success',
            defaultMessage: '登出成功'
          })
        );
        // 专有云 - 重新获取登录定向地址
        userStore.gotoLogoutPage();
      } catch (e) {}
    };

    // if (allowEditUser && havePasswordLogin) {
    //   menus.push({
    //     icon: <EditFilled />,
    //     key: 'change-password',
    //     text: formatMessage({
    //       id: 'odc.component.GlobalHeader.ChangePassword',
    //       defaultMessage: '修改密码'
    //     }),
    //     onClick: () => {
    //       setChangePasswordModalVisible(true);
    //     }
    //   });
    // }

    if (isClient()) {
      menus.push({
        key: 'change-lock-password',
        text: formatMessage({
          id: 'odc.component.LoginMenus.ApplicationPassword',
          defaultMessage: '应用密码'
        }),
        onClick: () => {
          setChangeLockPwdModalVisible(true);
        }
      });
    }
    if (odc.appConfig.locale.menu) {
      menus.push({
        icon: <LanguageFilled />,
        text: <Locale />,
        key: 'locale'
      });
    }

    // if (settingStore.enablePersonalRecord) {
    //   menus.push({
    //     key: 'record',
    //     icon: <ProfileEditFilled />,
    //     text: formatMessage({
    //       id: 'odc.Sider.MineItem.OperationRecord',
    //       defaultMessage: '操作记录'
    //     }),
    //     onClick: () => {
    //       tracert.click('a3112.b46782.c330850.d367366');
    //       recordRef.current?.handleOpenDrawer();
    //     }
    //   });
    // }

    if (allowEditUser) {
      menus.push({
        icon: <ArrowRightCircleFilled />,
        key: 'exit',
        text: formatMessage({
          id: 'odc.Sider.MineItem.Exit',
          defaultMessage: '退出'
        }),
        onClick: handleLogout
      });
    }
    return menus;
  }, [
    allowEditUser,
    havePasswordLogin,
    settingStore.enablePersonalRecord,
    userStore
  ]);

  return (
    <>
      <ContextMenu
        popoverProps={{
          onOpenChange: (v) => {
            if (v) {
              tracert.expo('a3112.b46782.c330850');
            }
          },
          placement: 'right'
        }}
        items={menuItems}
        header={
          <EmptyBox if={showUserInfo}>
            <BasicToolTip placement="right" title={userName}>
              <span>{userName}</span>
            </BasicToolTip>
          </EmptyBox>
        }
      >
        {children}
      </ContextMenu>

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

export default inject(
  'userStore',
  'settingStore',
  'modalStore'
)(observer(MineItem));
