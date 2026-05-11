# Self-containment

When I split my work into separate agents (chapter 5), I gave each one its own folder. The conference management folder has a file for every event (sponsorships, meetups, speaking engagements), a master schedule, a budget tracker, a contacts list, and a `CLAUDE.md` with instructions for how to run standups, track expenses, and evaluate sponsorship proposals. The content folder has blog drafts, video plans, podcast schedules, a LinkedIn posting queue, and a `CLAUDE.md` with instructions for the content pipeline, a morning standup checklist, and tracking what's published and what's in progress.

The agent's folder is its entire world. When I open the conference agent, it reads the files in the conference folder. It doesn't know my content folder exists. It doesn't know what I wrote yesterday in a blog post. It only knows what's in front of it.

If the agent needs something that's outside its folder, it has to go looking for it. The further it reaches, the more risk: it might read the wrong file, modify something in a folder it shouldn't touch, or waste time and context searching through irrelevant directories. When everything the agent needs is right there in its folder, it finds things faster, reads less, and stays focused.

If the folder contains files that don't belong to this job, the agent will read them, search through them, and spend tokens and attention on things that don't matter. Every irrelevant file is noise competing with the signal, the same problem from chapter 5, just at the file level instead of the instruction level.

This is the third engineering principle: **self-containment**. Everything the agent needs must be in its folder, and nothing else. The folder bundles the data (working files) with the instructions that operate on it (`CLAUDE.md`). In software engineering, this is called [encapsulation](https://en.wikipedia.org/wiki/Encapsulation_(computer_programming)).


---

Previous: [One agent, one job](05-one-agent-one-job.md) | Next: [Reviewing changes](07-git.md)