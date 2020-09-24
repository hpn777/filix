const GenericDB = require('../../Modules/GenericDB')
const Membership = require('../../Modules/Membership')
const Dashboard = require('../../Modules/Dashboard')
const ServerManager = require('../../Modules/ServerManager')
const WebSocketServer = require('../../Modules/WebSocketServer')

var config = {
	logger: {
		includeAppInfo: true
	},
	appDBModule: 'AppDB',
	membershipModule: 'Membership',
	modules: [{
		id: 'AppDB',
		module: GenericDB,
		autofetch: true,
		dbConfig: {
			protocol: 'mysql',
			user: 'root',
			password: 'visor777',
			host: 'mysql',
			database: 'appdata',
			query: {
				pool: true,
			}
		}
	},{
		id: 'EmployeesDB',
		module: GenericDB,
		autofetch: false,
		dbConfig: {
			protocol: 'mysql',
			user: 'root',
			password: 'visor777',
			host: 'mysql',
			database: 'employees',
			query: {
				pool: true,
			}
		}
	},{
		id: 'Membership',
		module: Membership,
		dbModule: 'AppDB'
	}, {
		id: 'Dashboard',
		module: Dashboard,
		dbModule: 'AppDB',
		membershipModule: 'Membership'
	}, {
		id: 'ServerManager',
		module: ServerManager,
		port: 1177
	}, {
		id: 'WebSocketServer',
		module: WebSocketServer,
		port: 30200
	}]
}

module.exports = config;