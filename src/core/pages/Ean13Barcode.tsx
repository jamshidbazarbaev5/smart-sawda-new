import { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';

interface Ean13BarcodeProps {
  code: string;
  className?: string;
}

export function Ean13Barcode({ code, className = '' }: Ean13BarcodeProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;
    try {
      JsBarcode(svgRef.current, code, {
        format: 'EAN13',
        width: 2,
        height: 60,
        displayValue: true,
        fontSize: 14,
        textMargin: 2,
        margin: 0,
        background: '#ffffff',
        lineColor: '#000000',
      });
    } catch (e) {
      console.error('Barcode render failed', e);
    }
  }, [code]);

  return <svg ref={svgRef} className={className} />;
}
