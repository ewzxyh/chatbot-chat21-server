
# REST API
Below are described the REST API of Chat21:

## Authentication

We support two authentication methods : JWT and Shared Secret

### JWT Authentication
Generate a Firebase token with:

```
 curl 'https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyPassword?key=<API_KEY>' \
    -H 'Content-Type: application/json' \
    -d '{"email":"<USER_EMAIL>","password":"<USER_PASSWORD>","returnSecureToken":true}'
```

The API_KEY is the firebase API KEY available under the Settings page of your Firebase project. 
You can find the API KEY in:
(gear-next-to-project-name) > Project Settings > Cloud Messaging

A successful authentication is indicated by a 200 OK HTTP status code. The response contains the Firebase ID token and refresh token associated with the existing email/password account.

Example:

```
curl 'https://www.googleapis.com/identitytoolkit/v3/relyingparty/verifyPassword?key=[REDACTED_GOOGLE_KEY]' \
    -H 'Content-Type: application/json' \
    -d '{"email":"redacted@example.invalid","password":"123456","returnSecureToken":true}'
```

More info here : https://firebase.google.com/docs/reference/rest/auth/#section-sign-in-email-password

### Secret Authentication (for admin)

To authenticate you can add the token query parameter to the endpoints. Example : ```?token=[REDACTED_TOKEN],```
You can change the secret token for your installation with ```firebase functions:config:set secretToken=MYSECRET```

## Send a message

You can send a message making a POST call to the endpoint :

```
  curl -X POST \
      -H 'Content-Type: application/json' \
      -H "Authorization: Bearer <FIREBASE_ID_TOKEN>" \
       -d '{"sender_fullname": "<SENDER_FULLNAME>", "recipient_id": "<RECIPIENT_ID>", "recipient_fullname":"<RECIPIENT_FULLNAME>","text":"<MESSAGE_TEXT>", "channel_type": "<CHANNEL_TYPE>", "type": "<TYPE>", "attributes": "<ATTRIBUTES>", "metadata": "<METADATA>"}' \
      'https://us-central1-<FIREBASE_PROJECT_ID>.cloudfunctions.net/api/<APP_ID>/messages'
```
Where :
- <FIREBASE_ID_TOKEN> : is a JWT token generated using JWT Authentication Method
- <SENDER_FULLNAME>: is the Sender Fullname. Ex: Andrea Leo
- <RECIPIENT_ID>: it's the recipient id of the message. The recipient id is the user id for direct message and the group id for group messaging.
- <RECIPIENT_FULLNAME>: is the Recipient Fullname. Ex: Andrea Sponziello
- <MESSAGE_TEXT>: it's the message text
- <CHANNEL_TYPE>: it's the channel type. "direct" value for one-to-one direct message and "group" for group messaging. Available values: direct (default) and group.
- <TYPE>: it's the message type. "text" value for textual message and "image" for sending image message. Available values: text (default) and image.
- <ATTRIBUTES>:  it's the message custom attributes. Example: attributes = {"custom_attribute1": "value1"}
- <METADATA>: it's the image properties: src is the absolute source path of the image, width is the image width, height is the image height. Example: metadata = { "src": "https://www.tiledesk.com/wp-content/uploads/2018/03/tiledesk-logo.png", "width": 200, "height": 200 }
- <FIREBASE_PROJECT_ID>: it's the Firebase project id. Find it on Firebase Console
- <APP_ID>: It's the appid usend on multitenant environment. Use  "default" as default value

Example. Send a direct message to recipient id U4HL3GWjBsd8zLX4Vva0s7W2FN92 : 

```
   curl -X POST \
       -H 'Content-Type: application/json' \
       -H 'Authorization: Bearer [REDACTED_JWT]' \
       -d '{"sender_fullname": "Andrea Leo", "recipient_id": "U4HL3GWjBsd8zLX4Vva0s7W2FN92", "recipient_fullname":"Andrea Leo","text":"hello from API"}' \
       'https://us-central1-chat-v2-dev.cloudfunctions.net/api/tilechat/messages'
```

Example. Send a group message : 

```
   curl -X POST \
       -H 'Content-Type: application/json' \
       -H 'Authorization: Bearer [REDACTED_JWT]' \
       -d '{"sender_fullname": "Andrea Leo", "recipient_id": "-LKQQxIY4DDyG17FDiOM", "recipient_fullname":"Test group","text":"hello group from API","channel_type":"group"}' \
       'https://us-central1-chat-v2-dev.cloudfunctions.net/api/tilechat/messages'
```


