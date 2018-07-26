/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import 'react-select/dist/react-select.css';
import React, { Component } from 'react';
import clientJson from '../../../package.json';
import Version from '../../FabricVerison';

export class FooterView extends Component {
  handleThemeChange = () => {
    const { isLight } = this.state;
    const theme = !isLight;
    this.setState({ isLight: theme });
  };

  render() {
    return (
      <div>
        <div className="footer">
          {'Hyperledger Explorer Client Version: '}
          {clientJson.version}
          &emsp;
          {'Fabric Compatibility: '} {Version.map(version => version)}
        </div>
      </div>
    );
  }
}

export default FooterView;
