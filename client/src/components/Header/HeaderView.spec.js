/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import { HeaderView } from './HeaderView';

jest.useFakeTimers();

const setup = prop => {
	const propsbase = {
		mode: 'light',
		channel: { currentChannel: 'mychannel' },
		channelList: ['mychannel'],
		channels: [
			{
				blocks: 5,
				channel_hash:
					'3406510bd4d8105683f340451418df018b661fb8461deb4ec62e7dfd6a2a6cfc',
				channelname: 'mychannel',
				createdat: '2018-06-18T14:30:32.000Z',
				channel_genesis_hash:
					'5e02f3535193eafeb084ea68e61b6ab73b6b9123e317499be2b428c37c24c46e',
				id: 3,
				transactions: 5
			},
			{
				blocks: 5,
				channel_hash:
					'3406510bd4d8105683f340451418df018b661fb8461deb4ec62e7dfd6a2a6cfc',
				channelname: 'mychannels',
				createdat: '2018-06-18T14:30:32.000Z',
				channel_genesis_hash:
					'5e02f3535193eafeb084ea68e61b6ab73b6b9123e317499be2b428c37c24c46e',
				id: 3,
				transactions: 5
			}
		],
		classes: {
			margin: 'Connect-HeaderView--margin-1',
			padding: 'Connect-HeaderView--padding-2'
		},
		currentChannel:
			'f3ed9c95452b184a4d5d66e25ba47f866ad6907a31f28f8067ca5596f64d8e0f',
		notification: {},
		getBlockList: jest.fn(),
		getBlocksPerHour: jest.fn(),
		getBlocksPerMin: jest.fn(),
		getChaincodeList: jest.fn(),
		getChangeChannel: jest.fn(),
		getChannelList: jest.fn(),
		getChannels: jest.fn(),
		getDashStats: jest.fn(),
		getNotification: jest.fn(),
		getPeerList: jest.fn(),
		getPeerStatus: jest.fn(),
		getBlockActivity: jest.fn(),
		getTransactionByOrg: jest.fn(),
		getTransactionList: jest.fn(),
		getTransactionPerHour: jest.fn(),
		getTransactionPerMin: jest.fn(),
		refresh: jest.fn()
	};

	const props = { ...propsbase, ...prop };
	const wrapper = shallow(<HeaderView {...props} />);

	return {
		props,
		wrapper
	};
};

