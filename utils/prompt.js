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
    // Concatenate all prompts into a single string
    const combinedPrompts = prompts.join(" ");

    // Create a single API request for all prompts
    const chatCompletion = await openai.chat.completions.create({
      messages: [
        {
          role: "user",
          content: `What are the best Ai tools for doing the following task:\n\n ${combinedPrompts}`,
        },
      ],
      model: "gpt-3.5-turbo",
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
