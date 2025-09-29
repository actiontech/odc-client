import { BasicCollapseStyleWrapper } from '@actiontech/dms-kit';
import { styled } from '@mui/material';

export const CreateViewStepPanelStyleWrapper = styled('div')`
  padding: 24px;
`;

export const CreateViewCollapseStyleWrapper = styled(BasicCollapseStyleWrapper)`
  border-radius: 4px;
  margin-bottom: 12px !important;

  .ant-collapse-header {
    position: relative;
    padding: 5px 0 5px 0 !important;
    font-size: 14px;
  }

  .ant-tabs-bar.ant-tabs-left-bar {
    height: 200px !important;
  }
`;
