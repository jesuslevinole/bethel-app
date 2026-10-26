import type { CSSProperties } from 'react';
import type { LoadBar } from '../dashboardData';

interface LoadBarsProps {
  bars: LoadBar[];
  emptyText: string;
  unitLabel: (value: number) => string;
}

// Barras horizontales relativas a la más alta. El ancho es un valor de runtime: va en la variable --load.
const LoadBars = ({ bars, emptyText, unitLabel }: LoadBarsProps) => {
  const highestValue = Math.max(...bars.map((bar) => bar.value), 0);

  if (highestValue === 0) return <p className="load-bars-empty">{emptyText}</p>;

  return (
    <ul className="load-bars">
      {bars.map((bar) => {
        const fillStyle = { '--load': `${(bar.value / highestValue) * 100}%` } as CSSProperties;
        return (
          <li key={bar.id}>
            <div className="load-bar-top">
              <span>{bar.label}</span>
              <span className="load-bar-value">{unitLabel(bar.value)}</span>
            </div>
            <div className="load-bar-track">
              <div className="load-bar-fill" style={fillStyle} />
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export default LoadBars;
