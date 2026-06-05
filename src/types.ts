export interface Layer {
  id: string;
  type: 'text' | 'photo';
  field?: string; // CSV Column name
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  width?: number; // pixels or relative
  height?: number; // pixels or relative
  borderRadius?: number; // percentage or pixels
  fontSize?: number;
  color?: string;
  fontWeight?: string;
  alignment?: 'left' | 'center' | 'right';
}

export interface StudentData {
  [key: string]: string;
}

export interface ProjectState {
  templateImage: string | null;
  csvData: StudentData[];
  photos: Record<string, string>; // filename without extension -> dataUrl
  photoKeyColumn: string;
  layers: Layer[];
  institutionName?: string;
  institutionAddress?: string;
  institutionLogo?: string | null;
  institutionColor?: string;
  useCustomHeader?: boolean;
}

export const STUDENT_CSV_TEMPLATE = "Name,Class,Section,Roll No,Year,Mobile";

export const DEFAULT_CSV_DATA = [
  {
    _id: "record_default_1",
    "Name": "MD. MASUD ALAM",
    "Class": "Ten",
    "Section": "A",
    "Roll No": "01",
    "Year": "2026",
    "Mobile": "01714-804392"
  },
  {
    _id: "record_default_2",
    "Name": "SAYEED ALAM ANIK",
    "Class": "Nine",
    "Section": "B",
    "Roll No": "12",
    "Year": "2026",
    "Mobile": "01815-999999"
  }
];

const DEFAULT_SVG_STRING = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 432" width="280" height="432">
  <!-- White Background -->
  <rect width="280" height="432" fill="#ffffff" />
  
  <!-- Orange/Yellow curves behind -->
  <path d="M 0,0 L 280,0 L 280,145 C 220,125 180,190 0,130 Z" fill="#FFB500" />
  
  <!-- Green curve foreground -->
  <path d="M 0,0 L 280,0 L 280,95 C 220,145 140,95 0,100 Z" fill="#009639" />
  
  <!-- Bottom Right Head Teacher Signature -->
  <path d="M 165,372 C 170,362 172,360 178,364 C 183,368 188,357 192,361 C 196,365 200,355 205,361 Z" fill="none" stroke="#18181b" stroke-width="1.8" stroke-linecap="round" />
  <text x="195" y="385" fill="#18181b" font-size="9" font-family="'Inter', -apple-system, sans-serif" font-weight="800" text-anchor="middle" letter-spacing="0.3">HEAD TEACHER</text>
  <line x1="155" y1="373" x2="235" y2="373" stroke="#d4d4d8" stroke-width="1" />

  <!-- Bottom Left Green/Yellowish Design Pillars -->
  <!-- Lime Green Back Pill -->
  <rect x="-10" y="355" width="115" height="26" rx="13" fill="#a3e635" transform="rotate(-15)" opacity="0.9" stroke="#ffffff" stroke-width="1.5" />
  <!-- Green Main Pill -->
  <rect x="-15" y="360" width="105" height="26" rx="13" fill="#009639" transform="rotate(-15)" stroke="#ffffff" stroke-width="1.5" />
</svg>`;

export const DEFAULT_TEMPLATE_IMAGE = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(DEFAULT_SVG_STRING)));

// Preset 1: Emerald Gold (Classic Premium school/institution)
const EMERALD_GOLD_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 432" width="280" height="432">
  <!-- Subtle off-white base with grid line decorations -->
  <rect width="280" height="432" fill="#fafafa" />
  <path d="M-50,0 Q140,40 280,0 T600,0" fill="none" stroke="#e4e4e7" stroke-width="1.5" opacity="0.3"/>
  <path d="M-50,30 Q140,70 280,30 T600,30" fill="none" stroke="#e4e4e7" stroke-width="1.5" opacity="0.3"/>

  <!-- Top Curved Header in Premium Emerald Green -->
  <path d="M0,0 L280,0 L280,105 C210,120 120,90 0,115 Z" fill="#0b5c2d" />
  
  <!-- Premium Gold Ribbon separating the wave -->
  <path d="M0,115 C120,90 210,120 280,105 L280,111 C210,126 120,96 0,121 Z" fill="#D4AF37" />

  <!-- Geometrical abstract nodes inside header -->
  <circle cx="280" cy="0" r="100" fill="#ffffff" opacity="0.04" />
  <circle cx="0" cy="0" r="70" fill="#ffffff" opacity="0.03" />
  
  <!-- Bottom Wave Deco in Emerald and Gold -->
  <path d="M0,402 Q140,392 280,407 L280,432 L0,432 Z" fill="#0b5c2d" />
  <path d="M0,394 Q140,384 280,399 L280,404 L0,409 Z" fill="#D4AF37" />

  <!-- Signature Placeholder -->
  <path d="M 165,342 Q 180,334 195,344 T 215,339" fill="none" stroke="#1d4ed8" stroke-width="1.2" stroke-linecap="round" opacity="0.6" />
  <text x="190" y="358" fill="#71717a" font-size="8" font-family="'Outfit', 'Inter', sans-serif" font-weight="700" text-anchor="middle" letter-spacing="0.3">HEAD TEACHER / PRINCIPAL</text>
  <line x1="150" y1="348" x2="230" y2="348" stroke="#e4e4e7" stroke-width="1" />
</svg>`;

