import React from 'react';
import Input from 'reactstrap/lib/Input';
import last from 'lodash/last';
import View from '../Styled/View';
import ReactTable from '../Styled/Table';
import AccountView from './AccountView';

import compose from 'recompose/compose';
import { gql } from 'apollo-boost';
import { graphql } from 'react-apollo';

const columns = [
  {
    Header: 'Id',
    accessor: 'id',
  },
  {
    Header: 'Quorum',
    accessor: 'quorum',
    width: 100,
  },
  {
    Header: 'Roles',
    accessor: 'roles',
    Cell: ({ value }) => <>
      {value.map(({ name }, i) => <div key={i}>{name}</div>)}
    </>,
  },
];

export class AccountsView extends React.Component {
  state = {
    showAccount: null,
    page: 0,
    pages: [null],
    idPart: null,
  };

  componentWillReceiveProps({ nextAfter }) {
    const { pages } = this.state;
    if (last(pages) < nextAfter) {
      this.setState({ pages: [...pages, nextAfter] });
    }
  }

  refetch(variables, state) {
    this.setState(state);
    this.props.refetch(variables);
  }
  
  pageToAfter = (page, pageSize) => this.wholePaging ? page * pageSize : this.state.pages[page];

  onPageSizeChange = (pageSize, page) => {
    if (this.wholePaging) {
      this.refetch({ after: this.pageToAfter(page, pageSize), pageSize }, { page });
    } else {
      this.refetch({ after: null, pageSize }, { page: 0, pages: [null] });
    }
  };

  onPageChange = (page) => {
    this.refetch({ after: this.pageToAfter(page, this.props.pageSize) }, { page });
  };

  idPartOnChange(idPart) {
    this.refetch({ after: null, idPart }, { page: 0, pages: [null], idPart });
  }

  get wholePaging() {
    return this.state.idPart === null;
  }

  render() {
    const {
      list,
      total, pageSize, loading,
    } = this.props;
    const {
      showAccount,
      page, pages,
      idPart,
    } = this.state;
    return (
      <View>
        <div className="row searchRow">
          <div className="col-md-6">
            <Input
              placeholder="Id part"
              value={idPart || ''}
              onChange={e => this.idPartOnChange(e.target.value || null)}
            />
          </div>
        </div>

        <ReactTable
          data={list}
          columns={columns}
          sortable={false}
          minRows={1}
          getTrProps={(state, row) => ({
            onClick: () => this.setState({ showAccount: row.original.id }),
          })}

          manual
          loading={loading}
          page={page}
          pageSize={pageSize}
          onPageChange={this.onPageChange}
          onPageSizeChange={this.onPageSizeChange}
          pages={this.wholePaging ? total !== null ? Math.ceil(total / pageSize) : 1 : pages.length}
        />
        <AccountView
          accountId={showAccount}
          onClose={() => this.setState({ showAccount: null })}
        />
      </View>
    );
  }
}

export default compose(
  graphql(
    gql`query ($pageSize: Int!, $after: Int, $idPart: String) {
      list: accountList(count: $pageSize, after: $after, id: $idPart) {
        items {
          id
          quorum
          roles {
            name
          }
        }
        nextAfter
      }
      total: accountCount
    }`,
    {
      options: {
        variables: {
          pageSize: 5,
          idPart: null,
        },
      },
      props({ data: { list, total = null, loading, refetch, variables: { pageSize } } }) {
        return {
          list: list ? list.items : [],
          nextAfter: list ? list.nextAfter : null,
          total,
          pageSize,
          loading,
          refetch,
        };
      },
    },
  ),
)(AccountsView);
