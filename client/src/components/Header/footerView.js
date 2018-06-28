/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import 'react-select/dist/react-select.css';
import React, { Component } from 'react';
import clientJson from '../../../package.json';
import Version from '../../../src/FabricVerison';

export class FooterView extends Component {

  handleChange = (selectedOption) => {
    this.setState({ selectedOption: selectedOption.value });
    this.props.getChangeChannel(selectedOption.value);
  }

  handleThemeChange = () => {
    const theme = !this.state.isLight;
    this.setState({ isLight: theme });
  }


  render() {

    return (
      <div>
        <div class="footer">
          {'Hyperledger Explorer Client Version: '}{clientJson.version}&emsp;
              {'Fabric Compatibility: '} {Version.map(version => {
            return version;
          })
          }
        </div>
      </div>
    );
  }
}

export default FooterView;