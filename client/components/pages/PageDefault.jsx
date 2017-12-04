import './style/PageDefault.pcss';
import React from 'react';
import { connect } from 'react-redux';

export default connect(

  state => state

)(class PageDefault extends React.Component {

  constructor (props) {
    super(props);
  }

  render () {
    return (
      <div className="page-default">
        <div className="container">
          <div className="central">
            <h1>{'Template React Application'}</h1>
            <sub>{`Version ${this.props.version}`}</sub>
          </div>
        </div>
      </div>
    );
  }

});

