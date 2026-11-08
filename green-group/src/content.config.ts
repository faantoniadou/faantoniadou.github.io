import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const caseStudies = defineCollection({
	loader: glob({ base: "./src/content/case-studies", pattern: "**/*.{md,mdx}" }),
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			blurb: z.string().optional(),               // one line, shown on cards
			role: z.string().optional(),
			org: z.string().optional(),
			year: z.number(),
			cover: image(),                  // optimised by Astro
			coverAlt: z.string().default(""),
			tags: z.array(z.string()).default([]),
			accent: z.string().optional(),   // per-study accent colour
			order: z.number().default(99),   // controls order on the home page
			draft: z.boolean().default(false),
		}),
});

export const collections = { "case-studies": caseStudies };
