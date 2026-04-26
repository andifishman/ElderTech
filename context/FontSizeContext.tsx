import React, { createContext, ReactNode, useContext, useState } from 'react';

type FontScale = 'normal' | 'grande' | 'muy grande';

const SCALES: Record<FontScale, number> = {
  'normal': 1,
  'grande': 1.2,
  'muy grande': 1.45,
};

interface FontSizeContextType {
  scale: FontScale;
  multiplier: number;
  setScale: (s: FontScale) => void;
}

const FontSizeContext = createContext<FontSizeContextType>({
  scale: 'normal',
  multiplier: 1,
  setScale: () => {},
});

export function FontSizeProvider({ children }: { children: ReactNode }) {
  const [scale, setScale] = useState<FontScale>('normal');
  return (
    <FontSizeContext.Provider value={{ scale, multiplier: SCALES[scale], setScale }}>
      {children}
    </FontSizeContext.Provider>
  );
}

export const FONT_SCALES = Object.keys(SCALES) as FontScale[];
export function useFontSize() { return useContext(FontSizeContext); }
