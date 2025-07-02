// module.exports = {
//     resolver: {
//       sourceExts: ['jsx', 'js', 'ts', 'tsx', 'mjs'],
//     },
//   };
  
const { getDefaultConfig } = require("expo/metro-config");

module.exports = getDefaultConfig(__dirname);