Example. Send an image to recipient id U4HL3GWjBsd8zLX4Vva0s7W2FN92 : 

```
   curl -X POST \
       -H 'Content-Type: application/json' \
       -H 'Authorization: Bearer [REDACTED_JWT]' \
       -d '{"sender_fullname": "Andrea Leo", "recipient_id": "U4HL3GWjBsd8zLX4Vva0s7W2FN92", "recipient_fullname":"Andrea Leo","text":"alt text", "type":"image", "metadata": { "src": "https://www.tiledesk.com/wp-content/uploads/2018/03/tiledesk-logo.png", "width": 200, "height": 200 } }' \
       'https://us-central1-chat-v2-dev.cloudfunctions.net/api/tilechat/messages'
```


## Create a Group

Create a chat user's group making the following POST call :

```

  curl -X POST \
      -H 'Content-Type: application/json' \
      -H "Authorization: Bearer <FIREBASE_ID_TOKEN>" \
      -d '{"group_name": "<GROUP_NAME>", "group_members": {"<MEMBER_ID>":1}}' \
      'https://us-central1-<FIREBASE_PROJECT_ID>.cloudfunctions.net/api/<APP_ID>/groups'
```

Where :
- <FIREBASE_ID_TOKEN> : is a JWT token generated using JWT Authentication Method
- <GROUP_NAME>: it's the new group name
- <MEMBER_ID>: it's the user ids of the group members
- <FIREBASE_PROJECT_ID>: it's the Firebase project id. Find it on Firebase Console
- <APP_ID>: It's the appid usend on multitenant environment. Use  "default" as default value

Example:

```
   curl -v -X POST \
       -H 'Content-Type: application/json' \
       -H 'Authorization: Bearer [REDACTED_JWT]' \
       -d '{"group_name": "TestGroup1", "group_members": {"y4QN01LIgGPGnoV6ql07hwPAQg23":1}}' 'https://us-central1-chat-v2-dev.cloudfunctions.net/api/tilechat/groups'
```


## Join a Group

With this API the user can join (become a member) of an existing group:

```
    curl -X POST \
       -H 'Content-Type: application/json' \
       -H "Authorization: Bearer <FIREBASE_ID_TOKEN>" \
       -d '{"member_id": "<MEMBER_ID>"}' \
       https://us-central1-<FIREBASE_PROJECT_ID>.cloudfunctions.net/api/<APP_ID>/groups/<GROUP_ID>/members
```


Where :
- <FIREBASE_ID_TOKEN> : is a JWT token generated using JWT Authentication Method
- <MEMBER_ID>: it's the user id of the user you want to joing (become a member)
- <FIREBASE_PROJECT_ID>: it's the Firebase project id. Find it on Firebase Console
- <APP_ID>: It's the appid usend on multitenant environment. Use  "default" as default value
- <GROUP_ID>: it's the existing group id


Example:

```
    curl -X POST \
       -H 'Content-Type: application/json' \
       -H 'Authorization: Bearer [REDACTED_JWT]' \
       -d '{"member_id": "81gLZhYmpTZM0GGuUI9ovD7RaCZ2"}' \
        https://us-central1-chat-v2-dev.cloudfunctions.net/api/tilechat/groups/-L5hnLkBGQoW05ax9ehg/members
```

## Leave a Group

With this API the user can leave of an existing group:


```
    curl  -X DELETE \
       -H 'Content-Type: application/json' \
       -H "Authorization: Bearer <FIREBASE_ID_TOKEN>" \
       https://us-central1-<FIREBASE_PROJECT_ID>.cloudfunctions.net/api/<APP_ID>/groups/<GROUP_ID>/members/<MEMBERID>
```

Where :
- <FIREBASE_ID_TOKEN> : is a JWT token generated using JWT Authentication Method
- <FIREBASE_PROJECT_ID>: it's the Firebase project id. Find it on Firebase Console
- <APP_ID>: It's the appid usend on multitenant environment. Use  "default" as default value
- <GROUP_ID>: it's the existing group id
- <MEMBER_ID>: it's the user id of the user you want to leave a group

Example:

