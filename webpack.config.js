const path = require('path');

module.exports = (options, webpack) => {
  const lazyImports = [
    '@nestjs/microservices/microservices-module',
    '@nestjs/websockets/socket-module',
  ];

  return {
    ...options,
    externals: {},
    output: {
      ...options.output,
      libraryTarget: 'commonjs2',
    },
    optimization: {
      ...options.optimization,
      minimize: false, // Desabilita minificação para economizar memória
      splitChunks: false, // Desabilita divisão de chunks para economizar memória
    },
    plugins: [
      ...options.plugins,
      new webpack.IgnorePlugin({
        checkResource(resource) {
          if (lazyImports.includes(resource)) {
            try {
              require.resolve(resource);
            } catch (err) {
              return true;
            }
          }
          return false;
        },
      }),
    ],
    resolve: {
      extensions: ['.ts', '.js'],
      alias: {
        '@modules': path.resolve(__dirname, 'src/modules'),
        '@shared': path.resolve(__dirname, 'src/shared'),
      },
    },
    stats: 'errors-only', // Reduz output para economizar memória
    performance: {
      hints: false, // Desabilita avisos de performance
    },
  };
};
