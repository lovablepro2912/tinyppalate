export interface PoisonControlInfo {
  country: string;
  number: string;
  name: string;
  flag: string;
  emergencyNumber: string;
}

export const poisonControlNumbers: Record<string, PoisonControlInfo> = {
  US: {
    country: 'United States',
    number: '1-800-222-1222',
    name: 'Poison Help',
    flag: '🇺🇸',
    emergencyNumber: '911',
  },
  CA: {
    country: 'Canada',
    number: '1-800-268-9017',
    name: 'Poison Control',
    flag: '🇨🇦',
    emergencyNumber: '911',
  },
  GB: {
    country: 'United Kingdom',
    number: '0800 689 1234',
    name: 'NHS Poison Service',
    flag: '🇬🇧',
    emergencyNumber: '999',
  },
  AU: {
    country: 'Australia',
    number: '13 11 26',
    name: 'Poisons Information Centre',
    flag: '🇦🇺',
    emergencyNumber: '000',
  },
  DE: {
    country: 'Germany',
    number: '+49 30 192 40',
    name: 'Giftnotruf',
    flag: '🇩🇪',
    emergencyNumber: '112',
  },
  FR: {
    country: 'France',
    number: '+33 1 40 05 48 48',
    name: 'Centre Antipoison',
    flag: '🇫🇷',
    emergencyNumber: '112',
  },
  IE: {
    country: 'Ireland',
    number: '01 809 2166',
    name: 'Poisons Information Centre',
    flag: '🇮🇪',
    emergencyNumber: '999',
  },
  NZ: {
    country: 'New Zealand',
    number: '0800 764 766',
    name: 'National Poisons Centre',
    flag: '🇳🇿',
    emergencyNumber: '111',
  },
  NL: {
    country: 'Netherlands',
    number: '030 274 8888',
    name: 'Nationaal Vergiftigingen Informatie Centrum',
    flag: '🇳🇱',
    emergencyNumber: '112',
  },
  ES: {
    country: 'Spain',
    number: '+34 91 562 04 20',
    name: 'Servicio de Información Toxicológica',
    flag: '🇪🇸',
    emergencyNumber: '112',
  },
  IT: {
    country: 'Italy',
    number: '+39 06 490 663',
    name: 'Centro Antiveleni',
    flag: '🇮🇹',
    emergencyNumber: '112',
  },
  MX: {
    country: 'Mexico',
    number: '800 123 4567',
    name: 'Centro de Información Toxicológica',
    flag: '🇲🇽',
    emergencyNumber: '911',
  },
  IN: {
    country: 'India',
    number: '+91 11 2658 9391',
    name: 'National Poisons Information Centre',
    flag: '🇮🇳',
    emergencyNumber: '112',
  },
  JP: {
    country: 'Japan',
    number: '+81 29 852 9999',
    name: 'Japan Poison Information Center',
    flag: '🇯🇵',
    emergencyNumber: '119',
  },
  BR: {
    country: 'Brazil',
    number: '0800 722 6001',
    name: 'Centro de Informação Toxicológica',
    flag: '🇧🇷',
    emergencyNumber: '192',
  },
};

export const defaultPoisonControl: PoisonControlInfo = {
  country: 'International',
  number: '112',
  name: 'Emergency Services',
  flag: '🆘',
  emergencyNumber: '112',
};

export function getPoisonControlInfo(countryCode: string): PoisonControlInfo {
  return poisonControlNumbers[countryCode] || defaultPoisonControl;
}
