require('dotenv').config();

const groq = require('./groq');

async function testGroq() {
  try {
    const response = await groq.chat.completions.create({
      model: 'openai/gpt-oss-20b',
      messages: [
        {
          role: 'user',
          content: 'Say hello to KisanConnect in one sentence.'
        }
      ]
    });

    console.log(response.choices[0].message.content);
  } catch (error) {
    console.error('Groq Error:', error.message);
  }
}

testGroq();