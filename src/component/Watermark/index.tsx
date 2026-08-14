import { useEffect, useMemo, useState } from 'react';

interface WatermarkProps {
  text: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  textColor?: string;
  rotate?: number;
  zIndex?: number;
  theme?: 'light' | 'dark';
  density?: number;
}

const DEFAULT_LIGHT_TEXT_COLOR = 'rgba(0, 0, 0, 0.1)';
const DEFAULT_DARK_TEXT_COLOR = 'rgba(255, 255, 255, 0.1)';

const Watermark: React.FC<WatermarkProps> = ({
  text,
  fontSize = 20,
  fontFamily = 'PlusJakartaSans Medium',
  textColor,
  rotate = -45,
  zIndex = 9999,
  theme = 'light',
  fontWeight = 'bold',
  density = 1
}) => {
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const watermarkDataUrl = useMemo(() => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (context) {
      const scale = window.devicePixelRatio;
      canvas.width = dimensions.width * scale;
      canvas.height = dimensions.height * scale;
      context.scale(scale, scale);

      context.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
      // Prefer explicit textColor for both themes; otherwise follow theme defaults.
      context.fillStyle =
        textColor ??
        (theme === 'dark' ? DEFAULT_DARK_TEXT_COLOR : DEFAULT_LIGHT_TEXT_COLOR);
      context.rotate((rotate * Math.PI) / 180);
      context.fillText(text, 0, 100);

      const metrics = context.measureText(text);
      const textWidth = metrics.width;
      const textHeight = fontSize;

      const spacingX = (textWidth + 180) / density;
      const spacingY = (textHeight + 180) / density;

      for (let y = -canvas.height; y < canvas.height * 2; y += spacingY) {
        for (let x = -canvas.width; x < canvas.width * 2; x += spacingX) {
          context.fillText(text, x, y);
        }
      }
      return canvas.toDataURL();
    }
    return '';
  }, [
    density,
    dimensions.height,
    dimensions.width,
    fontFamily,
    fontSize,
    fontWeight,
    rotate,
    text,
    textColor,
    theme
  ]);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex,
        pointerEvents: 'none',
        backgroundImage: `url(${watermarkDataUrl})`,
        backgroundRepeat: 'repeat'
      }}
    />
  );
};

export default Watermark;
