var assert = require('assert');
const { Chat21Client } = require('../mqttclient/chat21client.js');

const user1 = {
	userid: 'USER1',
	fullname: 'User 1',
	firstname: 'User',
	lastname: '1',
	token: '[REDACTED_JWT]'
};

 const user2 = {
	userid: 'USER2',
	fullname: 'User 2',
	firstname: 'User',
	lastname: '2',
	token: '[REDACTED_JWT]'
};

const user3 = {
	userid: 'USER3',
 	fullname: 'User 3',
 	firstname: 'User',
 	lastname: '3',
 	token: '[REDACTED_JWT]'
};

// LOCAL
// const MQTT_ENDPOINT = 'ws://localhost:15675/ws';

// REMOTE
const MQTT_ENDPOINT = 'ws://99.80.197.164:15675/ws';

const APPID = 'tilechat';

let TOTAL_MESSAGES = 500;
let DELAY = 100; //ms
let starttime;
let endtime;

startDirectBenchmark();

function startDirectBenchmark() {
    console.log("Sending " + TOTAL_MESSAGES + " direct messages from 1 user to 1 other user. Delivering a total of " + TOTAL_MESSAGES + " messages.");
    let messages_count = 0;
    let chatClient1 = new Chat21Client(
        {
            appId: APPID,
            MQTTendpoint: MQTT_ENDPOINT
        }
    );
    let chatClient2 = new Chat21Client(
      {
          appId: APPID,
          MQTTendpoint: MQTT_ENDPOINT
      }
    );
    chatClient2.connect(user2.userid, user2.token, () => {
          chatClient2.onMessageAdded((message, topic) => {
              console.log("Received:", message.text + ' ID:' + message.message_id);
              assert(message != null);
              assert(message.text != null);
              messages_count += 1;
              if (messages_count == TOTAL_MESSAGES) {
                endtime = Date.now();
                console.log("End:" + endtime);
                let totaltime = endtime - starttime;
                console.log("TOTAL TIME: " + totaltime + " ms");
                chatClient2.close(() => {
                    console.log("...TEST TERMINATED. DISCONNECTING CLIENT2. TOTAL RECEIVED MESSAGES:" + messages_count);
                });
                chatClient1.close(() => {
                    console.log("CLIENT 1 DISCONNECTED.");
                });
              }
          });
          
          chatClient1.connect(user1.userid, user1.token, async () => {
            console.log("User1 connected...");
            starttime = Date.now();
            console.log("Start:" + starttime);
            for (i = 0; i < TOTAL_MESSAGES; i++) {
                await new Promise(resolve => setTimeout(resolve, DELAY));
                let message_text = "Message" + i;
                chatClient1.sendMessage(
                    message_text,
                    'text',
                    user2.userid,
                    user2.fullname,
                    user1.fullname,
                    null,
                    null,
                    'direct',
                    (err, msg) => {
                        console.log("Sent:", msg.text);
                    }
                );
            }
        });
    });
}