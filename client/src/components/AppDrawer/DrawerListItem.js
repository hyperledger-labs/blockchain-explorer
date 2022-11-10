import {
	ListItem,
	ListItemIcon,
	ListItemText,
	withStyles
} from '@material-ui/core';
import { NavLink } from 'react-router-dom';

const styles = theme => {
	return {
		nav: {
			'&:hover': {
				color: 'inherit'
			}
		},
		subtitle: {
			'& .MuiTypography-body1': {
				fontSize: '16px',
				fontWeight: 500
			}
		}
	};
};

const DrawerListItem = ({ to, icon, label, exact, classes }) => (
	<ListItem
		button
		component={NavLink}
		className={classes.nav}
		to={to}
		exact={exact}
		activeClassName="Mui-selected"
	>
		<ListItemIcon>{icon}</ListItemIcon>
		<ListItemText primary={label} className={classes.subtitle} />
	</ListItem>
);

export default withStyles(styles)(DrawerListItem);
