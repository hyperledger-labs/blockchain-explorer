/**
 *    SPDX-License-Identifier: Apache-2.0
 */

const User = require('./../models/User');

const { responder } = require('./../../../rest/requestutils');

/**
 *
 *
 * @param {*} router
 * @param {*} platform
 */
const adminroutes = async function(router, platform) {
	const proxy = platform.getProxy();

	/*
	 * Register
	 * curl 'http://<host>:<port>/api/register'  -H 'Accept: application/json'
	 * -H 'Authorization: bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.8iTytz6wkPMVJzgD3jIGTQ2s2UZLO8nzvJQJGR0rs_0'
	 * -H 'Content-Type: application/json'
	 * --data-binary '{ "user": "user@gmail.com", "password": "adminpw", "affiliation": "department1", "roles": "client" }' --compressed
	 *
	 * "affiliation": "department1" see fabric-ca server configuration, https://hyperledger-fabric-ca.readthedocs.io/en/latest/serverconfig.html
	 */

	router.post(
		'/register',
		responder(async req => {
			const reqUser = await new User(req.body).asJson();
			return await proxy.register(reqUser);
		})
	);
};

module.exports = adminroutes;
