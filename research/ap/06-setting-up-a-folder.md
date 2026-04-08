# Self-containment

When I split my work into separate agents (chapter 5), I gave each one its own folder. The conference management folder has a file for every event (sponsorships, meetups, speaking engagements), a master schedule, a budget tracker, a contacts list, and a `CLAUDE.md` with instructions for how to run standups, track expenses, and evaluate sponsorship proposals. The content folder has blog drafts, video plans, podcast schedules, a LinkedIn posting queue, and a `CLAUDE.md` with instructions for the content pipeline, a morning standup checklist, and tracking what's published and what's in progress.

The agent's folder is its entire world. When I open the conference agent, it reads the files in the conference folder. It doesn't know my content folder exists. It doesn't know what I wrote yesterday in a blog post. It only knows what's in front of it.

If the agent needs something that's outside its folder, it has to go looking for it. The further it reaches, the more risk: it might read the wrong file, modify something in a folder it shouldn't touch, or waste time and context searching through irrelevant directories. When everything the agent needs is right there in its folder, it finds things faster, reads less, and stays focused.

If the folder contains files that don't belong to this job, the agent will read them, search through them, and spend tokens and attention on things that don't matter. Every irrelevant file is noise competing with the signal, the same problem from chapter 5, just at the file level instead of the instruction level.

This is the third engineering principle: **self-containment**. Everything the agent needs must be in its folder, and nothing else. The folder bundles the data (working files) with the instructions that operate on it (`CLAUDE.md`). In software engineering, this is called [encapsulation](https://en.wikipedia.org/wiki/Encapsulation_(computer_programming)).

The agent's memory belongs in the folder too.

There's a film called Memento where the main character has no long-term memory. Every morning he wakes up with no idea what happened yesterday. So he tattoos the important things on his body. Without them, he starts from zero.

The agent is the same. The files in the folder are its tattoos. If something important happened during a session and you didn't save it to a file, it's gone tomorrow. The conversation disappears when the session ends. Only the files survive.

So the tattoos need to be maintained. Claude Code has its own automatic memory system, but I keep a `MEMORY.md` file right in the agent's folder. At the end of each session, the agent appends what happened: what was done, what changed, what's still in progress. At the start of the next session, the agent reads it and picks up where we left off. I can open the file anytime, see exactly what the agent knows, and fix anything that's wrong or outdated. The automatic memory system works too, but it lives outside the folder. When the memory is right next to the working files, you see it every time you look at the folder. When it's somewhere else, you forget it exists.

The instruction in my `CLAUDE.md` is simple:

> **End-of-session routine:** Update `MEMORY.md` in this folder with what was done, decisions made, and what's next. Append, don't rewrite.

