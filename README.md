# Introduction

* Send a direct message
* Send a group message
* Create a conversation for each message
* Send the push notification for direct and group message
* Send an info message to notify the creation of a group or a member joining

# Pre requisites

* NPM installed. More info here https://nodejs.org/en/
* Create a Firebase Project on https://console.firebase.google.com/. Follow the Firebase Documentation to create a new project on the Firebase console.
* Install Firebase CLI running ```npm install -g firebase-tools```. 
More info here https://firebase.google.com/docs/cli/ 
If the command fails, you may need to change npm permissions as described here https://docs.npmjs.com/getting-started/fixing-npm-permissions or try to install Firebase CLI locally with ```npm install firebase-tools```

You can find more info about Firebase Functions here https://firebase.google.com/docs/functions/get-started

# Project setup
* Clone or download this repo from github 
* Run from command line:
```
cd functions 
npm install
```
* Login to Firebase CLI with ```firebase login```. More info here  https://firebase.google.com/docs/cli/
* Set up your Firebase project by running ```firebase use --add```, select your Project ID and follow the instructions.

# Test locally

This project comes with a web-based UI for testing the function. To test locally do:

* Start serving your project locally using ```firebase serve --only hosting,functions```
* Open the app in a browser at https://localhost:5000.
* Sign in to the web app in the browser using Google Sign-In
* Create messages and explore them using the List and Detail sections.
* Sign out. You should no longer be able to access the API.

# Deploy
* Deploy to Firebase using the following command: ```firebase deploy```. You can see the deployed functions on the Firebase Console under Functions menu.
* Open the app using firebase open hosting:site, this will open a browser.


# REST API

## Authentication

Generate a Firebase token with:

```
 curl 'https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyPassword?key=<API_KEY>' \
-H 'Content-Type: application/json' \
-d '{"email":"<USER_EMAIL>","password":"<USER_PASSWORD>","returnSecureToken":true}'
```

A successful authentication is indicated by a 200 OK HTTP status code. The response contains the Firebase ID token and refresh token associated with the existing email/password account.

Example:

```
curl 'https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyPassword?key=[REDACTED_GOOGLE_KEY]' \
 -H 'Content-Type: application/json' \
 -d '{"email":"redacted@example.invalid","password":"123456","returnSecureToken":true}'
```

More info here : https://firebase.google.com/docs/reference/rest/auth/#section-sign-in-email-password



## Send a message

```
  curl -X POST \
      -H 'Content-Type: application/json' \
      -H "Authorization: Bearer <Firebase ID Token>" \
       -d '{"sender_fullname": "<FULLNAME>", "recipient_id": "<ID>", "recipient_fullname":"<FULLNAME>","text":"helo from API"}' \
      https://us-central1-<project-id>.cloudfunctions.net/api/<APP_ID>/messages
```

Example: 
```
   curl -X POST \
       -H 'Content-Type: application/json' \
       -H 'Authorization: Bearer [REDACTED_JWT]' \
       -d '{"sender_fullname": "Andrea Leo", "recipient_id": "U4HL3GWjBsd8zLX4Vva0s7W2FN92", "recipient_fullname":"Andrea Leo","text":"hello from API"}' \
       https://us-central1-chat-v2-dev.cloudfunctions.net/api/tilechat/messages
```


## Create a Group

```

  curl -X POST \
      -H 'Content-Type: application/json' \
      -H "Authorization: Bearer <Firebase ID Token>" \
      -d '{"group_name": "group_name", "app_id":"<APP_ID>"}' \
      https://us-central1-<project-id>.cloudfunctions.net/api/<APP_ID>/groups
```

Example:

```
   curl -v -X POST \
       -H 'Content-Type: application/json' \
       -H 'Authorization: Bearer [REDACTED_JWT]' \
       -d '{"group_name": "TestGroup1", "group_members": {"y4QN01LIgGPGnoV6ql07hwPAQg23":1}}' https://us-central1-chat-v2-dev.cloudfunctions.net/api/tilechat/groups
```


## Join a Group

```
    curl -X POST \
       -H 'Content-Type: application/json' \
       -H "Authorization: Bearer <Firebase ID Token>" \
       -d '{"member_id": "<member_id>", "app_id": "<app_id>"}' 
       https://us-central1-<project-id>.cloudfunctions.net/api/<APP_ID>/groups/<GROUP_ID>/members
```

Example:

```
    curl -X POST \
       -H 'Content-Type: application/json' \
       -H 'Authorization: Bearer [REDACTED_JWT]' \
       -d '{"member_id": "81gLZhYmpTZM0GGuUI9ovD7RaCZ2"}' \
        https://us-central1-chat-v2-dev.cloudfunctions.net/api/tilechat/groups/-L5hnLkBGQoW05ax9ehg/members
```

## Leave a Group

```
    curl  -X DELETE \
       -H 'Content-Type: application/json' \
       -H "Authorization: Bearer <Firebase ID Token>" \
       https://us-central1-<project-id>.cloudfunctions.net/api/<APP_ID>/groups/<GROUP_ID>/members/<MEMBERID>
```

Example:

```
    curl -X DELETE \
      -H 'Content-Type: application/json' \
       -H 'Authorization: Bearer [REDACTED_JWT]' \
        https://us-central1-chat-v2-dev.cloudfunctions.net/api/tilechat/groups/-L5hnLkBGQoW05ax9ehg/members/81gLZhYmpTZM0GGuUI9ovD7RaCZ2
```