
const modtask = () => {};
modtask.verbose = {
  logConnectionAttempt: false
};

modtask.consume = (queryObject, cb) => {
  const { queueConfigId, queueName, ack } = queryObject;
  modtask.doChain([
    ['chain.importProcessor', 'chain', {
      verbose: modtask.verbose
    }],
    ['//inline/?loadConfigJSONFromID', { id: queueConfigId }],
    chain => chain(['queue.connect', chain.get('outcome').data]),
    ['queue.consumer', { queueName, ack }],
    chain => console.log('Listening as ' + queueName)
  ]);
};

modtask.publish = (queryObject, cb) => {
  const { queueConfigId, queueName } = queryObject;
  let { messageString } = queryObject;
  if (messageString == 'timestamp') {
    messageString = messageString + '_' + new Date();
  }
  modtask.doChain([
    ['chain.importProcessor', 'chain', {
      verbose: modtask.verbose
    }],
    ['//inline/?loadConfigJSONFromID', { id: queueConfigId }],
    chain => chain(['queue.connect', chain.get('outcome').data]),
    ['queue.publisher', { queueName, messageString }],
   // ['queue.disconnect']
  ]);
};

modtask.loadConfigJSONFromID = (queryObject, cb) => {
  const { id } = queryObject;
  try {
    cb({ success: true, data: JSON.parse(require('fs').readFileSync(`${id}`)) })
  } catch(e) {
    cb({ reason: e.message });
  }
}
