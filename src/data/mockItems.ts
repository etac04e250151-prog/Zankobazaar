import { University, ListingItem } from '../types';

export const UNIVERSITIES: University[] = [
  {
    id: 'epu',
    name: {
      ku: 'زانکۆی پۆلیتەکنیکی هەولێر (EPU)',
      en: 'Erbil Polytechnic University (EPU)',
      ar: 'جامعة أربيل التقنية (EPU)',
    },
    shortName: 'EPU',
    city: 'Erbil',
  },
  {
    id: 'salahaddin',
    name: {
      ku: 'زانکۆی سەڵاحەدین - هەولێر',
      en: 'Salahaddin University - Erbil',
      ar: 'جامعة صلاح الدين - أربيل',
    },
    shortName: 'UOS',
    city: 'Erbil',
  },
  {
    id: 'sulaimani',
    name: {
      ku: 'زانکۆی سلێمانی',
      en: 'University of Sulaimani',
      ar: 'جامعة السليمانية',
    },
    shortName: 'UOS-Suli',
    city: 'Sulaymaniyah',
  },
  {
    id: 'duhok',
    name: {
      ku: 'زانکۆی دهۆک',
      en: 'University of Duhok (UOD)',
      ar: 'جامعة دهوك',
    },
    shortName: 'UOD',
    city: 'Duhok',
  },
  {
    id: 'hmu',
    name: {
      ku: 'زانکۆی پزیشکیی هەولێر (HMU)',
      en: 'Hawler Medical University (HMU)',
      ar: 'جامعة هولير الطبية (HMU)',
    },
    shortName: 'HMU',
    city: 'Erbil',
  },
  {
    id: 'ukh',
    name: {
      ku: 'زانکۆی کوردستان هەولێر (UKH)',
      en: 'University of Kurdistan Hewlêr (UKH)',
      ar: 'جامعة كوردستان هولير',
    },
    shortName: 'UKH',
    city: 'Erbil',
  },
];

// Empty real dataset: dummy mock listings have been deleted as requested
export const INITIAL_ITEMS: ListingItem[] = [];
