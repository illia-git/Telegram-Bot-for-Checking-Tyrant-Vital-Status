import { config } from 'dotenv';
import TelegramBot from 'node-telegram-bot-api';
import nlp from 'compromise';
import axios from 'axios';

config();

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(TOKEN, { polling: true });

const people = [
  { name: 'Vladimir Putin', title: 'Vladimir_Putin' },
  { name: 'Alexander Lukashenko', title: 'Alexander_Lukashenko' },
  // { name: 'Michael Jackson', title: 'Michael_Jackson' },
];

const cache = {};
const CACHE_EXPIRY = 3600000; // 1 hour in milliseconds

const createInlineKeyboard = () => ({
  reply_markup: {
    inline_keyboard: people.map((person) => [
      { text: `Check if ${person.name} is dead`, callback_data: person.name },
    ]),
  },
});

const WIKIPEDIA_API_URL = 'https://en.wikipedia.org/w/api.php';
const deathDatePattern = /death_date.*?\d{4}/;

const fetchWikipediaInfobox = async (title) => {
  if (cache[title] && Date.now() - cache[title].timestamp < CACHE_EXPIRY) {
    return cache[title].data;
  }

  try {
    const response = await axios.get(WIKIPEDIA_API_URL, {
      params: {
        action: 'query',
        prop: 'revisions',
        rvprop: 'content',
        format: 'json',
        titles: title,
        rvsection: 0,
      },
    });

    const pages = response.data.query.pages;
    const pageContent = Object.values(pages)[0].revisions[0]['*'];

    cache[title] = {
      data: pageContent,
      timestamp: Date.now(),
    };

    return pageContent;
  } catch (error) {
    console.error('Error fetching Wikipedia infobox:', error);
    return null;
  }
};

const fetchDeathInfo = async (selectedPerson, chatId, messageId) => {
  try {
    const infoboxContent = await fetchWikipediaInfobox(selectedPerson.title);
    const doc = nlp(infoboxContent);

    let weight = 0;

    if (deathDatePattern.test(infoboxContent)) {
      weight += 15;
    }

    const name = selectedPerson.name;
    const checks = [
      [`death of ${name}`, 10],
      [`${name}'s death`, 10],
      [`${name} (died|passed away)`, 9],
      [`${name} was an`, 2],
      [`after ${name}'s death`, 10],
      [`${name} is remembered for`, 8],
      [`${name} was posthumously`, 8],
    ];

    for (const [pattern, value] of checks) {
      if (doc.has(pattern)) {
        weight += value;
      }
    }

    let message = `${name} is still alive.`;
    if (weight >= 25) {
      message = `${name} has passed away.`;
    } else if (weight >= 15) {
      message = `${name} probably passed away.`;
    }

    bot.editMessageText(message, { chat_id: chatId, message_id: messageId });
  } catch (err) {
    bot.editMessageText(
      `Error fetching data: ${err.message}. Please try again later.`,
      { chat_id: chatId, message_id: messageId }
    );
  }
};

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    'Click a button below to check:',
    createInlineKeyboard()
  );
});

bot.on('callback_query', async ({ message, data }) => {
  const messageId = message.message_id;
  const chatId = message.chat.id;
  const selectedPerson = people.find((person) => person.name === data);

  if (selectedPerson) {
    await fetchDeathInfo(selectedPerson, chatId, messageId);
  }
});
