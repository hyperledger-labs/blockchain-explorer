import {
	Accordion,
	AccordionDetails,
	AccordionSummary,
	Typography,
	withStyles
} from '@material-ui/core';
import { ExpandMore } from '@material-ui/icons';
import { Component } from 'react';
import { TimelineEvent } from 'react-event-timeline';
import BoxIcon from '../../static/images/box_icon.svg';
import TimelineItemRow from './TimelineItemRow';
import TimeAgo from 'react-timeago';

const styles = theme => {
	return {
		accordion: {
			border: '1px solid rgba(0, 0, 0, 0.12)',
			boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.08)',
			borderRadius: '8px !important'
		},
		summary: {
			position: 'relative',
			height: '56px',
			padding: '0 12px 0 36px',
			'&::before': {
				borderTopLeftRadius: '8px',
				borderBottomLeftRadius: '8px',
				content: "''",
				position: 'absolute',
				width: '8px',
				left: 0,
				top: 0,
				bottom: 0,
				backgroundColor: 'rgba(24, 32, 97, 1)',
				transition: theme.transitions.create('border-radius', {
					duration: 150
				})
			},
			'&.Mui-expanded': {
				borderBottom: '1px solid rgba(0, 0, 0, 0.12)'
			},
			'&.Mui-expanded::before': {
				borderBottomLeftRadius: '0px'
			}
		},
		title: {
			fontWeight: 500
		},
		details: {
			display: 'flex',
			flexDirection: 'column',
			padding: '24px 28px',
			backgroundColor: theme.palette.background.default,
			borderRadius: '8px'
		},
		timeSection: {
			display: 'flex',
			justifyContent: 'flex-end'
		},
		time: {
			background: '#E0E0E0',
			borderRadius: '16px',
			padding: '3px 10px',
			fontSize: '13px',
			color: theme.palette.text.primary
		}
	};
};

class TimelineItem extends Component {
	render() {
		const { classes, item } = this.props;
		const { title, channelName, datahash, txcount, time } = item;

		return (
			<TimelineEvent
				icon={<img src={BoxIcon} alt="box-icon" />}
				iconColor="rgba(24, 32, 97, 1)"
				contentStyle={{
					width: 'none',
					backgroundColor: 'none',
					boxShadow: 'none',
					margin: 0,
					lineHeight: 'none',
					padding: 0
				}}
			>
				<Accordion className={classes.accordion}>
					<AccordionSummary expandIcon={<ExpandMore />} className={classes.summary}>
						<Typography variant="subtitle1" className={classes.title}>
							{title}
						</Typography>
					</AccordionSummary>
					<AccordionDetails className={classes.details}>
						<TimelineItemRow title="Channel Name" value={channelName} />
						<TimelineItemRow title="Datahash" value={datahash} />
						<TimelineItemRow title="Number of Tx" value={txcount} />
						<div className={classes.timeSection}>
							<TimeAgo
								className={classes.time}
								date={time}
								live={false}
								minPeriod={60}
							/>
						</div>
					</AccordionDetails>
				</Accordion>
			</TimelineEvent>
		);
	}
}

export default withStyles(styles)(TimelineItem);
