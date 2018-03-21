import React from 'react';
import { Table } from 'reactstrap';
const Peers = ({ peerList }) => {
    return (
        <div>
            <Table className="peerList" >
                <thead>
                    <tr>
                        <th>Peer Name</th>
                        <th>Request Url</th>
                    </tr>
                </thead>
                <tbody>
                    {peerList.map(peer =>
                        <tr key={peer.server_hostname}>
                            <td>{peer.server_hostname} </td>
                            <td>{peer.requests} </td>
                        </tr>)}
                </tbody>
            </Table>
        </div>
    );
};
export default Peers;