/*
 * SPDX-License-Identifier: Apache-2.0
 */

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

const orgsArrayToString = function(orgs) {
	let temp = '';
	if (Array.isArray(orgs) || typeof orgs === 'object') {
		orgs.forEach((element, i) => {
			temp += `'${element}'`;
			if (orgs.length - 1 !== i) {
				temp += ',';
			}
		});
	} else if (orgs) {
		temp = `'${orgs}'`;
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
