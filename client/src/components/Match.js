import React, {Component} from 'react';
import {Table, Media,Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,Button,
    Card,CardText,CardTitle} from 'reactstrap'
import Spotify from 'spotify-web-api-js'
import '../styles/Match.css'
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link,
    NavLink
    
  } from "react-router-dom";
  import instagram from '../instagram-logo.png';
  import twitter from '../twitter-logo.png';

  import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';


const spotifyWebApi = new Spotify();
const axios = require('axios');



class Match extends Component{
    constructor(){
        super();
        this.state = {
            access_token: sessionStorage.getItem('access_token') ? sessionStorage.getItem('access_token') : null,
            refresh_token: sessionStorage.getItem('refresh_token') ? sessionStorage.getItem('refresh_token') : null,
            displayName:'',
            userEmail:'',
            userImage:'',
            nowPlaying:{
                name: '',
                image: ''
            },
            matchList:'',
            artistLoaded:true,
            songsLoaded: false,
            isLoading:true,
            modal: false,
            modalIsOpen: false,
            selectedMatch:'',
            selectedUserName:'',
            selectedUserImage:'',
            selectedUserFollowers:'',
            selectedUserPlaylists:'',
            selectedUserInstagram:'',
            selectedUserTwitter:'',
            selectedUserUrl:'',
            overlapArtists:'',
            overlapTracks:'',
            track:'',
            artist:''
        }

        if(sessionStorage.getItem('access_token') !== null){
            spotifyWebApi.setAccessToken(this.state.access_token);
        }

        const instance = axios.create({
            timeout: 36000,
            headers: {
              'Content-Type': 'application/json',
            }
          });
         
        instance.post('https://spotter-flask.herokuapp.com/users/match', {
            access_token: this.state.access_token,
        })
        .then((res)=>{
            console.log(res.data);
            this.setState({
                matchList: res.data
            })
        })
        .catch((error)=>  {
            console.log("Error: " + error);
        });
    }

    componentWillMount(){
        spotifyWebApi.getMe().then((res)=>{
            console.log(res);
            this.setState({
                displayName: res.display_name,
                userImage: res.images[0].url,
                userEmail: res.email
            })

        })

        


    }

    renderUserInfo(){
        if(this.state.displayName == ''){
            return(
                <div>
                    <p className="empty-info-text">Login to View your Information</p>
                </div>
            )
        }else{
            return(
                <div className="user-container">
                    <div className="user-info">
                        <img className="user-image" src={this.state.userImage}/>
                        <div className="user-name-container">
                            <p className="user-displayName">{this.state.displayName}</p>
                            <p className="user-email">{this.state.userEmail}</p>
                        </div>
                        

                    </div>
                    <div className="match-container">
                        <Link className="match-button" to="/user">View Profile</Link>
                    </div>
                    
                </div>
            )
        }
    }

    toggleModal(e){
        var overlap_artists = ''
        var overlap_tracks = ''
        if(!this.state.modalIsOpen){
            overlap_artists = e.currentTarget.getAttribute('overlap_artists').split(',')
            overlap_tracks = e.currentTarget.getAttribute('overlap_tracks').split(',')
        }
        
        this.setState({
            modalIsOpen: !this.state.modalIsOpen,
            selectedMatch: e.currentTarget.id,
            selectedUserInstagram: e.currentTarget.getAttribute('instagram'),
            selectedUserTwitter: e.currentTarget.getAttribute('twitter'),
            overlapArtists: overlap_artists,
            overlapTracks: overlap_tracks

        },()=>{
            var url = "https://api.spotify.com/v1/users/" + this.state.selectedMatch
            axios.get(url, {
                headers:{
                    "Authorization": "Bearer " + sessionStorage.getItem("access_token")
                }
            }).then((res)=>{
                    console.log(res)
                    this.setState({
                        selectedUserUrl: res.data.external_urls.spotify,
                        selectedUserName:res.data.display_name,
                        selectedUserImage:res.data.images[0].url,
                        selectedUserFollowers:res.data.followers.total
                    })
                    console.log(this.state.selectedMatch)
                })
                .catch((error)=>  {
                    console.log("Error: " + error);
                });
                
                const overlapArtists = this.state.overlapArtists;
                var artistNameArray = [];
                Object.keys(overlapArtists).map(artist=>{
                    
                    spotifyWebApi.getArtist(overlapArtists[artist]).then((res)=>{
                        artistNameArray.push(res.name)
                    })
                })
                this.setState({overlapArtists: artistNameArray})

                const overlapTracks = this.state.overlapTracks;
                var tracksNameArray = [];
                Object.keys(overlapTracks).map(track=>{
                    spotifyWebApi.getTrack(overlapTracks[track]).then((res)=>{
                        tracksNameArray.push(res.name)
                    })
                })
                console.log(tracksNameArray)
                this.setState({overlapTracks: tracksNameArray})
        })
            
        }

    renderTables(){
        if(this.state.topArtists === '' || this.state.topTracks === ''){
            return(
                <div>
                    <p className="empty-info-text">Login to View your Information</p>
                </div>
            )
        }else{
            
        }
    }

    showLoading(){
        if(this.state.matchList === ''){
            return(
                <div>
                    <p className="loading-message">Calculating your matches...</p>
                </div>
            )
        }
    }

