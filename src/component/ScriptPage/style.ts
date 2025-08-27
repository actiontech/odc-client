import { styled } from '@mui/material';
import { Layout } from 'antd';

export const ScriptPageLayoutStyleWrapper = styled(Layout)`
  min-height: auto;
  height: 100%;
  background: ${({ theme }) =>
    theme.sharedTheme.uiToken.colorBgBase} !important;
`;

export const ContentStyleWrapper = styled(Layout.Content)`
  position: relative;
  background: ${({ theme }) =>
    theme.sharedTheme.uiToken.colorBgBase} !important;
`;

export const StackListStyleWrapper = styled('div')`
  display: flex;
  height: 28px;
  line-height: 28px;
  border-bottom: 1px solid
    ${({ theme }) => theme.sharedTheme.uiToken.colorBorderSecondary};
`;

export const StackItemStyleWrapper = styled('div')`
  position: relative;
  width: 150px;
  padding-right: 12px;
  padding-left: 12px;
  overflow: hidden;
  text-align: center;
  text-overflow: ellipsis;
  border-right: 1px solid
    ${({ theme }) => theme.sharedTheme.uiToken.colorBorderSecondary};
  cursor: pointer;
`;

export const IconActiveStyleWrapper = styled('i')`
  position: absolute;
  top: 50%;
  right: 5px;
  display: inline-block;
  width: 8px;
  height: 8px;
  margin-top: -4px;
  overflow: hidden;
  background: #178bf6;
  border-radius: 8px;
`;
