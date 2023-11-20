import request from 'request';
import { FACEBOOK_GRAPH_API, PAGE_ACCESS_TOKEN, VERIFY_TOKEN } from '../configs/constants';
import MessengerServices from '../services/MessengerServices';

// Add support for GET requests to our webhook
const get = (req, res) => {
  // Parse the query params
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];

  // Checks if a token and mode is in the query string of the request
  if (mode && token) {
    // Checks the mode and token sent is correct
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      // Responds with the challenge token from the request
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  }
};

const post = (req, res) => {
  // Parse the request body from the POST
  let body = req.body;

  // Check the webhook event is from a Page subscription
  if (body.object === 'page') {
    // Iterate over each entry - there may be multiple if batched
    body.entry.forEach(function (entry) {
      // Get the webhook event. entry.messaging is an array, but
      // will only ever contain one event, so we get index 0
      let webhook_event = entry.messaging[0];
      console.log(webhook_event);

      // Get the sender PSID
      let sender_psid = webhook_event.sender.id;
      console.log('Sender PSID: ' + sender_psid);

      // Check if the event is a message or postback and
      // pass the event to the appropriate handler function
      if (webhook_event.message) {
        handleMessage(sender_psid, webhook_event.message);
      } else if (webhook_event.postback) {
        handlePostback(sender_psid, webhook_event.postback);
      }
    });

    // Return a '200 OK' response to all events
    res.status(200).send('EVENT_RECEIVED');
  } else {
    // Return a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }
};

// Sends response messages via the Send API
const callSendAPI = (senderPsid, response) => {
  // Construct the message body
  let requestBody = {
    recipient: {
      id: senderPsid,
    },
    message: response,
  };

  // Send the HTTP request to the Messenger Platform
  request(
    {
      uri: `${FACEBOOK_GRAPH_API}/me/messages`,
      qs: { access_token: PAGE_ACCESS_TOKEN },
      method: 'POST',
      json: requestBody,
    },
    (_err, res, body) => {
      if (res?.statusCode >= 200 && res?.statusCode < 300) {
        console.log('Message sent!');
      } else {
        console.error('Unable to send message:');
        console.error(body);
      }
    },
  );
};

// Handles 'messages' events
const handleMessage = (senderPsid, receivedMessage) => {
  let response;

  // Checks if the message contains text
  if (receivedMessage.text) {
    // Create the payload for a basic text message, which
    // will be added to the body of your request to the Send API
    response = {
      text: `You sent the message: '${receivedMessage.text}'. Now send me an attachment!`,
    };
  } else if (receivedMessage.attachments) {
    // Get the URL of the message attachment
    let attachmentUrl = receivedMessage.attachments[0].payload.url;
    response = {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'generic',
          elements: [
            {
              title: 'Is this the right picture?',
              subtitle: 'Tap a button to answer.',
              image_url: attachmentUrl,
              buttons: [
                {
                  type: 'postback',
                  title: 'Yes!',
                  payload: 'yes',
                },
                {
                  type: 'postback',
                  title: 'No!',
                  payload: 'no',
                },
              ],
            },
          ],
        },
      },
    };
  }

  // Send the response message
  callSendAPI(senderPsid, response);
};

// Handles 'messaging_postbacks' events
const handlePostback = async (senderPsid, receivedPostback) => {
  // Get the payload for the postback
  let payload = receivedPostback.payload;

  // Set the response based on the postback payload
  console.log('Postback payload: ', payload);
  switch (payload) {
    case 'GET_STARTED':
      await MessengerServices.handleGetStarted(senderPsid);
      break;
    case 'TODAY_TAROT_READ':
      await MessengerServices.handleTodayTarotRead(senderPsid);
      break;
    default:
      break;
  }
};

export default {
  get,
  post,
  handleMessage,
  handlePostback,
  callSendAPI,
};
