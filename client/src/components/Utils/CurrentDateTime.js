/**
 *    SPDX-License-Identifier: Apache-2.0
 */

/**
 * Component to display current date with an interval of 1 second
 */

import React, { Component } from 'react';
class CurrentDateTime extends Component {
    constructor() {
        super();
        this.state = {
            curTime: null
        }
    }
    componentDidMount() {
        setInterval(() => {
            this.setState({
                curTime: new Date().toLocaleString()
            })
        }, 1000)
    }
    render() {
        return (
            <span>{this.state.curTime}</span>
        );
    }
}

export default CurrentDateTime