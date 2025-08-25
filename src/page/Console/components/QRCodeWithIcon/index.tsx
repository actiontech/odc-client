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

import React from 'react';
import { Popover, QRCode } from 'antd';
import { ReactComponent as DingSvg } from '@/svgr/dingding.svg';
import styles from './index.less';
import { ConsoleTextConfig } from '../../const';
interface IProps {
  size?: number;
  padding?: number;
}

const QrCodeWithIcon = ({ size = 75 }: IProps) => {
  const renderContent = (qrSize: number, padding: number, iconClassName: string) => (
    <div className={styles.container}>
      <div className={styles.iconContainer}>
        <DingSvg className={iconClassName} />
      </div>
      <div className={styles.qrCodeContainer}>
        <QRCode
          value={ConsoleTextConfig.aboutUs.QRUrl}
          size={qrSize}
          className={styles.qrCode}
          style={{ padding }}
          color="#132039"
        />
      </div>
    </div>
  );

  return (
    <Popover placement="left" content={renderContent(160, 0, styles.circleIconPopover)}>
      {renderContent(size, 5, styles.circleIcon)}
    </Popover>
  );
};

export default QrCodeWithIcon;
