module.exports = {
  skipFiles: [
    'test/',
    'mocks/',
    'interfaces/',
    'libraries/',
    'vendor/',
  ],
  configureYulOptimizer: true,
  mocha: {
    grep: "@skip-on-coverage", // Skip tests with this tag
    invert: true              // Run all tests except those with this tag
  },
  providerOptions: {
    // Default gas price in wei
    default_balance_ether: 1000000, // 1M ETH
    // Total accounts to generate
    total_accounts: 10,
    // Block gas limit (0x7a1200 = 8,000,000)
    gasLimit: 0x7a1200,
  },
  // Configure the compiler version to match your contracts
  // This ensures consistent compilation results
  compilerVersion: '0.8.20',
  // Configure which files to instrument for coverage
  // This helps focus on the important contracts
  istanbulFolder: './coverage',
  istanbulReporter: ['html', 'lcov', 'text', 'json'],
  // Skip contracts that don't need coverage
  // or are from external dependencies
  skipContracts: [
    'mocks/',
    'interfaces/',
    'vendor/',
    'test/',
    'openzeppelin/'
  ]
};
