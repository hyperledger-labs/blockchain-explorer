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
        minWidth: 1290,
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

function ChannelView(props) {
    const { classes } = props;
    return (
        <div>
            <Card className={classes.card} title={'Channel List'}>
                <CardContent>
                    <Typography className={classes.title}>Channel List </Typography>
                </CardContent>
                <CardContent className={classes.content}>
                    Channel details goes here
                </CardContent>
            </Card>
        </div>
    );
}


ChannelView.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(ChannelView);
