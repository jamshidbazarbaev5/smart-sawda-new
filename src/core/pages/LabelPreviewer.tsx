/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Ean13Barcode } from './Ean13Barcode';
// import { LabelConfig } from '../types';
import { Printer, Sparkles } from 'lucide-react';

interface LabelPreviewProps {
  config: any;
  barcodeValue: string;
  layout: 'authentic' | 'classic' | 'modern';
  setLayout: (layout: 'authentic' | 'classic' | 'modern') => void;
}

export const LabelPreview: React.FC<LabelPreviewProps> = ({
  config,
  barcodeValue,
  layout,
  setLayout,
}) => {
  const {
    productName,
    plu,
    pricePerKg,
    weightKg,
    currency,
    pricePerUnitLabel,
    massLabel,
    priceLabel,
    costLabel,
    weightUnit,
  } = config;

  // Calculate total price
  const totalPrice = weightKg * pricePerKg;

  // Format numbers to match receipt look
  const formatValue = (num: number, decimals: number = 2) => {
    return num.toFixed(decimals);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="label-wrapper" className="flex flex-col items-center w-full">
      {/* Top action bar */}
      <div id="preview-actions" className="flex flex-wrap items-center justify-between w-full max-w-sm mb-4 gap-2 bg-gray-50 p-2 rounded-lg border border-gray-200">
        <div id="layout-toggle-group" className="flex items-center gap-1 bg-gray-100 p-1 rounded-md">
          <button
            id="layout-btn-authentic"
            onClick={() => setLayout('authentic')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1 ${
              layout === 'authentic'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
            Photo Match
          </button>
          <button
            id="layout-btn-classic"
            onClick={() => setLayout('classic')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1 ${
              layout === 'classic'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Classic Retail
          </button>
        </div>

        <button
          id="btn-print-label"
          onClick={handlePrint}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-medium transition shadow-sm"
        >
          <Printer className="w-3.5 h-3.5" />
          Print Label
        </button>
      </div>

      {/* Printer Container */}
      <div
        id="print-container"
        className="relative bg-white p-6 md:p-8 rounded-xl border border-gray-300 shadow-xl transition-all duration-300 w-full max-w-[400px]"
      >
        {/* Physical Sticker Simulation */}
        <div
          id="sticker-body"
          className="relative bg-white text-black p-4 border border-gray-400 font-sans print:border-0 print:p-0 print:shadow-none min-h-[500px] flex flex-col justify-between"
          style={{
            boxShadow: '0 0 10px rgba(0,0,0,0.02) inset',
            borderRadius: '4px',
          }}
        >
          {/* Thermal Cutting line (indicative) */}
          <div id="thermal-cut-top" className="absolute top-0 left-0 right-0 border-t border-dashed border-gray-200 print:hidden" />
          
          {layout === 'authentic' && (
            <div id="layout-authentic-view" className="flex flex-col h-full justify-between pt-2">
              {/* UPPER SECTION ROTATED BY -90 DEGREES TO MATCH PHOTO MATCH LAYOUT */}
              <div id="rotated-upper-wrapper" className="relative flex justify-center items-center h-[340px] overflow-hidden mb-4">
                {/* Simulated rotated layout */}
                <div
                  id="rotated-table"
                  className="absolute flex flex-col justify-between w-[320px] h-[320px] transform -rotate-90 origin-center text-[13px] font-mono leading-relaxed p-2"
                >
                  {/* Row 1: PRODUCT NAME */}
                  <div id="rotated-product-name" className="text-lg font-bold uppercase tracking-wider border-b border-black pb-2 text-left shrink-0 truncate max-w-[290px]">
                    {productName}
                  </div>

                  {/* Columns as Rows since we will rotate them */}
                  <div id="rotated-items" className="flex flex-col gap-3 justify-center py-2 text-sm">
                    {/* Mass Field */}
                    <div id="rotated-field-mass" className="flex justify-between items-baseline">
                      <span className="font-bold tracking-widest">{massLabel}</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black font-mono">{formatValue(weightKg, 3)}</span>
                        <span className="font-bold text-xs uppercase">{weightUnit}</span>
                      </div>
                    </div>

                    {/* Price Field */}
                    <div id="rotated-field-price" className="flex justify-between items-baseline">
                      <span className="font-bold tracking-widest">{priceLabel}</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-xl font-black font-mono">{formatValue(pricePerKg, 2)}</span>
                        <span className="text-[11px] font-bold">{pricePerUnitLabel}</span>
                      </div>
                    </div>

                    {/* Cost Field */}
                    <div id="rotated-field-cost" className="flex justify-between items-baseline border-t border-dashed border-black pt-2">
                      <span className="font-bold tracking-widest">{costLabel}</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black font-mono">{formatValue(totalPrice, 2)}</span>
                        <span className="text-xs font-bold">{currency}</span>
                      </div>
                    </div>
                  </div>

                  {/* PLU Footer bar */}
                  <div id="rotated-field-plu" className="flex justify-between items-center pt-2 border-t border-black text-sm shrink-0">
                    <span className="font-bold text-xs">PLU:</span>
                    <span className="text-xl font-bold font-mono bg-black text-white px-2 py-0.5 rounded-sm">{plu}</span>
                  </div>
                </div>
              </div>

              {/* LOWER SECTION: BARCODE (Horizontal, at the bottom) */}
              <div id="barcode-section" className="mt-auto px-1 pt-2 border-t border-black">
                <Ean13Barcode code={barcodeValue} className="w-full" />
                <div id="camscanner-watermark" className="text-[7.5px] text-gray-400 font-mono text-center mt-1 uppercase tracking-widest flex items-center justify-center gap-1 select-none">
                  <div className="w-[8px] h-[8px] border border-gray-300 rounded-sm flex items-center justify-center text-[5px] font-sans">CS</div>
                  Сканировано с CamScanner
                </div>
              </div>
            </div>
          )}

          {layout === 'classic' && (
            <div id="layout-classic-view" className="flex flex-col h-full justify-between pt-2">
              {/* Product Title at top */}
              <div id="classic-title-block" className="border-b-2 border-black pb-3 mb-4">
                <span className="text-[10px] uppercase tracking-widest block font-bold text-gray-500 mb-0.5">ВЗВЕШЕННЫЙ ТОВАР</span>
                <h2 className="text-xl font-black uppercase tracking-wide leading-tight">{productName}</h2>
                <div className="flex justify-between text-xs font-mono mt-1 text-gray-600">
                  <span>код товара: #{plu}</span>
                  <span>PLU: {plu}</span>
                </div>
              </div>

              {/* Data Table */}
              <div id="classic-data-grid" className="grid grid-cols-3 border border-black text-center divide-x divide-black mb-6">
                <div id="classic-grid-mass" className="py-2 bg-gray-50">
                  <span className="text-[10px] font-bold block border-b border-black pb-1">{massLabel} ({weightUnit})</span>
                  <span className="text-lg font-black font-mono block pt-1.5">{formatValue(weightKg, 3)}</span>
                </div>
                <div id="classic-grid-price" className="py-2">
                  <span className="text-[10px] font-bold block border-b border-black pb-1">ЦЕНА ({currency})</span>
                  <span className="text-lg font-black font-mono block pt-1.5">{formatValue(pricePerKg, 2)}</span>
                </div>
                <div id="classic-grid-cost" className="py-2 bg-gray-50">
                  <span className="text-[10px] font-bold block border-b border-black pb-1">{costLabel} ({currency})</span>
                  <span className="text-lg font-black text-indigo-700 font-mono block pt-1.5">{formatValue(totalPrice, 2)}</span>
                </div>
              </div>

              {/* Detail list */}
              <div id="classic-details-list" className="space-y-1.5 text-xs font-mono mb-6 border-t border-dashed border-gray-300 pt-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Дата взвешивания:</span>
                  <span className="font-bold">{new Date().toLocaleDateString('ru-RU')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Время взвешивания:</span>
                  <span className="font-bold">{new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Годен до:</span>
                  <span className="font-bold">
                    {(() => {
                      const expiry = new Date();
                      expiry.setDate(expiry.getDate() + 3);
                      return expiry.toLocaleDateString('ru-RU');
                    })()}
                  </span>
                </div>
              </div>

              {/* Barcode */}
              <div id="classic-barcode-section" className="mt-auto pt-4 border-t-2 border-black">
                <Ean13Barcode code={barcodeValue} className="w-full" />
              </div>
            </div>
          )}

          {/* Thermal Cutting line (indicative) */}
          <div id="thermal-cut-bottom" className="absolute bottom-0 left-0 right-0 border-b border-dashed border-gray-200 print:hidden" />
        </div>
      </div>

      {/* Printing helper styles */}
      <style>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          #print-container {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          #sticker-body {
            border: none !important;
            box-shadow: none !important;
            width: 58mm !important;
            height: auto !important;
            margin: auto !important;
          }
          header, footer, nav, button, aside, #preview-actions, #designer-panel, #title-banner, #camscanner-watermark {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};