```
    curl -X DELETE \
      -H 'Content-Type: application/json' \
       -H 'Authorization: Bearer [REDACTED_JWT]' \
        https://us-central1-chat-v2-dev.cloudfunctions.net/api/tilechat/groups/-L5hnLkBGQoW05ax9ehg/members/81gLZhYmpTZM0GGuUI9ovD7RaCZ2
```



## Set Group members

With this API you can set the group members


```
    curl -X PUT \
       -H 'Content-Type: application/json' \
       -H "Authorization: Bearer <FIREBASE_ID_TOKEN>" \
       -d '{"members": {"<member_id1>":1},{"<member_id2>":1}}' \
       https://us-central1-<FIREBASE_PROJECT_ID>.cloudfunctions.net/api/<APP_ID>/groups/<GROUP_ID>/members
```

Where :
- <FIREBASE_ID_TOKEN> : is a JWT token generated using JWT Authentication Method
- <FIREBASE_PROJECT_ID>: it's the Firebase project id. Find it on Firebase Console
- <MEMBER_IDs>: it's the user ids of the group members
- <APP_ID>: It's the appid usend on multitenant environment. Use  "default" as default value
- <GROUP_ID>: it's the existing group id

Example:

```
    curl -X PUT \
       -H 'Content-Type: application/json' \
       -H 'Authorization: Bearer [REDACTED_JWT]' \
       -d '{"members": {"system":1}}' \
        https://us-central1-chat-v2-dev.cloudfunctions.net/api/tilechat/groups/support-group-L5xro2P81zHs7YA7-DX/members
```


## Delete a message from the personal timeline

Delete a message from the personal timeline of a conversation specified by a RECIPIENT_ID

```
    curl  -X DELETE \
       -H 'Content-Type: application/json' \
       -H "Authorization: Bearer <FIREBASE_ID_TOKEN>" \
       https://us-central1-<FIREBASE_PROJECT_ID>.cloudfunctions.net/api/<APP_ID>/messages/<RECIPIENT_ID>/<MESSAGE_ID>
```

Where :
- <FIREBASE_ID_TOKEN> : is a JWT token generated using JWT Authentication Method
- <FIREBASE_PROJECT_ID>: it's the Firebase project id. Find it on Firebase Console
- <APP_ID>: It's the appid usend on multitenant environment. Use  "default" as default value
- <RECIPIENT_ID>: it's the recipient id
- <MESSAGE_ID>: it's the message id

Example:

```
    curl -X DELETE \
      -H 'Content-Type: application/json' \
       -H 'Authorization: Bearer [REDACTED_JWT]' \
        https://us-central1-chat-v2-dev.cloudfunctions.net/api/tilechat/messages/y4QN01LIgGPGnoV6ql07hwPAQg23/-L7iJ5QljBP7sPkN73Km
```

## Delete a group message for me and other users

Delete a message from all the timelines of a conversation specified by a RECIPIENT_ID


```
    curl  -X DELETE \
       -H 'Content-Type: application/json' \
       -H "Authorization: Bearer <FIREBASE_ID_TOKEN>" \
       'https://us-central1-<project-id>.cloudfunctions.net/api/<APP_ID>/messages/<RECIPIENT_ID>/<MESSAGE_ID>?all=true&channel_type=group'
```


Where :
- <FIREBASE_ID_TOKEN> : is a JWT token generated using JWT Authentication Method
- <FIREBASE_PROJECT_ID>: it's the Firebase project id. Find it on Firebase Console
- <APP_ID>: It's the appid usend on multitenant environment. Use  "default" as default value
- <RECIPIENT_ID>: it's the recipient id
- <MESSAGE_ID>: it's the message id


Example:

```
    curl -v -X DELETE \
      -H 'Content-Type: application/json' \
       -H 'Authorization: Bearer [REDACTED_JWT]' \
        'https://us-central1-chat-v2-dev.cloudfunctions.net/api/tilechat/messages/-L7iM75Pweqz2Atl7w1z/-L7iMFJKt06ixZFG_p4e?all=true&channel_type=group'


```


## Archive or delete a conversation

Archive or delete a conversation from the personal timeline specified by a RECIPIENT_ID

```
    curl  -X DELETE \
       -H 'Content-Type: application/json' \
       -H "Authorization: Bearer <FIREBASE_ID_TOKEN>" \
       https://us-central1-<FIREBASE_PROJECT_ID>.cloudfunctions.net/api/<APP_ID>/conversations/<RECIPIENT_ID>?delete=<BOOLEAN_VALUE>
```

