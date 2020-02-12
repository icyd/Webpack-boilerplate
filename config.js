const path = require('path');

// Allow solving for wordpress setup
const resolvePublic = (folder, prefix = false) => {
  if (typeof prefix === 'string') {
    const theme = path.basename(path.resolve('../'));
    if (prefix.length > 0) {
      return `/${prefix}/wp-content/themes/${theme}/${folder}/`;
    } else {
      return `/wp-content/themes/${theme}/${folder}/`;
    }
  }
  return `${folder}/`;
};

module.exports = {
  context: path.resolve('./'),
  entries: {
    main: [
      './src/scripts/main.js',
      './src/styles/main.scss',
    ],
  },
  devtool: 'cheap-module-eval-source-map',
  outputFolder: path.resolve(__dirname, './dist'),
  publicFolder: resolvePublic(''),
  contentBase: path.resolve(__dirname, './src/templates'),
  title: 'Test title',
  favicon: './src/favicon.ico',
  htmlTemplate: path.resolve(__dirname, './src/templates/index.html'),
  htmlFilename: 'index.html',
  hostPort: 9000,
};
