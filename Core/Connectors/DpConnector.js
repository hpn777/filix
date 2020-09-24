var guid = require('../../../Utils/guid')

const DpConnector = function (config, subscriptionManager, callback) {
	var dataProviderId = config.dataProviderId
	var dataProvider = subscriptionManager.getDataProvider(config.dataProviderId)
	var uuid = guid()
	var subscriptionRequest = {
		requestId: uuid,
		subscriptionId: uuid,
		containerId: uuid,
		dataProviderId: config.dataProviderId,
		connectionType: 'cluster'
	}

	subscriptionManager.Subscribe(subscriptionRequest)

	var subscription = subscriptionManager.subscriptions.get(uuid)

	subscription.error$ = dataProvider.error$.filter((x) => { return x.subscriptionId === uuid })

	subscription.doRequest = function (request) {
		var requestId = guid()

		setImmediate(() => {
			subscriptionManager.Execute({
				requestId: requestId,
				subscriptionId: uuid,
				containerId: uuid,
				dataProviderId: dataProviderId,
				connectionType: 'cluster',
				parameters: request
			})
		})

		return dataProvider.message$
			.filter((x) => { return x.requestId === requestId })
			.take(1)
	}

	subscription.doSubscription = function (request) {
		var requestId = guid()

		setImmediate(() => {
			subscriptionManager.Execute({
				requestId: requestId,
				subscriptionId: uuid,
				containerId: uuid,
				dataProviderId: dataProviderId,
				connectionType: 'cluster',
				parameters: request
			})
		})

		return dataProvider.message$
			.filter((x) => { return x.requestId === requestId })
	}

	callback(subscription)
}

module.exports = DpConnector
