//https://eth-sepolia.g.alchemy.com/v2/XNww6SSVs-Wuwr630ZhYR4h_sbIrcXW1

require('@nomiclabs/hardhat-waffle');

module.exports = {
  solidity: '0.8.0',
  networks: {
    ropsten: {
      url: 'https://eth-sepolia.g.alchemy.com/v2/XNww6SSVs-Wuwr630ZhYR4h_sbIrcXW1',
      accounts: ['acdd3e9e859e5d12843c03ad1886be6220e8f2cf0887d885ef0953ad3129b7fc']
    },
  },
};