import React, {Component} from 'react';
import {Table} from 'reactstrap'
import Spotify from 'spotify-web-api-js'
import '../styles/User.css'


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
            songsLoaded: false
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
        
            const matches = this.state.matchList;
            const matchList = Object.keys(matches).map(match=>{
                return(
                    <tr>
                        <td>
                            {matches[match].spotify_id}
                        </td>
                        <td>
                            {matches[match].match_value}
                        </td>
                    </tr>
                )
            })

            
            // const artists = this.state.topArtists;
            // const artistList = Object.keys(artists).map(artist=>{
            //     return(
            //         <tr>
            //             <td>
            //                 {artists[artist].name}
            //             </td>
            //         </tr>
            //     )
                
            // })

        


        return(
            <div>
                
                
                {this.renderUserInfo()}

                <div className="tables-container">
                    <Table striped id="songTable">
                        <thead>
                            <tr>
                                <td className="table-head">Matches</td>
                            </tr>
                        </thead>
                        <tbody>
                            {matchList}
                        </tbody>
                    </Table>
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