module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      '@babel/plugin-transform-class-static-block', // Your existing plugin
      ['module:react-native-dotenv', {
        moduleName: '@env',
        path: '.env',
      }] // Added for environment variables
    ],
  };
};