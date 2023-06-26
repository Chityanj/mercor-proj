import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function handler(req, res) {
  try {
    const chatCompletion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: req.query.transcription }],
    });
    console.log(chatCompletion.data.choices[0].message.content);
    res.status(200).json(chatCompletion.data.choices[0].message.content.trim());
  } catch (error) {
    console.error("Error processing chat completion:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
}
