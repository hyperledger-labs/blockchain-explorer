import { Handle, Position } from 'reactflow';
import { Box, Chip, styled, Typography } from '@material-ui/core';

const PeerNode = props => {
	const { orgName, port, status } = props.data;

	return (
		<Node>
			<Handle type="target" position={Position.Top} />
			<Handle type="source" position={Position.Bottom} />
			<Box
				flex={1}
				display="flex"
				flexDirection="column"
				justifyContent="center"
				alignItems="flex-start"
			>
				<OrgText>{orgName}</OrgText>
				<PortText>{port}</PortText>
			</Box>
			<Box flex={1} display="flex" justifyContent="center" alignItems="center">
				<StatusChip label={status} size="small" />
			</Box>
		</Node>
	);
};

const Node = styled('div')({
	width: '154px',
	height: '71px',
	display: 'flex',
	padding: '15px 14px',
	border: '1px solid rgba(0, 0, 0, 0.42)',
	borderRadius: '8px',
	'& .react-flow__handle.connectable': {
		minWidth: 0,
		minHeight: 0,
		width: 0,
		height: 0
	}
});

const OrgText = styled(Typography)({
	fontSize: '14px',
	fontWeight: 500
});

const PortText = styled(Typography)(({ theme }) => ({
	fontSize: '12px',
	color: theme.palette.text.secondary
}));

const StatusChip = styled(Chip)({
	padding: '3px 4px',
	backgroundColor: 'rgba(233, 241, 253, 1)',
	color: 'rgba(24, 32, 97, 1)'
});

export default PeerNode;
