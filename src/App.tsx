import React from 'react';
import AddNews from './AddNews';

export default class App extends React.Component {
  render() {
    return (
      <div className="box">
        <h2>Using CKEditor&nbsp;5 build in React</h2>
        <AddNews isModalOpen={true} />
      </div>
    );
  }
}