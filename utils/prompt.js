"use strict";
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_APIKEY,
});
function extractToolNames(response) {
  const toolNameRegex = /\d+\.\s([^:]+)/g;
  const matches = response.match(toolNameRegex);

  if (matches) {
    return matches.map((match) => match.replace(/\d+\.\s/, "").trim());
  } else {
    return [];
  }
}

exports.suggestTool = async (prompt) => {
  const chatCompletion = await openai.chat.completions.create({
    messages: [
      {
        role: "user",
        content: "I want AI tool list for" + prompt,
      },
    ],
    model: "gpt-3.5-turbo",
  });

  console.log(chatCompletion.choices);
  const assistantResponse = chatCompletion.choices[0].message.content;
  const toolNames = extractToolNames(assistantResponse);
  return toolNames;
};
