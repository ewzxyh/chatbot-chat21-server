var assert = require('assert');
// const { uuid } = require('uuidv4');
const { v4: uuidv4 } = require('uuid');

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
// const API_ENDPOINT = 'http://localhost:8004/api'

// REMOTE
const MQTT_ENDPOINT = 'ws://99.80.197.164:15675/ws';
const API_ENDPOINT = 'http://99.80.197.164:8004/api';
const APPID = 'tilechat';

let TOTAL_SENT_MESSAGES = 500;
let TOTAL_DELIVERED_MESSAGES = TOTAL_SENT_MESSAGES * 3;
let DELAY = 100; // ms
let starttime;
let endtime;

startBenchmark();

function startBenchmark() {
    console.log("Sending " + TOTAL_SENT_MESSAGES + " messages to 3 users. Delivering a total of " + TOTAL_DELIVERED_MESSAGES + " messages.");
    let messages_count = 0;
    const group_id = "group-" + uuidv4().replace("-", "");
    const group_name = "test send message group";
    const group_members = {}
    group_members[user1.userid] = 1;
    group_members[user2.userid] = 1;
    group_members[user3.userid] = 1;
    let received_messages = {}
    const USER1_RECEIVED_KEY = 'user1';
    const USER2_RECEIVED_KEY = 'user2';
    const USER3_RECEIVED_KEY = 'user3';
    const SENT_MESSAGE = "Welcome everybody 2";
    let chatClient1 = new Chat21Client( // group creator
        {
            appId: APPID,
            MQTTendpoint: MQTT_ENDPOINT,
            APIendpoint: API_ENDPOINT
        }
    );
    let chatClient2 = new Chat21Client( // group member, will receive sent message
        {
            appId: APPID,
            MQTTendpoint: MQTT_ENDPOINT
        }
    );
    let chatClient3 = new Chat21Client( // group member, will receive sent message
        {
            appId: APPID,
            MQTTendpoint: MQTT_ENDPOINT
        }
    );
    chatClient2.connect(user2.userid, user2.token, () => {
        console.log("User2 connected...");
        chatClient2.onMessageAdded((message, topic) => {
        	console.log("user2 message added:", message.text);
        	if (
        		message &&
        		message.text &&
        		!message.attributes
        		) {
        			messages_count += 1;
                    console.log("user2: " + messages_count);
        	}
        	check_finish(messages_count, chatClient1, chatClient2, chatClient3);
        });
        chatClient3.connect(user3.userid, user3.token, () => {
            console.log("User3 connected...");
            chatClient3.onMessageAdded((message, topic) => {
            	console.log("user3 message added:", message.text);
            	if (
            		message &&
            		message.text &&
            		!message.attributes
            		) {
            			messages_count += 1;
                        console.log("user3: " + messages_count);
                }
                check_finish(messages_count, chatClient1, chatClient2, chatClient3);
            });
            chatClient1.connect(user1.userid, user1.token, () => {
                console.log("User1 (group owner) connected...");
                chatClient1.createGroup(
                    group_name,
                    group_id,
                    group_members,
                    async (err, result) => {
                        assert(err == null);
                        assert(result != null);
                        assert(result.success == true);
                        assert(result.group.name === group_name);
                        chatClient1.onMessageAdded((message, topic) => {
                        	console.log("user1 message added:", message.text);
                        	if (
                        		message &&
                        		message.text &&
                        		!message.attributes
                        		) {
                        			messages_count += 1;
                                    console.log("user1: " + messages_count);
                            }
                            check_finish(messages_count, chatClient1, chatClient2, chatClient3);
                        });
                        starttime = Date.now();
                        console.log("Start:" + starttime);
                        for (i = 0; i < TOTAL_SENT_MESSAGES; i++) {
                            await new Promise(resolve => setTimeout(resolve, DELAY));
                            let message_text = "Message" + i;
                            chatClient1.sendMessage(
                                message_text,
                                'text',
                                group_id,
                                group_name,
                                user1.fullname,
                                null,
                                null,
                                'group',
                                (err, msg) => {
                                    console.log("Group sent", msg.text);
                                }
                            );
                        }
                    }
                );
            });
        });
    });
}

function check_finish(messages_count, chatClient1, chatClient2, chatClient3) {
    if (messages_count == TOTAL_DELIVERED_MESSAGES) {
        endtime = Date.now();
        console.log("End:" + endtime);
        let totaltime = endtime - starttime;
        console.log("TOTAL TIME:" + totaltime);
        chatClient1.close(() => {
            chatClient2.close(() => {
                chatClient3.close(() => {
                    console.log("BENCHMARK END. TOTAL MESSAGES DELIVERED:", messages_count);
                });
            });
        });
    }
}