Where :
- <FIREBASE_ID_TOKEN> : is a JWT token generated using JWT Authentication Method
- <FIREBASE_PROJECT_ID>: it's the Firebase project id. Find it on Firebase Console
- <APP_ID>: It's the appid usend on multitenant environment. Use  "default" as default value
- <RECIPIENT_ID>: it's the recipient id
- delete:  (Optional) if true permanently deletes the conversation, if false archives the conversation

Example:

```
    curl -v -X DELETE \
      -H 'Content-Type: application/json' \
       -H 'Authorization: Bearer [REDACTED_JWT]' \
        https://us-central1-chat-v2-dev.cloudfunctions.net/api/tilechat/conversations/y4QN01LIgGPGnoV6ql07hwPAQg23/
```


## Create a Contact

Create a new contact.

```

  curl -X POST \
      -H 'Content-Type: application/json' \
      -H "Authorization: Bearer <FIREBASE_ID_TOKEN>" \
      -d '{"firstname": "<FIRSTNAME>", "lastname": "<LASTNAME>","email": "<EMAIL>"}' \
      https://us-central1-<FIREBASE_PROJECT_ID>.cloudfunctions.net/api/<APP_ID>/contacts
```


Where :
- <FIREBASE_ID_TOKEN> : is a JWT token generated using JWT Authentication Method
- <FIRSTNAME>: it's the firstname of the contact
- <LASTNAME>: it's the lastname of the contact
- <EMAIL>: it's the contact email
- <FIREBASE_PROJECT_ID>: it's the Firebase project id. Find it on Firebase Console
- <APP_ID>: It's the appid usend on multitenant environment. Use  "default" as default value



Example:

```
   curl -v -X POST \
       -H 'Content-Type: application/json' \
       -H 'Authorization: Bearer [REDACTED_JWT]' \
        -d '{"firstname": "firstname", "lastname": "lastname","email": "email"}' \
    https://us-central1-chat-v2-dev.cloudfunctions.net/api/tilechat/contacts
```


## Update my FirstName and Last Name

Change my first and lastname:

```

  curl -X PUT \
      -H 'Content-Type: application/json' \
      -H "Authorization: Bearer <FIREBASE_ID_TOKEN>" \
      -d '{"firstname": "<FIRSTNAME>", "lastname": "<LASTNAME>"}' \
      https://us-central1-<FIREBASE_PROJECT_ID>.cloudfunctions.net/api/<APP_ID>/contacts/me
```


Where :
- <FIREBASE_ID_TOKEN> : is a JWT token generated using JWT Authentication Method
- <FIRSTNAME>: it's the firstname of the contact
- <LASTNAME>: it's the lastname of the contact
- <FIREBASE_PROJECT_ID>: it's the Firebase project id. Find it on Firebase Console
- <APP_ID>: It's the appid usend on multitenant environment. Use  "default" as default value



Example:

```
   curl -v -X PUT \
       -H 'Content-Type: application/json' \
       -H 'Authorization: Bearer [REDACTED_JWT]' \
        -d '{"firstname": "firstname", "lastname": "lastname"}' \
    https://us-central1-chat-v2-dev.cloudfunctions.net/api/tilechat/contacts/me
```


## Upload photo profile

Upload my photo profile

```

  curl -X PUT \
      -H 'Content-Type: application/json' \
      -H "Authorization: Bearer <FIREBASE_ID_TOKEN>" \
      https://us-central1-<FIREBASE_PROJECT_ID>.cloudfunctions.net/api/<APP_ID>/contacts/me/photo
```


Where :
- <FIREBASE_ID_TOKEN> : is a JWT token generated using JWT Authentication Method
- <FIREBASE_PROJECT_ID>: it's the Firebase project id. Find it on Firebase Console
- <APP_ID>: It's the appid usend on multitenant environment. Use  "default" as default value


Example:

```
   curl -v -X PUT \
       -H 'Authorization: Bearer [REDACTED_JWT]' \
       -F "image=@/Users/andrealeo/Downloads/a.jpg" \
    https://us-central1-chat-v2-dev.cloudfunctions.net/api/tilechat/contacts/me/photo
```


## Delete photo profile

Delete my photo profile

```

  curl -X DELETE \
      -H 'Content-Type: application/json' \
      -H "Authorization: Bearer <FIREBASE_ID_TOKEN>" \
      https://us-central1-<FIREBASE_PROJECT_ID>.cloudfunctions.net/api/<APP_ID>/contacts/me/photo
```


