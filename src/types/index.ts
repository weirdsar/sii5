/**
 * Общие типы приложения. Схемы контента кейсов, статей и тарифов — в `src/content.config.ts` (Zod + `z.infer`).
 */

import type { ServiceEntryData } from '../content.config';

/**
 * Пункт главной навигации (данные в `src/data/navigation.ts`).
 */
export interface NavItem {
  label: string;
  href: string;
}

/**
 * Сайт и контакты исполнителя (`src/data/site.ts`).
 */
export interface SiteConfig {
  name: string;
  description: string;
  url: string;
  author: string;
  email: string;
  phone: string;
  city: string;
  socials: {
    telegram: string;
    vk: string;
    github: string;
  };
}

/**
 * Плоские пропсы карточки тарифа (`ServiceCard.astro`).
 * Поля `name` / `subtitle` соответствуют `title` / `description` коллекции `services` + `id` записи (имя файла без `.md`).
 */
export interface ServiceCardProps {
  /** Идентификатор тарифа — имя файла в `src/content/services/` и query `service=` на `/contact`. */
  id: string;
  name: ServiceEntryData['title'];
  subtitle: ServiceEntryData['description'];
  price: ServiceEntryData['price'];
  features: ServiceEntryData['features'];
  highlighted: ServiceEntryData['highlighted'];
  cta: ServiceEntryData['cta'];
}
