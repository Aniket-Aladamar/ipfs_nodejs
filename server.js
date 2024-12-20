import express from 'express';
import cors from 'cors';
import { create } from 'ipfs-http-client';

const app = express();
const ipfs = create({ host: 'localhost', port: 5001, protocol: 'http' });

app.use(cors());
app.use(express.json());

let subscribedTopics = new Set();

// Endpoint to get Peer ID
app.get('/peer-id', async (req, res) => {
  try {
    const id = await ipfs.id();
    res.json({ peerId: id.id });
  } catch (error) {
    console.error('Error fetching Peer ID:', error);
    res.status(500).send('Error fetching Peer ID');
  }
});

// Endpoint to subscribe to a topic
app.post('/subscribe', async (req, res) => {
  const { topic } = req.body;

  if (subscribedTopics.has(topic)) {
    return res.status(400).json({ message: 'Already subscribed to this topic.' });
  }

  try {
    await ipfs.pubsub.subscribe(topic, (msg) => {
      const message = new TextDecoder().decode(msg.data);
      console.log(`Message received on topic '${topic}':`, message);
    });

    subscribedTopics.add(topic);
    res.json({ message: `Subscribed to topic '${topic}'` });
  } catch (error) {
    console.error('Error subscribing to topic:', error);
    res.status(500).send('Error subscribing to topic');
  }
});

// Endpoint to publish a message to a topic
app.post('/publish', async (req, res) => {
  const { topic, message } = req.body;

  try {
    await ipfs.pubsub.publish(topic, new TextEncoder().encode(message));
    res.json({ message: `Message published to '${topic}': ${message}` });
  } catch (error) {
    console.error('Error publishing message:', error);
    res.status(500).send('Error publishing message');
  }
});

// Endpoint to list subscribed topics
app.get('/subscribed-topics', (req, res) => {
  res.json({ topics: Array.from(subscribedTopics) });
});

// Endpoint to list peers in subscribed topics
app.get('/topic-peers', async (req, res) => {
  const peers = {};
  try {
    for (const topic of subscribedTopics) {
      const topicPeers = await ipfs.pubsub.peers(topic);
      peers[topic] = topicPeers;
    }
    res.json({ peers });
  } catch (error) {
    console.error('Error fetching peers:', error);
    res.status(500).send('Error fetching peers');
  }
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