Where :
- <FIREBASE_ID_TOKEN> : is a JWT token generated using JWT Authentication Method
- <FIREBASE_PROJECT_ID>: it's the Firebase project id. Find it on Firebase Console
- <APP_ID>: It's the appid usend on multitenant environment. Use  "default" as default value


Example:

```
   curl -v -X DELETE \
       -H 'Content-Type: application/json' \
       -H 'Authorization: Bearer [REDACTED_JWT]' \
    https://us-central1-chat-v2-dev.cloudfunctions.net/api/tilechat/contacts/me/photo
```


# REST API for Support

## Create support request

```
  curl -X POST \
      -H 'Content-Type: application/json' \
      -H "Authorization: Bearer <FIREBASE_ID_TOKEN>" \
       -d '{"sender_fullname": "<FULLNAME>","text":"helo from API","projectid":"<Project_id>"}' \
      https://us-central1-<project-id>.cloudfunctions.net/supportapi/<APP_ID>/requests
```

Example: 
```
   curl -X POST \
       -H 'Content-Type: application/json' \
       -d '{"sender_fullname": "Andrea Leo", "text":"hello from API","projectid":"5ab0f32757066e0014bfd718"}' \
       'https://us-central1-chat-v2-dev.cloudfunctions.net/supportapi/tilechat/requests?token=[REDACTED_TOKEN],'
```



## Rate the request

```
  curl -X PUT \
      -H 'Content-Type: application/json' \
      -H "Authorization: Bearer <FIREBASE_ID_TOKEN>" \
      https://us-central1-<project-id>.cloudfunctions.net/supportapi/<APP_ID>/requests/<REQUEST_ID>/rate?rating=2&rating_message=ciao
```

Example: 
```
   curl -X PUT \
       -H 'Content-Type: application/json' \
       'https://us-central1-chat-v2-dev.cloudfunctions.net/supportapi/tilechat/requests/support-group-LM879tEdviVwDkNmo94/rate?token=[REDACTED_TOKEN],&rating=2&rating_message=ciao'
```

## Close Support group

Where :
- <FIREBASE_ID_TOKEN> : is a JWT token generated using JWT Authentication Method
- <GROUP_ID>: is the group id to close
- open: (Optional)If true reopen an existing closed group
- <FIREBASE_PROJECT_ID>: it's the Firebase project id. Find it on Firebase Console
- <APP_ID>: It's the appid usend on multitenant environment. Use  "default" as default value

```
    curl -X PUT \
       -H 'Content-Type: application/json' \
       -H "Authorization: Bearer <FIREBASE_ID_TOKEN>" \
       https://us-central1-<project-id>.cloudfunctions.net/supportapi/<APP_ID>/groups/<GROUP_ID>?open=true/false
```

Example:

```
    curl -X PUT \
       -H 'Content-Type: application/json' \
       -H 'Authorization: Bearer [REDACTED_JWT]' \
        https://us-central1-chat-v2-dev.cloudfunctions.net/supportapi/tilechat/groups/support-group-LBqsOVQS59IZPWWY_me
```

## Subscribe/unsubscribe to receive emails

```
  curl -X POST \
      -H 'Content-Type: application/json' \
      -d '{"user_id": "<USER_ID>", "is_subscribed": "<IS_SUBSCRIBED>"}' \
      https://us-central1-<project-id>.cloudfunctions.net/api/<APP_ID>/users/<USER_ID>/settings/email?token=[REDACTED_TOKEN],
```

Example:

```
  curl -X POST \
      -H 'Content-Type: application/json' \
      -d '{"user_id": "u2K7nLo2dTZEOYYTykrufN6BDF92", "is_subscribed": "true"}' \
      https://us-central1-chat-v2-dev.cloudfunctions.net/api/tilechat/users/u2K7nLo2dTZEOYYTykrufN6BDF92/settings/email?token=[REDACTED_TOKEN],
```


## Webhook

* Enable webhook with ```firebase functions:config:set webhook.enabled=true```
* Set on new message webhook url with : ```firebase functions:config:set webhook.onmessage.url=http://localhost:3000/requests```


TODO

```
  curl -v -X GET \
      -H 'Content-Type: application/json' \
      'https://us-central1-chat-v2-dev.cloudfunctions.net/webhookapi/?hub.mode=subscribe&hub.verify_token=webhooksecret'
```
