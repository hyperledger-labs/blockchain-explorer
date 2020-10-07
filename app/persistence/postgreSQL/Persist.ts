/**
 * SPDX-License-Identifier: Apache-2.0
 */
import { PgService } from './PgService';
import { MetricService } from '../fabric/MetricService';
import { CRUDService } from '../fabric/CRUDService';
import { UserDataService } from '../fabric/UserDataService';
/**
 *
 *
 * @class Persist
 */
export class Persist {
	pgservice: PgService;
	metricservice: MetricService;
	crudService: CRUDService;
	userdataservice: UserDataService;

	constructor(pgconfig: any) {
		this.pgservice = new PgService(pgconfig);
		this.metricservice = null;
		this.crudService = null;
		this.userdataservice = null;
	}

	/**
	 *
	 *
	 * @param {*} metricservice
	 * @memberof Persist
	 */
	setMetricService(metricservice: MetricService) {
		this.metricservice = metricservice;
	}

	/**
	 *
	 *
	 * @param {*} crudService
	 * @memberof Persist
	 */
	setCrudService(crudService: CRUDService) {
		this.crudService = crudService;
	}

	/**
	 *
	 *
	 * @param {*} userdataservice
	 * @memberof Persist
	 */
	setUserDataService(userdataservice: UserDataService) {
		this.userdataservice = userdataservice;
	}

	/**
	 *
	 * @returns
	 * @memberof Persist
	 */
	getMetricService() {
		return this.metricservice;
	}

	/**
	 *
	 *
	 * @returns
	 * @memberof Persist
	 */
	getCrudService() {
		return this.crudService;
	}

	/**
	 *
	 * @returns
	 * @memberof Persist
	 */
	getUserDataService() {
		return this.userdataservice;
	}

	/**
	 *
	 *
	 * @returns
	 * @memberof Persist
	 */
	getPGService() {
		return this.pgservice;
	}

	/**
	 *
	 *
	 * @memberof Persist
	 */
	closeconnection() {
		this.pgservice.closeconnection();
	}
}
