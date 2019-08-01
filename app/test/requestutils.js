/*
    SPDX-License-Identifier: Apache-2.0
*/

const expect = require('chai').expect;
const assert = require('assert');
const chai = require('chai');
const chaiHttp = require('chai-http');
const helper = require('../common/helper');
const reqMultiOrgs = require('./fixtures/reqMultiOrgs.json');
const reqOneOrg = require('./fixtures/reqOneOrg.json');
const reqNoOrgs = require('./fixtures/reqNoOrgs.json');

const should = chai.should();
chai.use(chaiHttp);
const requestutils = require('../rest/requestutils.js');

describe('requestutils().orgsArrayToString should return empty string', () => {
	const emptyString = requestutils.orgsArrayToString(reqNoOrgs);
	it('requestutils().orgsArrayToString should return empty string', () => {
		assert.equal('', emptyString);
	});
});

describe('requestutils().orgsArrayToString should return single quotes value', () => {
	const oneOrgString = requestutils.orgsArrayToString(reqOneOrg);
	it('requestutils().orgsArrayToString should return single quotes value', () => {
		assert.equal("'OrgOne'", oneOrgString);
	});
});

describe('requestutils().orgsArrayToString should return comma separated single quotes values ', () => {
	const multiOrgsString = requestutils.orgsArrayToString(reqMultiOrgs);
	const multiOrgs = "'OrdererMSP','Org2MSP'";
	it('requestutils().orgsArrayToString should return comma separated single quotes values ', () => {
		assert.equal(multiOrgs, multiOrgsString);
	});
});
