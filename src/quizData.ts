export interface Country {
  id: number
  name: string
  aliases?: string[]
}

export interface SmallDef {
  id: number
  lon: number
  lat: number
  dx: number
  dy: number
}

export interface QuizConfig {
  label: string
  countries: Country[]
  smallDef: SmallDef[]
  total: number
  projCenter: [number, number]
  projScale: number
  regionLabel: string
  winMsg: string
}

export type RegionKey = 'europe' | 'asia' | 'southamerica'

const EUROPE: Country[] = [
  { id: 8,   name: 'Albania' },
  { id: 20,  name: 'Andorra' },
  { id: 40,  name: 'Austria' },
  { id: 112, name: 'Belarus' },
  { id: 56,  name: 'Belgium' },
  { id: 70,  name: 'Bosnia and Herzegovina', aliases: ['Bosnia', 'Bosnia & Herzegovina', 'Bosnia-Herzegovina'] },
  { id: 100, name: 'Bulgaria' },
  { id: 191, name: 'Croatia' },
  { id: 196, name: 'Cyprus' },
  { id: 203, name: 'Czechia',            aliases: ['Czech Republic'] },
  { id: 208, name: 'Denmark' },
  { id: 233, name: 'Estonia' },
  { id: 246, name: 'Finland' },
  { id: 250, name: 'France' },
  { id: 276, name: 'Germany' },
  { id: 300, name: 'Greece' },
  { id: 348, name: 'Hungary' },
  { id: 352, name: 'Iceland' },
  { id: 372, name: 'Ireland' },
  { id: 380, name: 'Italy' },
  { id: -99, name: 'Kosovo' },
  { id: 428, name: 'Latvia' },
  { id: 438, name: 'Liechtenstein' },
  { id: 440, name: 'Lithuania' },
  { id: 442, name: 'Luxembourg' },
  { id: 470, name: 'Malta' },
  { id: 498, name: 'Moldova' },
  { id: 492, name: 'Monaco' },
  { id: 499, name: 'Montenegro' },
  { id: 528, name: 'Netherlands',        aliases: ['Holland', 'The Netherlands'] },
  { id: 807, name: 'North Macedonia',    aliases: ['Macedonia', 'FYR Macedonia'] },
  { id: 578, name: 'Norway' },
  { id: 616, name: 'Poland' },
  { id: 620, name: 'Portugal' },
  { id: 642, name: 'Romania' },
  { id: 643, name: 'Russia' },
  { id: 674, name: 'San Marino' },
  { id: 688, name: 'Serbia' },
  { id: 703, name: 'Slovakia' },
  { id: 705, name: 'Slovenia' },
  { id: 724, name: 'Spain' },
  { id: 752, name: 'Sweden' },
  { id: 756, name: 'Switzerland' },
  { id: 792, name: 'Turkey' },
  { id: 804, name: 'Ukraine' },
  { id: 826, name: 'United Kingdom',     aliases: ['UK', 'Great Britain', 'England', 'Britain'] },
  { id: 336, name: 'Vatican City',       aliases: ['Vatican', 'Holy See'] },
]

const EUROPE_SMALL: SmallDef[] = [
  { id: 20,  lon: 1.58,  lat: 42.55, dx: -48, dy: -22 },
  { id: -99, lon: 20.90, lat: 42.58, dx:  55, dy: -30 },
  { id: 438, lon: 9.55,  lat: 47.17, dx: -50, dy: -22 },
  { id: 470, lon: 14.37, lat: 35.90, dx:  50, dy:  22 },
  { id: 492, lon: 7.40,  lat: 43.74, dx:  50, dy: -22 },
  { id: 674, lon: 12.46, lat: 43.93, dx:  50, dy: -22 },
  { id: 336, lon: 12.45, lat: 41.90, dx:  50, dy:  22 },
]

