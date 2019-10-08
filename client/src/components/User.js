import React, {Component} from 'react';
import {Table} from 'reactstrap'
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
            userEmail:'',
            userImage:'',
            nowPlaying:{
                name: '',
                image: ''
            },
            topTracks:'',
            topArtists:'',
            artistLoaded:true,
            songsLoaded: false
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

        spotifyWebApi.getMyCurrentPlaybackState().then((res)=>{
            this.setState({
                nowPlaying:{
                    name: res.item.name,
                    image: res.item.album.images[0].url
                }
            })
            console.log(res);
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
            <div>
                <div className="user-info">
                    <img className="user-image" src={this.state.userImage}/>
                    <div className="user-name-container">
                        <p className="user-displayName">{this.state.displayName}</p>
                        <p className="user-email">{this.state.userEmail}</p>
                    </div>
                    

                </div>
                
                <img className="song-thumbnail" src={this.state.nowPlaying.image}/>
                <p>Now Listening to: {this.state.nowPlaying.name}</p>

                <div className="tables-container">
                    <Table striped id="songTable">
                        <thead>
                            <tr>
                                <td className="table-head">Top Songs</td>
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