/*
 *SPDX-License-Identifier: Apache-2.0
 */

import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinonChai from 'sinon-chai';

chai.use(chaiAsPromised);
chai.use(sinonChai);

export const expect = chai.expect;
