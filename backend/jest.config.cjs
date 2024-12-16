// filepath: /c:/Users/danie/OneDrive/Coding/Projects/Todolist-Vite/backend/jest.config.cjs
module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+\\.jsx?$': 'babel-jest',
  },
  transformIgnorePatterns: [
    '/node_modules/',
  ],
};