
const modtask = (chainItem, cb, $chain) => {
  if (!modtask.__chainProcessorConfig) modtask.__chainProcessorConfig = {};
  const verbose =  modtask.__chainProcessorConfig.verbose || {};
  var i = 0;
  var params = {};
  params.action = modtask.extractPrefix(chainItem[i++]);
  switch (params.action) {
    case 'disconnect':
      if (!modtask.connected) return $chain.chainReturnCB({ reason: 'not connected' });
      modtask.connection.close();
      cb();
      return true;
    case 'connect':
      if (modtask.connected) return $chain.chainReturnCB({ reason: 'already connected' });
			const queue = require('amqplib/callback_api');
      const config = chainItem[i++] || {};
			if (verbose.logConnectionAttempt) console.log('Connecting to ', config);
      queue.connect(config, function(err, conn) {
        if (err) {
          if (verbose.logConnectionAttempt) console.log('Failed to connect', err);
          return $chain.chainReturnCB({reason: err.message });
        }
        if (verbose.logConnectionAttempt) console.log('Successful');
        modtask.connected = true;
        modtask.connection = conn;
        modtask.connection.on('error', err => {
          console.log(err.message);
          // Note: on normal closure it will be called with err.message 'Connection closing'
        });
        modtask.connection.on('close', () => console.log('close'));
        $chain.set('outcome', { success: true });
        cb();
      });
      return true;
    case 'publisher':
      if (!modtask.connected) return $chain.chainReturnCB({ reason: 'not connected' });
      var query = chainItem[i++] || {};
      var { queueName, messageString } = query;
      if (verbose.logConnectionAttempt) console.log('publisher.create channel ' + queueName);
      modtask.connection.createChannel((err, ch) => {
        if (err) return $chain.chainReturnCB({ reason: err.message });
        if (verbose.logConnectionAttempt) console.log('successful');
        ch.assertQueue(queueName);
        // returns true/false
        if (!ch.sendToQueue(queueName, Buffer.from(messageString))) {
          return $chain.chainReturnCB({ reason: 'sendToQueue failed' });
        }
        $chain.set('outcome', { success: true });
        cb();
      });
      return true;
    case 'consumer':
      if (!modtask.connected) return $chain.chainReturnCB({ reason: 'not connected' });
      var query = chainItem[i++] || {};
      var { queueName, messageString } = query;
      if (verbose.logConnectionAttempt) console.log('consumer.create channel ' + queueName);
      modtask.connection.createChannel((err, ch) => {
        if (err) return $chain.chainReturnCB({ reason: err.message });
        if (verbose.logConnectionAttempt) console.log('successful');
        ch.assertQueue(queueName);
        ch.consume(queueName, msg => {
          console.log(msg.fields, msg.content.toString());
          if (query.ack == 'true') {
             ch.ack(msg);
          }
        });
        $chain.set('outcome', { success: true });
        cb();
      });
      return true;
  }
  return false;
}

modtask.extractPrefix = function(str) {
  var all = ['queue.'];
  for(var i=0; i < all.length; ++i) {
    var prefix = all[i];
    if (str.indexOf(prefix) == 0) {
      return str.substr(prefix.length);
    }
  }
  return str;
}
