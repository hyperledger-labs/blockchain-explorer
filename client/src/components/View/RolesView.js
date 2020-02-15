import React from 'react';
import View from '../Styled/View';
import ReactTable, { filteredColumn } from '../Styled/Table';

import compose from 'recompose/compose';
import { gql } from 'apollo-boost';
import { graphql } from 'react-apollo';

const columns = [
  filteredColumn({
    Header: 'Role Name',
    accessor: 'name',
  }),
  filteredColumn({
    Header: 'Permissions',
    accessor: 'permissions',
    Cell: ({ value }) => value.length ? <>
      {value.map((permission, i) => <div key={i}>{permission}</div>)}
    </> : '(no permissions)',
  }),
];

export const RolesView = ({ list }) => (
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
      list: roleList(count: 100) {
        items {
          name
          permissions
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
)(RolesView);
