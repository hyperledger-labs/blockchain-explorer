// @ts-check

/*
 * SPDX-License-Identifier: Apache-2.0
 */
import { promisify } from 'util';
import jwt from 'jsonwebtoken';
import { Strategy } from 'passport-local';
import { User } from '../platform/fabric/models/User';
import config from '../explorerconfig.json';

const jwtSignAsync = promisify<
	Record<string, any>,
	jwt.Secret,
	jwt.SignOptions
>(jwt.sign);

export const localLoginStrategy = function(platform) {
	const proxy = platform.getProxy();
	return new Strategy(
		{
			usernameField: 'user',
			passwordField: 'password',
			session: false,
			passReqToCallback: true
		},
		async (req, user, password, done) => {
			const userData = {
				user: user.trim(),
				password: password.trim()
			};

			const reqUser = await new User(req.body).asJson();
			const authResult = await proxy.authenticate(reqUser);
			if (!authResult) {
				return done(null, false, { message: 'Incorrect credentials' });
			}

			const payload = {
				user: reqUser.user,
				network: reqUser.network
			};

			const token = await jwtSignAsync(payload, config.jwt.secret, {
				expiresIn: config.jwt.expiresIn
			});
			const data = {
				message: 'logged in',
				name: userData.user
			};
			return done(null, token, data);
		}
	);
};
