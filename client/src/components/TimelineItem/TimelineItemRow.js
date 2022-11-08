import { Typography } from '@material-ui/core';
import { withStyles } from '@material-ui/styles';
import { Component } from 'react';

const styles = theme => {
	return {
		row: {
			width: '100%',
			display: 'flex',
			marginBottom: '12px'
		},
		title: {
			minWidth: '130px',
			paddingRight: '28px',
			fontSize: '14px',
			fontWeight: 500
		},
		value: {
			minWidth: 0,
			overflowWrap: 'break-word',
			flex: 1,
			color: theme.palette.text.secondary
		}
	};
};

class TimelineItemRow extends Component {
	render() {
		const { classes, title, value } = this.props;

		return (
			<div className={classes.row}>
				<Typography className={classes.title}>{title}</Typography>
				<Typography variant="body2" className={classes.value}>
					{value}
				</Typography>
			</div>
		);
	}
}

export default withStyles(styles)(TimelineItemRow);
