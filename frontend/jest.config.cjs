// filepath: /c:/Users/danie/OneDrive/Coding/Projects/Todolist-Vite/frontend/jest.config.cjs
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json', 'node'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  transform: {
    '^.+\\.jsx?$': 'babel-jest',
    '^.+\\.mjs$': 'babel-jest', // Add this line to handle .mjs files
  },
  transformIgnorePatterns: [
    '/node_modules/(?!axios|date-fns)', // Add exceptions for any modules that need to be transformed
    '\\.pnp\\.[^\\/]+$'
  ],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
  }
};
