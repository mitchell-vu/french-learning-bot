import request from 'request';
import { FACEBOOK_GRAPH_API, PAGE_ACCESS_TOKEN, PAGE_ID } from '../configs/constants';
import fs from 'fs';
import OpenAI from 'openai';
import axios from 'axios';

const callSendAction = async (senderPsid, action) => {
  const requestBody = {
    recipient: { id: senderPsid },
    sender_action: action,
  };

  try {
    // Send the HTTP request to the Messenger Platform
    const res = await axios({
      method: 'POST',
      url: `${FACEBOOK_GRAPH_API}/${PAGE_ID}/messages`,
      params: { access_token: PAGE_ACCESS_TOKEN },
      data: requestBody,
    });

    if (res?.status >= 200 && res?.status < 300) {
      console.log(`Action ${action} sent!`);
    } else {
      console.error('Unable to send action');
      console.error(res.data);
    }
  } catch (err) {
    console.error(err);
    throw err;
  }
};

// TODO: DRY up the code
const callSendAPI = async (senderPsid, response) => {
  // Construct the message body
  const requestBody = {
    recipient: { id: senderPsid },
    message: response,
  };

  // Send the HTTP request to the Messenger Platform
  try {
    // Send the HTTP request to the Messenger Platform
    const res = await axios({
      method: 'POST',
      url: `${FACEBOOK_GRAPH_API}/${PAGE_ID}/messages`,
      params: { access_token: PAGE_ACCESS_TOKEN },
      data: requestBody,
    });

    if (res?.status >= 200 && res?.status < 300) {
      console.log('Message sent!');
    } else {
      console.error('Unable to send message');
      console.error(res.data);
    }
  } catch (err) {
    console.error(err);
    throw err;
  }
};

const getUserProfile = (senderPsid) => {
  return new Promise((resolve, reject) => {
    request(
      {
        uri: `${FACEBOOK_GRAPH_API}/${senderPsid}`,
        qs: {
          fields: ['first_name', 'last_name', 'profile_pic'].join(','),
          access_token: PAGE_ACCESS_TOKEN,
        },
        method: 'GET',
      },
      (err, _res, _body) => {
        if (_res?.statusCode >= 200 && _res?.statusCode < 300) {
          const body = JSON.parse(_body);

          const userProfile = {
            firstName: body.first_name,
            lastName: body.last_name,
            profilePic: body.profile_pic,
          };

          resolve(userProfile);
        } else {
          reject(err);
        }
      },
    );
  });
};

const genericTemplateMessage = {
  attachment: {
    type: 'template',
    payload: {
      template_type: 'generic',
      elements: [
        {
          title: 'Hát Vê chào bạn!',
          image_url:
            'https://scontent.fhan15-2.fna.fbcdn.net/v/t1.6435-9/64874172_448331855717625_2999126730234396672_n.jpg?_nc_cat=110&ccb=1-7&_nc_sid=7f8c78&_nc_ohc=iEhnIkAij0YAX_K9rSV&_nc_ht=scontent.fhan15-2.fna&oh=00_AfDlrW24oW1qB5E6iKu6oOI02YsVjGxlti0vRe3cn14Idg&oe=657A66AD',
          subtitle: 'Chào mừng bạn hê hê',
          default_action: {
            type: 'web_url',
            url: 'https://www.originalcoastclothing.com/',
            webview_height_ratio: 'tall',
          },
          buttons: [
            {
              type: 'web_url',
              url: 'https://www.originalcoastclothing.com/',
              title: 'View Website',
            },
            {
              type: 'postback',
              title: 'Start Chatting',
              payload: 'DEVELOPER_DEFINED_PAYLOAD',
            },
          ],
        },
        {
          title: 'Làm quẻ',
          image_url:
            'https://static01.nyt.com/images/2022/01/18/t-magazine/art/19tmag-tarot-slide-0DZT/19tmag-tarot-slide-0DZT-superJumbo.jpg',
          subtitle: 'Rút một lá tarot cho hôm nay',
          buttons: [
            {
              type: 'postback',
              title: 'Rút một lá',
              payload: 'TODAY_TAROT_READ',
            },
          ],
        },
      ],
    },
  },
};

const handleGetStarted = (senderPsid) => {
  return new Promise(async (resolve, reject) => {
    try {
      const userProfile = await getUserProfile(senderPsid);
      const { firstName, lastName } = userProfile;
      const username = `${firstName} ${lastName}`;

      await callSendAPI(senderPsid, {
        text: `Hê lô, chào mừng ${username} tới Nhà của Hát Vê 🙆🏻‍♂️`,
      });
      await callSendAPI(senderPsid, genericTemplateMessage);
      resolve('Started!');
    } catch (err) {
      reject(err);
    }
  });
};

const handleTodayTarotRead = (senderPsid) => {
  return new Promise(async (resolve, reject) => {
    try {
      await callSendAction(senderPsid, 'typing_on');
      const tarotCards = JSON.parse(fs.readFileSync('src/data/tarot.json', 'utf8'));

      // Get random card
      const randomCardIndex = Math.floor(Math.random() * tarotCards.cards.length);
      const randomCard = tarotCards.cards[randomCardIndex];

      await callSendAPI(senderPsid, {
        text: `Hôm nay bạn đã rút được lá ${randomCard.name}!`,
      });
      await callSendAPI(senderPsid, {
        attachment: {
          type: 'image',
          payload: {
            attachment_id: '1301943493858287',
          },
        },
      });

      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      await callSendAction(senderPsid, 'typing_on');
      const chatCompletions = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: `Act in Zohra Shakti interpreting today tarot card of ${randomCard.name} in a paragraph`,
          },
        ],
      });

      const {
        message: { content },
      } = chatCompletions.choices[0];

      await callSendAPI(senderPsid, { text: content });

      resolve('Sent today tarot read!');
    } catch (err) {
      reject(err);
      console.error(err);
    }
  });
};

export default {
  getUserProfile,
  handleGetStarted,
  handleTodayTarotRead,
};
