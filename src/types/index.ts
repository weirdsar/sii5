/**
 * Общие типы приложения. Схемы контента кейсов, статей и тарифов — в `src/content.config.ts` (Zod).
 */

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
 * Соответствуют полям коллекции `services` + `id` записи (имя файла без `.md`).
 */
export interface ServiceCardProps {
  /** Идентификатор тарифа — имя файла в `src/content/services/` и query `service=` на `/contact`. */
  id: string;
  /** Заголовок тарифа (`data.title` в коллекции). */
  name: string;
  /** Подзаголовок / описание (`data.description`). */
  subtitle: string;
  price: string;
  features: string[];
  highlighted: boolean;
  cta: string;
}
