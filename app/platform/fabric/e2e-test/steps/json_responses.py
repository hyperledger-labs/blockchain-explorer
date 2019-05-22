# SPDX-License-Identifier: Apache-2.0

import trafaret as t

"""
Example of using Trafaret (https://github.com/Deepwalker/trafaret) to describe json response structure

Assuming our json is:

{
   "access_token":"access_token",
   "refresh_token":"refresh_token",
   "token_type":"token_type",
   "expires_in":1800
}

Our trafaret will be:

tokenData = t.Dict({
    t.Key('access_token'): t.String,
    t.Key('refresh_token'): t.String,
    t.Key('token_type'): t.String,
    t.Key('expires_in'): t.Int
})
"""

# Below are objects used for validating response in explorer.feature
userData = t.Dict({
    t.Key('message'): t.String,
    t.Key('name'): t.String
})

networklistResp = t.Dict({
    t.Key('networkList'): t.List(t.List(t.String | t.Dict))
})

loginResp = t.Dict({
    t.Key('status'): t.Int,
    t.Key('success'): t.Bool,
    t.Key('message'): t.String,
    t.Key('token'): t.String,
    t.Key('user'): userData
})

channelsResp = t.Dict({
    t.Key('status'): t.Int,
    t.Key('channels'): t.List(t.String)
})

channelData = t.Dict({
    t.Key('id'): t.Int,
    t.Key('channelname'): t.String,
    t.Key('blocks'): t.Int,
    t.Key('channel_genesis_hash'): t.String,
    t.Key('transactions'): t.Int,
    t.Key('createdat'): t.String,
    t.Key('channel_hash'): t.String(allow_blank=True)
})

channelsInfoResp = t.Dict({
    t.Key('status'): t.Int,
    t.Key('channels'): t.List(channelData)
})

blockResp = t.Dict({
    t.Key('status'): t.Int,
    t.Key('number'): t.String,
    t.Key('previous_hash'): t.String,
    t.Key('data_hash'): t.String,
    t.Key('transactions'): t.List(t.Any)
})

peersStatusResp = t.Dict({
    t.Key('status'): t.Int,
    t.Key('peers'): t.List(t.Any)
})

blockData = t.Dict({
    t.Key('blocknum'): t.Int,
    t.Key('txcount'): t.Int,
    t.Key('datahash'): t.String,
    t.Key('blockhash'): t.String,
    t.Key('prehash'): t.String,
    t.Key('createdt'): t.String,
    t.Key('txhash'): t.List(t.String(allow_blank=True)),
    t.Key('channelname'): t.String
})

blockactivityResp = t.Dict({
    t.Key('status'): t.Int,
    t.Key('row'): t.List(blockData)
})

registerResp = t.Dict({
    t.Key('status'): t.Int,
    t.Key('message', optional=True): t.String
})

enrollResp = t.Dict({
    t.Key('status'): t.Int,
    t.Key('message', optional=True): t.String
})