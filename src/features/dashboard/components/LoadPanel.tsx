import type { LoadBar } from '../dashboardData';
import LoadBars from './LoadBars';

interface LoadPanelProps {
  bars: LoadBar[];
  emptyText: string;
  title: string;
  unitLabel: (value: number) => string;
}

const LoadPanel = ({ bars, emptyText, title, unitLabel }: LoadPanelProps) => (
  <section className="panel">
    <header className="panel-header">
      <h2 className="panel-title">{title}</h2>
    </header>
    <div className="panel-body">
      <LoadBars bars={bars} emptyText={emptyText} unitLabel={unitLabel} />
    </div>
  </section>
);

export default LoadPanel;
