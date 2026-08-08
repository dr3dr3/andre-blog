import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const status = z.enum(['shipped', 'abandoned', 'still-running', 'experiment']);

const posts = defineCollection({
    loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/posts' }),
    schema: z
        .object({
            title: z.string().max(70),
            summary: z.string().max(180),
            published: z.date(),
            updated: z.date().optional(),
            draft: z.boolean().default(false),
            archetype: z.enum(['war-story', 'decision-record', 'teardown', 'field-note']),

            context: z.string().optional(), // shape of the situation, never a company name
            stack: z
                .array(
                    z.object({
                        name: z.string(),
                        version: z.string().optional(), // as pinned at time of writing
                    }),
                )
                .default([]),

            outcome: z.object({
                status: status,
                was: status.optional(), // set only when it changed
                changed: z.date().optional(), // required if `was` is set
            }),

            tags: z.array(z.string()).default([]),
            canonical: z.url().optional(),
        })
        .refine((d) => !d.outcome.was || !!d.outcome.changed, {
            message: 'outcome.was requires outcome.changed',
        }),
});

export const collections = { posts };
