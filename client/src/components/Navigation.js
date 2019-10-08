import React, {Component} from 'react';
import Spotify from 'spotify-web-api-js'
import '../styles/Navigation.css'
import {
    Collapse,
    Navbar,
    NavbarToggler,
    NavbarBrand,
    Nav,
    NavItem,
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
                    <NavbarBrand href="/" className="navbar-header">Spotter</NavbarBrand>
                    <a href="http://localhost:8888">
                        <Button className="login-button">Login</Button>
                    </a>
                </Navbar>
            </div>
        )
    }
}

export default Navigation;