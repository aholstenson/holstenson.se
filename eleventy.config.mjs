import { DateTime } from 'luxon';
import EleventyVitePlugin from '@11ty/eleventy-plugin-vite';

export default function (config) {
	config.addPlugin(EleventyVitePlugin, {
		tempFolderName: '.11ty-vite',
		viteOptions: {
			clearScreen: false,
			appType: 'mpa',
			build: {
				assetsInlineLimit: 0
			}
		}
	});

	// Let Vite process referenced CSS/JS; copy the rest of the assets as-is.
	config.addPassthroughCopy({ 'src/assets': 'assets' });

	config.addCollection('articles', collection => {
		return collection.getFilteredByGlob('src/articles/**/*.md');
	});

	config.addCollection('tagList', collection => {
		const tags = new Set();
		for (const thing of collection.getAll()) {
			if (!thing.data.tags) continue;

			for (const tag of thing.data.tags) {
				tags.add(tag);
			}
		}

		return Array.from(tags).sort();
	});

	config.addFilter('isoDate', dateObj => {
		return DateTime.fromJSDate(dateObj).toISODate();
	});

	config.addFilter('limit', (arr, limit) => arr.slice(0, limit));

	return {
		templateFormats: ['md', 'njk', 'html'],
		markdownTemplateEngine: 'njk',
		htmlTemplateEngine: 'njk',

		dir: {
			input: 'src',
			output: 'build',
			includes: 'includes',
			layouts: 'layouts',
			data: 'data'
		}
	};
}
