const express = require("express");
const app = express();
const cors = require("cors");
const axios = require('axios').default;
const jwt = require('njwt');
const path = require('path');
const fs = require('fs');

require('dotenv').config();

//middlewares
app.use(cors());

//loading the key file 
let key = fs.readFileSync(path.resolve("key.key"));

//defining the claims object
const claims = {
    iss: process.env.CONSUMER_KEY,   
    sub: process.env.SFDC_USERNAME,     
    aud: process.env.SFDC_LOGIN_URL,
    exp : (Math.floor(Date.now() / 1000) + (60*3))
}

//function to create the JWT
const createJWT = (claims, key ) =>{
    let jwtToken = jwt.create(claims, key, 'RS256');
    let jwtTokenB64 = jwtToken.compact();
    return jwtTokenB64;
}

//function to request the access token
const requestSFToken = async(claims, key) =>{
    let token = createJWT(claims, key);
    let paramBody = 'grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion='+token;
    try{
        let SfResponse = await axios({
            url: SFDC_URL,
            method: 'POST',
            headers: { 'Content-Type' : 'application/x-www-form-urlencoded'},
            data: paramBody
        });
        return SfResponse.data.access_token;
    }catch(err){
        console.error(err);
    }
    
}

//fuction to get salesforce data
const getSFData = async(accessToken, url) =>{
    try{
        let response = await axios({
            method: 'GET',
            url,
            headers: {'Authorization': 'Bearer '+ accessToken}
        })
        return response.data;
    }catch(err){
        console.error(err); 
    }   
}


//server
app.listen(process.env.PORT || 3000, ()=>{
    console.log('Server up and running')
})