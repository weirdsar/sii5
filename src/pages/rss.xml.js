import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { siteConfig } from '../data/site.ts';

/** RSS статей: абсолютные ссылки через `site` из `astro.config` / контекста эндпоинта */
export async function GET(context) {
  const site = String(context.site ?? siteConfig.url);
  const articles = await getCollection('articles');
  const sorted = [...articles].sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf()
  );

  return rss({
    title: `${siteConfig.name} — Статьи`,
    description:
      'Материалы о веб-разработке, продвижении и сайтах для малого бизнеса в РФ.',
    site,
    trailingSlash: true,
    items: sorted.map((post) => ({
      title: post.data.title,
      pubDate: post.data.date,
      description: post.data.excerpt,
      link: new URL(`/articles/${post.id}/`, site).href,
    })),
  });
}
