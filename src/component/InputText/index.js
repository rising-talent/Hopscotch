import PropTypes from 'prop-types';
import React, { Component } from 'react';
require('./index.css')

export default class InputText extends Component {

    constructor(props) {
        super(props)
        this.state = {
            onFocus: false
        }
    }

    static propTypes = {
        placeholder: PropTypes.string.isRequired,
        isError: PropTypes.bool.isRequired,
        onChange: PropTypes.func.isRequired,
        errorText: PropTypes.string
    }

    static defaultProps = {
        onChange: () => undefined,
        placeholder: '',
        isError: false,
        errorText: ''
    }

    componentDidMount() {
        
    }

    render() {
        return (
            <p>
                <input 
                    className="inputBox" 
                    style={{borderColor: this.props.isError?'#FA656F':null}} 
                    onFocus={() => this.setState({onFocus: true})}
                    onBlur={() => this.setState({onFocus: false})}
                    onChange={(e) => this.props.onChange(e.target.value)}
                    type="text" 
                    placeholder={this.state.onFocus?'':this.props.placeholder} 
                    ref={(ref) => this.signUpEmail = ref}/>
					<label
					htmlFor="email">
						{this.props.placeholder}
					</label>
                {
                    this.props.isError?
                    <span className="error-message">{this.props.errorText}</span>
                    :null
                }                                  
            </p>
        );
    }
}