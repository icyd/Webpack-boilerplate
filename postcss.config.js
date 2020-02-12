const cssnanoConfig = {
  preset: [
    'default',
    {
      discardComments: {
        removeAll: true,
      },
    },
  ],
};

const purgecssConfig = {
  content: [
    './src/**/*.html',
    './src/**/*.vue',
    './src/**/*.jsx',
  ],
  whitelist: [
    // 'class-to-whitelist',
  ],
  defaultExtractor: (content) => content.match(/[\w-/:]+(?<!:)/g) || [],
};

const mqpackerConfig = {
  sort: true,
};

module.exports = ({ options }) => ({
  plugins: [
    require('tailwindcss'),
    require('autoprefixer'),
    require('postcss-preset-env'),
    ...(options.isDev ? [] : [
      require('@fullhuman/postcss-purgecss')(purgecssConfig),
      require('css-mqpacker')(mqpackerConfig),
      require('cssnano')(cssnanoConfig),
    ]),
  ],
});
