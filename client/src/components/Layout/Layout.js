/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import MenuBar from '../CountHeader/MenuBar';

class Layout extends Component {
    constructor(props) {
        super(props);
        this.state = { page: 'index.js', description: 'Main layout' };
    }

    render() {
        return (
            <div>
                <div>
                    <MenuBar />
                </div>
            </div>
        );
    }
}

export default Layout;
