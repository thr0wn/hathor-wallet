import React from 'react';
import $ from 'jquery';
import helpers from '../utils/helpers';
import _ from 'lodash';


class OutputsWrapper extends React.Component {
  constructor(props) {
    super(props);

    this.address = React.createRef();
    this.value = React.createRef();
    this.timelock = React.createRef();
    this.timelockCheckbox = React.createRef();
    this.uniqueID = _.uniqueId()
  }

  handleCheckboxTimelockChange = (e) => {
    const value = e.target.checked;
    if (value) {
      $(this.timelock.current).show(400);
    } else {
      $(this.timelock.current).hide(400);
    }
  }

  render = () => {
    return (
      <div className="input-group mb-3">
        <input type="text" ref={this.address} placeholder="Address" className="form-control output-address col-4" />
        <input type="number" ref={this.value} step={helpers.prettyValue(1)} min={helpers.prettyValue(1)} placeholder={helpers.prettyValue(0)} className="form-control output-value col-2" />
        <div className="form-check mr-3 d-flex flex-column justify-content-center">
          <input className="form-check-input mt-0 has-timelock" ref={this.timelockCheckbox} type="checkbox" onChange={this.handleCheckboxTimelockChange} id={this.uniqueID}/>
          <label className="form-check-label" htmlFor={this.uniqueID}>
            Time lock
          </label>
        </div>
        <input type="datetime-local" placeholder="Date and time in GMT" ref={this.timelock} step="1" className="form-control output-timelock col-3" style={{display: 'none'}}/>
        {this.props.index === 0 ? <button type="button" className="btn btn-hathor" onClick={this.props.addOutput}>+</button> : null}
      </div>
    );
  }
}

export default OutputsWrapper;