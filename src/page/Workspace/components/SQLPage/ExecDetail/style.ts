import { styled } from '@mui/material';

export const ExplainDrawerStyleWrapper = styled('div')`
  .ant-drawer-body {
    padding-top: 16px;
  }
  .ant-spin-nested-loading + div {
    z-index: 9 !important;
  }
`;

export const CardStyleWrapper = styled('div')`
  border: none;
  border-radius: 4px;
  box-shadow: 0 6px 16px 0 rgba(0, 0, 0, 0.08);

  .ant-descriptions-header {
    margin-bottom: 12px;
  }

  .ant-descriptions-row > th,
  .ant-descriptions-row > td {
    padding-bottom: 2px;
  }

  .ant-descriptions-item-content {
    display: flex;
    justify-content: flex-end;
    color: ${({ theme }) => theme.sharedTheme.uiToken.colorText};
    font-weight: 600;
    font-size: 14px;
    text-align: right;
  }

  .ant-statistic-title {
    position: relative;

    &::before {
      display: inline-block;
      width: 6px;
      height: 6px;
      margin-right: 6px;
      vertical-align: middle;
      background: ${({ theme }) => theme.sharedTheme.uiToken.colorTextTertiary};
      border-radius: 50%;
      content: '';
    }
  }

  .ant-statistic-content {
    padding-left: 12px;
    color: ${({ theme }) => theme.sharedTheme.uiToken.colorText};
    font-weight: 500;
    font-size: 30px;
  }
`;

export const BaseCardStyleWrapper = styled('div')`
  .tech-statistic-field {
    padding: 4px 0;
  }

  .tech-statistic-field-name {
    font-size: 12px;
  }

  .tech-statistic-field-val {
    font-size: 12px;
    line-height: 18px;
  }
`;

export const IOCardStyleWrapper = styled('div')`
  .tech-stats-item {
    padding-left: 0 !important;
  }
`;

export const BasicInfoCardStyleWrapper = styled('div')`
  border: none;
  border-radius: 4px;
  box-shadow: 0 6px 16px 0 rgba(0, 0, 0, 0.08);

  .ant-descriptions-header {
    margin-bottom: 12px;
  }

  .ant-descriptions-row > th,
  .ant-descriptions-row > td {
    padding-bottom: 2px;
  }

  .ant-descriptions-item-content {
    display: flex;
    justify-content: flex-end;
    color: ${({ theme }) => theme.sharedTheme.uiToken.colorText};
    font-weight: 600;
    font-size: 14px;
    text-align: right;
  }

  .tech-statistic-field {
    padding: 4px 0;
  }

  .tech-statistic-field-name {
    font-size: 12px;
  }

  .tech-statistic-field-val {
    font-size: 12px;
    line-height: 18px;
  }
`;

export const TimeStatisticsCardStyleWrapper = styled('div')`
  border: none;
  border-radius: 4px;
  box-shadow: 0 6px 16px 0 rgba(0, 0, 0, 0.08);

  .ant-descriptions-header {
    margin-bottom: 12px;
  }

  .ant-descriptions-row > th,
  .ant-descriptions-row > td {
    padding-bottom: 2px;
  }

  .ant-descriptions-item-content {
    display: flex;
    justify-content: flex-end;
    color: ${({ theme }) => theme.sharedTheme.uiToken.colorText};
    font-weight: 600;
    font-size: 14px;
    text-align: right;
  }

  .ant-statistic-title {
    position: relative;

    &::before {
      display: inline-block;
      width: 6px;
      height: 6px;
      margin-right: 6px;
      vertical-align: middle;
      background: ${({ theme }) => theme.sharedTheme.uiToken.colorTextTertiary};
      border-radius: 50%;
      content: '';
    }
  }

  .ant-statistic-content {
    padding-left: 12px;
    color: ${({ theme }) => theme.sharedTheme.uiToken.colorText};
    font-weight: 500;
    font-size: 30px;
  }
`;

export const IOStatisticsCardStyleWrapper = styled('div')`
  border: none;
  border-radius: 4px;
  box-shadow: 0 6px 16px 0 rgba(0, 0, 0, 0.08);

  .ant-descriptions-header {
    margin-bottom: 12px;
  }

  .ant-descriptions-row > th,
  .ant-descriptions-row > td {
    padding-bottom: 2px;
  }

  .ant-descriptions-item-content {
    display: flex;
    justify-content: flex-end;
    color: ${({ theme }) => theme.sharedTheme.uiToken.colorText};
    font-weight: 600;
    font-size: 14px;
    text-align: right;
  }

  .ant-statistic-title {
    position: relative;

    &::before {
      display: inline-block;
      width: 6px;
      height: 6px;
      margin-right: 6px;
      vertical-align: middle;
      background: ${({ theme }) => theme.sharedTheme.uiToken.colorTextTertiary};
      border-radius: 50%;
      content: '';
    }
  }

  .ant-statistic-content {
    padding-left: 12px;
    color: ${({ theme }) => theme.sharedTheme.uiToken.colorText};
    font-weight: 500;
    font-size: 30px;
  }

  .tech-stats-item {
    padding-left: 0 !important;
  }
`;
