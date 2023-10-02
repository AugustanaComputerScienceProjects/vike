module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'expo-router/babel',
      '@babel/plugin-proposal-export-namespace-from', // Web support for reanimated
      'react-native-reanimated/plugin',
    ],
  };
};
