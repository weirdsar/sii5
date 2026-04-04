import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const cases = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/cases' }),
  schema: z.object({
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
    liveUrl: z.string().url(),
    metaTitle: z.string(),
    metaDescription: z.string(),
  }),
});

const articles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/articles' }),
  schema: z.object({
    title: z.string(),
    excerpt: z.string(),
    date: z.coerce.date(),
    readTime: z.number().int().positive(),
    tags: z.array(z.string()),
    metaTitle: z.string(),
    metaDescription: z.string(),
    /** Смысловой хаб на `/articles/` для перелинковки и навигации */
    hub: z.enum(['strategy', 'tech', 'marketing']),
  }),
});

/** Тарифы: `id` записи = имя файла без `.md` (как у кейсов). */
const services = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/services' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    price: z.string(),
    features: z.array(z.string()),
    highlighted: z.boolean().optional().default(false),
    order: z.number().int(),
    /** Текст кнопки и query `service=` на `/contact` */
    cta: z.string(),
  }),
});

/** Доп. услуги: отдельная коллекция, сортировка по `order`. */
const additionalServices = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/additional-services' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    price: z.string(),
    order: z.number().int(),
  }),
});

export const collections = {
  cases,
  articles,
  services,
  additionalServices,
};
