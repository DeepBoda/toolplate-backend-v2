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

exports.suggestTool = async (prompts) => {
  try {
    // Create a single API request for all prompts
    const chatCompletion = await openai.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that suggests AI tools.",
        },
        {
          role: "user",
          content: `Give me the best Ai tools for following prompt: ${prompts} ?`,
        },
      ],
      model: "gpt-4-turbo-preview",
    });

    // Extract tool names from the response
    const toolNames = extractToolNames(
      chatCompletion.choices[0].message.content
    );

    return toolNames;
  } catch (error) {
    console.error("Error suggesting AI tools:", error);
    throw error;
  }
};
