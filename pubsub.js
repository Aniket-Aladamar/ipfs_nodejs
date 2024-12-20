import { create } from 'ipfs-http-client';

async function runPubSub() {
  const ipfs = create({ host: 'localhost', port: 5001, protocol: 'http' });
  const topic = 'example-topic';

  try {
    // Get the Peer ID
    const id = await ipfs.id();
    console.log(`Your Peer ID: ${id.id}\n`);

    // Subscribe to the topic
    await ipfs.pubsub.subscribe(topic, (message) => {
      const receivedMessage = new TextDecoder().decode(message.data);
      console.log(`Message received on topic '${topic}': ${receivedMessage}`);
    });
    console.log(`Subscribed to topic: ${topic}\n`);

    // Publish a message every 10 seconds
    setInterval(async () => {
      const message = `Hello from ${id.id} at ${new Date().toISOString()}`;
      await ipfs.pubsub.publish(topic, new TextEncoder().encode(message));
      console.log(`Published message to '${topic}': ${message}`);
    }, 10000);

    // Periodically show the topics you're subscribed to and peers connected to each
    setInterval(async () => {
      try {
        // Fetch peers subscribed to the current topic
        const peers = await ipfs.pubsub.peers(topic);
        console.clear();
        console.log(`Your Peer ID: ${id.id}\n`);
        console.log(`Subscribed Topics:\n- ${topic}`);
        console.log(`\nPeers subscribed to '${topic}':`);
        if (peers.length === 0) {
          console.log('No peers connected yet.');
        } else {
          peers.forEach((peer) => console.log(`- ${peer}`));
        }
      } catch (error) {
        console.error('Error fetching subscribed topics or peers:', error);
      }
    }, 5000);
  } catch (error) {
    console.error('Error:', error);
  }
}

runPubSub();
