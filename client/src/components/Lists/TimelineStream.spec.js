/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import { TimelineStream } from './TimelineStream';

const setup = () => {
  const props = {
    classes: {
      scrollable: 'scrollable',
      text: 'text',
      event: 'event',
      open: 'open',
    },
    notifications: [
      {
        blockhash:
          '6880fc2e3fcebbe7964335ee4f617c94ba9afb176fade022aa6573d85539129f',
        datahash:
          '07ff8fa88e8c8412daa15ae0ecec80b47293a452165d00213ec08811c9fd88e7',
        time: '2018-05-30T21:15:09.000Z',
        title: 'Block 12 Added',
        txcount: 3,
        type: 'block',
      },
    ],
    blockList: [
      {
        blockhash:
          '6880fc2e3fcebbe7964335ee4f617c94ba9afb176fade022aa6573d85539129f',
        blocknum: 20,
        channelname: 'mychannel',
        createdt: '2018-04-26T20:32:13.000Z',
        datahash:
          '2802f7e70ca3a6479b1c3dd16f4bac1a55b213f6cff10a96e60977bc8ef9166e',
        id: 21,
        prehash:
          '5880fc2e3fcebbe7964335ee4f617c94ba9afb176fade022aa6573d85539129f',
        prev_blockhash: null,
        txcount: 2,
        txhash: [
          '308a24cc218085f16e12af38bf54a72beec0b85e98f971b1e0819592f74deb80',
          '9abc8cb27439b256fa38384ee98e34da75f5433cfc21a45a77f98dcbc6bddbb1',
        ],
      },
      {
        blockhash:
          '7880fc2e3fcebbe7964335ee4f617c94ba9afb176fade022aa6573d85539129f',
        blocknum: 19,
        channelname: 'mychannel',
        createdt: '2018-04-26T20:32:11.000Z',
        datahash:
          '1adc2b51cb7d7df44f114fc42df1f6fdca64a5da3f9a07edbd3b0d8060bb2edf',
        id: 20,
        prehash:
          '68f4481e0caec16a5aceebabd01cb31635d9f0a8cf9f378f86e06b76c21c633d',
        prev_blockhash: null,
        txcount: 3,
        txhash: [
          '912cd6e7624313675cb1806e2ce0243bbeff247792f2c7aae857a8c5436074f6',
          'a9cc2d309967fbba0d9575319ea0c7eb75e7c003142e6c43060015e59909d91d',
          '85770c2057e4b63504de6fa8b0c711f33ec897d9e8fc10659d7712e51d57c513',
        ],
      },
    ],
    blockHash: {
      blockhash:
        '7880fc2e3fcebbe7964335ee4f617c94ba9afb176fade022aa6573d85539129f',
      blocknum: 19,
      channelname: 'mychannel',
      createdt: '2018-04-26T20:32:11.000Z',
      datahash:
        '1adc2b51cb7d7df44f114fc42df1f6fdca64a5da3f9a07edbd3b0d8060bb2edf',
      id: 20,
      prehash:
        '68f4481e0caec16a5aceebabd01cb31635d9f0a8cf9f378f86e06b76c21c633d',
      prev_blockhash: null,
      txcount: 3,
      txhash: [
        '912cd6e7624313675cb1806e2ce0243bbeff247792f2c7aae857a8c5436074f6',
      ],
    },
  };

  const wrapper = mount(<TimelineStream {...props} />);

  return {
    props,
    wrapper,
  };
};

describe('TimelineStream', () => {
  test('TimelineStream component should render', () => {
    const { wrapper } = setup();
    expect(wrapper.exists()).toBe(true);
  });

  test('handleDialogOpenBlockHash sets the correct state', () => {
    const { wrapper, props } = setup();
    const instance = wrapper.instance();
    const { blockHash } = props;
    expect(wrapper.state('dialogOpenBlockHash')).toBe(false);
    expect(wrapper.state('blockHash')).not.toMatchObject({
      blockhash: blockHash.blockhash,
    });
    instance.handleDialogOpenBlockHash(blockHash.blockhash);
    expect(wrapper.state('dialogOpenBlockHash')).toBe(true);
    expect(wrapper.state('blockHash')).toMatchObject({
      blockhash: blockHash.blockhash,
    });
  });

  test('handleDialogCloseBlockHash sets dialogOpenBlockHash to fasle', () => {
    const { wrapper } = setup();
    const instance = wrapper.instance();
    wrapper.setState({ dialogOpenBlockHash: true });
    instance.handleDialogCloseBlockHash();
    expect(wrapper.state('dialogOpenBlockHash')).toBe(false);
  });

  test('onClick for blockLink', () => {
    const { wrapper } = setup();
    wrapper
      .find('a[data-command="block-link"]')
      .at(0)
      .simulate('click');
    wrapper.update();
    expect(wrapper.state('dialogOpenBlockHash')).toBe(true);
  });
});
