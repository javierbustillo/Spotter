import React, {Component} from 'react';
import logo from './logo.svg';
import './App.css';
import Spotify from 'spotify-web-api-js'
import Navigation from './components/Navigation'
import User from './components/User'
import Match from './components/Match'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

const spotifyWebApi = new Spotify();
const axios = require('axios');

class App extends Component {

  constructor(){
    super();
    const instance = axios.create({
      timeout: 36000,
      headers: {
        'Content-Type': 'application/json',
      }
    });
    const params = this.getHashParams();
    this.state = {
      loggedIn: params.access_token ? true : false,
      access_token: params.access_token ? params.access_token : '',
      refresh_token: params.refresh_token ? params.refresh_token : ''
    }

    if(params.access_token){
      sessionStorage.setItem('access_token', params.access_token);
      sessionStorage.setItem('refresh_token', params.refresh_token);
      spotifyWebApi.setAccessToken(params.access_token);

      instance.post('https://spotter-flask.herokuapp.com/register', {
        access_token: this.state.access_token,
        refresh_token: this.state.refresh_token
      })
      .then(function (response) {
        console.log("Success: " + response.status);
      })
      .catch((error)=>  {

        console.log("Error: " + error);
      });
    }
  }
  

  getUserInfo(){
    if(this.state.access_token !== ''){
      spotifyWebApi.getUserPlaylists().then((res)=>{
        console.log(res);
      })
    }
  }

  
  getHashParams() {
    var hashParams = {};
    var e, r = /([^&;=]+)=?([^&;]*)/g,
        q = window.location.hash.substring(1);
    while ( e = r.exec(q)) {
       hashParams[e[1]] = decodeURIComponent(e[2]);
    }
    return hashParams;
  }

  render(){
    

    return (
      <div className="App">
      <Navigation/>

      <Router>
      <div>
        <nav>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/match">About</Link>
            </li>
            <li>
              <Link to="/user">Users</Link>
            </li>
          </ul>
        </nav>

        {/* A <Switch> looks through its children <Route>s and
            renders the first one that matches the current URL. */}
        <Switch>
          <Route path="/user">
            <User />
          </Route>
          <Route path="/match">
            <Match />
          </Route>
        </Switch>
      </div>
    </Router>
      </div>
    );
  }
  
}

export default App;
