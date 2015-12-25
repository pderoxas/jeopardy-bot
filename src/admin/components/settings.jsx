import React, { PropTypes } from 'react';
import { Button, Card, CardText, CardTitle, CardMenu, CardActions, Icon, Tooltip, Textfield } from 'react-mdl';

const propTypes = {
  app: PropTypes.object.isRequired,
};

const defaultProps = {};

class Settings extends React.Component {
  constructor(props) {
    super(props);

    this.onChangeMode = this.onChangeMode.bind(this);
    this.onChangeApiToken = this.onChangeApiToken.bind(this);
    this.onChangeOwner = this.onChangeOwner.bind(this);
    this.onClickSave = this.onClickSave.bind(this);

    this.getContestants();
    this.state = {
      contestants: [],
    };
  }

  componentWillReceiveProps(props) {
    this.getState(props.app);
  }

  onChangeMode(e) {
    this.setState({
      mode: e.target.value,
    });
  }

  onChangeApiToken(e) {
    this.setState({
      api_token: e.target.value,
    });
  }

  onChangeOwner(e) {
    this.setState({
      owner: e.target.value,
    });
  }

  onClickSave() {
    const { owner, api_token, mode } = this.state;
    this.props.onValueChanged({
      owner,
      api_token,
      mode,
    });
  }

  getContestants() {
    fetch('/api/v1/contestants/', {
      credentials: 'include',
    }).then(res => {
      return res.json();
    }).then(contestants => {
      this.setState({ contestants });
    });
  }

  getState({ owner, api_token, mode }) {
    this.setState({
      owner,
      api_token,
      mode,
    });
  }

  render() {
    return (
      <Card shadow={0} style={{
        width: '100%',
      }}>
        <CardTitle>Settings</CardTitle>
        <CardText>
          <div>
            <h6 className="no-margin">
              Mode
              <Tooltip
                label="Change the bot mode based on the configurated slack integration."
              >
                <Icon className="jbot-inline-icon" name="help" />
              </Tooltip>
            </h6>
            <select className="jbot-select" value={this.state.mode} onChange={this.onChangeMode}>
              <option value="" disabled>Select a mode...</option>
              <option value="bot">Bot</option>
              <option value="hybrid">Hybrid</option>
              <option value="response">Response</option>
            </select>
          </div>

          {this.state.mode !== 'response' ? (
            <div>
              <h6 className="no-margin">
                API Token
                <Tooltip
                  label="The Slack API Token, used to send responses back to Slack."
                >
                  <Icon className="jbot-inline-icon" name="help" />
                </Tooltip>
              </h6>
              <Textfield
                onChange={this.onChangeApiToken}
                value={this.state.api_token}
                label="API Token..."
              />
            </div>
          ) : null}

          <div>
            <h6 className="no-margin">
              Jeopardy Owner
              <Tooltip
                label="The contestant that is responsible for the Jeopardy Bot."
              >
                <Icon className="jbot-inline-icon" name="help" />
              </Tooltip>
            </h6>
            <select className="jbot-select" value={this.state.owner} onChange={this.onChangeOwner}>
              <option value="" disabled>Select an owner...</option>
              {this.state.contestants.map((contestant) => (
                <option key={contestant._id} value={contestant._id}>
                  {contestant.name}
                </option>
              ))}
            </select>
          </div>
        </CardText>
        <CardActions border>
          <Button colored ripple onClick={this.onClickSave}>Save</Button>
        </CardActions>
        <CardMenu>
          <Icon name="settings" />
        </CardMenu>
      </Card>
    );
  }
}

Settings.propTypes = propTypes;
Settings.defaultProps = defaultProps;

export default Settings;