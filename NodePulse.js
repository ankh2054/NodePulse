const axios = require('axios');

class NodePulse {
  constructor(options = {}) {
    this.options = {
      nodeType: options.nodeType || 'hyperion',
      network: options.network || 'mainnet',
      nodeCount: options.nodeCount || 3,
      updateInterval: options.updateInterval || 30000,
      apiUrl: options.apiUrl || 'http://127.0.0.1:3000/nodes',
      logLevel: options.logLevel || 'warn', // Add this line
    };

    this.logger = options.logger || console; // Add this line

    this.nodes = [];
    this.currentNodeIndex = 0;
    this.defaultNodes = {
      hyperion: {
        mainnet: [
          'https://wax.eosusa.news',
          'https://wax.greymass.com',
          'https://wax.cryptolions.io',
        ],
        testnet: [
          'https://testnet.waxsweden.org',
          'https://testnet.wax.pink.gg',
          'https://testnet.wax.eosdetroit.io',
        ],
      },
      atomic: {
        mainnet: [
          'https://wax.api.atomicassets.io',
          'https://aa.wax.blacklusion.io',
          'https://wax-aa.eu.eosamsterdam.net',
        ],
        testnet: [
          'https://test.wax.api.atomicassets.io',
          'https://atomic-wax-testnet.eosphere.io',
          'https://testatomic.waxsweden.org',
        ],
      },
    };

    this.hooks = {
      onNodeUpdate: options.onNodeUpdate || (() => {}),
      onError: options.onError || (() => {}),
      onFallback: options.onFallback || (() => {}),
    };

    this.nodesReady = false;
    this.nodesPromise = this.updateNodes();
    setInterval(() => this.updateNodes(), this.options.updateInterval);
  }

  async updateNodes() {
    const maxRetries = 3;
    let retries = 0;

    while (retries < maxRetries) {
      try {
        const response = await axios.get(this.options.apiUrl, {
          params: {
            type: this.options.nodeType,
            network: this.options.network,
            count: this.options.nodeCount,
          },
        });

        if (response.status === 200 && response.data && response.data.length > 0) {
          this.nodes = response.data.map(node => node.url);
          this.log('info', 'Updated nodes:', this.nodes);
          this.hooks.onNodeUpdate(this.nodes);
          this.nodesReady = true;
          return; // Success, exit the function
        } else {
          this.log('warn', `Attempt ${retries + 1}: No nodes received or unexpected response.`);
          this.hooks.onError(new Error('No nodes received or unexpected response'));
        }
      } catch (error) {
        this.log('error', `Attempt ${retries + 1}: Failed to fetch nodes:`, error.message);
        this.hooks.onError(error);
      }

      retries++;
      if (retries < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retrying
      }
    }

    // If all retries fail, keep existing nodes if available, otherwise use default nodes
    if (this.nodes.length > 0) {
      console.warn('All attempts to fetch nodes failed, keeping existing nodes.');
      this.hooks.onFallback('existing', this.nodes);
    } else {
      console.warn('All attempts to fetch nodes failed, using default nodes.');
      this.nodes = this.defaultNodes[this.options.nodeType][this.options.network];
      this.hooks.onFallback('default', this.nodes);
    }
  }

  async getNode() {
    if (!this.nodesReady) {
      await this.nodesPromise;
    }

    if (this.nodes.length === 0) {
      await this.updateNodes();
    }

    const node = this.nodes[this.currentNodeIndex];
    this.currentNodeIndex = (this.currentNodeIndex + 1) % this.nodes.length;
    return node;
  }

  async waitForNodes() {
    if (!this.nodesReady) {
      await this.nodesPromise;
    }
  }

  log(level, ...args) {
    const levels = ['error', 'warn', 'info', 'debug'];
    if (levels.indexOf(level) <= levels.indexOf(this.options.logLevel)) {
      this.logger[level](...args);
    }
  }
}

module.exports = NodePulse;