    loadMatchSocialMedia(){
        var instagram_link = <p>No Account Available</p>
        var twitter_link = <p>No Account Available</p>
        if(this.state.selectedUserInstagram){
            var url = "https://www.instagram.com/" + this.state.selectedUserInstagram
            instagram_link = <a href={url} target="_blank">{this.state.selectedUserInstagram}</a>
        }
        if(this.state.selectedUserInstagram){
            var url = "https://www.twitter.com/" + this.state.selectedUserTwitter
            twitter_link = <a href={url} target="_blank">{this.state.selectedUserTwitter}</a>
        }

        return(
            <div className="social-media">
                <img className="logo" src={instagram}></img>
                {instagram_link}
                <img className="logo" src={twitter} />
                {twitter_link}
            </div>
        )
        
    }

    render(){
            var percent;
            const matches = this.state.matchList;
            const matchList = Object.keys(matches).map(match=>{
                percent = matches[match].match_value.toFixed(2)
                
                return(
                    <Media id={matches[match].spotify_id} overlap_artists={matches[match].overlap_artists} overlap_tracks={matches[match].overlap_tracks}instagram={matches[match].inst_profile} twitter={matches[match].tw_profile} onClick={this.toggleModal.bind(this)} className="match-card">
                         {/* User Image */}
                         <Media className="match-image" left href="#">
                            <img className="match-image"src={matches[match].profile_picture[0].url}/>
                         </Media>
                         {/* Display Name y other info */}
                         <Media className="match-name">
                             {matches[match].display_name}
                         </Media>
                         <Media className="match-percent">
                             <CircularProgressbar  
                             styles={buildStyles({
                                pathColor: '#1DB954',
                                textColor:'#1DB954',
                                textSize: '30px',

                            })}
                                 value={percent} text={percent} />
                         </Media>
                     </Media>
                    
                )
            })

            const playlists = this.state.selectedUserPlaylists;
            const playlistsList = Object.keys(playlists).map(playlist=>{
                if(playlist % 2 === 0){
                    return(
                        <a href={playlists[playlist].external_urls.spotify} target="_blank" className="card-text-even">
                            {playlists[playlist].name}
                        </a>
                    )
                }else{
                    return(
                        <a href={playlists[playlist].external_urls.spotify} target="_blank" className="card-text-odd">
                            {playlists[playlist].name}
                        </a>
                    )
                }
                
            })

            const overlapArtists = this.state.overlapArtists;
            const overlapArtistsList = Object.keys(overlapArtists).map(artist=>{
                if(artist % 2 === 0){
                    return(<p className="card-text-even">{overlapArtists[artist]}</p>)
                }else{
                    return(<p className="card-text-odd">{overlapArtists[artist]}</p>)

                }
            })

            const overlapTracks = this.state.overlapTracks;
            const overlapTracksList = Object.keys(overlapTracks).map(track=>{
                if(track % 2 === 0){
                    return(<p className="card-text-even">{overlapTracks[track]}</p>)
                }else{
                    return(<p className="card-text-odd">{overlapTracks[track]}</p>)

                }
            })

            


        return(
            <div className="main-container">
                {this.renderUserInfo()}

                <p className="table-header">Match Results</p>
                <div className="match-cards-container">


                            <Modal isOpen={this.state.modalIsOpen} toggle={this.toggleModal.bind(this)} className="user-modal">
                                <ModalHeader toggle={this.toggleModal.bind(this)}>Matched Users Information</ModalHeader>
                                <ModalBody>
                                    <div className="match-modal-top">
                                        <img className="match-image"src={this.state.selectedUserImage}/>
                                        <div className="match-modal-top-left">
                                            <p className="match-username">{this.state.selectedUserName}</p>
                                            <p className="match-followers">Followers: {this.state.selectedUserFollowers}</p>
                                            <a href={this.state.selectedUserUrl} target="_blank">
                                            <Button color="success" className="follow-button">Follow</Button>

                                            </a>
                                        </div>
                                        <div className="match-modal-top-right">
                                            <div className="match-modal-value">
                                                <CircularProgressbar  
                                                styles={buildStyles({
                                                    pathColor: '#1DB954',
                                                    textColor:'#1DB954',
                                                    textSize: '30px',

                                                })}
                                                    value={percent} text={percent} />
                                            </div>
                                            
                                        </div>
                                        
                                    </div>
                                    
                                    <p className="social-media-title">Follow Them On Social Media:</p>
                                    {this.loadMatchSocialMedia()}

                                    <Card className="match-music-card">
                                        <CardTitle className="match-card-title">Artists In Common</CardTitle>
                                        {overlapArtistsList}
                                    </Card>
                                    <br/>
                                    <Card className="match-music-card">
                                        <CardTitle className="match-card-title">Tracks In Common</CardTitle>
                                        {overlapTracksList}
                                    </Card>
                                </ModalBody>
                                <ModalFooter>
                                    <a href={this.state.selectedUserUrl} target="_blank">
                                        <Button color="success" className="follow-button">Follow</Button>
                                    </a>                                    
                                    <Button color="secondary" onClick={this.toggleModal.bind(this)}>Close</Button>
                                </ModalFooter>
                            </Modal>
                            {matchList}

                    {this.showLoading()}

                    
                </div>
            </div>
        )
    }
}

export default Match;