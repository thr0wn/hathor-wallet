import React from 'react';
import wallet from '../utils/wallet';
import ChoosePassword from '../components/ChoosePassword';
import ChoosePin from '../components/ChoosePin';
import logo from '../assets/images/hathor-logo.png';
import { updatePassword, updatePin } from '../actions/index';
import { connect } from "react-redux";


const mapStateToProps = (state) => {
  return { password: state.password, pin: state.pin };
};


const mapDispatchToProps = dispatch => {
  return {
    updatePassword: data => dispatch(updatePassword(data)),
    updatePin: data => dispatch(updatePin(data)),
  };
};


class LoadWallet extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      errorMessage: '',
      words: '',
      askPassword: false,
      askPIN: false,
    }
  }

  import = () => {
    const words = this.refs.wordsInput.value;
    const ret = wallet.wordsValid(words);
    if (ret.valid) {
      this.setState({ words, askPassword: true });
    } else {
      this.setState({ errorMessage: ret.message });
    }
  }

  passwordSuccess = () => {
    // This method is called after the ChoosePassword component has a valid password and succeeds
    this.setState({ askPIN: true });
  }

  pinSuccess = () => {
    // This method is called after the ChoosePin component has a valid PIN and succeeds
    // First we clean what can still be there of a last wallet
    wallet.cleanWallet();
    wallet.generateWallet(this.state.words, '', this.props.pin, this.props.password, true);
    wallet.markBackupAsDone();
    // Clean pin and password from redux
    this.props.updatePassword(null);
    this.props.updatePin(null);
    this.props.history.push('/wallet/');
  }

  pinBack = () => {
    this.setState({ askPIN: false });
  }

  passwordBack = () => {
    this.setState({ askPassword: false });
  }

  render() {
    const renderLoad = () => {
      return (
        <div>
          <p className="mt-4 mb-4">Write the 24 words of your wallet (separated by space)</p>
          <textarea className="form-control one-word-input mb-4" placeholder="Words separated by single space" ref="wordsInput" rows={4} />
          {this.state.errorMessage && <p className="mb-4 text-danger">{this.state.errorMessage}</p>}
          <div className="d-flex justify-content-between flex-row w-100">
            <button onClick={this.props.history.goBack} type="button" className="btn btn-secondary">Back</button>
            <button onClick={this.import} type="button" className="btn btn-hathor">Import data</button>
          </div>
        </div>
      )
    }

    return (
      <div className="outside-content-wrapper">
        <div className="inside-white-wrapper col-sm-12 col-md-8 offset-md-2 col-lg-6 offset-lg-3">
          <div className="d-flex align-items-center flex-column">
            <img className="hathor-logo" src={logo} alt="" />
            <div className="d-flex align-items-start flex-column">
              {this.state.askPIN ? <ChoosePin back={this.pinBack} success={this.pinSuccess} /> : (this.state.askPassword ? <ChoosePassword back={this.passwordBack} success={this.passwordSuccess} /> : renderLoad())}
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(LoadWallet);