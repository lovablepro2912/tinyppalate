export interface PoisonControlInfo {
  country: string;
  number: string;
  name: string;
  flag: string;
}

export const poisonControlNumbers: Record<string, PoisonControlInfo> = {
  US: {
    country: 'United States',
    number: '1-800-222-1222',
    name: 'Poison Help',
    flag: '🇺🇸',
  },
  CA: {
    country: 'Canada',
    number: '1-800-268-9017',
    name: 'Poison Control',
    flag: '🇨🇦',
  },
  GB: {
    country: 'United Kingdom',
    number: '0800 689 1234',
    name: 'NHS Poison Service',
    flag: '🇬🇧',
  },
  AU: {
    country: 'Australia',
    number: '13 11 26',
    name: 'Poisons Information Centre',
    flag: '🇦🇺',
  },
  DE: {
    country: 'Germany',
    number: '+49 30 192 40',
    name: 'Giftnotruf',
    flag: '🇩🇪',
  },
  FR: {
    country: 'France',
    number: '+33 1 40 05 48 48',
    name: 'Centre Antipoison',
    flag: '🇫🇷',
  },
  IE: {
    country: 'Ireland',
    number: '01 809 2166',
    name: 'Poisons Information Centre',
    flag: '🇮🇪',
  },
  NZ: {
    country: 'New Zealand',
    number: '0800 764 766',
    name: 'National Poisons Centre',
    flag: '🇳🇿',
  },
  NL: {
    country: 'Netherlands',
    number: '030 274 8888',
    name: 'Nationaal Vergiftigingen Informatie Centrum',
    flag: '🇳🇱',
  },
  ES: {
    country: 'Spain',
    number: '+34 91 562 04 20',
    name: 'Servicio de Información Toxicológica',
    flag: '🇪🇸',
  },
  IT: {
    country: 'Italy',
    number: '+39 06 490 663',
    name: 'Centro Antiveleni',
    flag: '🇮🇹',
  },
  MX: {
    country: 'Mexico',
    number: '800 123 4567',
    name: 'Centro de Información Toxicológica',
    flag: '🇲🇽',
  },
  IN: {
    country: 'India',
    number: '+91 11 2658 9391',
    name: 'National Poisons Information Centre',
    flag: '🇮🇳',
  },
  JP: {
    country: 'Japan',
    number: '+81 29 852 9999',
    name: 'Japan Poison Information Center',
    flag: '🇯🇵',
  },
  BR: {
    country: 'Brazil',
    number: '0800 722 6001',
    name: 'Centro de Informação Toxicológica',
    flag: '🇧🇷',
  },
};

export const defaultPoisonControl: PoisonControlInfo = {
  country: 'International',
  number: '112',
  name: 'Emergency Services',
  flag: '🆘',
};

export function getPoisonControlInfo(countryCode: string): PoisonControlInfo {
  return poisonControlNumbers[countryCode] || defaultPoisonControl;
}
