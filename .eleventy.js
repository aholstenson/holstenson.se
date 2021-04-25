const { DateTime } = require('luxon');
const isProduction = process.env.NODE_ENV === 'production';

module.exports = (config) => {
	config.addCollection('articles', collection => {
		return collection.getFilteredByGlob('src/articles/**/*.md');
	});

	config.addCollection('tagList', collection => {
		const tags = new Set();
		for(const thing of collection.getAll()) {
			if(! thing.data.tags) continue;

			for(const tag of thing.data.tags) {
				tags.add(tag);
			}
		}

		return Array.from(tags).sort();
	});

	config.addFilter('isoDate', (dateObj) => {
		return DateTime.fromJSDate(dateObj).toISODate();
	});

	config.addNunjucksFilter('limit', (arr, limit) => arr.slice(0, limit));

	return {
		templateFormats: [ 'md', 'njk', 'html' ],
		markdownTemplateEngine: 'njk',
		htmlTemplateEngine: 'njk',
		dataTemplateEngine: 'njk',

		dir: {
			input: 'src',
			output: isProduction ? 'build' : '.11ty',
			includes: 'includes',
			layouts: 'layouts',
			data: 'data'
		}
	};
};
