import React from 'react';
import FontAwesome from 'react-fontawesome';
import Dialog from '@material-ui/core/Dialog';
import Table from 'reactstrap/lib/Table';
import Card from 'reactstrap/lib/Card';
import CardBody from 'reactstrap/lib/CardBody';
import CardTitle from 'reactstrap/lib/CardTitle';
import flatMap from 'lodash/flatMap';
import Modal from '../Styled/Modal';
import ReactTable, { filteredColumn } from '../Styled/Table';

import compose from 'recompose/compose';
import { gql } from 'apollo-boost';
import { graphql } from 'react-apollo';

const rolePermissionColumns = [
  filteredColumn({
    Header: 'Permission',
    accessor: 'permission',
  }),
  filteredColumn({
    Header: 'Role',
    accessor: 'role',
  }),
];

const grantedPermissionColumns = [
  filteredColumn({
    Header: 'Permission',
    accessor: 'permission',
  }),
  filteredColumn({
    Header: 'Account',
    accessor: 'account',
  }),
];

export function AccountView({ accountId, onClose, account }) {
  const rolePermissions = account ? flatMap(account.roles, role => role.permissions.map(permission => ({ role: role.name, permission }))) : [];
  const open = !!accountId;
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
    >
      {!open ? '' :
        <Modal>
          {modalClasses => <Card className={modalClasses.card}>
            <CardTitle className={modalClasses.title}>
              Account Details
              <button
                type="button"
                onClick={onClose}
                className={modalClasses.closeBtn}
              >
                <FontAwesome name="close" />
              </button>
            </CardTitle>
            <CardBody className={modalClasses.body}>
              {account ?
                <Table striped hover responsive className="table-striped">
                  <tbody>
                    <tr>
                      <th>Acocunt Id</th>
                      <td>{account.id}</td>
                    </tr>
                    <tr>
                      <th>Quorum</th>
                      <td>{account.quorum}</td>
                    </tr>
                    <tr>
                      <th>Roles</th>
                      <td>{account.roles.map(({ name }, i) => <div key={i}>{name}</div>)}</td>
                    </tr>
                    <tr>
                      <th>Role Permissions</th>
                      <td>
                        {rolePermissions.length ? <ReactTable
                          data={rolePermissions}
                          columns={rolePermissionColumns}
                          filterable
                          minRows={0}
                          showPagination={false}
                        /> : '-'}
                      </td>
                    </tr>
                    <tr>
                      <th>Permissions Granted By Account</th>
                      <td>
                        {account.permissionsGrantedBy.length ? <ReactTable
                          data={account.permissionsGrantedBy}
                          columns={grantedPermissionColumns}
                          filterable
                          minRows={0}
                          showPagination={false}
                        /> : '-'}
                      </td>
                    </tr>
                    <tr>
                      <th>Permissions Granted To Account</th>
                      <td>
                        {account.permissionsGrantedTo.length ? <ReactTable
                          data={account.permissionsGrantedTo}
                          columns={grantedPermissionColumns}
                          filterable
                          minRows={0}
                          showPagination={false}
                        /> : '-'}
                      </td>
                    </tr>
                  </tbody>
                </Table>
              :
                <FontAwesome name="circle-o-notch" size="3x" spin />
              }
            </CardBody>
          </Card>}
        </Modal>
      }
    </Dialog>
  );
}

export default compose(
  graphql(
    gql`query ($accountId: String!) {
      account: accountById(id: $accountId) {
        id
        quorum
        roles {
          name
          permissions
        }
        permissionsGrantedBy {
          account: to
          permission
        }
        permissionsGrantedTo {
          account: by
          permission
        }
      }
    }`,
    {
      skip({ accountId }) {
        return !accountId;
      },
      options({ accountId }) {
        return {
          variables: {
            accountId,
          },
        };
      },
      props({ data: { account } }) {
        return {
          account,
        };
      },
    },
  ),
)(AccountView);
