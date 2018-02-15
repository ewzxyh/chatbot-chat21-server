/**
 * Copyright 2017 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const functions = require('firebase-functions');
const admin = require('firebase-admin');
// const Language = require('@google-cloud/language');
const chatApi = require('./chat-api');
const express = require('express');
const cors = require('cors')({origin: true});

const app = express();
// const language = new Language({projectId: process.env.GCLOUD_PROJECT});

// admin.initializeApp(functions.config().firebase);







/* AUTH REST

 * https://firebase.google.com/docs/reference/rest/auth/#section-sign-in-email-password
 * 
curl 'https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyPassword?key=<API_KEY>' \
-H 'Content-Type: application/json' \
--data-binary '{"email":"<USER_EMAIL>","password":"<USER_PASSWORD>","returnSecureToken":true}'
 
Example:

curl 'https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyPassword?key=[REDACTED_GOOGLE_KEY]' \
 -H 'Content-Type: application/json' \
 -d '{"email":"redacted@example.invalid","password":"123456","returnSecureToken":true}'

*/




// Express middleware that validates Firebase ID Tokens passed in the Authorization HTTP header.
// The Firebase ID token needs to be passed as a Bearer token in the Authorization HTTP header like this:
// `Authorization: Bearer <Firebase ID Token>`.
// when decoded successfully, the ID Token content will be added as `req.user`.
const authenticate = (req, res, next) => {
    console.log('authenticate');
  if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
    res.status(403).send('Unauthorized');
    return;
  }
  const idToken = req.headers.authorization.split('Bearer ')[1];
  console.log('idToken', idToken);

  admin.auth().verifyIdToken(idToken).then((decodedIdToken) => {
    req.user = decodedIdToken;
    console.log('req.user', req.user);

    return next();
  }).catch(() => {
    res.status(403).send('Unauthorized');
  });
};

app.use(authenticate);



/**
 * Send a message.
 * Example request using request body with cURL:
 *  curl -X POST \
      -H 'Content-Type: application/json' \
      -H "Authorization: Bearer <Firebase ID Token>" \
       -d '{"sender_fullname": "<FULLNAME>", "recipient_id": "<ID>", "recipient_fullname":"<FULLNAME>","text":"helo from API", "app_id":"<APP_ID>"}' \
      https://us-central1-<project-id>.cloudfunctions.net/api/messages

   curl -X POST \
       -H 'Content-Type: application/json' \
       -H 'Authorization: Bearer [REDACTED_JWT]' \
       -d '{"sender_fullname": "Andrea Leo", "recipient_id": "U4HL3GWjBsd8zLX4Vva0s7W2FN92", "recipient_fullname":"Andrea Leo","text":"helo from API", "app_id":"tilechat"}' \
       https://us-central1-chat-v2-dev.cloudfunctions.net/api/messages
 *
 * This endpoint supports CORS.
 */
// [START trigger]
app.post('/messages', (req, res) => {
  console.log('sendDirectMessage');

   
      if (req.method !== 'POST') {
        res.status(403).send('Forbidden!');
      }
      
      cors(req, res, () => {
        let sender_id = req.user.uid;

        if (!req.body.sender_fullname) {
            res.status(405).send('Sender Fullname is not present!');
        }
        if (!req.body.recipient_id) {
            res.status(405).send('Recipient id is not present!');
        }
        if (!req.body.recipient_fullname) {
            res.status(405).send('Recipient Fullname is not present!');
        }
        if (!req.body.text) {
            res.status(405).send('text  is not present!');
        }
        if (!req.body.app_id) {
            res.status(405).send('app_id is not present!');
        }

        let sender_fullname = req.body.sender_fullname;
        let recipient_id = req.body.recipient_id;
        let recipient_fullname = req.body.recipient_fullname;
        let text = req.body.text;
        let app_id = req.body.app_id;
        let channel_type = req.body.channel_type;


        console.log('sender_id', sender_id);
        console.log('sender_fullname', sender_fullname);
        console.log('recipient_id', recipient_id);
        console.log('recipient_fullname', recipient_fullname);
        console.log('text', text);
        console.log('app_id', app_id);
        console.log('channel_type', channel_type);


        if (channel_type==null || message.channel_type=="direct") {  //is a direct message
          var result =  chatApi.sendDirectMessage(sender_id, sender_fullname, recipient_id, recipient_fullname, text, app_id);
        }else if (channel_type=="group") {
          var result =  chatApi.sendGroupMessage(sender_id, sender_fullname, recipient_id, recipient_fullname, text, app_id);
        }else {
          res.status(405).send('channel_type error!');
        }

        console.log('result', result);

        res.status(200).send(result);
        // [END sendResponse]
      });
    });





    /**
 * Create a group
 * Example request using request body with cURL:
  
  curl -X POST \
      -H 'Content-Type: application/json' \
      -H "Authorization: Bearer <Firebase ID Token>" \
      -d '{"group_name": "group_name", "app_id":"<APP_ID>"}' \
      https://us-central1-<project-id>.cloudfunctions.net/api/groups

   curl -v -X POST \
       -H 'Content-Type: application/json' \
       -H 'Authorization: Bearer [REDACTED_JWT]' \
    -d '{"group_name": "TestGroup21", "group_members": {"y4QN01LIgGPGnoV6ql07hwPAQg23":1}, "app_id":"tilechat"}' https://us-central1-chat-v2-dev.cloudfunctions.net/api/groups
 *
 * This endpoint supports CORS.
 */
