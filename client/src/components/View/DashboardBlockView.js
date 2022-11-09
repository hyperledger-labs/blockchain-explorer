import { IconButton } from '@material-ui/core';
import { FullscreenExit } from '@material-ui/icons';
import { Component } from 'react';
import { Link } from 'react-router-dom';
import TimelineStream from '../Lists/TimelineStream';

class DashBoardBlockView extends Component {
	constructor(props) {
		super(props);
		this.state = {
			notifications: []
		};
	}

	componentDidMount() {
		const { blockActivity } = this.props;
		this.setNotifications(blockActivity);
	}

	componentWillReceiveProps() {
		const { blockActivity } = this.props;
		this.setNotifications(blockActivity);
	}

	setNotifications = blockList => {
		const notificationsArr = [];
		if (blockList !== undefined) {
			for (let i = 0; i < blockList.length && blockList && blockList[i]; i += 1) {
				const block = blockList[i];
				const notify = {
					title: `Block ${block.blocknum} `,
					type: 'block',
					time: block.createdt,
					txcount: block.txcount,
					datahash: block.datahash,
					blockhash: block.blockhash,
					channelName: block.channelname
				};
				notificationsArr.push(notify);
			}
		}
		this.setState({ notifications: notificationsArr });
	};

	render() {
		const { blockActivity } = this.props;
		const { notifications } = this.state;

		return (
			<div>
				<TimelineStream
					notifications={notifications}
					blockList={blockActivity}
					button={
						<Link to="/dashboard">
							<IconButton>
								<FullscreenExit />
							</IconButton>
						</Link>
					}
				/>
			</div>
		);
	}
}

export default DashBoardBlockView;
