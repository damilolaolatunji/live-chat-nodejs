import React, { useState, useEffect } from 'react';
import './App.css';
import {
  Chat,
  Channel,
  ChannelHeader,
  Window,
  MessageList,
  MessageCommerce,
  MessageInput,
} from 'stream-chat-react';
import { StreamChat } from 'stream-chat';
import axios from 'axios';

import 'stream-chat-react/dist/css/index.css';

let chatClient;

function App() {
  const [channel, setChannel] = useState(null);

  useEffect(() => {
    const username = 'joker';
    async function getToken() {
      try {
        const response = await axios.post('http://localhost:5500/join', {
          username,
        });
        const { token } = response.data;
        const apiKey = response.data.api_key;

        chatClient = new StreamChat(apiKey);

        await chatClient.setUser(
          {
            id: username,
            name: username,
          },
          token
        );

        const channel = chatClient.channel('commerce', 'live-chat');
        await channel.watch();
        setChannel(channel);
      } catch (err) {
        console.log(err);
      }
    }

    getToken();
  }, []);

  if (channel) {
    return (
      <Chat client={chatClient} theme="commerce light">
        <Channel channel={channel}>
          <Window>
            <ChannelHeader />
            <MessageList Message={MessageCommerce} />
            <MessageInput focus />
          </Window>
        </Channel>
      </Chat>
    );
  }

  return <div></div>;
}

export default App;
