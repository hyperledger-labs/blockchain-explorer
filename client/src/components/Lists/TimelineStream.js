/**
 *    SPDX-License-Identifier: Apache-2.0
 */

import React, { Component } from 'react';
import { Timeline, TimelineEvent } from 'react-event-timeline'
import FontAwesome from 'react-fontawesome';
// import Card, { CardContent } from 'material-ui/Card';
import { Card, CardHeader, CardBody } from 'reactstrap';


class TimelineStream extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false
        }
    }
    render() {
        return (
            <div className="activity-stream">
                <Card>
                    <CardHeader>
                        <h5>Activity</h5>
                    </CardHeader>
                    <CardBody>
                        <Timeline className="timeline">
                            <TimelineEvent title="Block Added"
                                createdAt="2017-03-19 09:08 PM"
                                className="timeline-items"
                                icon={<FontAwesome name="cube" />}
                            >
                                <h6>Block 1</h6>
                                1 Tx, datahash: d932n9481cf3..
                            </TimelineEvent>
                            <TimelineEvent
                                title="Block Added"
                                createdAt="2017-03-19 09:06 AM"
                                className="timeline-items"
                                icon={<FontAwesome name="cube" />}>
                                <h6>Block 0</h6>
                                1 Tx, datahash : b9868fa6530d95...
                            </TimelineEvent>
                        </Timeline>
                    </CardBody>
                </Card>
            </div>
        );
    }
};
export default TimelineStream;