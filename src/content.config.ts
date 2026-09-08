import { defineCollection } from 'astro:content';
import { z } from 'zod';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    id: z.string().min(1),
    title: z.string().min(1),
    date: z.coerce.date(),
    updated: z.preprocess(value => value == null || value === '' ? undefined : value, z.coerce.date().optional()),
    category: z.enum(['3D 디자인', '개발 기록', 'AI 실험', '프로젝트']),
    description: z.preprocess(value => value ?? '', z.string()),
    tags: z.preprocess(value => value ?? [], z.array(z.string())),
    cover: z.preprocess(value => value ?? '', z.string()),
    coverAlt: z.preprocess(value => value ?? '', z.string()),
    published: z.boolean().default(false),
    featured: z.boolean().default(false),
    sample: z.boolean().default(false),
  }),
});
export const collections = { posts };
