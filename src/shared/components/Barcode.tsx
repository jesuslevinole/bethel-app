import JsBarcode from 'jsbarcode';
import { useEffect, useRef } from 'react';

interface BarcodeProps {
  className?: string;
  value: string;
}

// Código de barras CODE128 en SVG (se imprime nítido a cualquier tamaño).
const Barcode = ({ className, value }: BarcodeProps) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !value) return;
    JsBarcode(svgRef.current, value, {
      background: 'transparent',
      displayValue: false,
      format: 'CODE128',
      height: 36,
      margin: 0,
      width: 1.4,
    });
  }, [value]);

  return <svg aria-label={`Código de barras ${value}`} className={className} ref={svgRef} role="img" />;
};

export default Barcode;
