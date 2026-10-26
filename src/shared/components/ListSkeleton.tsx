interface ListSkeletonProps {
  rows?: number;
}

// Mientras llega un dato: esqueleto, no texto.
const ListSkeleton = ({ rows = 5 }: ListSkeletonProps) => {
  const rowKeys = Array.from({ length: rows }, (_, index) => `skeleton-${index}`);

  return (
    <div aria-busy="true" aria-label="Cargando" className="skel-list">
      {rowKeys.map((rowKey) => (
        <div className="skel-line" key={rowKey} />
      ))}
      <div className="skel-line skel-line-short" />
    </div>
  );
};

export default ListSkeleton;
