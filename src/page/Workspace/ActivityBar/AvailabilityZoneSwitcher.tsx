import React, { useState, useCallback } from 'react';
import { Modal, Space, Typography } from 'antd';
import Icon from '@ant-design/icons';
import { ItemsWrapperStyleWrapper, NavItemStyleWrapper } from './style';
import {
  BasicButton,
  BasicDrawer,
  BasicSelect,
  BasicToolTip,
  ResponseCode
} from '@actiontech/dms-kit';
import useRecentlySelectedZone from '@actiontech/dms-kit/es/features/useRecentlySelectedZone';
import { formatMessage } from '@/util/intl';
import { useRequest } from 'ahooks';
import { DMSBaseService } from '@/external_api';
import { ReactComponent as ZoneSvg } from '@/svgr/zone.svg';

export interface AvailabilityZoneSwitcherProps {
  collapsed?: boolean;
  iconSize?: number;
  label?: React.ReactNode;
  defaultValue?: string;
}

const AvailabilityZoneSwitcher: React.FC<AvailabilityZoneSwitcherProps> = ({
  collapsed = true,
  iconSize = 16,
  label = '可用区'
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { updateRecentlySelectedZone, availabilityZone } =
    useRecentlySelectedZone();
  const [selectedValue, setSelectedValue] = useState<string | undefined>();
  const onConfirmSwitch = (uid: string) => {
    Modal.confirm({
      title: '确认切换可用区',
      content: '切换可用区将重新加载数据，是否确认？',
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        setDrawerOpen(false);
        updateRecentlySelectedZone({
          uid,
          name: zoneOptions?.find((item) => item.value === uid)?.label
        });
        window.location.reload();
      }
    });
  };

  const { data: zoneOptions, loading: getZoneTipsLoading } = useRequest(() =>
    DMSBaseService.GatewayService.GetGatewayTips().then((res) => {
      if (res.data.code === ResponseCode.SUCCESS) {
        return res.data.data.map((item) => ({
          label: item.name,
          value: item.uid
        }));
      }
      return [];
    })
  );

  const handleOpen = useCallback(() => {
    setDrawerOpen(true);
    setSelectedValue(availabilityZone?.uid);
  }, [availabilityZone?.uid]);

  const handleClose = useCallback(() => {
    setDrawerOpen(false);
  }, []);

  const handleChange = useCallback((value: string) => {
    setSelectedValue(value);
  }, []);

  return (
    <>
      <ItemsWrapperStyleWrapper>
        <BasicToolTip
          title={formatMessage({
            id: 'app.common.availabilityZone',
            defaultMessage: '可用区切换'
          })}
          placement="right"
        >
          <NavItemStyleWrapper $collapsed={collapsed} onClick={handleOpen}>
            <Icon component={ZoneSvg} style={{ fontSize: iconSize }} />
            {!collapsed && (
              <div
                style={{ marginLeft: 8, lineHeight: 1.2, textAlign: 'left' }}
              >
                <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)' }}>
                  {label}
                </div>
                <div style={{ fontSize: 14 }}>
                  {availabilityZone?.name || '-'}
                </div>
              </div>
            )}
          </NavItemStyleWrapper>
        </BasicToolTip>
      </ItemsWrapperStyleWrapper>

      <BasicDrawer
        title={formatMessage({
          id: 'app.common.availabilityZone',
          defaultMessage: '可用区切换'
        })}
        placement="right"
        open={drawerOpen}
        onClose={handleClose}
        footer={
          <Space>
            <BasicButton onClick={handleClose}>
              {formatMessage({
                id: 'app.common.cancel',
                defaultMessage: '取消'
              })}
            </BasicButton>
            <BasicButton
              type="primary"
              onClick={() => {
                if (selectedValue) {
                  onConfirmSwitch(selectedValue);
                }
              }}
            >
              {formatMessage({
                id: 'app.common.confirm',
                defaultMessage: '确认'
              })}
            </BasicButton>
          </Space>
        }
      >
        <Space direction="vertical" size={20} style={{ width: '100%' }}>
          <div>
            <Typography.Text type="secondary">切换至</Typography.Text>
            <BasicSelect
              loading={getZoneTipsLoading}
              style={{ width: '100%', marginTop: 4 }}
              value={selectedValue}
              options={zoneOptions}
              onChange={handleChange}
              placeholder="请选择可用区"
            />
          </div>
        </Space>
      </BasicDrawer>
    </>
  );
};

export default AvailabilityZoneSwitcher;
