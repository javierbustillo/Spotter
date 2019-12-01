import React, {Component} from 'react';
import {Table, Media,Modal,
    ModalBody,
    ModalFooter,
    ModalHeader,Button,
    Input,
    Form,
    InputGroup,
    InputGroupText,
    InputGroupAddon,} from 'reactstrap'
import Spotify from 'spotify-web-api-js'
import '../styles/Match.css'
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link,
    
  } from "react-router-dom";

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
            selectedMatch:''
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

        //post to /users/match => access_token

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
        // spotifyWebApi.getMyTopTracks().then((res) => {
        //     this.setState({topTracks:res.items})
        //     //console.log(this.state.topTracks)
        // })

        // spotifyWebApi.getMyTopArtists().then((res) => {
        //     this.setState({topArtists:res.items})
        // })


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
        console.log(this.state.selectedMatch)
        this.setState({
            modalIsOpen: !this.state.modalIsOpen,
            selectedMatch: e.currentTarget.id
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

    render(){
        
            const matches = this.state.matchList;
            const matchList = Object.keys(matches).map(match=>{
                return(
                    // <Media>
                    //     {/* User Image */}
                    //     <Media left href="#">
                    //         <Media object data-src="holder.js/64x64" alt="Generic placeholder image" />
                    //     </Media>
                    //     {/* Display Name y other info */}
                    //     <Media body>
                    //         <Media heading>
                    //         Media heading
                    //         </Media>
                    //         Cras sit amet nibh libero, in gravida nulla. Nulla vel metus scelerisque ante sollicitudin commodo. Cras purus odio, vestibulum in vulputate at, tempus viverra turpis. Fusce condimentum nunc ac nisi vulputate fringilla. Donec lacinia congue felis in faucibus.
                    //     </Media>
                    // </Media>
                    <tr>
                        <td>
                            <p className="match-display-name">{matches[match].display_name}</p>
                        </td>
                        <td>
                            <p className="match-value">{matches[match].match_value.toFixed(2)}</p>
                        </td>
                    </tr>
                )
            })


        return(
            <div className="main-container">
                {this.renderUserInfo()}

                <p className="table-header">Match Results</p>
                <div className="match-cards-container">
                    <Media id="1" onClick={this.toggleModal.bind(this)} className="match-card">
                         {/* User Image */}
                         <Media className="match-image" left href="#">
                            <img className="match-image"src={this.state.userImage}/>
                         </Media>
                         {/* Display Name y other info */}
                         <Media className="match-name">
                             John Smith
                         </Media>
                         <Media className="match-percent">
                             <CircularProgressbar  
                             styles={buildStyles({
                                pathColor: '#1DB954',
                                textColor:'#1DB954',
                                textSize: '30px',

                            })}
                                 value="90" text="90" />
                         </Media>
                     </Media>
                     <Media id="2" onClick={this.toggleModal.bind(this)} className="match-card">
                         {/* User Image */}
                         <Media className="match-image" left href="#">
                            <img className="match-image"src={this.state.userImage}/>
                         </Media>
                         {/* Display Name y other info */}
                         <Media className="match-name">
                             John Smith
                         </Media>
                         <Media className="match-percent">
                             <CircularProgressbar  
                             styles={buildStyles({
                                pathColor: '#1DB954',
                                textColor:'#1DB954',
                                textSize: '30px',

                            })}
                                 value="85" text="85" />
                         </Media>
                     </Media>
                     <Media className="match-card">
                         {/* User Image */}
                         <Media className="match-image" left href="#">
                            <img className="match-image"src={this.state.userImage}/>
                         </Media>
                         {/* Display Name y other info */}
                         <Media className="match-name">
                             John Smith
                         </Media>
                         <Media className="match-percent">
                             <CircularProgressbar  
                             styles={buildStyles({
                                pathColor: '#1DB954',
                                textColor:'#1DB954',
                                textSize: '30px',

                            })}
                                 value="80" text="80" />
                         </Media>
                     </Media>
                     <Media className="match-card">
                         {/* User Image */}
                         <Media className="match-image" left href="#">
                            <img className="match-image"src={this.state.userImage}/>
                         </Media>
                         {/* Display Name y other info */}
                         <Media className="match-name">
                             John Smith
                         </Media>
                         <Media className="match-percent">
                             <CircularProgressbar  
                             styles={buildStyles({
                                pathColor: '#1DB954',
                                textColor:'#1DB954',
                                textSize: '30px',

                            })}
                                 value="50" text="50" />
                         </Media>
                     </Media>



                            <Modal isOpen={this.state.modalIsOpen} toggle={this.toggleModal.bind(this)} className="user-modal">
                                <ModalHeader toggle={this.toggleModal.bind(this)}>Matched Users Information</ModalHeader>
                                <ModalBody>
                                    <div className="match-modal-top">
                                        <img className="match-image"src={this.state.userImage}/>
                                        <p>DISPLAY NAME</p>
                                    </div>
                                </ModalBody>
                                <ModalFooter>
                                    <Button color="secondary" onClick={this.toggleModal.bind(this)}>Close</Button>
                                </ModalFooter>
                            </Modal>
                            {matchList}

                    {this.showLoading()}

                    {/* <Table striped id="artistTable">
                        <thead>
                            <tr>
                                <td className="table-head">Top Artists</td>
                            </tr>
                        </thead>
                        <tbody>
                            {artistList}
                        </tbody>
                    </Table> */}
                </div>
            </div>
        )
    }
}

export default Match;