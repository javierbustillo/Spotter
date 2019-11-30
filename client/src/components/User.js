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
    TabContent, TabPane    
} from 'reactstrap'
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
            modalIsOpen: false,
            instagramUser: '',
            twitterUser: ''
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

    updateUserInformation = (event) =>{
        event.preventDefault();
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