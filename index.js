'use strict';
const line = require('@line/bot-sdk');
const request = require('request');
const express = require('express');
const nlpManager = require('./ai-loader');
const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
  openWeatherSecret: process.env.OPENWEATHER_SECRET
};
const client = new line.Client(config);
const app = express();
app.post('/callback', line.middleware(config), (req, res) => {
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(`Event ${err}`);
      res.status(500).end();
    });
});
app.all('*', (req, res) => {
    res.status(200).json({"message" : "test"});
})
function handleEvent(event) {
  if (event.replyToken === "00000000000000000000000000000000" ||
    event.replyToken === "ffffffffffffffffffffffffffffffff") {
    return Promise.resolve(null);
  }else if (event.message.type==='text'){
    nlpManager.process(event.message.text).then(result => {
      let searchReply = {
        type: 'text',
        text: 'I don\'t understand this message'
      };
      if (result.intent !== 'None') {
        console.log(result);
        searchReply.text = result.entities?.[0].sourceText ?? "Not Found";
        request({url: "http://api.openweathermap.org/data/2.5/weather?q="+result.entities?.[0]?.sourceText.replace(" ", "%20")+"&appid=" + config.openWeatherSecret, method: "GET"}, (err, resp, body) => {
            let asd = JSON.parse(body);
            searchReply.text = JSON.stringify(asd);

            let object = {
                "type": "bubble",
                "hero": {
                  "type": "image",
                  "url": "https://www.flaticon.com/svg/static/icons/svg/1247/1247109.svg",
                  "size": "full",
                  "aspectRatio": "20:13",
                  "aspectMode": "cover",
                  "action": {
                    "type": "uri",
                    "label": "Action",
                    "uri": "https://linecorp.com/"
                  }
                },
                "body": {
                  "type": "box",
                  "layout": "vertical",
                  "spacing": "md",
                  "contents": [
                    {
                      "type": "text",
                      "text": "Weather in Jakarta",
                      "weight": "bold",
                      "size": "xl",
                      "gravity": "center",
                      "wrap": true,
                      "contents": []
                    },
                    {
                      "type": "box",
                      "layout": "vertical",
                      "spacing": "sm",
                      "margin": "lg",
                      "contents": [
                        {
                          "type": "box",
                          "layout": "baseline",
                          "spacing": "sm",
                          "contents": [
                            {
                              "type": "text",
                              "text": "Date",
                              "size": "sm",
                              "color": "#AAAAAA",
                              "flex": 1,
                              "contents": []
                            },
                            {
                              "type": "text",
                              "text": "Monday 25, 9:00PM",
                              "size": "sm",
                              "color": "#666666",
                              "flex": 4,
                              "wrap": true,
                              "contents": []
                            }
                          ]
                        },
                        {
                          "type": "box",
                          "layout": "baseline",
                          "spacing": "sm",
                          "contents": [
                            {
                              "type": "text",
                              "text": "Place",
                              "size": "sm",
                              "color": "#AAAAAA",
                              "flex": 1,
                              "contents": []
                            },
                            {
                              "type": "text",
                              "text": "7 Floor, No.3",
                              "size": "sm",
                              "color": "#666666",
                              "flex": 4,
                              "wrap": true,
                              "contents": []
                            }
                          ]
                        },
                        {
                          "type": "box",
                          "layout": "baseline",
                          "spacing": "sm",
                          "contents": [
                            {
                              "type": "text",
                              "text": "Seats",
                              "size": "sm",
                              "color": "#AAAAAA",
                              "flex": 1,
                              "contents": []
                            },
                            {
                              "type": "text",
                              "text": "C Row, 18 Seat",
                              "size": "sm",
                              "color": "#666666",
                              "flex": 4,
                              "wrap": true,
                              "contents": []
                            }
                          ]
                        }
                      ]
                    },
                    {
                      "type": "box",
                      "layout": "vertical",
                      "margin": "xxl",
                      "contents": [
                        {
                          "type": "spacer"
                        },
                        {
                          "type": "image",
                          "url": "https://scdn.line-apps.com/n/channel_devcenter/img/fx/linecorp_code_withborder.png",
                          "size": "xl",
                          "aspectMode": "cover"
                        },
                        {
                          "type": "text",
                          "text": "You can enter the theater by using this code instead of a ticket",
                          "size": "xs",
                          "color": "#AAAAAA",
                          "margin": "xxl",
                          "wrap": true,
                          "contents": []
                        }
                      ]
                    }
                  ]
                }
              };

            let smData = [{
                "type": "flex",
                "altText": "This is a Flex Message",
                "contents": object
            }]
            return client.replyMessage(event.replyToken, smData).catch((error)=>{
                console.log(error)
            });
        })
      }else{
        return client.replyMessage(event.replyToken, searchReply).catch((error)=>{
            console.log(error)
          });
      }
    });
  }  
  return Promise.resolve(null);
}
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});