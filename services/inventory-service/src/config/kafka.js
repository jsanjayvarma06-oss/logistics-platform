const QSTASH_TOKEN = process.env.QSTASH_TOKEN;
const QSTASH_URL = 'https://qstash.upstash.io/v2/publish/';

function getTargetUrl(topic) {
  const DISPATCH_URL = process.env.DISPATCH_SERVICE_URL || 'http://localhost:3002';

  const routes = {
    'inventory.stock.added': `${DISPATCH_URL}/api/events/inventory.stock.added`,
    'inventory.stock.removed': `${DISPATCH_URL}/api/events/inventory.stock.removed`,
    'inventory.stock.reserved': `${DISPATCH_URL}/api/events/inventory.stock.reserved`,
  };
  return routes[topic];
}

async function connectKafka() {
  console.log('  QStash messaging ready (HTTP-based)');
}

async function publishEvent(topic, payload) {
  const targetUrl = getTargetUrl(topic);
  if (!targetUrl) {
    console.warn(`No target URL for topic: ${topic}`);
    return;
  }

  try {
    const res = await fetch(`${QSTASH_URL}${targetUrl}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${QSTASH_TOKEN}`,
        'Content-Type': 'application/json',
        'Upstash-Retries': '3',
      },
      body: JSON.stringify({ ...payload, topic, timestamp: new Date().toISOString() }),
    });

    if (!res.ok) {
      console.error(`QStash publish failed [${topic}]:`, await res.text());
    }
  } catch (err) {
    console.error(`QStash error [${topic}]:`, err.message);
  }
}

module.exports = { connectKafka, publishEvent };
