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

import { IPage } from '@/d.ts';
import { QuestionCircleFilled } from '@ant-design/icons';
import { Component, ReactNode } from 'react';

import { formatMessage } from '@/util/intl';
import styles from './index.less';
import { WithConfirmModalStyleWrapper } from './style';
import { BasicButton, BasicModal } from '@actiontech/dms-kit';

export default function withConfirmModal(WrappedComponent: any) {
  return class extends Component<
    {
      pageKey: string;
      page: IPage;
      isSaved: boolean;
      startSaving: boolean;
      isShow: boolean;
      params: any;
      showUnsavedModal: boolean;
      /**
       * 未保存的修改
       */
      onUnsavedChange: (pageKey: string) => void;
      /**
       * 修改已保存
       */
      onChangeSaved: (pageKey: string) => void;
      /**
       * 关闭但不保存
       */
      onCloseUnsavedModal: (pageKey: string) => void;
      /**
       * 取消
       */
      onCancelUnsavedModal: () => void;
      /**
       * 关闭并保存
       */
      onSaveAndCloseUnsavedModal: (
        pageKey: string,
        closeImmediately?: boolean
      ) => void;
      /**
       * 关闭当前页面
       */
      closeSelf: () => void;
    },
    {
      unsavedModalTitle: string;
      unsavedModalContent: string;
      unsavedModalSaveButtonText: string | ReactNode;
      disableUnsavedModalCloseUnsaveButton: boolean;
      closeImmediately: boolean;
    }
  > {
    public readonly state = {
      unsavedModalTitle: '',
      unsavedModalContent: '',
      unsavedModalSaveButtonText: formatMessage({
        id: 'app.button.save',
        defaultMessage: '保存'
      }),
      disableUnsavedModalCloseUnsaveButton: false,
      closeImmediately: false
    };

    public render() {
      const {
        pageKey,
        page,
        isSaved,
        startSaving,
        params,
        showUnsavedModal,
        onCloseUnsavedModal,
        onSaveAndCloseUnsavedModal,
        onCancelUnsavedModal,
        onUnsavedChange,
        onChangeSaved,
        closeSelf,
        isShow
      } = this.props;
      const {
        unsavedModalTitle,
        unsavedModalContent,
        unsavedModalSaveButtonText,
        disableUnsavedModalCloseUnsaveButton,
        closeImmediately
      } = this.state;
      return (
        <WithConfirmModalStyleWrapper className="with-confirm-modal">
          <WrappedComponent
            pageKey={pageKey}
            page={page}
            isSaved={isSaved}
            startSaving={startSaving}
            isShow={isShow}
            params={params}
            onUnsavedChange={onUnsavedChange}
            onChangeSaved={onChangeSaved}
            onSetUnsavedModalTitle={(t: string) =>
              this.setState({ unsavedModalTitle: t })
            }
            onSetUnsavedModalContent={(t: string) =>
              this.setState({ unsavedModalContent: t })
            }
            onSetUnsavedModalSaveButtonText={(t: string | ReactNode) =>
              this.setState({ unsavedModalSaveButtonText: t })
            }
            onSetDisableUnsavedModalCloseUnsaveButton={(t: boolean) =>
              this.setState({ disableUnsavedModalCloseUnsaveButton: t })
            }
            onSetCloseImmediately={(t: boolean) =>
              this.setState({ closeImmediately: t })
            }
            closeSelf={closeSelf}
          />

          {showUnsavedModal && (
            <BasicModal
              className={styles.modal}
              centered={true}
              open={showUnsavedModal}
              onOk={() => onSaveAndCloseUnsavedModal(pageKey, closeImmediately)}
              onCancel={onCancelUnsavedModal}
              footer={[
                !disableUnsavedModalCloseUnsaveButton && (
                  <BasicButton
                    key="close"
                    onClick={() => onCloseUnsavedModal(pageKey)}
                  >
                    {formatMessage({
                      id: 'app.button.dontsave',
                      defaultMessage: '不保存'
                    })}
                  </BasicButton>
                ),

                <BasicButton key="back" onClick={onCancelUnsavedModal}>
                  {formatMessage({
                    id: 'app.button.cancel',
                    defaultMessage: '取消'
                  })}
                </BasicButton>,
                <BasicButton
                  key="submit"
                  type="primary"
                  onClick={() =>
                    onSaveAndCloseUnsavedModal(pageKey, closeImmediately)
                  }
                >
                  {unsavedModalSaveButtonText}
                </BasicButton>
              ]}
            >
              <div className="ant-modal-confirm-body">
                <QuestionCircleFilled style={{ color: 'rgb(250, 173, 20)' }} />
                <span className="ant-modal-confirm-title">
                  {unsavedModalTitle}
                </span>
                <div className="ant-modal-confirm-content">
                  {unsavedModalContent}
                </div>
              </div>
            </BasicModal>
          )}
        </WithConfirmModalStyleWrapper>
      );
    }
  };
}
