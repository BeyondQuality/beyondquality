# From chat to agent

Another problem with using ChatGPT is that in order to get help with a document, you copy its contents into ChatGPT, read the response, and paste the useful parts back. Another pass means another round of copy, read, paste. You're the carrier pigeon between the AI and your work.

This is exactly why agents emerged. An agent is a program built around an LLM, with tools to read your files, edit them, and run commands. Claude Code is one such agent.

![Claude Code editing a file directly](img/agent-editing-file.png)

In this example, I was collaborating with Claude Code on an article and asked it to change a line of text. Claude Code read the file, sent the contents along with my request to Anthropic's LLM. The LLM's response included an instruction to use the edit tool: "replace this line with that line". Claude Code executed the edit on my machine and showed the result.

This is how I write articles with Claude: refining them paragraph by paragraph. We discuss changes, the agent edits the file directly, and the article on disk is always the latest version.

The agent can also search across your files.

![Claude Code searching across files](img/grep.png)

Here I asked how many times a specific term is mentioned across conference and meetup files. You can see "Searched for 1 pattern" on the screenshot. Just one line, but a lot happened behind it:

1. Claude Code assembled an input: my question, the conversation so far, and detailed descriptions of its tools: search, edit, read, run commands, fetch web pages, and others (what each one does and what parameters it accepts).
2. Claude Code sent this input to Anthropic's LLM.
3. The LLM generated a response that included an instruction to use the search tool, with parameters inferred from my question: the term to search for, a file pattern to match, how to do the matching.
4. Claude Code parsed this response and executed the search on my machine.
5. Claude Code sent the search results back to the LLM.
6. The LLM generated a summary of the results.

With ChatGPT, you'd paste the files into the chat, and the LLM on OpenAI's servers would try to find the matches within the text you gave it. With Claude Code, a real search tool runs on your computer, and the agent with the LLM are just building the instructions for the search tool. Every match found, none missed, none invented.

The tool Claude Code used to do file search is [ripgrep](https://github.com/burntsushi/ripgrep), which is just a little program on your computer. You could run that search yourself, without Claude Code at all:

![Running the same search manually with ripgrep](img/grep-manual.png)

You'd just need to figure out the right parameters: the search term, which files to look in, how to match. That's what the LLM did. Claude Code sent your question to the LLM, the LLM figured out the parameters, and Claude Code ran ripgrep with them.

Same with the edit. You could open the file and change the line yourself. The LLM figured out what to replace and with what, and Claude Code made the change. In both cases, the LLM is the helper that translates what you said into specific instructions. The tools do the actual work.

The same back-and-forth applies to running commands. I had two vertical screenshots from my phone and needed to combine them into one image. Instead of looking up the right command, I described what I needed. The LLM figured out that ImageMagick (just another little program on my computer) could do it, composed the command, and Claude Code ran it on my machine.

![Claude Code combining two screenshots using ImageMagick](img/imagemagick.png)

Search, edit, run commands: these are just a few of Claude Code's tools. It can also fetch web pages, read PDFs, create files, run scripts.

With ChatGPT, the LLM does everything. You paste your files in, and the LLM produces a response. There is no file search, no file editing, no commands running on your machine. Everything is text generation, with all the problems from the previous chapter: non-determinism, degradation, the risk of plausible but wrong results. With an agent, the LLM only generates the instructions: which tool to call and with what parameters. The actual work is done by programs that either succeed or fail, with nothing generated or guessed. The LLM is still non-deterministic, but the surface area where that matters shrinks to a thin layer of coordination.

---

Previous: [What is an LLM](01-what-is-an-llm.md) | Next: [A real workflow](03-lil-demo.md)