/*
 * SPDX-License-Identifier: Apache-2.0
 */

import queryString from 'query-string';
/**
 *
 *
 * @param {*} action
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
async function respond(action, req, res, next) {
	try {
		const value = await action(req, res, next);
		res.status(200).send(value);
	} catch (error) {
		res.send({
			status: 400,
			message: error.toString()
		});
	}
}

/**
 *
 *
 * @param {*} action
 * @returns
 */
export function responder(action: any) {
	return async function(req: any, res: any, next: any) {
		return await respond(action, req, res, next);
	};
}

/**
 *
 *
 * @param {*} req
 * @param {*} res
 */
export function invalidRequest(req, res) {
	const payload = reqPayload(req);
	res.send({
		status: 400,
		error: 'BAD REQUEST',
		payload
	});
}

/**
 *
 *
 * @param {*} req
 * @param {*} res
 */
export function notFound(req, res) {
	const payload = reqPayload(req);
	res.send({
		status: 404,
		error: 'NOT FOUND',
		payload
	});
}

/**
 *
 *
 * @param {*} req
 * @returns
 */
function reqPayload(req) {
	const requestPayload = [];
	const { params, query, body } = req;

	requestPayload.push({
		params
	});

	requestPayload.push({
		query
	});

	requestPayload.push({
		body
	});
	return requestPayload;
}

export const parseOrgsArray = function(reqQuery: { [key: string]: any }) {
	if (reqQuery) {
		// eslint-disable-next-line spellcheck/spell-checker
		// workaround 'Type confusion through parameter tampering', see `https //lgtm dot com/rules/1506301137371 `
		const orgsStr = queryString.stringify(reqQuery);

		if (orgsStr) {
			const parsedReq = queryString.parse(orgsStr);
			if (parsedReq && parsedReq.orgs) {
				return Array.isArray(parsedReq) ? parsedReq.orgs : [parsedReq.orgs];
			}

			return [];
		}
	}
};

export const queryDatevalidator = function(from: string, to: string) {
	if (!isNaN(Date.parse(from)) && !isNaN(Date.parse(to))) {
		from = new Date(from).toISOString();
		to = new Date(to).toISOString();
	} else {
		from = new Date(Date.now() - 864e5).toISOString();
		to = new Date().toISOString();
	}
	return { from, to };
};
