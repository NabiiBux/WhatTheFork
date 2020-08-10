import React from 'react';
import logo from './logo.svg';
// import 'bootstrap/dist/css/bootstrap.css';
import './custom.scss';
import './App.css';

function App() {
  return <>
    <div className="container">
      <div className="row">
        <div className="col-md-6">
          Half
    </div>
        <div className="col-md-6">
          Other half
    </div>
      </div>
    </div>

    <div className="App">

      <h1>Yo</h1>
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  </>;
}

export default App;
