module.exports = {
	mount: {
		".11ty": "/",
		"src/assets/images": "/assets/images",
		"src/assets/js": "/assets/js",
		"src/assets/css": "/assets/css"
	},
	plugins: [
		"@snowpack/plugin-typescript",
		"@snowpack/plugin-postcss",
		[
			"@snowpack/plugin-run-script",
			{ "cmd": "eleventy", "watch": "$1 --watch" }
		],
	],
	buildOptions: {
		clean: true
	},
	optimize: {
		bundle: true,
		minify: true,
		target: 'es2018',
		entrypoints: [ 'src/assets/js/main.ts' ]
	},
	devOptions: {
		out: 'dist',
		port: 3000,
		bundle: false,
		open: 'none',
		hmr: true
	}
};
