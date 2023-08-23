# Telegram Bot for Checking Tyrant Vital Status

## Overview
This bot is designed for users who wish to inquire about the vital status of certain tyrants, specifically Vladimir Putin and Alexander Lukashenko. It fetches the most recent data from Wikipedia and employs the `compromise` library for natural language processing to deduce if the individual is still alive or has passed away.

## Features
- Fetches data from Wikipedia's API to obtain the most recent information about the tyrants.
- Caches the fetched data for an hour to minimize redundant requests.
- Offers an inline keyboard interface on Telegram for users to select a tyrant.
- Utilizes natural language processing to interpret the status of the tyrant based on Wikipedia's content.

## Setup and Configuration

1. Install the necessary packages:
   ```
   npm install dotenv node-telegram-bot-api compromise axios
   ```

2. Create a `.env` file in the root directory and input your Telegram bot token:
   ```
   TELEGRAM_BOT_TOKEN=YOUR_TELEGRAM_BOT_TOKEN
   ```

3. Execute the bot:
   ```
   node yourfilename.js
   ```

4. Engage with the bot on Telegram by initiating a conversation and using the `/start` command.

## Usage
- Activate the bot with the `/start` command.
- Press on the provided buttons to verify the status of a tyrant.
- The bot will retrieve the data and notify you if the tyrant is still alive, probably passed away, or has passed away.

## Note
The bot is currently tailored for Vladimir Putin and Alexander Lukashenko. The commented-out entry for Michael Jackson in the code is solely for testing purposes and is not part of the bot's main functionality.
