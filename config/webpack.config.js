const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const resolve = require('resolve');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const paths = require('./paths');
const getClientEnvironment = require('./env');
const ForkTsCheckerWebpackPlugin = require('react-dev-utils/ForkTsCheckerWebpackPlugin');

// Source maps are resource heavy and can cause out of memory issue for large source files.
const shouldUseSourceMap = process.env.GENERATE_SOURCEMAP !== 'false';


// Check if TypeScript is setup
const useTypeScript = fs.existsSync(paths.appTsConfig);

// style files regexes
const cssRegex = /\.css$/;
const cssModuleRegex = /\.module\.css$/;
const sassRegex = /\.(scss|sass)$/;
const sassModuleRegex = /\.module\.(scss|sass)$/;

// This is the production and development configuration.
// It is focused on developer experience, fast rebuilds, and a minimal bundle.
module.exports = function(webpackEnv) {
	const isEnvDevelopment = webpackEnv === 'development';
	const isEnvProduction = webpackEnv === 'production';

	// Webpack uses `publicPath` to determine where the app is being served from.
	// It requires a trailing slash, or the file assets will get an incorrect path.
	// In development, we always serve from the root. This makes config easier.
	const publicPath = isEnvProduction ? paths.servedPath : isEnvDevelopment && '/';
	// Some apps do not use client-side routing with pushState.
	// For these, "homepage" can be set to "." to enable relative asset paths.
	const shouldUseRelativeAssetPaths = publicPath === './';

	// `publicUrl` is just like `publicPath`, but we will provide it to our app
	// as %PUBLIC_URL% in `index.html` and `process.env.PUBLIC_URL` in JavaScript.
	// Omit trailing slash as %PUBLIC_URL%/xyz looks better than %PUBLIC_URL%xyz.
	const publicUrl = isEnvProduction ? publicPath.slice(0, -1) : isEnvDevelopment && '';
	// Get environment variables to inject into our app.
	const env = getClientEnvironment(publicUrl);

	// common function to get style loaders
	const getStyleLoaders = (cssOptions, preProcessor) => {
		const loaders = [
			isEnvDevelopment && require.resolve('style-loader'),
			isEnvProduction && {
				loader: MiniCssExtractPlugin.loader,
				options: Object.assign(
					{},
					shouldUseRelativeAssetPaths ? { publicPath: '../../' } : undefined
				)
			},
			{
				loader: require.resolve('css-loader'),
				options: cssOptions
			},
			{
				// Options for PostCSS as we reference these options twice
				// Adds vendor prefixing based on your specified browser support in
				// package.json
				loader: require.resolve('postcss-loader'),
				options: {
					// Necessary for external CSS imports to work
					// https://github.com/facebook/create-react-app/issues/2677
					ident: 'postcss',
					plugins: () => [
						require('postcss-flexbugs-fixes'),
						// require('postcss-preset-env')({
						// 	autoprefixer: {
						// 		flexbox: 'no-2009'
						// 	},
						// 	stage: 3
						// })
					],
					sourceMap: isEnvProduction && shouldUseSourceMap
				}
			}
		].filter(Boolean);
		if (preProcessor) {
			loaders.push({
				loader: require.resolve(preProcessor),
				options: {
					sourceMap: isEnvProduction && shouldUseSourceMap
				}
			});
		}
		return loaders;
	};

	return {
		mode: isEnvProduction ? 'production' : isEnvDevelopment && 'development',
		// Stop compilation early in production
		bail: isEnvProduction,
		devtool: isEnvProduction
			? shouldUseSourceMap
				? 'source-map'
				: false
			: isEnvDevelopment && 'cheap-module-source-map',
		// These are the "entry points" to our application.
		// This means they will be the "root" imports that are included in JS bundle.
		entry: [
			// Include an alternative client for WebpackDevServer. A client's job is to
			// connect to WebpackDevServer by a socket and get notified about changes.
			// When you save a file, the client will either apply hot updates (in case
			// of CSS changes), or refresh the page (in case of JS changes). When you
			// make a syntax error, this client will display a syntax error overlay.
			// Note: instead of the default WebpackDevServer client, we use a custom one
			// to bring better experience for Create React App users. You can replace
			// the line below with these two lines if you prefer the stock client:
			// require.resolve('webpack-dev-server/client') + '?/',
			// require.resolve('webpack/hot/dev-server'),
			isEnvDevelopment && require.resolve('react-dev-utils/webpackHotDevClient'),
			// Finally, this is your app's code:
			paths.appIndexJs
			// We include the app code last so that if there is a runtime error during
			// initialization, it doesn't blow up the WebpackDevServer client, and
			// changing JS code would still trigger a refresh.
		].filter(Boolean),
		output: {
			// The build folder.
			path: isEnvProduction ? paths.appBuild : undefined,
			// Add /* filename */ comments to generated require()s in the output.
			pathinfo: isEnvDevelopment,
			// There will be one main bundle, and one file per asynchronous chunk.
			// In development, it does not produce real files.
			filename: isEnvProduction
				? 'static/js/[name].[contenthash:8].js'
				: isEnvDevelopment && 'static/js/bundle.js',
			// There are also additional JS chunk files if you use code splitting.
			chunkFilename: isEnvProduction
				? 'static/js/[name].[contenthash:8].chunk.js'
				: isEnvDevelopment && 'static/js/[name].chunk.js',
			// We inferred the "public path" (such as / or /my-project) from homepage.
			// We use "/" in development.
			publicPath: publicPath,
			// Point sourcemap entries to original disk location (format as URL on Windows)
			devtoolModuleFilenameTemplate: isEnvProduction
				? info => path.relative(paths.appSrc, info.absoluteResourcePath).replace(/\\/g, '/')
				: isEnvDevelopment &&
				  (info => path.resolve(info.absoluteResourcePath).replace(/\\/g, '/'))
		},
		optimization: {
			minimize: isEnvProduction,
			minimizer: [
				// This is only used in production mode
				new TerserPlugin({
					terserOptions: {
						parse: {
							// we want terser to parse ecma 8 code. However, we don't want it
							// to apply any minfication steps that turns valid ecma 5 code
							// into invalid ecma 5 code. This is why the 'compress' and 'output'
							// sections only apply transformations that are ecma 5 safe
							// https://github.com/facebook/create-react-app/pull/4234
							ecma: 8
						},
						compress: {
							ecma: 5,
							warnings: false,
							// Disabled because of an issue with Uglify breaking seemingly valid code:
							// https://github.com/facebook/create-react-app/issues/2376
							// Pending further investigation:
							// https://github.com/mishoo/UglifyJS2/issues/2011
							comparisons: false,
							// Disabled because of an issue with Terser breaking valid code:
							// https://github.com/facebook/create-react-app/issues/5250
							// Pending futher investigation:
							// https://github.com/terser-js/terser/issues/120
							inline: 2
						},
						mangle: {
							safari10: true
						},
						output: {
							ecma: 5,
							comments: false,
							// Turned on because emoji and regex is not minified properly using default
							// https://github.com/facebook/create-react-app/issues/2488
							ascii_only: true
						}
					},
					// Use multi-process parallel running to improve the build speed
					// Default number of concurrent runs: os.cpus().length - 1
					parallel: true,
					// Enable file caching
					cache: true,
					sourceMap: shouldUseSourceMap
				}),
				// // This is only used in production mode
				// new OptimizeCSSAssetsPlugin({
				// 	cssProcessorOptions: {
				// 		// parser: safePostCssParser,
				// 		map: shouldUseSourceMap
				// 			? {
				// 					// `inline: false` forces the sourcemap to be output into a
				// 					// separate file
				// 					inline: false,
				// 					// `annotation: true` appends the sourceMappingURL to the end of
				// 					// the css file, helping the browser find the sourcemap
				// 					annotation: true
				// 			  }
				// 			: false
				// 	}
				// })
			],
			// Automatically split vendor and commons
			// https://twitter.com/wSokra/status/969633336732905474
			// https://medium.com/webpack/webpack-4-code-splitting-chunk-graph-and-the-splitchunks-optimization-be739a861366
			splitChunks: {
				chunks: 'all',
				name: false
			},
			// Keep the runtime chunk separated to enable long term caching
			// https://twitter.com/wSokra/status/969679223278505985
			runtimeChunk: true
		},
		resolve: {
			alias: {
				'@sqs': path.resolve(paths.appSrc, 'sqs-compat')
			},
			extensions: ['.ts', '.tsx', '.js', '.jsx'],
			modules: [paths.appSrc, 'node_modules']
		},
		module: {
			strictExportPresence: true,
			rules: [
				{
					// "oneOf" will traverse all following loaders until one will
					// match the requirements. When no loader matches it will fall
					// back to the "file" loader at the end of the loader list.
					oneOf: [
						// "url" loader works like "file" loader except that it embeds assets
						// smaller than specified limit in bytes as data URLs to avoid requests.
						// A missing `test` is equivalent to a match.
						{
							test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
							loader: require.resolve('url-loader'),
							options: {
								limit: 10000,
								name: 'static/media/[name].[hash:8].[ext]'
							}
						},

						{
							test: /.(js|jsx|ts|tsx)$/,
							include: paths.appSrc,
							loader: 'ts-loader',
							options: {}
						},

						// "postcss" loader applies autoprefixer to our CSS.
						// "css" loader resolves paths in CSS and adds assets as dependencies.
						// "style" loader turns CSS into JS modules that inject <style> tags.
						// In production, we use MiniCSSExtractPlugin to extract that CSS
						// to a file, but in development "style" loader enables hot editing
						// of CSS.
						// By default we support CSS Modules with the extension .module.css
						{
							test: cssRegex,
							exclude: cssModuleRegex,
							use: getStyleLoaders({
								importLoaders: 1,
								sourceMap: isEnvProduction && shouldUseSourceMap
							}),
							// Don't consider CSS imports dead code even if the
							// containing package claims to have no side effects.
							// Remove this when webpack adds a warning or an error for this.
							// See https://github.com/webpack/webpack/issues/6571
							sideEffects: true
						},
						// Adds support for CSS Modules (https://github.com/css-modules/css-modules)
						// using the extension .module.css
						{
							test: cssModuleRegex,
							use: getStyleLoaders({
								importLoaders: 1,
								sourceMap: isEnvProduction && shouldUseSourceMap,
								modules: {
									localIdentName: '[name]__[local]___[hash:base64:5]'
								}
							})
						},
						// Opt-in support for SASS (using .scss or .sass extensions).
						// By default we support SASS Modules with the
						// extensions .module.scss or .module.sass
						{
							test: sassRegex,
							exclude: sassModuleRegex,
							use: getStyleLoaders(
								{
									importLoaders: 2,
									sourceMap: isEnvProduction && shouldUseSourceMap
								},
								'sass-loader'
							),
							// Don't consider CSS imports dead code even if the
							// containing package claims to have no side effects.
							// Remove this when webpack adds a warning or an error for this.
							// See https://github.com/webpack/webpack/issues/6571
							sideEffects: true
						},
						// Adds support for CSS Modules, but using SASS
						// using the extension .module.scss or .module.sass
						{
							test: sassModuleRegex,
							use: getStyleLoaders(
								{
									importLoaders: 2,
									sourceMap: isEnvProduction && shouldUseSourceMap,
									modules: {
										localIdentName: '[name]__[local]___[hash:base64:5]'
									}
								},
								'sass-loader'
							)
						},

						// "file" loader makes sure those assets get served by WebpackDevServer.
						// When you `import` an asset, you get its (virtual) filename.
						// In production, they would get copied to the `build` folder.
						// This loader doesn't use a "test" so it will catch all modules
						// that fall through the other loaders.
						{
							loader: require.resolve('file-loader'),
							// Exclude `js` files to keep "css" loader working as it injects
							// its runtime that would otherwise be processed through "file" loader.
							// Also exclude `html` and `json` extensions so they get processed
							// by webpacks internal loaders.
							exclude: [/\.(js|mjs|jsx|ts|tsx)$/, /\.html$/, /\.json$/],
							options: {
								name: 'static/media/[name].[hash:8].[ext]'
							}
						}
						// ** STOP ** Are you adding a new loader?
						// Make sure to add the new loader(s) before the "file" loader.
					]
				}
			]
		},
		plugins: [
			// Generates an `index.html` file with the <script> injected.
			new HtmlWebpackPlugin(
				Object.assign(
					{},
					{
						inject: true,
						template: paths.appHtml
					},
					isEnvProduction
						? {
								minify: {
									removeComments: true,
									collapseWhitespace: true,
									removeRedundantAttributes: true,
									useShortDoctype: true,
									removeEmptyAttributes: true,
									removeStyleLinkTypeAttributes: true,
									keepClosingSlash: true,
									minifyJS: true,
									minifyCSS: true,
									minifyURLs: true
								}
						  }
						: undefined
				)
			),
			// Makes some environment variables available to the JS code, for example:
			// if (process.env.NODE_ENV === 'production') { ... }. See `./env.js`.
			// It is absolutely essential that NODE_ENV is set to production
			// during a production build.
			// Otherwise React will be compiled in the very slow development mode.
			new webpack.DefinePlugin(env.stringified),
			// This is necessary to emit hot updates (currently CSS only):
			isEnvDevelopment && new webpack.HotModuleReplacementPlugin(),
			isEnvProduction &&
				new MiniCssExtractPlugin({
					// Options similar to the same options in webpackOptions.output
					// both options are optional
					filename: 'static/css/[name].[contenthash:8].css',
					chunkFilename: 'static/css/[name].[contenthash:8].chunk.css'
				}),
			// TypeScript type checking
			useTypeScript &&
				new ForkTsCheckerWebpackPlugin({
					typescript: resolve.sync('typescript', {
						basedir: paths.appNodeModules
					}),
					async: isEnvDevelopment,
					useTypescriptIncrementalApi: true,
					checkSyntacticErrors: true,
					tsconfig: paths.appTsConfig,
					reportFiles: [
						'**',
						'!**/*.json',
						'!**/src/setupProxy.*'
					],
					watch: paths.appSrc,
					silent: true
				}),

			new webpack.DefinePlugin({
				__DEV__: false,
				__PROD__: true,
				'process.env': {
					NODE_ENV: JSON.stringify('production')
				}
			})
		].filter(Boolean),
		// Some libraries import Node modules but don't use them in the browser.
		// Tell Webpack to provide empty mocks for them so importing them works.
		node: {
			module: 'empty',
			dgram: 'empty',
			dns: 'mock',
			fs: 'empty',
			net: 'empty',
			tls: 'empty',
			child_process: 'empty'
		},
		// Turn off performance processing because we utilize
		// our own hints via the FileSizeReporter
		performance: false
	};
};
