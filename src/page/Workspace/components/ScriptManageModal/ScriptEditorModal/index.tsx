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

import {
  getScript,
  updateScript as updateRemoteScript
} from '@/common/network';
import CommonIDE from '@/component/CommonIDE';
import { updatePageByScriptId } from '@/store/helper/page';
import { formatMessage } from '@/util/intl';
import { Form, Modal, Space, Spin } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import { BasicButton, BasicDrawer, BasicInput } from '@actiontech/dms-kit';

interface IProps {
  visible: boolean;
  scriptId: string;
  onClose: () => void;
  onOk: () => void;
}

const ScriptEditorModal: React.FC<IProps> = function ({
  scriptId,
  visible,
  onClose: propOnClose,
  onOk
}) {
  const [script, setScript] = useState(null);
  const [scriptKey, setScriptKey] = useState(0);
  const [changed, setChanged] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  useEffect(() => {
    if (visible) {
      setChanged(false);
    }
  }, [visible]);
  const onClose = useCallback(() => {
    if (changed) {
      Modal.confirm({
        content: formatMessage({
          id: 'odc.ScriptManageModal.ScriptEditorModal.TheCurrentOperationIsNot',
          defaultMessage: '当前的操作未保存，是否确定关闭窗口？'
        }), //当前的操作未保存，确定要关闭窗口吗?
        title: formatMessage({
          id: 'odc.ScriptManageModal.ScriptEditorModal.CloseWindow',
          defaultMessage: '关闭窗口'
        }), //关闭窗口
        onOk: () => {
          propOnClose();
        }
      });
    } else {
      propOnClose();
    }
  }, [propOnClose, changed]);
  const onSave = async function () {
    // save
    const values = await form.validateFields();
    if (!values) {
      return;
    }
    const file = await updateRemoteScript(
      scriptId,
      script.scriptText,
      values.scriptName
    );

    if (file) {
      updatePageByScriptId(
        file.id,
        {
          title: script.scriptName,
          isSaved: true
        },

        {
          scriptText: script.scriptText,
          scriptName: script.scriptName,
          scriptId: scriptId
        }
      );

      setChanged(false);
      onOk();
    }
  };
  async function updateScript() {
    if (!scriptId) {
      return;
    }
    setLoading(true);
    try {
      const file = await getScript(scriptId);
      setScript({
        scriptText: file.content,
        scriptName: file.scriptMeta.objectName
      });

      setScriptKey(scriptKey + 1);
      form.setFieldsValue({
        scriptText: file.content,
        scriptName: file.scriptMeta.objectName
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    //get script
    updateScript();
  }, [scriptId]);

  const scriptName = script?.scriptName;
  return (
    <BasicDrawer
      width={520}
      destroyOnHidden
      open={visible}
      title={
        formatMessage(
          {
            id: 'odc.ScriptManageModal.ScriptEditorModal.EditScriptScriptname',
            defaultMessage: '编辑脚本({scriptName})'
          },

          { scriptName }
        )
        //`编辑脚本(${scriptName})`
      }
      onClose={onClose}
      footer={
        <Space style={{ float: 'right' }}>
          <BasicButton onClick={onClose} disabled={loading}>
            {
              formatMessage({
                id: 'odc.ScriptManageModal.ScriptEditorModal.Cancel',
                defaultMessage: '取消'
              })

              /*取消*/
            }
          </BasicButton>
          <BasicButton type="primary" onClick={onSave} loading={loading}>
            {
              formatMessage({
                id: 'odc.ScriptManageModal.ScriptEditorModal.Save',
                defaultMessage: '保存'
              })

              /*保存*/
            }
          </BasicButton>
        </Space>
      }
    >
      <Spin spinning={loading}>
        <Form
          onValuesChange={() => {
            setChanged(true);
          }}
          layout="vertical"
          form={form}
          initialValues={script}
        >
          <Form.Item
            name="scriptName"
            label={formatMessage({
              id: 'odc.ScriptManageModal.ScriptEditorModal.ScriptName',
              defaultMessage: '脚本名称'
            })}

            /*脚本名称*/
          >
            <BasicInput />
          </Form.Item>
          <Form.Item
            label={formatMessage({
              id: 'odc.ScriptManageModal.ScriptEditorModal.ScriptContent',
              defaultMessage: '脚本内容'
            })}
            style={{ height: 500 }}
          >
            <div style={{ height: 500 }}>
              <CommonIDE
                session={null}
                key={scriptKey}
                bordered
                initialSQL={script?.scriptText}
                language={'sql'}
                onSQLChange={(sql) => {
                  if (!changed) {
                    setChanged(true);
                  }
                  setScript(Object.assign({}, script, { scriptText: sql }));
                }}
              />
            </div>
          </Form.Item>
        </Form>
      </Spin>
    </BasicDrawer>
  );
};

export default ScriptEditorModal;
