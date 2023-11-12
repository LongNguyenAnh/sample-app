// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFiles: [
    "<rootDir>/setupTests.js"
  ],
  snapshotSerializers: ['@emotion/jest/serializer','jest-serializer-react-helmet-async'],
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "babel-jest"
  },
  transformIgnorePatterns: [
    ""
  ],
  moduleNameMapper: {
    ".+\\.(css|styl|less|sass|scss|png|gif|jpg|svg|ttf|woff|woff2)$": "jest-transform-stub",
    "uuid": require.resolve('uuid')
  },
  reporters: [
    "default",
    "./jest-reporter.js"
  ],
  coverageReporters: [
    "html",
    "json",
    "lcov"
  ]
}