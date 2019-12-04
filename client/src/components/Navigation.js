import React, {Component} from 'react';
import Spotify from 'spotify-web-api-js'
import '../styles/Navigation.css'
import {
    Navbar,
    NavLink,
    Button
     } from 'reactstrap';
const spotifyWebApi = new Spotify();

class Navigation extends Component{
    
    constructor(){
        super();
        this.state = {
            loggedIn: sessionStorage.getItem('access_token') !== null ? true : false,
        }
    }

    loginButton(){

        var url = "https://accounts.spotify.com/authorize?client_id=814daec5d00647a6951025d3ba7abc3a&redirect_uri=http:%2F%2Flocalhost:3000%2Fuser&scope=user-read-private%20user-read-email%20user-top-read%20user-read-playback-state%20user-follow-modify%20user-library-read%20user-library-modify&response_type=token&state=123"
        return(
            <a href={url}> 
                        <Button className="login-button" color="primary">Login</Button>
            </a>
        )
    }

    

    render(){
        return(
            <div className="navbar-container">
                <Navbar className="navbar-header">
                    <NavLink href="/" className="navbar-text">Spotter</NavLink>
                    {/* <a href="http://localhost:8888">
                        <Button className="login-button" color="primary">Login</Button>
                    </a>                 */}
                    {this.loginButton()}
                </Navbar>
            </div>
        )
    }
}

export default Navigation;