// [START trigger]
app.post('/groups', (req, res) => {
  console.log('create a group');

   
    if (req.method !== 'POST') {
      res.status(403).send('Forbidden!');
    }
      
      cors(req, res, () => {

        if (!req.body.group_name) {
            res.status(405).send('group_name is not present!');
        }
        // if (!req.body.group_members) {
        //     res.status(405).send('group_members is not present!');
        // }
        if (!req.body.app_id) {
            res.status(405).send('app_id is not present!');
        }

        let group_name = req.body.group_name;
        let group_owner = req.user.uid;

        let group_members = {};
        if (req.body.group_members) {
          group_members = req.body.group_members;
        }

        group_members[req.user.uid] = 1;

        let app_id = req.body.app_id;


        console.log('group_name', group_name);
        console.log('group_owner', group_owner);
        console.log('group_members', group_members);
        console.log('app_id', app_id);


        var result =  chatApi.createGroup(group_name, group_owner, group_members, app_id);
      
        console.log('result', result);

        res.status(200).send(result);
      });
    });










    /**
 * Join a group
 * Example request using request body with cURL:
    curl -X POST \
       -H 'Content-Type: application/json' \
       -H "Authorization: Bearer <Firebase ID Token>" \
       -d '{"member_id": "<member_id>", "app_id": "<app_id>"}' 
       https://us-central1-<project-id>.cloudfunctions.net/api/groups/<GROUP_ID>/members

    curl -X POST \
       -H 'Content-Type: application/json' \
       -H 'Authorization: Bearer [REDACTED_JWT]' \
        -d '{"member_id": "81gLZhYmpTZM0GGuUI9ovD7RaCZ2", "app_id": "tilechat"}' \
        https://us-central1-chat-v2-dev.cloudfunctions.net/api/groups/-L5KLYXVUzMWj4Lbtu7F/members

 *
 * This endpoint supports CORS.
 */
// [START trigger]
app.post('/groups/:group_id/members', (req, res) => {
  console.log('join group');

   
    if (req.method !== 'POST') {
      res.status(403).send('Forbidden!');
    }
      
      cors(req, res, () => {

        if (!req.body.member_id) {
            res.status(405).send('member_id is not present!');
        }
        if (!req.params.group_id) {
            res.status(405).send('group_id is not present!');
        }
        if (!req.body.app_id) {
            res.status(405).send('app_id is not present!');
        }

        let member_id = req.body.member_id;
        let group_id = req.params.group_id;
        let app_id = req.body.app_id;


        console.log('member_id', member_id);
        console.log('group_id', group_id);
        console.log('app_id', app_id);


        var result =  chatApi.joinGroup(member_id, group_id, app_id);
      
        console.log('result', result);

        res.status(200).send(result);
      });
    });









    /**
 * Leave a group
 * Example request using request body with cURL:
    curl  -X DELETE \
       -H 'Content-Type: application/json' \
       -H "Authorization: Bearer <Firebase ID Token>" \
       -d '{"app_id": "<app_id>"}' 
       https://us-central1-<project-id>.cloudfunctions.net/api/groups/<GROUP_ID>/members/<MEMBERID>

    curl -X DELETE \
      -H 'Content-Type: application/json' \
       -H 'Authorization: Bearer [REDACTED_JWT]' \
        -d '{"app_id": "tilechat"}' \
        https://us-central1-chat-v2-dev.cloudfunctions.net/api/groups/-L5KLYXVUzMWj4Lbtu7F/members/81gLZhYmpTZM0GGuUI9ovD7RaCZ2

 *
 * This endpoint supports CORS.
 */
// [START trigger]
app.delete('/groups/:group_id/members/:member_id', (req, res) => {
  console.log('leave group');

   
    if (req.method !== 'DELETE') {
      res.status(403).send('Forbidden!');
    }
      
      cors(req, res, () => {

        if (!req.params.member_id) {
            res.status(405).send('member_id is not present!');
        }
        if (!req.params.group_id) {
            res.status(405).send('group_id is not present!');
        }
        if (!req.body.app_id) {
            res.status(405).send('app_id is not present!');
        }

        let member_id = req.params.member_id;
        let group_id = req.params.group_id;
        let app_id = req.body.app_id;


        console.log('member_id', member_id);
        console.log('group_id', group_id);
        console.log('app_id', app_id);


        var result =  chatApi.leaveGroup(member_id, group_id, app_id);
      
        console.log('result', result);

        res.status(200).send(result);
      });
    });

  

// Expose the API as a function
exports.api = functions.https.onRequest(app);