const ASIA: Country[] = [
  { id: 4,   name: 'Afghanistan' },
  { id: 48,  name: 'Bahrain' },
  { id: 50,  name: 'Bangladesh' },
  { id: 64,  name: 'Bhutan' },
  { id: 96,  name: 'Brunei',              aliases: ['Brunei Darussalam'] },
  { id: 116, name: 'Cambodia' },
  { id: 156, name: 'China' },
  { id: 268, name: 'Georgia' },
  { id: 356, name: 'India' },
  { id: 360, name: 'Indonesia' },
  { id: 364, name: 'Iran' },
  { id: 368, name: 'Iraq' },
  { id: 376, name: 'Israel' },
  { id: 392, name: 'Japan' },
  { id: 400, name: 'Jordan' },
  { id: 398, name: 'Kazakhstan' },
  { id: 414, name: 'Kuwait' },
  { id: 417, name: 'Kyrgyzstan' },
  { id: 418, name: 'Laos' },
  { id: 422, name: 'Lebanon' },
  { id: 458, name: 'Malaysia' },
  { id: 462, name: 'Maldives' },
  { id: 496, name: 'Mongolia' },
  { id: 104, name: 'Myanmar',             aliases: ['Burma'] },
  { id: 524, name: 'Nepal' },
  { id: 408, name: 'North Korea' },
  { id: 512, name: 'Oman' },
  { id: 586, name: 'Pakistan' },
  { id: 608, name: 'Philippines' },
  { id: 634, name: 'Qatar' },
  { id: 682, name: 'Saudi Arabia' },
  { id: 702, name: 'Singapore' },
  { id: 410, name: 'South Korea',         aliases: ['Korea'] },
  { id: 144, name: 'Sri Lanka',           aliases: ['Ceylon'] },
  { id: 760, name: 'Syria' },
  { id: 158, name: 'Taiwan' },
  { id: 762, name: 'Tajikistan' },
  { id: 764, name: 'Thailand' },
  { id: 626, name: 'Timor-Leste',         aliases: ['East Timor'] },
  { id: 792, name: 'Turkey' },
  { id: 795, name: 'Turkmenistan' },
  { id: 784, name: 'United Arab Emirates', aliases: ['UAE'] },
  { id: 860, name: 'Uzbekistan' },
  { id: 704, name: 'Vietnam',             aliases: ['Viet Nam'] },
  { id: 887, name: 'Yemen' },
]

const ASIA_SMALL: SmallDef[] = [
  { id: 48,  lon: 50.55,  lat: 26.00, dx:  55, dy: -25 },
  { id: 96,  lon: 114.83, lat:  4.94, dx:  50, dy: -28 },
  { id: 462, lon: 73.50,  lat:  4.00, dx: -55, dy: -20 },
  { id: 634, lon: 51.20,  lat: 25.30, dx:  55, dy:  25 },
  { id: 702, lon: 103.82, lat:  1.35, dx:  50, dy: -25 },
]

const SOUTH_AMERICA: Country[] = [
  { id: 32,  name: 'Argentina' },
  { id: 68,  name: 'Bolivia' },
  { id: 76,  name: 'Brazil',    aliases: ['Brasil'] },
  { id: 152, name: 'Chile' },
  { id: 170, name: 'Colombia' },
  { id: 218, name: 'Ecuador' },
  { id: 328, name: 'Guyana' },
  { id: 600, name: 'Paraguay' },
  { id: 604, name: 'Peru' },
  { id: 740, name: 'Suriname' },
  { id: 858, name: 'Uruguay' },
  { id: 862, name: 'Venezuela' },
]

export const CONFIGS: Record<RegionKey, QuizConfig> = {
  europe: {
    label: 'Europe',
    countries: EUROPE,
    smallDef: EUROPE_SMALL,
    total: 47,
    projCenter: [15, 53],
    projScale: 600,
    regionLabel: 'European',
    winMsg: '🎉 You named all 47 countries of Europe!',
  },
  asia: {
    label: 'Asia',
    countries: ASIA,
    smallDef: ASIA_SMALL,
    total: 45,
    projCenter: [88, 30],
    projScale: 280,
    regionLabel: 'Asian',
    winMsg: '🎉 You named all 45 countries of Asia!',
  },
  southamerica: {
    label: 'South America',
    countries: SOUTH_AMERICA,
    smallDef: [],
    total: 12,
    projCenter: [-58, -18],
    projScale: 400,
    regionLabel: 'South American',
    winMsg: '🎉 You named all 12 countries of South America!',
  },
}
