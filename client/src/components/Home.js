import React, {Component} from 'react';
import Spotify from 'spotify-web-api-js'
import '../styles/Home.css'
import {
    Navbar,
    NavLink,
    Button
     } from 'reactstrap';
const spotifyWebApi = new Spotify();

class Home extends Component{
    
    constructor(){
        super();
        this.state = {
            loggedIn: sessionStorage.getItem('access_token') !== null ? true : false,
        }
    }

    

    render(){
        return(
            <div className="home">
                <div className="home-division">
                    <p className="home-text">TEST</p>
                </div>
            </div>
        )
    }
}

export default Home;