import './Window.pcss';
import React from 'react';
import DefaultPage from './pages/PageDefault';
import { Provider } from 'react-redux';

class Window extends React.Component {

  constructor (props) {
    super(props);
  }

  render () {
    console.log(this.props);
    return (
      <Provider store={this.props.store}>
        <DefaultPage />
      </Provider>
    );
  }
}

export default Window;