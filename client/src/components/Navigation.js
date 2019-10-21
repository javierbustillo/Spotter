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

    

    render(){
        return(
            <div className="navbar-container">
                <Navbar className="navbar-header">
                    <NavLink href="/" className="navbar-text">Spotter</NavLink>
                    <a href="http://localhost:8888">
                        <Button className="login-button" color="primary">Login</Button>
                    </a>                
                </Navbar>
            </div>
        )
    }
}

export default Navigation;