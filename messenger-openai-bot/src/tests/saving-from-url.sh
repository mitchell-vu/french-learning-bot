PAGE_ACCESS_TOKEN=
url=https://raw.githubusercontent.com/mitchell-vu/ts-messenger-bot/main/src/public/assets/cards/c01.jpg

curl --location --request POST 'https://graph.facebook.com/v2.10/me/message_attachments?access_token='$PAGE_ACCESS_TOKEN'' \
--header 'Content-Type: application/json' \
--data-raw '{
  "message":{
    "attachment":{
      "type":"image", 
      "payload":{
        "url":"'$url'",
        "is_reusable": true
      }
    }
  }
}'