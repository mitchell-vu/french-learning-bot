import request from 'request';
import { FACEBOOK_GRAPH_API, PAGE_ACCESS_TOKEN } from '../configs/constants';

const setupProfile = (_req, response) => {
  // Construct the message body
  let requestBody = {
    get_started: { payload: 'GET_STARTED' },
    whitelisted_domains: ['https://ts-messenger-3dc344cc936f.herokuapp.com/'],
    persistent_menu: [
      {
        locale: 'default',
        composer_input_disabled: false,
        call_to_actions: [
          {
            type: 'web_url',
            title: 'Shop now',
            url: 'https://www.originalcoastclothing.com/',
            webview_height_ratio: 'full',
          },
          {
            type: 'postback',
            title: 'Rút quẻ hôm nay',
            payload: 'TODAY_TAROT_READ',
          },
          {
            type: 'postback',
            title: 'Restart conversation',
            payload: 'RESTART_CONVERSATION',
          },
        ],
      },
    ],
  };

  // Send the HTTP request to the Messenger Platform
  request(
    {
      uri: `${FACEBOOK_GRAPH_API}/me/messenger_profile`,
      qs: { access_token: PAGE_ACCESS_TOKEN },
      method: 'POST',
      json: requestBody,
    },
    (_err, res, body) => {
      console.log(body);
      console.log('Status - ', res.statusCode);

      if (res?.statusCode >= 200 && res?.statusCode < 300) {
        console.log('Setup user profile successful!');
      } else {
        console.error('Unable to setup profile');
      }
    },
  );

  return response.send('Setup user profile successful!');
};

export default {
  setupProfile,
};
