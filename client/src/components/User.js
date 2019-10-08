import React, {Component} from 'react';
import {} from 'reactstrap'
import Spotify from 'spotify-web-api-js'
import '../styles/User.css'

const spotifyWebApi = new Spotify();


class User extends Component{
    constructor(){
        super();
        this.state = {
            access_token: sessionStorage.getItem('access_token') ? sessionStorage.getItem('access_token') : '',
            refresh_token: sessionStorage.getItem('refresh_token') ? sessionStorage.getItem('refresh_token') : '',
            displayName:'',
            userImage:'',
            nowPlaying:{
                name: '',
                image: ''
            }
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
                userImage: res.images[0].url
            })

        })

        spotifyWebApi.getMyCurrentPlaybackState().then((res)=>{
            this.setState({
                nowPlaying:{
                    name: res.item.name,
                    image: res.item.album.images[0].url
                }
            })
            console.log(res);
        })

    }

    render(){
        return(
            <div>
                <img className="user-image" src={this.state.userImage}/>
                <p>{this.state.displayName}</p>
                <img className="user-image" src={this.state.nowPlaying.image}/>
                <p>Now Listening to: {this.state.nowPlaying.name}</p>
            </div>
        )
    }
}

export default User;