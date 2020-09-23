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
async function respond(action: (arg0: any, arg1: any, arg2: any) => any, req: any, res: { status: (arg0: number) => { (): any; new(): any; send: { (arg0: any): void; new(): any; }; }; send: (arg0: { status: number; message: any; }) => void; }, next: any) {
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
function responder(action: any) {
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
function invalidRequest(req: any, res: { send: (arg0: { status: number; error: string; payload: any[]; }) => void; }) {
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
function notFound(req: any, res: { send: (arg0: { status: number; error: string; payload: any[]; }) => void; }) {
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
function reqPayload(req: { params: any; query: any; body: any; }) {
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

const orgsArrayToString = function(reqQuery: { [key: string]: any; }) {
	let temp = '';
	if (reqQuery) {
		// eslint-disable-next-line spellcheck/spell-checker
		// workaround 'Type confusion through parameter tampering', see `https //lgtm dot com/rules/1506301137371 `
		const orgsStr = queryString.stringify(reqQuery);

		if (orgsStr) {
			const parsedReq = queryString.parse(orgsStr);
			if (parsedReq && parsedReq.orgs) {
				const orgsArray = parsedReq.orgs.toString().split(',');
				// format DB value for IN clause, ex: in ('a', 'b', 'c')
				if (orgsArray) {
					orgsArray.forEach((element, i) => {
						temp += `'${element}'`;
						if (orgsArray.length - 1 !== i) {
							temp += ',';
						}
					});
				}
			}
		}
	}

	return temp;
};

const queryDatevalidator = function(from: string, to: string) {
	if (!isNaN(Date.parse(from)) && !isNaN(Date.parse(to))) {
		from = new Date(from).toISOString();
		to = new Date(to).toISOString();
	} else {
		from = new Date(Date.now() - 864e5).toISOString();
		to = new Date().toISOString();
	}
	return { from, to };
};

module.exports = {
	respond,
	responder,
	invalidRequest,
	notFound,
	reqPayload,
	orgsArrayToString,
	queryDatevalidator
};
