import { Box, Typography } from '@material-ui/core';
import { withStyles } from '@material-ui/styles';
import { Component } from 'react';

const styles = theme => {
	return {
		card: {
			padding: '32.5px 48.5px 0 24px',
			minHeight: '116px',
			border: '1px solid #EEEEEE',
			boxShadow: 'inset 1px -1px 0px rgba(102, 102, 102, 0.2)',
			borderRadius: '12px',
			backgroundColor: '#fff'
		},
		iconBox: {
			width: '52px',
			height: '52px',
			marginRight: '24px',
			borderRadius: '8px',
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'center'
		},
		count: {
			color: theme.palette.text.primary,
			fontWeight: 700
		},
		label: {
			color: theme.palette.text.secondary
		}
	};
};

const getBackgroundColor = label => {
	switch (label) {
		case 'BLOCKS':
			return 'rgba(183, 211, 255, 1)';
		case 'TRANSACTIONS':
			return 'rgba(255, 217, 101, 1)';
		default:
			return '';
	}
};

class StatCard extends Component {
	render() {
		const { classes, count, label, icon } = this.props;

		return (
			<div className={classes.card}>
				<Box display="flex">
					<div>
						<Box
							className={classes.iconBox}
							style={{ backgroundColor: getBackgroundColor(label) }}
						>
							{icon}
						</Box>
					</div>
					<div>
						<Typography variant="h5" className={classes.count}>
							{count}
						</Typography>
						<Typography variant="body2" className={classes.label}>
							{label}
						</Typography>
					</div>
				</Box>
			</div>
		);
	}
}

export default withStyles(styles)(StatCard);