describe('HeaderView', () => {
	beforeEach(() => {
		jest.useFakeTimers();
	});

	afterEach(() => {
		jest.clearAllMocks();
		jest.useRealTimers();
	});

	test('HeaderView component should render', () => {
		const { wrapper } = setup();
		expect(wrapper.exists()).toBe(true);
	});
	test('toggle changes the state of isOpen', () => {
		const { wrapper } = setup();
		window.matchMedia = jest.fn(() => ({ matches: true }));
		expect(wrapper.state('isOpen')).toBe(false);
		wrapper.instance().toggle();
		expect(wrapper.state('isOpen')).toBe(true);
		wrapper.instance().toggle();
		expect(wrapper.state('isOpen')).toBe(false);
	});

	test('handleData sets notification', () => {
		const { wrapper } = setup();
		const notification =
			'{"title":"Block 12 Added","type":"block","message":"Block 12 established with 3 tx","time":"2018-05-30T21:15:09.000Z","txcount":3,"datahash":"07ff8fa88e8c8412daa15ae0ecec80b47293a452165d00213ec08811c9fd88e7"}';
		expect(wrapper.state('notifyCount')).toBe(0);
		wrapper.instance().handleData(notification);
		expect(wrapper.state('notifications').length).toBe(1);
		expect(wrapper.state('notifyCount')).toBe(1);
	});

	test('handleChange sets selectedChannel and calls changeChannel', async () => {
		const { wrapper, props } = setup();
		const selectedChannel = { value: 'newChannel' };
		const { getChangeChannel } = props;
		await wrapper.instance().handleChange(selectedChannel);
		expect(wrapper.state('selectedChannel').value).toBe('newChannel');
		expect(getChangeChannel).toHaveBeenCalled();
	});

	test('handleOpen sets modalOpen to true', () => {
		const { wrapper } = setup();
		expect(wrapper.state('modalOpen')).toBe(false);
		wrapper.instance().handleOpen();
		expect(wrapper.state('modalOpen')).toBe(true);
	});

	test('handleClose sets modalClose to false', () => {
		const { wrapper } = setup();
		expect(wrapper.state('modalOpen')).toBe(false);
		wrapper.setState({ modalopen: true });
		wrapper.instance().handleClose();
		expect(wrapper.state('modalOpen')).toBe(false);
	});

	test('handleDrawOpen sets the corresponding state to true', () => {
		const { wrapper } = setup();
		wrapper.instance().handleDrawOpen();
		expect(wrapper.state('notifyDrawer')).toBe(false);
		expect(wrapper.state('adminDrawer')).toBe(false);
		let drawer = 'notifyDrawer';
		wrapper.instance().handleDrawOpen(drawer);
		expect(wrapper.state('notifyDrawer')).toBe(true);
		drawer = 'adminDrawer';
		wrapper.instance().handleDrawOpen(drawer);
		expect(wrapper.state('adminDrawer')).toBe(true);
	});

	test('handleDrawClose sets the corresponding state to false', () => {
		const { wrapper } = setup();
		wrapper.instance().handleDrawClose();
		expect(wrapper.state('notifyDrawer')).toBe(false);
		expect(wrapper.state('adminDrawer')).toBe(false);
		let drawer = 'notifyDrawer';
		wrapper.setState({ notifyDrawer: true });
		wrapper.instance().handleDrawClose(drawer);
		expect(wrapper.state('notifyDrawer')).toBe(false);
		drawer = 'adminDrawer';
		wrapper.setState({ adminDrawer: true });
		wrapper.instance().handleDrawClose(drawer);
		expect(wrapper.state('adminDrawer')).toBe(false);
	});

	test('click on bell should set state notifyDrawer to true', () => {
		const { wrapper } = setup();
		wrapper.find('[data-command="bell"]').simulate('click');
		expect(wrapper.state('notifyDrawer')).toBe(true);
	});

	// test('click on cog should set state adminDrawer to true', () => {
	//   const { wrapper } = setup();
	//   // To be used when admin functionality is available
	//   // wrapper.find('.cog').simulate('click')
	//   // expect(wrapper.state('adminDrawer')).toBe(true);
	// });

	test('notifyDrawer onClose sets state to false', () => {
		const { wrapper } = setup();
		const instance = wrapper.instance();
		const spy = jest.spyOn(instance, 'handleDrawClose');
		wrapper.setState({ notifyDrawer: true });
		wrapper
			.find('WithStyles(ForwardRef(Drawer))')
			.at(0)
			.simulate('close');
		expect(wrapper.state('notifyDrawer')).toBe(false);
		expect(spy).toHaveBeenCalledTimes(1);
	});

	test('adminDrawer onClose sets state to false', () => {
		const { wrapper } = setup();
		const instance = wrapper.instance();
		const spy = jest.spyOn(instance, 'handleDrawClose');
		wrapper.setState({ adminDrawer: true });
		wrapper
			.find('WithStyles(ForwardRef(Drawer))')
			.at(1)
			.simulate('close');
		expect(wrapper.state('adminDrawer')).toBe(false);
		expect(spy).toHaveBeenCalledTimes(1);
	});

	test('handleThemeChange toggles isLight', () => {
		const { wrapper } = setup();
		const instance = wrapper.instance();
		// expect(wrapper.state("isLight")).toBe(true);
		instance.handleThemeChange();
		// expect(wrapper.state("isLight")).toBe(false);
	});
	// 71.19 |       75 |    72.73 |    72.41
	test('componentWillReceiveProps calls syncData', () => {
		const { wrapper } = setup();
		const instance = wrapper.instance();
		const spy = jest.spyOn(instance, 'syncData');
		const newChannel = 'newChannel';
		wrapper.setProps({ currentChannel: newChannel });
		expect(spy).toHaveBeenCalled();
	});

	test('componentDidMount calls setInterval', () => {
		const { wrapper } = setup();
		const instance = wrapper.instance();
		const spy = jest.spyOn(instance, 'syncData');
		expect(setInterval).toHaveBeenCalled();
		jest.runOnlyPendingTimers();
		expect(spy).toHaveBeenCalled();
	});

	test('switch calls handleThemeChange', () => {
		const { wrapper, props } = setup();
		const instance = wrapper.instance();
		const spy = jest.spyOn(instance, 'handleThemeChange');
		wrapper.setState({ adminDrawer: true });
		wrapper
			.find('WithStyles(ForwardRef(Switch))')
			.at(0)
			.simulate('change');
		expect(props.refresh.mock.calls[0][0]).toBe('dark');
		expect(spy).toHaveBeenCalled();
	});

	test('when found currentChannel in channel list', () => {
		const { wrapper, props } = setup({
			currentChannel:
				'5e02f3535193eafeb084ea68e61b6ab73b6b9123e317499be2b428c37c24c46e'
		});
		const selectedChannel = wrapper.state('selectedChannel');
		expect(selectedChannel.value).toBe(
			'5e02f3535193eafeb084ea68e61b6ab73b6b9123e317499be2b428c37c24c46e'
		);
		expect(selectedChannel.label).toBe('mychannels');
	});

	test('calls componentWillUnmount', () => {
		const { wrapper } = setup();
		const instance = wrapper.instance();
		const spy = jest.spyOn(instance, 'componentWillUnmount');

		wrapper.unmount();

		expect(spy).toHaveBeenCalledTimes(1);
		expect(clearInterval).toHaveBeenCalled();
	});

	test('channels / selectedChannel state are left empty when componentWillReceiveProps gets called with empty channel list', () => {
		const { wrapper } = setup();
		const instance = wrapper.instance();
		const spy = jest.spyOn(instance, 'componentWillReceiveProps');

		const currentChannel = { channels: [] };
		wrapper.setProps(currentChannel);

		expect(wrapper.state('channels').length).toBe(0);
		expect(wrapper.state('selectedChannel')).toStrictEqual({});
		expect(spy).toHaveBeenCalledTimes(1);
	});

	test('channels / selectedChannel state are left empty when componentWillReceiveProps gets called with `null/undefined` currentChannel', () => {
		const { wrapper } = setup();
		const instance = wrapper.instance();
		const spy = jest.spyOn(instance, 'componentWillReceiveProps');
		wrapper.setState({ selectedChannel: {} });

		// i)
		// nextProps.currentChannel = null
		// nextProps.channels[0].channel_genesis_hash != null
		wrapper.setProps({ currentChannel: null });

		let selectedChannel = wrapper.state('selectedChannel');
		expect(selectedChannel.value).toBe(
			'5e02f3535193eafeb084ea68e61b6ab73b6b9123e317499be2b428c37c24c46e'
		);
		expect(selectedChannel.label).toBe('mychannels');
		expect(spy).toHaveBeenCalledTimes(1);

		spy.mockClear();
		wrapper.setState({ selectedChannel: {} });

		// ii)
		// nextProps.currentChannel = undefined
		// nextProps.channels[0].channel_genesis_hash = null
		wrapper.setProps({
			currentChannel: undefined,
			channels: [
				{
					blocks: 5,
					channel_hash:
						'3406510bd4d8105683f340451418df018b661fb8461deb4ec62e7dfd6a2a6cfc',
					channelname: 'mychannel',
					createdat: '2018-06-18T14:30:32.000Z',
					channel_genesis_hash: null,
					id: 3,
					transactions: 5
				}
			]
		});

		selectedChannel = wrapper.state('selectedChannel');
		expect(selectedChannel).toStrictEqual({});
		expect(spy).toHaveBeenCalledTimes(1);

		spy.mockClear();
		wrapper.setState({ selectedChannel: {} });

		// iii)
		// nextProps.currentChannel != null / undefined
		// nextProps.channels[0].channel_genesis_hash === nextProps.currentChannel
		wrapper.setProps({
			currentChannel:
				'5e02f3535193eafeb084ea68e61b6ab73b6b9123e317499be2b428c37c24c46e',
			channels: [
				{
					blocks: 5,
					channel_hash:
						'3406510bd4d8105683f340451418df018b661fb8461deb4ec62e7dfd6a2a6cfc',
					channelname: 'mychannel',
					createdat: '2018-06-18T14:30:32.000Z',
					channel_genesis_hash:
						'5e02f3535193eafeb084ea68e61b6ab73b6b9123e317499be2b428c37c24c46e',
					id: 3,
					transactions: 5
				}
			]
		});

		selectedChannel = wrapper.state('selectedChannel');
		expect(selectedChannel.value).toBe(
			'5e02f3535193eafeb084ea68e61b6ab73b6b9123e317499be2b428c37c24c46e'
		);
		expect(selectedChannel.label).toBe('mychannel');
		expect(spy).toHaveBeenCalledTimes(1);
	});

	test('Header gets closed when width is narrower than max-width', () => {
		window.matchMedia = jest.fn(() => ({ matches: false }));
		const { wrapper } = setup();
		wrapper.instance().toggle();
		let nav = wrapper.find('Collapse');
		expect(nav.first().prop('isOpen')).toBe(false);

		window.matchMedia = jest.fn(() => ({ matches: true }));
		wrapper.instance().toggle();
		nav = wrapper.find('Collapse');
		expect(nav.first().prop('isOpen')).toBe(true);

		wrapper.instance().closeToggle();
		nav = wrapper.find('Collapse');
		expect(nav.first().prop('isOpen')).toBe(false);
	});

	test('handleChange does nothing when channel list has only a single entry or nothing', () => {
		const { wrapper } = setup();

		wrapper.setState({
			channels: [
				{
					blocks: 5,
					channel_hash:
						'3406510bd4d8105683f340451418df018b661fb8461deb4ec62e7dfd6a2a6cfc',
					channelname: 'mychannel',
					createdat: '2018-06-18T14:30:32.000Z',
					channel_genesis_hash:
						'5e02f3535193eafeb084ea68e61b6ab73b6b9123e317499be2b428c37c24c46e',
					id: 3,
					transactions: 5
				}
			]
		});

		clearInterval.mockClear();
		wrapper.instance().handleChange({
			value: '5e02f3535193eafeb084ea68e61b6ab73b6b9123e317499be2b428c37c24c46e',
			label: 'mychannels'
		});
		expect(clearInterval).not.toHaveBeenCalled();
	});

	test('registerOpen does update a state', () => {
		const { wrapper } = setup();
		wrapper.setState({ registerOpen: false });
		wrapper.instance().registerOpen();
		expect(wrapper.state('registerOpen')).toBe(true);
	});

	test('registerClose does update a state', () => {
		const { wrapper } = setup();
		wrapper.setState({ registerOpen: true });
		wrapper.instance().registerClose();
		expect(wrapper.state('registerOpen')).toBe(false);
	});

	test('onRegister does update a state', () => {
		const { wrapper } = setup();
		const instance = wrapper.instance();
		const spy = jest.spyOn(instance, 'registerClose');
		wrapper.instance().onRegister();
		expect(spy).toHaveBeenCalledTimes(1);
	});

	test('refresh gets called from handleThemeChange with `light` argument', () => {
		const { wrapper, props } = setup();
		const instance = wrapper.instance();
		const spy = jest.spyOn(instance, 'registerClose');
		wrapper.instance().handleThemeChange('dark');
		expect(props.refresh).toHaveBeenCalled();
		expect(props.refresh.mock.calls[0][0]).toBe('light');
	});

	test('reloadChannels runs successfully', () => {
		const { wrapper, props } = setup();
		wrapper.instance().reloadChannels();
		expect(props.getChannels).toHaveBeenCalled();
	});

	test('protocol get switched to `https`', () => {
		delete global.window.location;
		global.window = Object.create(window);
		global.window.location = {
			port: '123',
			protocol: 'https:',
			hostname: 'localhost'
		};
		const { wrapper, props } = setup();
		const ws = wrapper.find('Websocket');
		expect(ws.exists()).toBe(true);
		expect(ws.first().prop('url')).toContain('wss');
	});

	test('registerOpen gets called when click user-plus icon', () => {
		const { wrapper, props } = setup();

		const fa = wrapper.find('[name="user-plus"]');
		expect(fa.exists()).toBe(true);

		const instance = wrapper.instance();
		const spy = jest.spyOn(instance, 'registerOpen');
		fa.first().prop('onClick')();
		expect(spy).toHaveBeenCalledTimes(1);
	});
});
