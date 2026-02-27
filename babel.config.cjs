module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: '18' }, modules: 'auto' }],
    '@babel/preset-react',
    '@babel/preset-typescript',
  ],
};