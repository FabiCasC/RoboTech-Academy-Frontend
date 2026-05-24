export type KitCategory =
  | 'MICROCONTROLADOR'
  | 'SENSOR'
  | 'ACTUADOR'
  | 'CONECTIVIDAD'
  | 'ENERGIA'
  | 'MECANICA'
  | 'CABLEADO';

export interface KitItem {
  id: string;
  category: KitCategory;
  title: string;
  description: string;
  inStock: boolean;
  image: string;
}

export interface KitPin {
  name: string;
  label: string;
  color: 'accent' | 'signal' | 'ground';
}

export interface KitSpec {
  label: string;
  value: string;
}

export interface KitDetail extends KitItem {
  tags: string[];
  subtitle: string;
  pins: KitPin[];
  specs: KitSpec[];
  whatIs: string;
  howItWorks: string;
  howToUse: string[];
  codeFile: string;
  codeSnippet: string;
}
