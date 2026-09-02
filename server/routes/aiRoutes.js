const express = require('express');
const router = express.Router();
const groq = require('../groq');

router.post('/generate-listing', async (req, res) => {
  try {
    const { input } = req.body;

    if (!input) {
      return res.status(400).json({
        success: false,
        message: 'Listing information is required'
      });
    }

    const response = await groq.chat.completions.create({
      model: 'openai/gpt-oss-20b',
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful AI assistant for KisanConnect, a farmer-to-buyer agricultural marketplace in India. Convert a farmer’s simple Hindi or English description into a clear marketplace product listing.'
        },
        {
          role: 'user',
          content: `Create a professional product listing from this farmer information:\n\n${input}`
        }
      ],
      temperature: 0.4,
      max_tokens: 500
    });

    const listing = response.choices[0].message.content;

    res.json({
      success: true,
      listing
    });
  } catch (error) {
    console.error('[Groq Listing Error]', error);

    res.status(500).json({
      success: false,
      message: 'Failed to generate AI listing'
    });
  }
});

module.exports = router;