require('@babel/register')({
  presets: [
    ['@babel/preset-env', {useBuiltIns: 'usage', corejs: {version: 3}}],
  ],
});
