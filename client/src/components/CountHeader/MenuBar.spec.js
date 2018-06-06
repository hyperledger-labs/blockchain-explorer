/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import { MenuBar } from './MenuBar';
import DashboardView from '../View/DashboardView'
import Blocks from '../Lists/Blocks'

jest.useFakeTimers();

const setup = () => {
  const props = {
    block: {},
    blockList: [{'id':16,'blocknum':15,'datahash':'d6651c777f5bcbae60ef26ec77ef0ea07913d700ecadf0edbc9a0474d41c4d0f','prehash':'10b2534438c4b8beece9ca51e033ae019856c3d71790e576e308dd24a6aa4367','channelname':'mychannel','txcount':1,'createdt':'2018-05-23T16:50:53.000Z','prev_blockhash':null,'blockhash':null,'txhash':['dad0df2501b835049610ca402867a3104359c722fc28f7b9c9bf215b546e72cf']},{'id':15,'blocknum':14,'datahash':'d89d2d2b1ffeb3b5149087b60d9817d811a5b57419123c4017c07bcb17df990d','prehash':'8c094a29e914400963de5086068981cdf0fd799c77c66c4443e076dddf6dfd15','channelname':'mychannel','txcount':2,'createdt':'2018-05-23T16:50:47.000Z','prev_blockhash':null,'blockhash':null,'txhash':['ba1ceaddb58762ecab90a21232533190838bc52beb958e1fd7dc3c698deca926','ecd34c9fe1f07573a6a55f7b4dde79d44676dc633105d12df7d874572dd1b831']},{'id':14,'blocknum':13,'datahash':'08ac67107d33279d8a53ab22f9bb6315f67e5a569d78ec39cc394ce32442b03d','prehash':'1058108ab73f5006c8d5d866f03fbbe4ddacb38c0da72be9a0935aaa52bb41b0','channelname':'mychannel','txcount':2,'createdt':'2018-05-23T16:50:44.000Z','prev_blockhash':null,'blockhash':null,'txhash':['226f3e0da098e593acd810a63d4a1f39f56a52b2c06d2c2c78c1e0b21b42e4ba','a0c1ebd2d199f1b0d3e6f111233dd9ac2498861cf8cbc923f89287f35bdb0721']},{'id':13,'blocknum':12,'datahash':'ade15aa67f1eccb9e42d1ac27b6c88619bcbfbff955d8f070de3e44714d8cc7c','prehash':'0d3d6acd7c018841afd7769bc273deeb649edd2135e9bae29d781729e888ce3f','channelname':'mychannel','txcount':2,'createdt':'2018-05-23T15:17:14.000Z','prev_blockhash':null,'blockhash':null,'txhash':['7fd84d4d0adde39d1a43764f0a9de6d632b239c21c9795ec3cde5446cde5837d','a10d086067a0c75648529eaaec03bfe7d93c197e711bfe07ce3b3a8fd4cfa831']},{'id':12,'blocknum':11,'datahash':'cf532f4031fe20204c52376fa6399a79599efae05767fce1369b2dd219c171e2','prehash':'6a8557afe68c5213a3bd4aea368c197ab4feb71c134a6ceca4f8307eba0c7541','channelname':'mychannel','txcount':3,'createdt':'2018-05-23T15:17:10.000Z','prev_blockhash':null,'blockhash':null,'txhash':['6b6a2ded79c2733ee27d546cac40015333d1387778cb6d26b66b3d8c266143fc','0a5deb73ec4908813bbb06b9458c972db5770803bf16825be42cd2e0b4c1b881','0dc0528e2dd1786f4a121869d7ef040a829b9ca3f99362fcfed75f6649d9115c']},{'id':11,'blocknum':10,'datahash':'12e37be62e4390b89790922e20517a25b75875171f6847de70aa20f3e7a75c8c','prehash':'b42a032d39928a82299146a4f2be851f14185cac44471a558ae48dc62a6ec9af','channelname':'mychannel','txcount':2,'createdt':'2018-05-23T15:15:21.000Z','prev_blockhash':null,'blockhash':null,'txhash':['108b5e64ac64cd90edfb02a2d0b34fd9fccb2fccf6c916bb2e253f813141dc1e','8d4cc9d075bd3163f1843525d1643f50120d6922b748bb02a26baa02ffca6b88']},{'id':10,'blocknum':9,'datahash':'ca8589292b21899ace65cc6425142973d8689cba4482f268a4e0133825bf5601','prehash':'b33320e2da0e34f0a99a0eb8408733afd04356ac990abdf8c681ed98a2f613ed','channelname':'mychannel','txcount':3,'createdt':'2018-05-23T15:15:18.000Z','prev_blockhash':null,'blockhash':null,'txhash':['b711703bec0bd37be202ed9ea8d163eba28158ca632a263c0d5ef73d29447653','74796c23c521f000cb5a720e2d85167b827f7cdebc20081d26eceaea884fe0f8','92082a16bfe11f365bc1172561e1d8ee538f57852bea806e48db773a8366a365']},{'id':9,'blocknum':8,'datahash':'b6564fe60fdbe9f1179f23319b625a0d81921f55e0ab01e11ab97db953eaf1a0','prehash':'270c2ab6ccb7736f1cb6ad7a835cdc188504168cdf3de56250fd3817edd2a4fc','channelname':'mychannel','txcount':3,'createdt':'2018-05-23T15:14:57.000Z','prev_blockhash':null,'blockhash':null,'txhash':['46afc6f1b4de23e9492df5e548591544ee777b6fe8ca397c9d06509f3f061c6d','33859cc007b447976078087480ee3379692768cc83fbfad845f22e29d3ac9c61','3a8d7fbd70300a1532cb27906df28eac9886e9e2aed692ddecb4ab0432821d7e']},{'id':8,'blocknum':7,'datahash':'73f189b68b1eade5f01bb77e36022054564d191acca6db37d6bb0690ae0d43c7','prehash':'7ec05f4771a2c5f0206cfe4e65b8403351e49a7c3ffce858c14d1f193922be01','channelname':'mychannel','txcount':3,'createdt':'2018-05-23T15:14:54.000Z','prev_blockhash':null,'blockhash':null,'txhash':['5345d9feeb4144b3e8e4f9ba618581bfb7a57d0606946c42f7723248463ebe79','91a59310e11fc3e49a62cfcf4f0a9beed600fa9daa0de4316dab968166167245','70aa3dfa32ace32be9b882cb8f47ccc7f9b2966d7d1a4a152cefb5d796260109']},{'id':7,'blocknum':6,'datahash':'f08ffff7a8f747481331376b268ed1f5c39dcb78f4b5c63861c4bf4fa43b61f3','prehash':'c455e393a5a9106d5d1683855cb11bd1d89cf8148fb246a0418ea3544c407c19','channelname':'mychannel','txcount':3,'createdt':'2018-05-23T15:14:51.000Z','prev_blockhash':null,'blockhash':null,'txhash':['72df70b0828f4fcc4f0fab4c0bab28ffcfed22c923a737023be8c5e5bda97487','f31b90a8a85bada1dcbf7517ebca0f469b04ba0ed2fc62e6ecbcb40365205e83','76248c4b167589845a3bf63096634fac55675931cfb2ca4c557e4f059f621dc7']},{'id':6,'blocknum':5,'datahash':'2fbaecc08ed66d15cca410c4640a0dfda806484b8e665ffbbf73df15c6ea480b','prehash':'a6d849f19dafacbe16cecad52685fc6893566ea33ed5ee4cb883832b88997e69','channelname':'mychannel','txcount':1,'createdt':'2018-05-23T15:14:49.000Z','prev_blockhash':null,'blockhash':null,'txhash':['e2d2659858fbbc136a0d257c4da0f1055fb9435dfd583c402e2a5eebbc4b096b']},{'id':1,'blocknum':4,'datahash':'17a6056bcf37274400ba0ed9ec53786c8600123f5d11e32c95b63316a3cf37ec','prehash':'0215479bd602e763829cef39e715b37d74e113bf11e662b280a6366279deac58','channelname':'mychannel','txcount':1,'createdt':'2018-05-23T15:12:16.000Z','prev_blockhash':null,'blockhash':null,'txhash':['d801e2550ef492861d9b97de89a312a45e0f8935c01da27f4707938003793580']},{'id':5,'blocknum':3,'datahash':'d8948ce47805a130ed19a23cb446cb1f5500f886a91c4a58cfcb9f96f3b6f6d3','prehash':'eae8d236d74c8aea7c2714065eea48d033fd4b6f3ae6a444ca10277c7a703575','channelname':'mychannel','txcount':1,'createdt':'2018-05-23T15:11:53.000Z','prev_blockhash':null,'blockhash':null,'txhash':['b8eedaf47356f8b40f75483b99df73fe5df3915241716352d0f3b960525dd90d']},{'id':4,'blocknum':2,'datahash':'d31cd73f91262ddd741a502a16e2415e1777e1e19c75903bd572282d80715aab','prehash':'174b99a45f02c9220259ce52e51417f8693cdbad25cb7fc42efa97d3c889c51c','channelname':'mychannel','txcount':1,'createdt':'2018-05-23T15:11:49.000Z','prev_blockhash':null,'blockhash':null,'txhash':['']},{'id':3,'blocknum':1,'datahash':'5b5fdd4bf7491d7f9693fb79a80369f73ee0a0b35d6f7c33ca2160ab5756874c','prehash':'7a6ed96ac53bba730d2cec5bb8d9dffbe56b53f597f99466d927adbca7595f3c','channelname':'mychannel','txcount':1,'createdt':'2018-05-23T15:11:46.000Z','prev_blockhash':null,'blockhash':null,'txhash':['']},{'id':2,'blocknum':0,'datahash':'b046fedfe6b86e5faaf8212bacf15f75481dae41d2e5b7402f0b4dd1b30b188c','prehash':'','channelname':'mychannel','txcount':1,'createdt':'2018-05-23T15:11:33.000Z','prev_blockhash':null,'blockhash':null,'txhash':['']}],
    chaincodes: [{'channelName':'mychannel','chaincodename':'mycc','path':'github.com/chaincode/chaincode_example02/go/','version':'1.0','txCount':27}],
    channel: {'currentChannel':'mychannel'},
    classes: {'card':'CountHeader-card-21','media':'CountHeader-media-22','title':'CountHeader-title-23','pos':'CountHeader-pos-24'},
    countHeader: {'chaincodeCount':'1','txCount':'30','latestBlock':15,'peerCount':'4'},
    getBlockList: jest.fn(),
    getChaincodes: jest.fn(),
    getCountHeader: jest.fn(),
    getLatestBlock: jest.fn(),
    getTransactionInfo: jest.fn(),
    getTransactionList: jest.fn(),
    notification: {},
    peerList: [{'requests':'grpcs://127.0.0.1:7051','server_hostname':'peer0.org1.example.com'},{'requests':'grpcs://127.0.0.1:8051','server_hostname':'peer1.org1.example.com'},{'requests':'grpcs://127.0.0.1:9051','server_hostname':'peer0.org2.example.com'},{'requests':'grpcs://127.0.0.1:10051','server_hostname':'peer1.org2.example.com'}],
    transaction: {},
    transactionList: {'status':200, rows: [{'id':45,'channelname':'mychannel','blockid':19,'txhash':'ea05eb8f5964a2b30ca616def1086923690ec575d55bf189de770a409f8221ff','createdt':'5-23-2018 1:36 PM EDT','chaincodename':'mycc','status':200,'creator_msp_id':'Org1MSP','endorser_msp_id':'{\'Org1MSP\'}','chaincode_id':'','type':'ENDORSER_TRANSACTION','read_set':[{'chaincode':'lscc','set':[{'key':'mycc','version':{'block_num':'3','tx_num':'0'}}]},{'chaincode':'mycc','set':[{'key':'a','version':{'block_num':'18','tx_num':'0'}},{'key':'b','version':{'block_num':'18','tx_num':'0'}}]}],'write_set':[{'chaincode':'lscc','set':[]},{'chaincode':'mycc','set':[{'key':'a','is_delete':false,'value':'-60'},{'key':'b','is_delete':false,'value':'360'}]}]}]}
  }

  const wrapper = shallow(<MenuBar {...props} />);

  return{
    props,
    wrapper }
}

