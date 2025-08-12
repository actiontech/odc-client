import { BasicButton, BasicInput } from '@actiontech/dms-kit';
import { DmsKitDemoStyleWrapper } from './style';
import { FaLessThanEqualOutlined } from '@actiontech/icons';

const DmsKitDemo: React.FC = () => {
  return (
    <DmsKitDemoStyleWrapper>
      DMS kit Demo
      <BasicButton type="primary">test</BasicButton>
      <BasicInput allowClear />
      <FaLessThanEqualOutlined />
    </DmsKitDemoStyleWrapper>
  );
};

export default DmsKitDemo;
