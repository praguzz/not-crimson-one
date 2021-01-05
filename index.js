'use strict';
const line = require('@line/bot-sdk');
const { request } = require('request');
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
            searchReply.text = resp;
        })

      }
      return client.replyMessage(event.replyToken, searchReply).catch((error)=>{
        console.log(error)
      });
    });
  }  
  return Promise.resolve(null);
}
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});