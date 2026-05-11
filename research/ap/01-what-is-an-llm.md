# What is an LLM

A large language model (LLM) is a program that takes text as input and generates text as the output. The LLM has been trained on enormous amounts of written material and has learned statistical patterns in how language is structured. You give it text, and it uses these patterns to generate a response, building it one token at a time. A token is roughly a word or a piece of a word. Each token is chosen based on your input, what it has already generated so far, and everything it absorbed during training.

OpenAI LLMs run on their powerful hardware, and ChatGPT app runs on your machine, sending your requests to LLM and showing you the generated output.

The LLM knows nothing and remembers nothing. It is completely stateless. When you use ChatGPT, the chat app keeps your conversation history, not the LLM. Each time you send a message, it assembles the **entire conversation** and sends it to the LLM as **one input**. The LLM processes this from scratch, generates a response, and retains nothing. What feels like a flowing conversation is the application feeding the LLM a bigger input each time. Between chats, nothing carries over.

Every new chat starts with an empty input. You've been there: re-explaining what you're working on, copying your text in again, repeating the same instructions.

So naturally, you try to keep everything in one long chat. Why start over if you can keep going? But the longer the chat gets, the worse the LLM behaves. It follows your instructions at first, then twenty messages in, it stops. It formats things wrong. It ignores what you told it. It feels like it stopped listening, or started _hallucinating_.

However, there are no hallucinations, just a few inherent features of any LLM:

1. **Non-determinism.** The generation process involves randomness. The same question _always_ produces different answers: different formats, different levels of detail, even different facts.

![Same question, two different responses from ChatGPT](img/non-determinism.jpg)

The LLM has no concept of correct or incorrect. It generates plausible text. Whether that text is accurate or useful is something only you can judge. When the plausible text happens to be factually wrong, people often call it hallucination.

2. **Degradation.** The LLM doesn't pay equal attention to every part of the input. The longer the input, the less precisely it processes each part. Your instructions from message 3 get buried by message 30.

3. **Truncation.** Each time you send a message, the ChatGPT app assembles your entire conversation into one input for the LLM. But the LLM can only process so much text at once. When the conversation grows beyond this so-called _context limit_, the app has to summarise older parts to fit. Like someone condensing the top half of a whiteboard into a few bullet points and erasing the rest. You don't know what was kept and what was lost.

What we call hallucination comes from non-determinism: the LLM generates plausible text, and sometimes it's not what you need. Degradation and truncation amplify the problem.

ChatGPT, Claude, Gemini, and every other chat assistant you've used has an LLM underneath. The chat interface is just a wrapper.

This is the foundation everything else builds on.

---

Next: [From chat to agent](02-from-chat-to-agent.md)