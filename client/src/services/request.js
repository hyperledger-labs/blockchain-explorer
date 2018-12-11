/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import agent from 'superagent';

export const post = (uri, payload) =>
  new Promise((resolve, reject) => {
    agent
      .post(uri)
      .send(payload)
      .set('Accept', 'application/json')
      .end(withPromiseCallback(resolve, reject));
  });

export const postForm = (uri, form, file) =>
  new Promise((resolve, reject) => {
    agent
      .post(uri)
      .field('name', form.name)
      .field('version', form.version)
      .field('type', form.type)
      .field('peer', form.peer)
      .field('channel', form.channel)
      .attach('file', file)
      .end(withPromiseCallback(resolve, reject));
  });

export const get = uri =>
  new Promise((resolve, reject) => {
    agent
      .get(uri)
      .set('Accept', 'application/json')
      .end(withPromiseCallback(resolve, reject));
  });
export const put = (uri, payload) =>
  new Promise((resolve, reject) => {
    agent
      .put(uri)
      .send(payload)
      .set('Accept', 'application/json')
      .end(withPromiseCallback(resolve, reject));
  });
export const deleteRequest = (uri, payload) =>
  new Promise((resolve, reject) => {
    agent
      .delete(uri)
      .send(payload)
      .set('Accept', 'application/json')
      .end(withPromiseCallback(resolve, reject));
  });
export const withPromiseCallback = (resolve, reject) => (error, response) => {
  if (error) {
    console.error(error);
    reject({ error });
  } else {
    resolve(response.body);
  }
};
