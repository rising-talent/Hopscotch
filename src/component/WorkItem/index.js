import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { push } from 'react-router-redux';
import { Router, Route, browserHistory, IndexRoute } from 'react-router';
import firebase from 'firebase'
import ProgressCircle from '../Progress'
import FirebaseMedia from '../FeedbackList/media'
import * as Controller from '../../lib/controller'
import { Document, Page } from 'react-pdf';
import ReactTooltip from 'react-tooltip'

require('./index.css')
const sample_word = require('../../resource/images/sample-word.png')
const sample_video = require('../../resource/images/sample-video.png')
const sample_audio = require('../../resource/images/sample-audio.png')
const sample_pdf = require('../../resource/images/sample-pdf.png')
const contentHight = 240//must change in css

export default class WorkItem extends Component {

    constructor(props) {
        super(props)
        this.state = {
            file: {},
            imageURL: null,
            loadingViewHeight: 0,
            percent: 0,
        }
    }

    static propTypes = {
        file: PropTypes.object.isRequired,
        project: PropTypes.object.isRequired,
        onDownload: PropTypes.func,
        onDelete: PropTypes.func,
        onNavigate: PropTypes.func.isRequired,
        handle: PropTypes.object.isRequired,
        onCompleteUpload: PropTypes.func,
        isOwn: PropTypes.bool
    }

    static defaultProps = {
        onDownload: () => undefined,
        onDelete: () => undefined,
        onNavigate: () => undefined,
        isOwn: false
    }

    componentWillMount() {
        const _this = this
        this.mounted = true
        this.startLoadingAnimation()
        if(this.props.file.state === undefined){
            //new uploaded work
            this.mounted && this.setState({file: this.props.file})
            
            console.log(this.state.file.name + ' created')
            let UploadTask = firebase.storage().ref(this.props.file.image).put(this.props.file.file)
            UploadTask.on('state_changed', function(snapshot){
                // Observe state change events such as progress, pause, and resume
                // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
                var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                _this.mounted && _this.setState({percent: progress})
                console.log('Upload is ' + progress + '% done');
                switch (snapshot.state) {
                  case firebase.storage.TaskState.PAUSED: // or 'paused'
                    console.log('Upload is paused');
                    break;
                  case firebase.storage.TaskState.RUNNING: // or 'running'
                    console.log('Upload is running');
                    break;
	              default:
	                return null
                }
            }, function(error) {
                // Handle unsuccessful uploads
            }, function() {
                // Handle successful uploads on complete
                // For instance, get the download URL: https://firebasestorage.googleapis.com/...
                var downloadURL = UploadTask.snapshot.downloadURL;
                _this.props.onCompleteUpload()
                _this.props.handle.createWork(_this.props.file, _this.props.project, (res) => {
                    console.log('Work_id '+ res + ' has been created')                    
                })
                if(_this.props.file.type === 'WORD') 
                    _this.mounted && _this.setState({imageURL: sample_word})
                else if(_this.props.file.type === 'AUDIO' || _this.props.file.type === 'MP3') 
                    _this.mounted && _this.setState({imageURL: sample_audio})
                else if(_this.props.file.type === 'PDF') 
                    _this.mounted && _this.setState({imageURL: sample_pdf})
                else if(_this.props.file.type === 'VIDEO' || _this.props.file.type === 'MP4') 
                    _this.mounted && _this.setState({imageURL: sample_video})
                else 
                    _this.mounted && _this.setState({imageURL: downloadURL})
            });    
        }
        else{
            //existing work
            this.props.handle.getWorkDetails(this.props.file.work_id, (file) => {
                this.mounted && this.setState({file})
                this.getWorkImage(file)                
            })
        }        
    }

    componentWillReceiveProps(props) {
        //existing 
        if(this.props.file.work_id !== this.state.file.work_id){
            this.setState({imageURL: null})
            this.props.handle.getWorkDetails(this.props.file.work_id, (file) => {
                this.mounted && this.setState({file})
                this.getWorkImage(file)
            })
        } 
        
    }

    componentWillUnmount() {
        this.mounted = false
    }

    startLoadingAnimation() {
        const _this = this
        if(this.state.loadingViewHeight === 0){
            this.mounted && this.setState({loadingViewHeight: contentHight})
        }
        else{
            this.mounted && this.setState({loadingViewHeight: 0})
        }
        setTimeout(function() {
            if(_this.state.imageURL === null) _this.mounted && _this.startLoadingAnimation()
        }, 1000)
    }

