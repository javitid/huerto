module.exports = {
  preset: 'jest-preset-angular',
  testPathIgnorePatterns: [
    '<rootDir>/src/test.ts',
    '<rootDir>/e2e/',
    '<rootDir>/.features-gen/',
  ],
};