// Preset 2: Corporate Royal Blue & Amber (Extremely clean & executive)
const ROYAL_BLUE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 432" width="280" height="432">
  <rect width="280" height="432" fill="#f8fafc" />
  <path d="M-50,150 L350,70 L350,450 Z" fill="#eff6ff" opacity="0.5"/>
  
  <!-- Navy Blue clean header banner -->
  <path d="M0,0 L280,0 L280,100 L0,122 Z" fill="#0f172a" />
  <!-- Elegant amber divider -->
  <path d="M0,122 L280,100 L280,106 L0,128 Z" fill="#f59e0b" />
  
  <!-- Polygon overlay elements in header -->
  <polygon points="180,0 280,0 280,70" fill="#1e293b" opacity="0.4"/>
  <polygon points="0,0 100,0 0,80" fill="#1d4ed8" opacity="0.12" stroke="#ffffff" stroke-width="1" />

  <!-- Elegant dual-slit bottom bar of blue & amber -->
  <path d="M0,408 L280,392 L280,432 L0,432 Z" fill="#0f172a" />
  <path d="M0,402 L280,386 L280,391 L0,407 Z" fill="#f59e0b" />
  
  <!-- Inner design border -->
  <rect x="8" y="8" width="264" height="416" fill="none" stroke="#e2e8f0" stroke-width="1" rx="8" opacity="0.7" />

  <!-- Signature line -->
  <path d="M 168,341 Q 185,332 200,344 T 220,338" fill="none" stroke="#000" stroke-width="1.3" stroke-linecap="round" opacity="0.75" />
  <text x="195" y="358" fill="#64748b" font-size="8" font-family="'Outfit', 'Inter', sans-serif" font-weight="800" text-anchor="middle" letter-spacing="0.4">AUTHORITY SIGNATURE</text>
  <line x1="155" y1="348" x2="235" y2="348" stroke="#cbd5e1" stroke-width="1" />
</svg>`;

// Preset 3: Vibrant Crimson & Warm Yellow (Vibrant, creative, and inviting feel)
const CRIMSON_WARM_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 432" width="280" height="432">
  <rect width="280" height="432" fill="#fffaf8" />
  <!-- Modern radial geometry dots watermark in BG -->
  <circle cx="280" cy="220" r="160" fill="none" stroke="#fed7aa" stroke-width="0.8" stroke-dasharray="3 4" opacity="0.6"/>
  <circle cx="280" cy="220" r="110" fill="none" stroke="#fed7aa" stroke-width="0.8" stroke-dasharray="3 4" opacity="0.6"/>

  <!-- Wave Top Header in deep orange-crimson -->
  <path d="M0,0 L280,0 L280,105 Q190,135 120,100 T0,115 Z" fill="#7c2d12" />
  <path d="M0,0 L280,0 L280,95 Q190,125 120,90 T0,105 Z" fill="#ea580c" />
  <path d="M0,0 L240,0 Q160,95 80,60 T0,70 Z" fill="#f97316" opacity="0.25"/>

  <!-- Rounded Bottom in matching palettes -->
  <path d="M0,408 Q140,398 280,413 L280,432 L0,432 Z" fill="#ea580c" />
  <path d="M0,416 Q140,406 280,421 L280,432 L0,432 Z" fill="#7c2d12" />

  <!-- Signature line -->
  <path d="M 165,342 Q 182,333 198,343 T 215,337" fill="none" stroke="#2563eb" stroke-width="1.3" stroke-linecap="round" opacity="0.5" />
  <text x="190" y="358" fill="#9a3412" font-size="8" font-family="'Outfit', 'Inter', sans-serif" font-weight="800" text-anchor="middle" letter-spacing="0.3">PRINCIPAL SIGNATURE</text>
  <line x1="150" y1="348" x2="230" y2="348" stroke="#ffedd5" stroke-width="1" />
</svg>`;

export const TEMPLATE_PRESETS = [
  { id: 'emerald', name: 'Classic Emerald (সবুজ ও সোনালী টিউন)', dataUrl: "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(EMERALD_GOLD_SVG))) },
  { id: 'royal', name: 'Royal Executive (রাজকীয় রয়্যাল ব্লু)', dataUrl: "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(ROYAL_BLUE_SVG))) },
  { id: 'crimson', name: 'Crimson Vibrant (উষ্ণ আধুনিক ক্রিমসন)', dataUrl: "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(CRIMSON_WARM_SVG))) },
  { id: 'simple_bengali', name: 'Original Classic (মূল বাংলাদেশী থিম)', dataUrl: DEFAULT_TEMPLATE_IMAGE }
];


