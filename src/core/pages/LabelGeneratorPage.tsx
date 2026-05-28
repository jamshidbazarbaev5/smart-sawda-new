import { useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
  Package,
  Scale,
  Coins,
  Receipt,
  Hash,
  Printer,
  Download,
  Copy,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Ean13Barcode } from './Ean13Barcode';

type Category = 'КОНФЕТЫ' | 'ОВОЩИ' | 'ФРУКТЫ' | 'МЯСО' | 'РЫБА' | 'СЫР' | 'ХЛЕБ' | 'ТОВАР';

const CATEGORIES: Category[] = [
  'КОНФЕТЫ', 'ОВОЩИ', 'ФРУКТЫ', 'МЯСО', 'РЫБА', 'СЫР', 'ХЛЕБ', 'ТОВАР',
];

const calcCheckDigit = (digits12: string): number => {
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const d = parseInt(digits12[i], 10);
    sum += i % 2 === 0 ? d : d * 3;
  }
  return (10 - (sum % 10)) % 10;
};

const buildEan13 = (plu: string, weightGrams: number): string => {
  const pluPadded = (plu || '0').replace(/\D/g, '').padStart(5, '0').slice(-5);
  const grams = Math.min(99999, Math.max(0, Math.round(weightGrams)));
  const gramsPadded = String(grams).padStart(5, '0');
  const base12 = `2${pluPadded}${gramsPadded}0`;
  const check = calcCheckDigit(base12);
  return `${base12}${check}`;
};


