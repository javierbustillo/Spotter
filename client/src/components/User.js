import React, {Component} from 'react';
import {Table,Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,Button} from 'reactstrap'
import Spotify from 'spotify-web-api-js'
import '../styles/User.css'
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link,
  } from "react-router-dom";


const spotifyWebApi = new Spotify();


class User extends Component{
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
            topTracks:'',
            topArtists:'',
            artistLoaded:true,
            songsLoaded: false,
            modal: false,
            modalIsOpen: false
        }

        if(sessionStorage.getItem('access_token') !== null){
            spotifyWebApi.setAccessToken(this.state.access_token);
        }
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

        // spotifyWebApi.getMyCurrentPlaybackState().then((res)=>{
        //     this.setState({
        //         nowPlaying:{
        //             name: res.item.name,
        //             image: res.item.album.images[0].url
        //         }
        //     })
        //     console.log(res);
        // })

        //this.loadTable();
        spotifyWebApi.getMyTopTracks().then((res) => {
            this.setState({topTracks:res.items})
            //console.log(this.state.topTracks)
        })

        spotifyWebApi.getMyTopArtists().then((res) => {
            this.setState({topArtists:res.items})
        })


    }

    toggleModal(){
        this.setState({
            modalIsOpen: !this.state.modalIsOpen
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
                            <Button color="danger" onClick={this.toggleModal.bind(this)}>Update User Info</Button>
                            
                            <Modal isOpen={this.state.modalIsOpen} toggle={this.toggleModal.bind(this)} className="user-modal">
                                <ModalHeader toggle={this.toggleModal.bind(this)}>Modal title</ModalHeader>
                                <ModalBody>
                                Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                                </ModalBody>
                                <ModalFooter>
                                <Button color="primary" onClick={this.toggleModal.bind(this)}>Do Something</Button>{' '}
                                <Button color="secondary" onClick={this.toggleModal.bind(this)}>Cancel</Button>
                                </ModalFooter>
                            </Modal>
                        </div>
                        
                        

                    </div>
                    <div className="match-container">
                        <Link className="match-button" to="/match">Calculate your Matches</Link>
                    </div>
                    {/* <div className="recently-played">
                        <img className="song-thumbnail" src={this.state.nowPlaying.image}/>
                        <p className="song-name">Now Listening to: {this.state.nowPlaying.name}</p>
                    </div> */}
                </div>
            )
        }
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

    render(){
        
            const songs = this.state.topTracks;
            const songsList = Object.keys(songs).map(song=>{
                return(
                    <tr>
                        <td>
                            {songs[song].name}
                        </td>
                    </tr>
                )
            })

            
            const artists = this.state.topArtists;
            const artistList = Object.keys(artists).map(artist=>{
                return(
                    <tr>
                        <td>
                            {artists[artist].name}
                        </td>
                    </tr>
                )
                
            })

        


        return(
            <div class="main-container">
                
                
                {this.renderUserInfo()}

                <div className="tables-container">
                    <Table striped id="songTable">
                        <thead>
                            <tr>
                                <td className="table-head">Top Tracks</td>
                            </tr>
                        </thead>
                        <tbody>
                            {songsList}
                        </tbody>
                    </Table>
                    <Table striped id="artistTable">
                        <thead>
                            <tr>
                                <td className="table-head">Top Artists</td>
                            </tr>
                        </thead>
                        <tbody>
                            {artistList}
                        </tbody>
                    </Table>
                </div>
            </div>
        )
    }
}

export default User;