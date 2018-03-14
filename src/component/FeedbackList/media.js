import PropTypes from 'prop-types';
import React, { Component } from 'react';
import ReactPlayer from 'react-player'
import { Document, Page } from 'react-pdf';
require('./index.css')
const sample_pdf = require('../../resource/pdf/book.pdf')

export default class FirebaseMedia extends Component {

    constructor(props) {
        super(props)
        this.state = {
            hover: false,
            mediaURL: '',
            pageWidth: 400
        }
    }

    static propTypes = {
        url: PropTypes.string.isRequired,
        handle: PropTypes.object.isRequired,
        type: PropTypes.string.isRequired,
        disable: PropTypes.bool
    }

    static defaultProps = {

    }

    componentDidMount() {
        this.mounted = true
        console.log('Video URL: ', this.props.url)
        this.props.handle.getFileWithName(this.props.url, (url) => {
            this.mounted && this.setState({mediaURL: url})
            console.log('Video URL:', url)
        })
        window.addEventListener("resize", this.updateDimensions);
    }

    componentWillUnmount() {
        this.mounted = false
    }

    updateDimensions() {
        if(this.props == undefined) return
        const width = document.getElementById(this.props.url).offsetWidth
        this.setState({pageWidth: width})
    }

    onError(e) {
        console.log('File Load Error: ', e)
    }

    onDocumentLoad(numPages) {
        const width = document.getElementById(this.props.url).offsetWidth
        this.setState({pageWidth: width})
    }

    render() {
        console.log('Audio File Path', this.state.mediaURL)
        if(this.props.type == 'audio'){            
            return(
                <div className="item-image">
                    <audio src={this.state.mediaURL} controls width="100%" height="100%"/>
                </div>
            )
        }
        else if(this.props.type == "pdf"){
            const type="pdf"
            return(
                <div>
                    <Document
                    file="book.pdf"
                    onLoadSuccess={this.onDocumentLoad}
                    >
                    <Page pageNumber={1} />
                    </Document>
                    <p>Page 1 of 12</p>
                </div>
                // <div className="item-image">
                // <img src={sample_pdf} className="pdf-preview-item"/>
                // </div>
            )
        }
        else if(this.props.type == 'video' && this.props.disable){
            return (
                <div className="item-image">
                    <ReactPlayer url={this.state.mediaURL} width="100%" height="240px" className="video-item-cover"/>
                </div>
            );
        }
        else{
            return (
                <div className="item-image">
                    <ReactPlayer url={this.state.mediaURL} controls width="100%" height="100%"/>                    
                </div>
            );
        }
        
    }
}