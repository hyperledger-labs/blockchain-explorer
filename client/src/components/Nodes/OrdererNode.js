import { Handle, Position } from 'reactflow';
import { styled, Typography } from '@material-ui/core';
import ordererNodeBackground from '../../static/images/orderer_node_background.svg';

const OrdererNode = props => {
	const { orgName, port } = props.data;

	return (
		<Node>
			<Handle type="target" position={Position.Top} style={{ display: 'none' }} />
			<Handle
				type="source"
				position={Position.Bottom}
				style={{ display: 'none' }}
			/>
			<ContentsWrapper>
				<OrgText>{orgName}</OrgText>
				<PortText>{port}</PortText>
			</ContentsWrapper>
		</Node>
	);
};

const Node = styled('div')({
	width: '173px',
	height: '75px',
	display: 'flex',
	justifyContent: 'center',
	alignItems: 'center'
});

const ContentsWrapper = styled('div')({
	flex: 1,
	height: '100%',
	display: 'flex',
	flexDirection: 'column',
	justifyContent: 'center',
	alignItems: 'center',
	background: `url(${ordererNodeBackground})`
});

const OrgText = styled(Typography)({
	fontSize: '14px',
	fontWeight: 500
});

const PortText = styled(Typography)(({ theme }) => ({
	fontSize: '12px',
	color: theme.palette.text.secondary
}));

export default OrdererNode;
