import React, { useState } from 'react';
import {
  BasicModal,
  LocalStorageWrapper,
  StorageKey
} from '@actiontech/dms-kit';
import { Spin } from 'antd';
import { DMSIframeModalStyleWrapper } from './style';
import { inject, observer } from 'mobx-react';
import type { ModalStore } from '@/store/modal';

export interface DMSIframeModalProps {
  title: string;
  iframeTitle: string;
  url: URL;
  onClose?: () => void;
  onIframeLoad?: () => void;
}

const DMSIframeModal: React.FC<{ modalStore: ModalStore }> = ({
  modalStore
}) => {
  const [iframeLoading, setIframeLoading] = useState(true);
  const { title, iframeTitle, url, onIframeLoad, onClose } =
    modalStore.dmsIframeModalData ?? {};
  const handleIframeLoad = (e: React.SyntheticEvent<HTMLIFrameElement>) => {
    const iframe = e.currentTarget;
    const token = LocalStorageWrapper.get(StorageKey.Token);

    if (!token) {
      // eslint-disable-next-line no-console
      console.warn('No token found in localStorage.');
      return;
    }

    try {
      if (
        iframe.contentWindow &&
        iframe.contentWindow.location.origin === window.location.origin
      ) {
        iframe.contentWindow.localStorage.setItem(StorageKey.Token, token);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(
        'Could not access iframe localStorage directly (likely due to cross-origin restrictions):',
        error
      );
    }

    // 调用外部的 onLoad 回调
    onIframeLoad?.();
    setIframeLoading(false);
  };

  const renderIframe = () => {
    const iframe = (
      <iframe
        src={url.href}
        title={iframeTitle}
        className="dms-iframe"
        onLoad={handleIframeLoad}
      />
    );

    return (
      <Spin spinning={iframeLoading} delay={600}>
        {iframe}
      </Spin>
    );
  };

  const handleClose = () => {
    modalStore.changeDMSIframeModalVisible(false);
    onClose?.();
    setIframeLoading(true);
  };

  if (!modalStore.dmsIframeModalData) {
    return null;
  }

  return (
    <BasicModal
      title={title}
      open={modalStore.dmsIframeModalVisible}
      onCancel={handleClose}
      footer={null}
      width="90%"
      centered
      destroyOnHidden
      styles={{
        body: {
          padding: 0
        }
      }}
    >
      <Spin spinning={iframeLoading} delay={600}>
        <DMSIframeModalStyleWrapper>
          {renderIframe()}
        </DMSIframeModalStyleWrapper>
      </Spin>
    </BasicModal>
  );
};

export default inject('modalStore')(observer(DMSIframeModal));
