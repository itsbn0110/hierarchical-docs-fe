import './GlobalStyles.scss';
import type { ReactNode } from 'react';

interface GlobalStylesProps {
  children: ReactNode;
}

function GlobalStyles({ children }: GlobalStylesProps) {
  return children;
}

export default GlobalStyles;
