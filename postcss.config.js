module.exports = ({ file }) => ({
  parser: false,
  plugins: {
    'postcss-import': { root: file.dirname },
    'postcss-nested': {},
    'postcss-simple-vars': {},
    'autoprefixer': {
      remove: true,
      browsers: ['last 2 versions']
    }
  }
});