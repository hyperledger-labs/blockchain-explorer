/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Table } from 'reactstrap';
const Channels = ({ channelList }) => {
    return (
        <div>
            <Table>
                <thead>
                    <th>Channel Id</th>
                </thead>
                <tbody>
                    {channelList.map(channel=>
                    <tr key={channel.channel_id}>
                        <td>{channel.channel_id} </td>
                    </tr>)}
                </tbody>
            </Table>
        </div>
    );
};
export default Channels;