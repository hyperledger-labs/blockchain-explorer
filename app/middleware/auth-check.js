/*
 * SPDX-License-Identifier: Apache-2.0
 */

// @ts-check

const jwt = require('jsonwebtoken');
// @ts-ignore
const config = require('../explorerconfig.json');
// @ts-check
/**
 *  The Auth Checker middleware function.
 */
module.exports = (req, res, next) => {
	if (!req.headers.authorization) {
		return res.status(401).end();
	}

	// Get the last part from a authorization header string like "bearer token-value"
	const token = req.headers.authorization.split(' ')[1];

	// Decode the token using a secret key-phrase
	return jwt.verify(token, config.jwt.secret, (err, decoded) => {
		// The 401 code is for unauthorized status
		if (err) {
			return res.status(401).end();
		}

		const userId = decoded.sub;

		req.userId = userId;

		// TODO: check if a user exists, otherwise error

		return next();
	});
};
