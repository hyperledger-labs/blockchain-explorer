import { styled } from '@material-ui/core';
import PropTypes from 'prop-types';

const TabPanel = props => {
	const { children, value, tab, ...other } = props;

	return (
		<Container role="tabpanel" hidden={value !== tab} {...other}>
			{value === tab && children}
		</Container>
	);
};

const Container = styled('div')({
	paddingTop: '32px',
	paddingBottom: '24px'
});

TabPanel.propTypes = {
	children: PropTypes.node,
	index: PropTypes.any.isRequired,
	value: PropTypes.any.isRequired
};

export default TabPanel;
