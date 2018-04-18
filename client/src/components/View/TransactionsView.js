/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { withStyles } from 'material-ui/styles';
import PropTypes from 'prop-types';
import Card, { CardContent } from 'material-ui/Card';
import Typography from 'material-ui/Typography';

const styles = theme => ({
    root: {
        flexGrow: 1,
        paddingTop: 42,
        position: 'relative',
    },
    card: {
        height: 250,
        width: 1215,
        margin: 20,
        textAlign: 'left',
        display: 'inline-block',
    },
    title: {
        fontSize: 16,
        color: theme.palette.text.secondary,
        position: 'absolute',
        left: 40,
        top: 60
    },
    content: {
        fontSize: 12,
        color: theme.palette.text.secondary,
        position: 'absolute',
        left: 40,
        top: 70
    }
});

class TransactionsView extends Component {
    constructor(props, context) {
        super(props, context);
    }
    render() {
        const { classes } = this.props;

        return (
            <Card className={classes.card} >
                <CardContent>
                    <Typography className={classes.title}>Transactions </Typography>
                    <CardContent className={classes.content}>
                        Transactions details goes here
                        <Typography className={classes.content} >
                            tx_id:{this.props.transaction.tx_id} <br />
                            creator_msp:{this.props.transaction.creator_msp} <br />
                            endsorments: needed! <br />
                        </Typography>
                    </CardContent>
                </CardContent>
            </Card>

        );
    }
}


TransactionsView.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(TransactionsView);
