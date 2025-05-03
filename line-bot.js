const line = require('@line/bot-sdk');
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// LINE bot 的 channel secret 和 channel access token
const config = {
  channelAccessToken: 'kveEJ3VoqwcbT4Gsrbq+45TfvfMiCKgI3NYAZjazKKU/uPF7oHcDTZ1PUtFD9Xlx7tBFiPf7bK44ZztS9Pu21j77+iMon1pszZzPoZ0XSQJ5ndrTJHOKDzetcOm1qYIaWA4maIylLyApij+t47iOIAdB04t89/1O/w1cDnyilFU=',
  channelSecret: '677f70fa956f395d655b696860205373'
};

const client = new line.Client(config);

// 設定 webhook 路徑來接收來自 LINE 的訊息
app.post('/webhook', line.middleware(config), (req, res) => {
  Promise.all(req.body.events.map(handleEvent))
    .then((result) => res.json(result));
});

// 處理來自 LINE 的訊息事件
function handleEvent(event) {
  if (event.type === 'message' && event.message.type === 'text') {
    return client.replyMessage(event.replyToken, {
      type: 'text',
      text: `你說的是: ${event.message.text}`
    });
  }
  return Promise.resolve(null);
}

// 啟動伺服器
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
