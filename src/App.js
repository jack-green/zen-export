import React, { Component } from 'react';

import Login from './components/login';
import Intro from './components/intro';
import Results from './components/results';
import Status from './components/status';

import { getZenRecords } from './brain';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      error: null,
      results: null,
      status: null,
      progress: 100,
    }
  }

  setStatus = (status, progress = 100) => {
    this.setState({ status, progress });
  }

  login = async (email, password) => {

    this.setState({
      error: null,
      loading: true,
    });

    getZenRecords(email, password, this.setStatus)
      .then((results) => {
        this.setState({
          loading: false,
          status: null,
          results,
        });
      })
      .catch((error) => {
        this.setState( {
          error: error.message,
          status: error,
          loading: false,
        });
      });
  }

  onBack = () => {
    this.setState({
      status: null,
      error: null,
      results: null,
      loading: false,
    });
  }

  render() {
    const { error, loading, status, progress, results } = this.state;

    return (
      <div className="app container my-4">
        {results === null ? (
          <div className="row align-items-center">
            <div className="col-lg-8">
              {!status ? (
                <Intro />
              ) : (
                <Status status={status} progress={progress} error={error} />
              )}
            </div>
            <div className="col-lg-4">
              <Login
                onLogin={this.login}
                loading={loading}
              />
            </div>
          </div>
        ) : (
          <Results results={results} onBack={this.onBack} />
        )}
      </div>
    );
  }
}

export default App;
