/** Jest config for AC-UT-FE-001 pgThreeLayer suite (Node 20). */
module.exports = {
  rootDir: __dirname,
  testEnvironment: 'node',
  setupFiles: [
    '<rootDir>/src/page/Workspace/SideBar/ResourceTree/__tests__/jest.setup.js'
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  moduleNameMapper: {
    // SVG must win over @/ rewrite, otherwise real .svg XML is loaded.
    '^.+\\.svg$':
      '<rootDir>/src/page/Workspace/SideBar/ResourceTree/__tests__/svgMock.js',
    '\\.(css|less)$': 'identity-obj-proxy',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@@/(.*)$': '<rootDir>/src/.umi/$1'
  },
  testMatch: [
    '<rootDir>/src/page/Workspace/SideBar/ResourceTree/__tests__/pgThreeLayer.test.ts'
  ],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: './tsconfig.jest.json',
        diagnostics: false,
        isolatedModules: true
      }
    ]
  }
};
