require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { StreamChat } = require('stream-chat');
const processMessage = require('./process-message');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// initialize Stream Chat SDK

const serverSideClient = new StreamChat(
  process.env.STREAM_API_KEY,
  process.env.STREAM_APP_SECRET
);

app.post('/webhook', async (req, res) => {
  const { type, user } = req.body;
  try {
    if (type === 'message.new' && user.id !== 'admin') {
      const result = await processMessage(req.body);
      const channel = serverSideClient.channel('commerce', 'live-chat', {
        name: 'Live Chat',
      });

      await channel.sendMessage({
        text: result.fulfillmentText,
        user: {
          id: 'admin',
        },
      });

      res.status(200).end();
    }
  } catch (err) {
    console.log(err);
    res.status(500).end();
  }
});

app.post('/join', async (req, res) => {
  const { username } = req.body;
  const token = serverSideClient.createToken(username);
  try {
    await serverSideClient.updateUser(
      {
        id: username,
        name: username,
      },
      token
    );
  } catch (err) {
    console.log(err);
  }

  const admin = { id: 'admin' };
  const channel = serverSideClient.channel('commerce', 'live-chat', {
    name: 'Live Chat',
    created_by: admin,
  });

  try {
    await channel.create();
    await channel.addMembers([username, 'admin']);
  } catch (err) {
    console.log(err);
  }

  return res
    .status(200)
    .json({ user: { username }, token, api_key: process.env.STREAM_API_KEY });
});

const server = app.listen(process.env.PORT || 5500, () => {
  const { port } = server.address();
  console.log(`Server running on PORT ${port}`);
});
