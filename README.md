# Izy DataConsole Message Queue Feature

For command line access use:

	npm run consume queryObject.queueConfigId xxxx-xxxx-xxxx-xxxx queryObject.queueName myQueue queryObject.ack true
	npm run publish queryObject.queueConfigId xxxx-xxxx-xxxx-xxxx queryObject.queueName myQueue queryObject.messageString helloworld|timestamp

# Changelog


# V1
* add timestamp generation for publish
* add ack flag for the consumer
    * normally without ack, the consume would be a "poke"


