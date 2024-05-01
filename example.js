// ================================================================================
// == AWS Bedrock Example: Invoke a Model with a Streamed or Unstreamed Response ==
// ================================================================================

// ---------------------------------------------------------------------
// -- import environment variables from .env file or define them here --
// ---------------------------------------------------------------------
import dotenv from 'dotenv';
dotenv.config();
const AWS_REGION = process.env.AWS_REGION;
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const LLM_MAX_GEN_TOKENS = parseInt(process.env.LLM_MAX_GEN_TOKENS);
const LLM_TEMPERATURE = parseFloat(process.env.LLM_TEMPERATURE);
const LLM_TOP_P = parseFloat(process.env.LLM_TOP_P);

// -------------------------------------------------------
// -- import bedrockTunnel function from bedrock-tunnel --
// -------------------------------------------------------
import { bedrockTunnel } from "bedrock-tunnel";

// -----------------------------------------------
// -- example prompt in `messages` array format --
// -----------------------------------------------
const messages = [
    {
        role: "system",
        content: "You are a helpful AI assistant that follows instructions extremely well. Answer the user questions accurately. Think step by step before answering the question. You will get a $100 tip if you provide the correct answer.",
    },
    {
        role: "user",
        content: "Describe why openai api standard used by lots of serverless LLM api providers is better than aws bedrock invoke api offered by aws bedrock. Limit your response to five sentences.",
    },
    {
        role: "assistant",
        content: "",
    },
];


// ---------------------------------------------------
// -- create an object to hold your AWS credentials --
// ---------------------------------------------------
const awsCreds = {
    region: AWS_REGION,
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
};
// ----------------------------------------------------------------------
// -- create an object that copies your openai chat completions object --
// ----------------------------------------------------------------------
const openaiChatCompletionsCreateObject = {
    "messages": messages,
    "model": "Llama-3-8b",
    "max_tokens": LLM_MAX_GEN_TOKENS,
    "stream": true,
    "temperature": LLM_TEMPERATURE,
    "top_p": LLM_TOP_P,
};


// ------------------------------------------------------------
// -- invoke the streamed or unstreamed bedrock api response --
// ------------------------------------------------------------
// create a variable to hold the complete response
let completeResponse = "";
// streamed call
if (openaiChatCompletionsCreateObject.stream) {
    for await (const chunk of bedrockTunnel(awsCreds, openaiChatCompletionsCreateObject)) {
        completeResponse += chunk;
        // ---------------------------------------------------
        // -- each chunk is streamed as it is received here --
        // ---------------------------------------------------
        process.stdout.write(chunk); // ⇠ do stuff with the streamed chunk
    }
} else { // unstreamed call
    const response = await bedrockTunnel(awsCreds, openaiChatCompletionsCreateObject);
    for await (const data of response) {
        const jsonString = new TextDecoder().decode(data.body);
        const jsonResponse = JSON.parse(jsonString);
        completeResponse += jsonResponse.generation;
    }
    // ----------------------------------------------------
    // -- unstreamed complete response is available here --
    // ----------------------------------------------------
    console.log(`\n\completeResponse:\n${completeResponse}\n`); // ⇠ do stuff with the complete response
}
// console.log(`\n\completeResponse:\n${completeResponse}\n`); // ⇠ optional do stuff with the complete response returned from the API reguardless of stream or not