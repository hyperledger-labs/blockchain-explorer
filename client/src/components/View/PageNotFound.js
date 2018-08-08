import React, { Component } from 'react';
import FontAwesome from 'react-fontawesome';

export default class PageNotFound extends Component {
  render() {
    return (
      <div className="errorContainer">
        <div className="errorHeader">
          <FontAwesome name="exclamation-triangle" className="errorIcon" />404
        </div>
        <div className="errorSubHeader"> Page not found </div>
        <div className="errorContent">
          {' '}
          The page you are trying to access does not exist. Please check the URL
        </div>
      </div>
    );
  }
}
