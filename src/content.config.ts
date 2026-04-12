import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/** Схемы вынесены для `z.infer` и синхронизации с пропсами UI (`ServiceCardProps` и т.д.). */
export const caseEntrySchema = z.object({
  title: z.string(),
  /** Краткое описание для карточек (ранее `shortDesc`) */
  description: z.string(),
  publishDate: z.coerce.date(),
  category: z.string(),
  client: z.string(),
  challenge: z.string(),
  solution: z.string(),
  result: z.string(),
  tags: z.array(z.string()),
  gallery: z.array(z.string()).default([]),
  liveUrl: z.url(),
  metaTitle: z.string(),
  metaDescription: z.string(),
});

export type CaseEntryData = z.infer<typeof caseEntrySchema>;

export const articleEntrySchema = z.object({
  title: z.string(),
  excerpt: z.string(),
  date: z.coerce.date(),
  readTime: z.number().int().positive(),
  tags: z.array(z.string()),
  metaTitle: z.string(),
  metaDescription: z.string(),
  /** Смысловой хаб на `/articles/` для перелинковки и навигации */
  hub: z.enum(['strategy', 'tech', 'marketing']),
});

export type ArticleEntryData = z.infer<typeof articleEntrySchema>;

/** Тарифы: `id` записи = имя файла без `.md` (как у кейсов). */
export const serviceEntrySchema = z.object({
  title: z.string(),
  description: z.string(),
  price: z.string(),
  features: z.array(z.string()),
  highlighted: z.boolean().optional().default(false),
  order: z.number().int(),
  /** Текст кнопки и query `service=` на `/contact` */
  cta: z.string(),
});

export type ServiceEntryData = z.infer<typeof serviceEntrySchema>;

/** Доп. услуги: отдельная коллекция, сортировка по `order`. */
export const additionalServiceEntrySchema = z.object({
  title: z.string(),
  description: z.string(),
  price: z.string(),
  order: z.number().int(),
});

export type AdditionalServiceEntryData = z.infer<typeof additionalServiceEntrySchema>;

const cases = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/cases' }),
  schema: caseEntrySchema,
});

const articles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/articles' }),
  schema: articleEntrySchema,
});

const services = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/services' }),
  schema: serviceEntrySchema,
});

const additionalServices = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/additional-services' }),
  schema: additionalServiceEntrySchema,
});

export const collections = {
  cases,
  articles,
  services,
  additionalServices,
};
