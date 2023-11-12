const { merge } = require('webpack-merge');
const {
    commonConfig,
    commonLambdaConfig,
    setupNewrelicBrowserScript
  } = require('@samplesdk/express/webpack');
const fs = require('fs');
const TerserPlugin = require('terser-webpack-plugin')

module.exports = async env => {
	// Inline the browser script to avoid API calls to newrelic
	
    const customConfig = {
        devtool: process.env.CONFIG === 'prod' ? 'hidden-source-map' : undefined,
        output: {
            sourceMapFilename: '../../sourcemaps/[name].[fullhash].js.map' //exposes source maps for New Relic upload but not Akamai upload
        },
        optimization: {
            splitChunks: {
                minSize: 20000,
                maxSize: 200000,
                chunks: 'all',
                cacheGroups: {
                    vendor: {
                        test: /[\\/]node_modules[\\/]/,
                        name(module) {
                            const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
                            return `npm.${packageName.replace('@', '')}`;
                        }
                    }
                }
            },
            minimizer: [
                // We need to preserve function names to allow an easier time caching partial
                // results for mini etl
                new TerserPlugin({
                    parallel: true,
                    terserOptions: {
                        // https://github.com/webpack-contrib/terser-webpack-plugin#terseroptions
                        keep_fnames: true
                    }
                }),
            ],
        }
    };
    return [
        merge(commonConfig(env), customConfig),
        merge(commonLambdaConfig(env))
    ];
};