describe('MenuBar', () => {
  test('MenuBar component should render', () => {
    const { wrapper } = setup();
    expect(wrapper.exists()).toBe(true);
  });

  test(' to have been called', () => {
    const { wrapper, props } = setup();
    jest.runOnlyPendingTimers();
    expect(props.getCountHeader).toHaveBeenCalled();
  });

  test('handleClick functions set the appropriate activeView', () => {
    const { wrapper } = setup();
    wrapper.find('NavItem').findWhere(n => n.contains('NETWORK  ')).first().simulate('click')
    expect(wrapper.state('activeTab').networkTab).toBe(true)
    wrapper.find('NavItem').findWhere(n => n.contains('BLOCKS ')).first().simulate('click')
    expect(wrapper.state('activeTab').blocksTab).toBe(true)
    wrapper.find('NavItem').findWhere(n => n.contains('TRANSACTIONS')).first().simulate('click')
    expect(wrapper.state('activeTab').txTab).toBe(true)
    wrapper.find('NavItem').findWhere(n => n.contains('CHAINCODES')).first().simulate('click')
    expect(wrapper.state('activeTab').chaincodesTab).toBe(true)
    wrapper.find('NavItem').findWhere(n => n.contains('DASHBOARD ')).first().simulate('click')
    expect(wrapper.state('activeTab').dashboardTab).toBe(true)
  });

  test('swithc case defaults to DashboardView given a non valid state', () => {
    const { wrapper } = setup();
    wrapper.setState({ activeView: 'test'})
    wrapper.update()
    expect(wrapper.find(DashboardView).exists()).toBe(true)
    expect(wrapper.find(Blocks).exists()).toBe(false)
  })

  test('componentWillReceiveProps will set new countHeader', () => {
    const { wrapper, props } = setup();
    const instance = wrapper.instance();
    const countHeader = {'chaincodeCount':'1','txCount':'31','latestBlock':16,'peerCount':'4'}
    wrapper.setProps({ countHeader })
    expect(wrapper.instance().props.countHeader).not.toBe(props.countHeader)
  })

  test('componentWillReceiveProps will not set new countHeader', () => {
    const { wrapper, props } = setup();
    const instance = wrapper.instance()
    wrapper.setProps({ countHeader: props.countHeader })
    expect(instance.props.countHeader).toBe(props.countHeader)
  })

  test('syncData calls the selectors', () => {
    const { wrapper, props } = setup();
    wrapper.instance().syncData('newData')
    expect(props.getCountHeader).toHaveBeenCalled();
    expect(props.getLatestBlock).toHaveBeenCalled();
    expect(props.getBlockList).toHaveBeenCalled();
    expect(props.getChaincodes).toHaveBeenCalled();
    expect(props.getTransactionList).toHaveBeenCalled();
  })
});
