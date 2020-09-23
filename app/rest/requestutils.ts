/*
 * SPDX-License-Identifier: Apache-2.0
 */

const queryString = require('query-string');
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
function responder(action) {
	return async function(req, res, next) {
		return await respond(action, req, res, next);
	};
}

/**
 *
 *
 * @param {*} req
 * @param {*} res
 */
function invalidRequest(req, res) {
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
function notFound(req, res) {
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

const orgsArrayToString = function(reqQuery) {
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

const queryDatevalidator = function(from, to) {
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
