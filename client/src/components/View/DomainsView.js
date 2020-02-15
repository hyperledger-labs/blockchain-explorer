import React from 'react';
import View from '../Styled/View';
import ReactTable, { filteredColumn } from '../Styled/Table';

import compose from 'recompose/compose';
import { gql } from 'apollo-boost';
import { graphql } from 'react-apollo';

const columns = [
  filteredColumn({
    Header: 'Domain Id',
    accessor: 'id',
  }),
  filteredColumn({
    Header: 'Default Role',
    accessor: 'defaultRole.name',
  }),
];

export const DomainsView = ({ list }) => (
  <View>
    <ReactTable
      data={list}
      columns={columns}
      defaultPageSize={5}
      filterable
      minRows={0}
    />
  </View>
);

export default compose(
  graphql(
    gql`{
      list: domainList(count: 100) {
        items {
          id
          defaultRole {
            name
          }
        }
      }
    }`,
    {
      props({ data: { list } }) {
        return {
          list: list ? list.items : [],
        };
      },
    },
  ),
)(DomainsView);
