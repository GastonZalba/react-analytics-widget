import React from "react";
import PropTypes from 'prop-types';

// dont wait for auth twice, even after unmounts
let isLoaded = false;

// wait for auth to display children
export class GoogleProvider extends React.Component {
  state = {
    ready: false
  };
  componentDidMount() {
    this.init();
  }
  init = () => {
    const doAuth = () => {
      const authObj = this.props.accessToken ?
        {serverAuth: {access_token: this.props.accessToken}} :
        {clientid: this.props.clientId};
      gapi.analytics.auth &&
        gapi.analytics.auth.authorize({
          ...authObj,
          container: this.authButtonNode
        });
    };
    gapi.analytics.ready(a => {
      if (isLoaded) {
        this.setState({
          ready: true
        });
        return;
      }
      const authResponse = gapi.analytics.auth.getAuthResponse();
      if (!authResponse) {
        gapi.analytics.auth.on("success", response => {
          this.setState({
            ready: true
          });
        });
      } else {
        this.setState({
          ready: true
        });
      }
      doAuth();
    });
  };
  render() {
    return (
      <div>
        {this.props.clientId && <div ref={node => (this.authButtonNode = node)} />}
        {this.state.ready && this.props.children}
      </div>
    );
  }
}
GoogleProvider.propTypes = {
  clientId: PropTypes.string,
  accessToken: PropTypes.string,
}

// real time data for active users
export class GoogleDataLive extends React.Component {
  componentDidMount() {
    const checkExist = setInterval(() => {
      // Wait until this component is loaded
      if (typeof gapi.analytics.ext !== undefined) {
        clearInterval(checkExist);
        this.loadData();
      }
    }, 100)
  }
  componentWillUpdate() {
    this.loadData();
  }
  componentWillUnmount() {
  }
  loadData = () => {
    const config = {
      ...this.props.config,
      container: this.dataNode
    };
    this.activeUsers = new gapi.analytics.ext.ActiveUsers(config);
    this.activeUsers.set(this.props.views).execute();
    
    /**
     * Add CSS animation to visually show the when users come and go.
     */
    this.activeUsers.once('success', () => {
      const element = this.dataNode.firstChild;
      let timeout;

      this.activeUsers.on('change', (data) => {
        const animationClass = data.delta > 0 ? 'is-increasing' : 'is-decreasing';
        element.className += (' ' + animationClass);

        clearTimeout(timeout);
        timeout = setTimeout(() => {
          element.className =
            element.className.replace(/ is-(increasing|decreasing)/g, '');
        }, 3000);
      });
    });
  };
  render() {
    return (
      <div
        className={this.props.className}
        style={this.props.style}
        ref={node => (this.dataNode = node)}
      >
        {!this.dataNode && this.props.loader !== undefined ? this.props.loader : 'Loading ...'}
      </div>
    );
  }
}

// single chart
export class GoogleDataChart extends React.Component {
  componentDidMount() {
    this.loadChart();
  }
  componentWillUpdate() {
    this.loadChart();
  }
  componentWillUnmount() {
    // TODO: cleanup
  }
  loadChart = () => {
    const config = {
      ...this.props.config,
      chart: {
        ...this.props.config.chart,
        container: this.chartNode
      }
    };
    this.chart = new gapi.analytics.googleCharts.DataChart(config);
    this.chart.set(this.props.views).execute();
  };
  render() {
    return (
      <div
        className={this.props.className}
        style={this.props.style}
        ref={node => (this.chartNode = node)}
      >
        {!this.chart && this.props.loader !== undefined ? this.props.loader : 'Loading ...'}
      </div>
    );
  }
}