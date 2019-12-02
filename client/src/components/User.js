import React, {Component} from 'react';
import {Table,Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,Button,
    Input,
    Form,
    InputGroup,
    InputGroupText,
    InputGroupAddon,
    TabContent, TabPane   ,
    Container,Row,Col,
    Card,CardTitle,
    CardBody,CardText
} from 'reactstrap'
import Spotify from 'spotify-web-api-js'
import '../styles/User.css'
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link,
  } from "react-router-dom";

  import instagram from '../instagram-logo.png';
  import twitter from '../twitter-logo.png';

  const axios = require('axios');


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
            playlists:'',
            savedTracks:'',
            savedAlbums:'',
            artistLoaded:true,
            songsLoaded: false,
            modal: false,
            modalIsOpen: false,
            instagramUser: '',
            twitterUser: ''
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
         
        instance.post('https://spotter-flask.herokuapp.com/users/profile', {
            access_token: this.state.access_token,
        })
        .then((res)=>{
            this.setState({
                instagramUser:res.data.inst_profile,
                twitterUser:res.data.tw_profile
            })
            console.log(res.data);
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

        //this.loadTable();
        spotifyWebApi.getMyTopTracks().then((res) => {
            this.setState({topTracks:res.items})
            //console.log(this.state.topTracks)
        })

        spotifyWebApi.getMyTopArtists().then((res) => {
            this.setState({topArtists:res.items})
        })

        spotifyWebApi.getUserPlaylists().then((res)=>{
            this.setState({playlists:res.items})
        })

        spotifyWebApi.getMySavedTracks().then((res)=>{
            console.log(res)
            this.setState({savedTracks:res.items})
        })

        spotifyWebApi.getMySavedAlbums().then((res)=>{
            console.log(res)
            this.setState({savedAlbums:res.items})
        })

    }

    toggleModal(){
        this.setState({
            modalIsOpen: !this.state.modalIsOpen
        })
    }

    updateUserInformation = (event) =>{
        event.preventDefault();
        axios.put('https://spotter-flask.herokuapp.com/users/profile', {
            access_token: sessionStorage.getItem("access_token"),
            tw_profile: this.state.twitterUser,
            inst_profile: this.state.instagramUser
          })
          .then(function (response) {
            console.log(response);
            window.location.reload();
          })
          .catch(function (error) {
            console.log(error);
          });

    }

    onInputChange = (event) => {
        event.preventDefault();
        console.log(event.target.name);
        console.log(event.target.value);
        this.setState({
            [event.target.name]: event.target.value
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
                            <div className="social-media">
                                <img className="logo" src={instagram}></img>
                                <p>{this.state.instagramUser}</p>
                                <img className="logo" src={twitter} />
                                <p>{this.state.twitterUser}</p>
                            </div>
                            <Button color="danger" onClick={this.toggleModal.bind(this)}>Update User Info</Button>
                            
                            <Modal isOpen={this.state.modalIsOpen} toggle={this.toggleModal.bind(this)} className="user-modal">
                                <ModalHeader toggle={this.toggleModal.bind(this)}>Edit User Information</ModalHeader>
                                <ModalBody>
                                <Form onSubmit={this.updateUserInformation}>
                                    <InputGroup>
                                        <InputGroupAddon addonType="prepend">
                                        <InputGroupText>Display Name</InputGroupText>
                                        </InputGroupAddon>
                                        <Input name="displayName" placeholder={this.state.displayName} onChange={this.onInputChange}/>
                                    </InputGroup>
                                    <br/>
                                    <InputGroup>
                                        <InputGroupAddon addonType="prepend">
                                        <InputGroupText>Instagram Username</InputGroupText>
                                        </InputGroupAddon>
                                        <Input name="instagramUser" placeholder={this.state.instagramUser} onChange={this.onInputChange}/>
                                    </InputGroup>
                                    <br/>
                                    <InputGroup>
                                        <InputGroupAddon addonType="prepend">
                                        <InputGroupText>Twitter Username</InputGroupText>
                                        </InputGroupAddon>
                                        <Input name="twitterUser" placeholder={this.state.twitterUser} onChange={this.onInputChange}/>
                                    </InputGroup>
                                </Form>

                                </ModalBody>
                                <ModalFooter>
                                    <Button color="primary" onClick={this.updateUserInformation.bind(this)}>Update Information</Button>{' '}
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
        if(this.state.topArtists === '' || this.state.topTracks === '' || this.state.playlists){
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
                    <CardText>
                        {songs[song].name}
                    </CardText>
                )
            })

            const playlists = this.state.playlists;
            const playlistsList = Object.keys(playlists).map(playlist=>{
                return(
                    <CardText>
                        {playlists[playlist].name}
                    </CardText>
                )
            })

            const savedTracks = this.state.savedTracks;
            const savedTracksList = Object.keys(savedTracks).map(track=>{
                return(
                    <CardText>
                        {savedTracks[track].track.name}
                    </CardText>
                )
            })

            const savedAlbums = this.state.savedAlbums;
            const savedAlbumsList = Object.keys(savedAlbums).map(album=>{
                return(
                    <CardText>
                        {savedAlbums[album].album.name}
                    </CardText>
                )
            })

            
            const artists = this.state.topArtists;
            const artistList = Object.keys(artists).map(artist=>{
                return(
                    <CardText>
                        {artists[artist].name}
                    </CardText>
                )
                
            })

        


        return(
            <div className="main-container">
                
                
                {this.renderUserInfo()}

                <Container>
                    <Row>
                        <Col>
                            <Card>
                                <CardBody>
                                <CardTitle>My Playlists</CardTitle>
                                {playlistsList}
                                </CardBody>
                            </Card>
                        </Col>
                        <Col>
                            <Card>
                                <CardBody>
                                <CardTitle>My Songs</CardTitle>
                                {savedTracksList}
                                </CardBody>
                            </Card>
                        </Col>
                        <Col>
                            <Card>
                                <CardBody>
                                <CardTitle>My Albums</CardTitle>
                                {savedAlbumsList}
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Card>
                                    <CardBody>
                                    <CardTitle>My Top Tracks</CardTitle>
                                    {songsList}
                                    </CardBody>
                            </Card>
                        </Col>
                        <Col>
                            <Card>
                                    <CardBody>
                                    <CardTitle>My Top Artists</CardTitle>
                                    {artistList}
                                    </CardBody>
                            </Card>
                        </Col>
                    </Row>
                </Container>
                {/* <div className="tables-container">
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
                </div> */}
            </div>
        )
    }
}

export default User;