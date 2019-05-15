const axios = require('axios');

const setupServerURL = 'http://setup:3000';

async function createChannel(params) {
  return axios.post(`${setupServerURL}/channel`, params);
}

async function addOrgToChannel(params) {
  return axios.post(`${setupServerURL}/add-org`, params);
}

async function addOrgToConsortium(params) {
  return axios.post(`${setupServerURL}/add-org-to-consortium`, params);
}

async function getChannel(params) {
  return axios.get(`${setupServerURL}/channel`, {
    params
  });
}

module.exports = {
  createChannel,
  getChannel,
  addOrgToChannel,
  addOrgToConsortium
};
