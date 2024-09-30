# NodePulse Documentation

NodePulse is a lightweight JavaScript library designed to help developers maintain and utilize a list of healthy nodes (Currently it supports Hyperion and Atomic API nodes). The library connects to an API that provides a list of healthy nodes, which it regularly refreshes, and can fallback to a predefined list of default nodes in case of API failure.


## Usage

### Basic Example

**Here’s an example of how to use NodePulse to retrieve a healthy node from the list:**

```js
const NodePulse = require('./nodePulse');

// Initialize NodePulse with default options
const nodePulse = new NodePulse();

// Retrieve the next healthy node in the list
const node = nodePulse.getNode();
console.log(`Using node: ${node}`);
```

### Custom Options

You can customize the behavior of NodePulse by passing an options object when creating an instance. Available options include:

	•	nodeType: Type of nodes to use ('hyperion' or 'atomic').
	•	network: Network to use ('mainnet' or 'testnet').
	•	nodeCount: Number of nodes to retrieve from the API.
	•	updateInterval: How often (in milliseconds) to refresh the node list.
	•	apiUrl: The API URL to fetch healthy nodes.



**Example of using custom options:**


```js
const NodePulse = require('./nodePulse');

// Initialize with custom options
const nodePulse = new NodePulse({
  nodeType: 'atomic',
  network: 'testnet',
  nodeCount: 5,
  updateInterval: 60000, // Refresh every minute
  apiUrl: 'http://nodepulse.sentnl.io/nodes',
});

// Retrieve a node from the custom configuration
const node = nodePulse.getNode();
console.log(`Using node: ${node}`);
```


## Class Methods

### constructor(options)

The constructor initializes the NodePulse instance. It accepts an options object to configure the behavior of the node-fetching mechanism.

Parameters:

	•	options (object):
	•	nodeType (string, default: 'hyperion'): Type of node ('hyperion' or 'atomic').
	•	network (string, default: 'mainnet'): Which network to connect to ('mainnet' or 'testnet').
	•	nodeCount (number, default: 3): How many nodes to fetch from the API.
	•	updateInterval (number, default: 30000): Interval for refreshing the node list, in milliseconds.
	•	apiUrl (string, default: 'http://nodepulse.sentnl.io/nodes'): The API URL from which to fetch the healthy node list.  (For now Sentnl are the only ones running this, but we hope more providers will offer this service in the future.)

```js
const nodePulse = new NodePulse({
  nodeType: 'atomic',
  network: 'testnet',
  nodeCount: 3,
  updateInterval: 60000,
  apiUrl: 'http://api.custom.com/nodes'
});
```


### getNode()

Returns the next healthy node from the internal list. If the node list is empty, it will attempt to refresh the list before returning a node. The nodes are selected using a round-robin strategy.


**Example:**

```js
const node = nodePulse.getNode();
console.log(`Using node: ${node}`);
```


### refreshNodes()

This method allows for manually refreshing the list of nodes. By default, NodePulse automatically refreshes the list at regular intervals, but you can call this method manually if needed.

```js
nodePulse.refreshNodes().then(() => {
  const node = nodePulse.getNode();
  console.log(`Manually refreshed. Using node: ${node}`);
});
```


## Default Nodes

If the API fails to return healthy nodes or an error occurs, NodePulse falls back to a predefined list of default nodes. The default nodes are separated by type (hyperion or atomic) and by network (mainnet or testnet).

Default nodes:

```js
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
```



## Error Handling and Retries

If fetching nodes from the API fails, NodePulse will retry the request up to 3 times. After all retry attempts fail, the library will either retain the existing nodes (if any) or fallback to the default nodes.



## Event Hooks

NodePulse now provides several event hooks that allow developers to react to various events during the node-fetching process. These hooks can be provided as part of the options object when creating an instance of NodePulse.



### onNodeUpdate(nodes)

This hook is triggered every time the node list is successfully updated. The updated list of nodes is passed as an argument.

```js
onNodeUpdate: (nodes) => {
  console.log('Nodes updated:', nodes);
}
```

Parameters:

	•	nodes: The list of updated node URLs.


### onError(error)

This hook is called whenever there is an error while fetching nodes from the API. The error object is passed as an argument.

```js
onError: (error) => {
  console.error('An error occurred:', error.message);
}
```

Parameters:

	•	error: The error object.


### onFallback(fallbackType, nodes)

This hook is triggered when the library falls back to existing or default nodes after failing to fetch new nodes from the API. It passes the fallback type ('existing' or 'default') and the list of fallback nodes as arguments.

```js
onFallback: (fallbackType, nodes) => {
  if (fallbackType === 'existing') {
    console.log('Using existing nodes:', nodes);
  } else if (fallbackType === 'default') {
    console.log('Using default nodes:', nodes);
  }
}
```

Parameters:

	•	fallbackType: A string indicating the fallback type. It can either be 'existing' (using the existing node list) or 'default' (using the default nodes).
	•	nodes: The list of fallback node URLs.