export default function LabelGeneratorPage() {
  const [category, setCategory] = useState<Category>('КОНФЕТЫ');
  const [productName, setProductName] = useState('Essen Berlingo K');
  const [weight, setWeight] = useState('0.210');
  const [pricePerKg, setPricePerKg] = useState('95000');
  const [plu, setPlu] = useState('284');
  const [layout, setLayout] = useState<'authentic' | 'classic'>('authentic');
  // Portrait label: taller than wide
  const [labelWidth, setLabelWidth] = useState(48);
  const [labelHeight, setLabelHeight] = useState(75);

  const labelRef = useRef<HTMLDivElement>(null);

  const weightNum = Number(weight) || 0;
  const priceNum = Number(pricePerKg) || 0;
  const total = weightNum * priceNum;
  const weightGrams = Math.round(weightNum * 1000);

  const ean13 = useMemo(() => buildEan13(plu, weightGrams), [plu, weightGrams]);

  const handleReset = () => {
    setCategory('КОНФЕТЫ');
    setProductName('Essen Berlingo K');
    setWeight('0.210');
    setPricePerKg('95000');
    setPlu('284');
  };

  const handleCopyEan = async () => {
    try {
      await navigator.clipboard.writeText(ean13);
      toast.success(`EAN-13 ${ean13} скопирован`);
    } catch {
      toast.error('Не удалось скопировать');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPng = () => {
    if (!labelRef.current) return;
    const svg = labelRef.current.querySelector('svg');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const scale = 4;
    canvas.width = svg.viewBox.baseVal.width * scale || 200 * scale;
    canvas.height = svg.viewBox.baseVal.height * scale || 100 * scale;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      if (!ctx) return;
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const a = document.createElement('a');
      a.download = `barcode-${plu}-${weightGrams}g.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
      toast.success('PNG загружен');
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const formatMoney = (n: number) =>
    n.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const previewMm = (mm: number) => mm * 4
  ;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:bg-card">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6 flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Генератор этикеток</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Этикетка с весом для весовых товаров (EAN-13: 2 + PLU + граммы + контрольная цифра)
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="h-4 w-4 mr-1.5" />
              Сброс
            </Button>
            <Button variant="outline" onClick={handleDownloadPng}>
              <Download className="h-4 w-4 mr-1.5" />
              PNG
            </Button>
            <Button onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-1.5" />
              Печать
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_auto]">
          {/* Form column */}
          <div className="space-y-4 max-w-xl">
            <Card>
              <CardContent className="pt-6 space-y-5">
                <div className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                  <Package className="h-4 w-4" /> Товар
                </div>

                <div className="grid gap-4 sm:grid-cols-[180px_1fr]">
                  <div className="space-y-2">
                    <Label>Категория</Label>
                    <Select
                      value={category}
                      onValueChange={(v) => setCategory(v as Category)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="product_name">Название</Label>
                    <Input
                      id="product_name"
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      placeholder="Essen Berlingo K"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-5">
                <div className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                  <Scale className="h-4 w-4" /> Цена и вес
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="weight" className="flex items-center gap-1">
                      <Scale className="h-3.5 w-3.5 text-muted-foreground" />
                      Масса (кг)
                    </Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.001"
                      min="0"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                      className="font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price" className="flex items-center gap-1">
                      <Coins className="h-3.5 w-3.5 text-muted-foreground" />
                      Цена (СУМ/кг)
                    </Label>
                    <Input
                      id="price"
                      type="number"
                      step="100"
                      min="0"
                      value={pricePerKg}
                      onChange={(e) => setPricePerKg(e.target.value)}
                      className="font-mono"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="plu" className="flex items-center gap-1">
                      <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                      PLU код
                    </Label>
                    <Input
                      id="plu"
                      type="number"
                      min="0"
                      max="99999"
                      value={plu}
                      onChange={(e) => setPlu(e.target.value)}
                      className="font-mono"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-lg border-2 border-dashed border-primary/30 bg-primary/5 p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Receipt className="h-4 w-4" />
                    Стоимость
                  </div>
                  <div className="text-2xl font-bold font-mono text-primary">
                    {formatMoney(total)} <span className="text-sm text-muted-foreground">СУМ</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
                  <Printer className="h-4 w-4" /> Размер этикетки (мм)
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="lw">Ширина</Label>
                    <Input
                      id="lw"
                      type="number"
                      min="20"
                      max="120"
                      value={labelWidth}
                      onChange={(e) => setLabelWidth(Number(e.target.value) || 50)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lh">Высота</Label>
                    <Input
                      id="lh"
                      type="number"
                      min="30"
                      max="150"
                      value={labelHeight}
                      onChange={(e) => setLabelHeight(Number(e.target.value) || 70)}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCopyEan}
                  className="w-full inline-flex items-center justify-between rounded-md border bg-muted/30 px-3 py-2 text-sm hover:bg-muted transition-colors"
                >
                  <span className="text-muted-foreground">EAN-13</span>
                  <span className="font-mono font-semibold tracking-wider flex items-center gap-2">
                    {ean13}
                    <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                  </span>
                </button>
              </CardContent>
            </Card>
          </div>

          {/* Preview column */}
          <div className="lg:sticky lg:top-6 self-start w-full max-w-[400px]">
            {/* Layout toggle bar */}
            <div className="flex items-center justify-between w-full mb-4 gap-2 bg-gray-50 p-2 rounded-lg border border-gray-200">
              <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-md">
                <button
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
            </div>

            <div className="rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 p-6 shadow-inner flex justify-center">
              <div
                ref={labelRef}
                id="sticker-body"
                className="relative bg-white text-black shadow-xl font-sans overflow-hidden"
                style={{
                  width: `${previewMm(labelWidth)}px`,
                  minHeight: `${previewMm(labelHeight)}px`,
                  borderRadius: '4px',
                  border: '1px solid #999',
                }}
              >
                {layout === 'authentic' && (
                  <div className="flex flex-col min-h-full">
                    {/* UPPER SECTION ROTATED BY -90 DEGREES */}
                    <div className="relative flex justify-center items-center overflow-hidden"
                      style={{ height: `${previewMm(labelHeight) - previewMm(18)}px` }}>
                      <div
                        className="absolute flex flex-col justify-between"
                        style={{
                          width: `154px`,
                          height: `${previewMm(labelHeight) - previewMm(10)}px`,
                          transform: 'rotate(-90deg)',
                          transformOrigin: 'center center',
                          fontSize: '13px',
                          fontFamily: '"Courier New", Courier, monospace',
                          lineHeight: '1.5',
                          padding: '4px',
                        }}
                      >
                        {/* Product name */}
                        <div className="text-lg font-bold uppercase tracking-wider border-b border-black pb-2 text-left truncate">
                          {productName}
                        </div>

                        {/* Mass / Price / Cost */}
                        <div className="flex flex-col gap-2 justify-center py-2 text-sm">
                          <div className="flex justify-between items-baseline">
                            <span className="font-bold tracking-widest">МАССА</span>
                            <div className="flex items-baseline gap-1">
                              <span className="text-2xl font-black font-mono">{weightNum.toFixed(3)}</span>
                              <span className="font-bold text-xs uppercase">кг</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-baseline">
                            <span className="font-bold tracking-widest">ЦЕНА</span>
                            <div className="flex items-baseline gap-1">
                              <span className="text-xl font-black font-mono">{formatMoney(priceNum)}</span>
                              <span className="text-[11px] font-bold">СУМ/кг</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-baseline border-t border-dashed border-black pt-2">
                            <span className="font-bold tracking-widest">СТОИМОСТЬ</span>
                            <div className="flex items-baseline gap-1">
                              <span className="text-2xl font-black font-mono">{formatMoney(total)}</span>
                              <span className="text-xs font-bold">СУМ</span>
                            </div>
                          </div>
                        </div>

                        {/* PLU */}
                        <div className="flex justify-between items-center pt-2 border-t border-black text-sm shrink-0">
                          <span className="font-bold text-xs">PLU:</span>
                          <span className="text-xl font-bold font-mono bg-black text-white px-2 py-0.5 rounded-sm">{plu}</span>
                        </div>
                      </div>
                    </div>

                    {/* BARCODE SECTION */}
                    <div className="px-2 pt-2 border-t border-black">
                      <Ean13Barcode code={ean13} className="w-full" />
                      <div className="text-[7.5px] text-gray-400 font-mono text-center mt-1 uppercase tracking-widest flex items-center justify-center gap-1 select-none">
                        <div className="w-[8px] h-[8px] border border-gray-300 rounded-sm flex items-center justify-center text-[5px] font-sans">CS</div>
                        Сканировано с CamScanner
                      </div>
                    </div>
                  </div>
                )}

                {layout === 'classic' && (
                  <div className="flex flex-col min-h-full p-4">
                    {/* Product Title */}
                    <div className="border-b-2 border-black pb-3 mb-4">
                      <span className="text-[10px] uppercase tracking-widest block font-bold text-gray-500 mb-0.5">ВЗВЕШЕННЫЙ ТОВАР</span>
                      <h2 className="text-xl font-black uppercase tracking-wide leading-tight">{productName}</h2>
                      <div className="flex justify-between text-xs font-mono mt-1 text-gray-600">
                        <span>код товара: #{plu}</span>
                        <span>PLU: {plu}</span>
                      </div>
                    </div>

                    {/* Data Grid */}
                    <div className="grid grid-cols-3 border border-black text-center divide-x divide-black mb-6">
                      <div className="py-2 bg-gray-50">
                        <span className="text-[10px] font-bold block border-b border-black pb-1">МАССА (кг)</span>
                        <span className="text-lg font-black font-mono block pt-1.5">{weightNum.toFixed(3)}</span>
                      </div>
                      <div className="py-2">
                        <span className="text-[10px] font-bold block border-b border-black pb-1">ЦЕНА (СУМ)</span>
                        <span className="text-lg font-black font-mono block pt-1.5">{formatMoney(priceNum)}</span>
                      </div>
                      <div className="py-2 bg-gray-50">
                        <span className="text-[10px] font-bold block border-b border-black pb-1">СТОИМОСТЬ (СУМ)</span>
                        <span className="text-lg font-black text-indigo-700 font-mono block pt-1.5">{formatMoney(total)}</span>
                      </div>
                    </div>

                    {/* Detail list */}
                    <div className="space-y-1.5 text-xs font-mono mb-6 border-t border-dashed border-gray-300 pt-3">
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
                    <div className="mt-auto pt-4 border-t-2 border-black">
                      <Ean13Barcode code={ean13} className="w-full" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-3 text-xs text-muted-foreground text-center max-w-xs mx-auto">
              Сканер кассы прочитает{' '}
              <span className="font-mono font-semibold">{ean13}</span>{' '}
              и автоматически подставит PLU <span className="font-semibold">{plu}</span> и вес{' '}
              <span className="font-semibold">{weightGrams} г</span>.
            </div>

            <style>{`
              @media print {
                body { background: white !important; color: black !important; }
                #sticker-body {
                  border: none !important;
                  box-shadow: none !important;
                  width: ${labelWidth}mm !important;
                  height: auto !important;
                  margin: auto !important;
                }
                nav, button, aside, .bg-gradient-to-br, .bg-gray-50, [class*="gap-2"] { display: none !important; }
              }
            `}</style>
          </div>
        </div>
      </div>
    </div>
  );
}
