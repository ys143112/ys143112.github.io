import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import settings from '../data/site.json';
import { getPosts, postPath, postSummary } from '../lib/posts';
export async function GET(context: APIContext) {
  return rss({ title: settings.title, description: settings.description, site: context.site!, items: (await getPosts()).map(post => ({ title: post.data.title, pubDate: post.data.date, description: postSummary(post), link: postPath(post) })), customData: '<language>ko-KR</language>' });
}
