/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import Express from 'express';
import bodyParser from 'body-parser';
import swaggerUi from 'swagger-ui-express';
import compression from 'compression';
import passport from 'passport';
import RateLimit from 'express-rate-limit';
import { PlatformBuilder } from './platform/PlatformBuilder';
import explorerconfig from './explorerconfig.json';
import { PersistenceFactory } from './persistence/PersistenceFactory';
import { authroutes } from './rest/authroutes';
import { dbroutes } from './rest/dbroutes';
import { platformroutes } from './rest/platformroutes';
import { adminroutes } from './platform/fabric/rest/adminroutes';
import { explorerConst } from './common/ExplorerConst';
import { explorerError } from './common/ExplorerMessage';
import { authCheckMiddleware } from './middleware/auth-check';
import swaggerDocument from './swagger.json';
import { ExplorerError } from './common/ExplorerError';
import { localLoginStrategy } from './passport/local-login';

/**
 *
 *
 * @class Explorer
 */
export class Explorer {
	app = Express();
	persistence: any;
	platforms: any[];

	/**
	 * Creates an instance of explorerConst.
	 * @memberof Explorer
	 */
	constructor() {
		// set up rate limiter: maximum of 1000 requests per minute

		const limiter = new RateLimit({
			windowMs: 1 * 60 * 1000, // 1 minute
			max: 1000
		});
		// apply rate limiter to all requests
		this.app.use(limiter);

		this.app.use(bodyParser.json());
		this.app.use(
			bodyParser.urlencoded({
				extended: true
			})
		);

		// eslint-disable-next-line spellcheck/spell-checker
		// handle rate limit, see https://lgtm.com/rules/1506065727959/

		this.app.use(passport.initialize());
		if (process.env.NODE_ENV !== 'production') {
			this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
		}
		this.app.use(compression());
		this.persistence = null;
		this.platforms = [];
	}

	/**
	 *
	 *
	 * @returns
	 * @memberof Explorer
	 */
	getApp() {
		return this.app;
	}

	/**
	 *
	 *
	 * @param {*} broadcaster
	 * @memberof Explorer
	 */
	async initialize(broadcaster) {
		if (!explorerconfig[explorerConst.PERSISTENCE]) {
			throw new ExplorerError(explorerError.ERROR_1001);
		}
		if (!explorerconfig[explorerconfig[explorerConst.PERSISTENCE]]) {
			throw new ExplorerError(
				explorerError.ERROR_1002,
				explorerconfig[explorerConst.PERSISTENCE]
			);
		}
		this.persistence = await PersistenceFactory.create(
			explorerconfig[explorerConst.PERSISTENCE],
			explorerconfig[explorerconfig[explorerConst.PERSISTENCE]]
		);

		for (const pltfrm of explorerconfig[explorerConst.PLATFORMS]) {
			const platform = await PlatformBuilder.build(
				pltfrm,
				this.persistence,
				broadcaster
			);

			platform.setPersistenceService();

			// Initializing the platform
			await platform.initialize();

			// Make sure that platform instance will be referred after its initialization
			passport.use('local-login', localLoginStrategy(platform));

			this.app.use('/api', authCheckMiddleware);

			const authrouter = Express.Router();

			// Initializing the rest app services
			await authroutes(authrouter, platform);

			const apirouter = Express.Router();

			// Initializing the rest app services
			dbroutes(apirouter, platform);
			await platformroutes(apirouter, platform);
			await adminroutes(apirouter, platform);

			this.app.use('/auth', authrouter);
			this.app.use('/api', apirouter);

			// Initializing sync listener
			platform.initializeListener(explorerconfig.sync);

			this.platforms.push(platform);
		}
	}

	/**
	 *
	 *
	 * @memberof Explorer
	 */

	close() {
		if (this.persistence) {
			this.persistence.closeconnection();
		}
		for (const platform of this.platforms) {
			if (platform) {
				platform.destroy();
			}
		}
	}
}