    onClickTitle() {
        if(!this.props.isFile){
            this.props.onNavigate()
        }
    }

    getWorkImage(file) {
        if(file.type === 'WORD') this.mounted && this.setState({imageURL: sample_word})
        else if(file.type === 'AUDIO' || file.type === 'MP3') this.mounted && this.setState({imageURL: sample_audio})
        else if(file.type === 'PDF') this.mounted && this.setState({imageURL: sample_pdf})
        else if(file.type === 'VIDEO' || file.type === 'MP4') this.mounted && this.setState({imageURL: sample_video})
        else {
            this.props.handle.getFileWithName(file.image, (url) => {
                this.mounted && this.setState({imageURL: url})
            })
        }        
    }    

    render() {
        console.log('Work Type: ', this.props.file.type)
        return (
                <div className="col-md-3" style={{padding: 10}}>
                    <div className="item">
                    {
                        this.state.percent > 0 && this.state.percent < 100?
                        <div className='work-loading-container'>
                            <ProgressCircle percent={this.state.percent} strokeWidth={10} />
                        </div>
                        :this.state.imageURL === null || this.state.file == {}?
                        <div className='work-loading-container'>
                            <div className='item-image work-loading-view' style={{height: this.state.loadingViewHeight}}/>
                        </div>
                        :this.state.file.type == 'PDF'?
                        <div className="item-image">
                            <FirebaseMedia type="pdf" url={this.state.file.image} handle={this.props.handle}/>
                            <div className="item-overlay">
                                <div>
                                    <button type="button" className="transparent" onClick={() => this.props.onNavigate()}>VIEW</button>
                                    <p>{this.state.file.feedback} Feedback</p>
                                    <div className="item-overlay-buttons">
                                        <button type="button" data-tip="Download" className="icon" onClick={() => this.props.onDownload()}>
                                            <i className="icon-download"></i>
                                        </button>
                                        {
                                            this.props.isOwn?
                                            <button type="button" data-tip="Delete" className="icon" onClick={() => this.props.onDelete(this.state.file)}>
                                                <i className="icon-trash"></i>
                                            </button>
                                            :null
                                        }				
                                        <ReactTooltip effect="solid" border={true}/>   		                
                                    </div>
                                </div>
                            </div>
                        </div>
                        :this.state.file.type == 'VIDEO' || this.state.file.type == 'MP4'?
                        <div className="item-image">
                            <FirebaseMedia type="video" url={this.state.file.image} handle={this.props.handle} disable={true}/>
                            <div className="item-overlay">
                                <div>
                                    <button type="button" className="transparent" onClick={() => this.props.onNavigate()}>VIEW</button>
                                    <p>{this.state.file.feedback} Feedback</p>
                                    <div className="item-overlay-buttons">
                                        <button type="button" data-tip="Download" className="icon" onClick={() => this.props.onDownload()}>
                                            <i className="icon-download"></i>
                                        </button>
                                        {
                                            this.props.isOwn?
                                            <button type="button" data-tip="Delete" className="icon" onClick={() => this.props.onDelete(this.state.file)}>
                                                <i className="icon-trash"></i>
                                            </button>
                                            :null
                                        }				
                                        <ReactTooltip effect="solid" border={true}/>   		                
                                    </div>
                                </div>
                            </div>
                        </div>
                        :
                        <div className="item-image" style={{backgroundImage: "url(" + this.state.imageURL + ")" }}>
                            <div className="item-overlay">
                                <div>
                                    <button type="button" className="transparent" onClick={() => this.props.onNavigate()}>VIEW</button>
                                    <p>{this.state.file.feedback} Feedback</p>
                                    <div className="item-overlay-buttons">
                                        <button type="button" data-tooltip="Download" data-flow="up" className="icon" onClick={() => this.props.onDownload()}>
                                            <i className="icon-download"></i>
                                        </button>
                                        {
                                            this.props.isOwn?
                                            <button type="button" data-tooltip="Delete" data-flow="up" className="icon" onClick={() => this.props.onDelete(this.state.file)}>
                                                <i className="icon-trash"></i>
                                            </button>
                                            :null
                                        }				 		                
                                    </div>
                                </div>
                            </div>
                        </div>
                    }
                    <h3 className="truncate">
                        {this.state.file.name !== undefined ? Controller.myDecode(this.state.file.name) : ''}
                        <span>{this.state.file.type === undefined ? '' : this.state.file.type.toUpperCase()}</span>
                    </h3>   
                    </div>          
                </div>
        );
    }
}