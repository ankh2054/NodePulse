const NodePulse = require('../NodePulse');

const nodePulse = new NodePulse({
  nodeType: 'hyperion', // or 'atomic'
  network: 'mainnet', // or 'testnet'
  nodeCount: 3,
  updateInterval: 30000, // 30 seconds
  apiUrl: 'http://127.0.0.1:3000/nodes',
  onNodeUpdate: (nodes) => {
    console.log('Nodes updated:', nodes);
  },
  onError: (error) => {
    console.error('Error occurred:', error.message);
  },
  onFallback: (type, nodes) => {
    console.warn(`Fallback to ${type} nodes:`, nodes);
  }
});

async function example() {
  try {

    const node = await nodePulse.getNode();
    console.log('Using node:', node);
    
    const response = await fetch(`${node}/v1/chain/get_info`);
    const chainInfo = await response.json();
    console.log('Chain info:', chainInfo);
  } catch (error) {
    console.error('Failed to get chain info:', error.message);
  }
}

example();

// Then call example() every 10 seconds
setInterval(example, 10000);