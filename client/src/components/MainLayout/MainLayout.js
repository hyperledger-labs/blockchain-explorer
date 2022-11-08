import { withStyles } from '@material-ui/styles';
import { Component } from 'react';
import { connect } from 'react-redux';
import { DRAWER_WIDTH } from '../../constants/styles';
import { drawerOpenSelector } from '../../state/redux/core/selectors';

const styles = theme => {
	return {
		main: {
			minWidth: 900,
			padding: '0 24px',
			transition: theme.transitions.create(['margin'], {
				easing: theme.transitions.easing.sharp,
				duration: theme.transitions.duration.leavingScreen
			})
		},
		opened: {
			marginLeft: DRAWER_WIDTH
		}
	};
};

class MainLayout extends Component {
	render() {
		const { classes, children, drawerOpen } = this.props;

		return (
			<main className={`${classes.main} ${drawerOpen ? classes.opened : ''}`}>
				{children}
			</main>
		);
	}
}

const mapStateToProps = state => {
	return {
		drawerOpen: drawerOpenSelector(state)
	};
};

const connectedComponent = connect(mapStateToProps)(MainLayout);

export default withStyles(styles)(connectedComponent);
