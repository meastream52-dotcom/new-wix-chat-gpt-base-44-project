export type Material = "paper" | "bopp-white" | "bopp-clear" | "polyester" | "chrome" | "thermal";
export type Finish = "none" | "matte-laminate" | "gloss-laminate" | "uv-coating" | "cold-foil";
export type LabelShape = "rectangle" | "circle" | "oval" | "custom";

export interface QuoteInput {
  material: Material;
  shape: LabelShape;
  widthIn: number;
  heightIn: number;
  quantity: number;
  colors: number;
  finish: Finish;
  hasBarcode: boolean;
  hasVariableData: boolean;
  isReorder: boolean;
}

export interface QuoteResult {
  unitPriceLow: number;
  unitPriceHigh: number;
  totalLow: number;
  totalHigh: number;
  setupFee: number;
  leadTimeDays: number;
  notes: string[];
}

// Base price per 1000 units at 2" x 3" (standard reference size)
const MATERIAL_BASE: Record<Material, number> = {
  paper: 89,
  thermal: 99,
  "bopp-white": 129,
  "bopp-clear": 149,
  polyester: 179,
  chrome: 229,
};

// Quantity discount factors relative to 1000-unit base
function quantityFactor(qty: number): number {
  if (qty <= 500)   return 1.45;
  if (qty <= 1000)  return 1.00;
  if (qty <= 2500)  return 0.80;
  if (qty <= 5000)  return 0.65;
  if (qty <= 10000) return 0.52;
  if (qty <= 25000) return 0.42;
  return 0.35;
}

// Color multipliers (flexo plates: 4-color is the base reference)
const COLOR_MULTIPLIER: Record<number, number> = {
  1: 0.70,
  2: 0.82,
  3: 0.92,
  4: 1.00,
  5: 1.12,
};

// Flat finish adder (per order)
const FINISH_ADDER: Record<Finish, number> = {
  "none": 0,
  "matte-laminate": 35,
  "gloss-laminate": 35,
  "uv-coating": 50,
  "cold-foil": 85,
};

export function calculateQuote(input: QuoteInput): QuoteResult {
  const { material, shape, widthIn, heightIn, quantity, colors, finish, hasBarcode, hasVariableData, isReorder } = input;

  const sqIn = widthIn * heightIn;
  const sizeFactor = sqIn / 6; // 2" x 3" = 6 sqin reference

  const materialBase = MATERIAL_BASE[material];
  const qFactor = quantityFactor(quantity);
  const colorMul = COLOR_MULTIPLIER[Math.min(Math.max(colors, 1), 5)];

  // Base cost for quantity of 1000, scale to actual quantity
  const basePerThousand = materialBase * sizeFactor * colorMul;
  const scaledBase = basePerThousand * qFactor * (quantity / 1000);

  // Adders
  const finishAdd = FINISH_ADDER[finish];
  const barcodeAdd = hasBarcode ? 20 : 0;
  const variableAdd = hasVariableData ? 45 : 0;

  // Setup fee
  let setupFee = 0;
  if (!isReorder) {
    setupFee = shape === "custom" ? 75 : 0;
  }

  const baseTotal = scaledBase + finishAdd + barcodeAdd + variableAdd + setupFee;

  // ±12% range for the quote
  const totalLow = Math.round(baseTotal * 0.92);
  const totalHigh = Math.round(baseTotal * 1.08);

  const unitPriceLow = parseFloat((totalLow / quantity).toFixed(4));
  const unitPriceHigh = parseFloat((totalHigh / quantity).toFixed(4));

  // Lead time estimate
  let leadTimeDays = 10;
  if (quantity <= 1000 && !hasVariableData) leadTimeDays = 7;
  if (quantity >= 10000) leadTimeDays = 14;
  if (material === "chrome") leadTimeDays += 2;
  if (finish === "cold-foil") leadTimeDays += 3;

  const notes: string[] = [];
  if (hasVariableData) notes.push("Variable data printing requires a print-ready data file.");
  if (finish === "cold-foil") notes.push("Cold foil stamping adds premium metallic accents — proof approval required.");
  if (shape === "custom") notes.push("Custom die shape — $75 die setup fee included for new artwork.");
  if (quantity < 500) notes.push("Minimum order quantity is 500 units. Price reflects 500-unit minimum.");

  return { unitPriceLow, unitPriceHigh, totalLow, totalHigh, setupFee, leadTimeDays, notes };
}

export const MATERIAL_LABELS: Record<Material, string> = {
  paper: "White Paper (Standard)",
  thermal: "Thermal Transfer",
  "bopp-white": "BOPP White (Waterproof)",
  "bopp-clear": "BOPP Clear (No-Label Look)",
  polyester: "White Polyester (Durable)",
  chrome: "Chrome / Metallic",
};

export const FINISH_LABELS: Record<Finish, string> = {
  none: "No Finish",
  "matte-laminate": "Matte Laminate",
  "gloss-laminate": "Gloss Laminate",
  "uv-coating": "UV Coating",
  "cold-foil": "Cold Foil Stamping",
};
