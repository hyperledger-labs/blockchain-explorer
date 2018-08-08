import React, { Component } from 'react';
import { Alert } from 'reactstrap';

export default class ErrorMesageComponent extends Component {
  render() {
    return (
      <div className="error">
        <Alert color="danger">{this.props.message}</Alert>
      </div>
    );
  }
}
