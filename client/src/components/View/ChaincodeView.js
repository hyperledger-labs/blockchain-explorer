/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import { withStyles } from 'material-ui/styles';
import PropTypes from 'prop-types';
import FontAwesome from 'react-fontawesome';
import Typography from 'material-ui/Typography';
import {
    DialogContent,
    DialogContentText,
    DialogTitle,
} from 'material-ui/Dialog';
import moment from 'moment-timezone';

var beautify = require('js-beautify');
const styles = theme => ({
    container: {
        border: "3px solid #afeeee"
    },
    container1: {
        display: "flex",
        flexWrap: "wrap"
    }
});

class ChaincodeView extends Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            loading: false
        }
    }

    componentWillReceiveProps(nextProps) {
        this.setState({ loading: false });
    }

    render() {
        var formattedSrc = beautify(this.props.chaincode.source, { indent_size: 4 });
        var srcHeader = this.props.chaincode.chaincodename + " " + this.props.chaincode.version;
        const { classes } = this.props;

        return (

            < div className={["card", classes.container].join(" ")} >
                <div className="card-header" align="center">
                    <h3> {srcHeader}</h3>
                </div>
                <div className="card-body">
                    <div className={classes.container1}>
                        <textarea className="source-code" readOnly>
                            {formattedSrc}
                        </textarea>

                    </div>
                </div>
            </div >

        );
    }
}

ChaincodeView.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(ChaincodeView);
