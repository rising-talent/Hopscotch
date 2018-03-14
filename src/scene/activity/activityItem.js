import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { push } from 'react-router-redux';
import { Router, Route, browserHistory, IndexRoute } from 'react-router';
import ProfileImage from '../../component/ProfileImage'
import FeedbackImage from '../../component/FeedbackList/image.js'
import FirebaseMedia from '../../component/FeedbackList/media'
const sample_pdf = require('../../resource/images/sample-pdf.png')
require('./index.css')

const Months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
export default class ActivityItem extends Component {

    constructor(props) {
        super(props)
        this.state = {
            annotation: JSON.parse(this.props.activity.annotation),
            imageURL: []
        }
    }

    static propTypes = {
        pDate: PropTypes.number,
        date: PropTypes.number.isRequired,
        activity: PropTypes.object.isRequired,
        isLeft: PropTypes.bool.isRequired,
        handle: PropTypes.object.isRequired,
        onPreviewImage: PropTypes.func.isRequired
    }

    static defaultProps = {
        pDate: 0,
        onPreviewImage: () => undefined
    }

    componentWillMount() {
        this.mounted = true
    }

    componentWillUnmount() {
        this.mounted = false
    }

    onPreviewImage(url) {
        alert(url)
    }

    onGoToWorkResult(activity) {
        //
        this.props.handle.formatSortedWorks()
        this.props.handle.getWorkURL(activity, (index) => {
            if(index === -1) browserHistory.push('/workdoesnotexist')
            else browserHistory.push('/app/projects/' + activity.project_id + '/works/' + (index + 1))
        })
    }

    render() {
        const _this = this
        console.log('pDate: ', this.props.pDate)
        console.log('Date: ', this.props.date)
        //processing date
        let isShowDate = false
        const PT = new Date(this.props.pDate)
        const MT = new Date(this.props.date)
        if(this.props.pDate === 0) isShowDate = true
        else if(PT.getMonth() !==MT.getMonth() || PT.getDate() !==MT.getDate()) isShowDate = true

        //processing image and title message
        let UID = ''
        let Msg = ''
        let Name = ''
        if(this.props.isLeft){
            UID = localStorage.getItem('uid')
            Name = 'You'
            Msg = ' left a comment on '
        }else{
            UID = this.props.activity.user_id
            Name = this.props.activity.user_name
            Msg = ' added a comment on '
        }
        return (
            <li>
                {                    
                    isShowDate?
                    <h3 className="feedback-date">{Months[MT.getMonth()] + '. ' + MT.getDate()}</h3>
                    :null
                }
				<ul className="feedback-list-item">
	                <li>
	                    <ProfileImage id={UID} handle={this.props.handle}/>
	                    {
	                        this.props.isLeft?
	                        <p className="title">
	                            <strong>{Name}</strong>
	                            {Msg}
								<a onClick={() => this.onGoToWorkResult(this.props.activity)}> {this.props.activity.title}</a>
	                        </p>
	                        :
	                        <p className="title">
	                            <strong>{Name}</strong>
	                            {Msg}<a onClick={() => this.onGoToWorkResult(this.props.activity)}>{this.props.activity.title}</a>
	                        </p>
	                    }
                    	<div className="item-list">
	                    {                        
                            this.state.annotation.map(function(annotation, index){
                                console.log('Image URL: ', annotation.url)
                                if(annotation.type == 'image'){
                                    return(
                                        <div key={index} className="col-xs-12 col-sm-6 col-md-4">
                                            <div className="activity-item-image">
                                                <FeedbackImage url={annotation.url} handle={_this.props.handle} onPreviewImage={(url) => _this.props.onPreviewImage(url)}/>
                                            </div>
                                        </div>
                                    )
                                }
                                else if(annotation.type == 'other'){
                                    if(annotation.ext.indexOf('audio') > -1){
                                        return(
                                            <div key={index} className="col-xs-12 col-sm-6 col-md-4">
                                                <div className="activity-item-audio">
                                                    <FirebaseMedia type='audio' url={annotation.url} handle={_this.props.handle} />
                                                </div>
                                            </div>
                                        )
                                    }
                                    if(annotation.ext.indexOf('pdf') > -1){
                                        return(
                                            <div key={index} className="col-xs-12 col-sm-6 col-md-4">
                                                <div className="activity-item-audio">
                                                    <FeedbackImage url={'pdf'} handle={_this.props.handle} onPreviewImage={(url) => _this.props.onPreviewImage(url)}/>
                                                </div>
                                            </div>
                                        )
                                    }
                                    else{
                                        return(
                                            <div key={index} className="col-xs-12 col-sm-6 col-md-4">
                                                <div className="activity-item-video">
                                                    <FirebaseMedia type="video" url={annotation.url} handle={_this.props.handle} />
                                                </div>
                                            </div>
                                        )
                                    }
                                }
                            })
	                    }
						</div>
	                    {
                        
	                        this.state.annotation.map(function(annotation, index){
	                            if(annotation.type === 'text'){
	                                return(
	                                    <p className="quote" key={index}>
	                                        {annotation.text}
	                                    </p>
	                                )
	                            }
	                        })
	                    }
	                </li>
            </ul>
		</li>
        );        
    }
}