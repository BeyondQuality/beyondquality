# Using third-party skills

In November 2018, a user opened a [GitHub issue](https://github.com/dominictarr/event-stream/issues/116) on [`event-stream`](https://github.com/dominictarr/event-stream), an npm package downloaded around two million times a week. The issue asked a simple question: why does this package suddenly include hidden code that targets Bitcoin wallets?

The story went like this. Two months earlier, a stranger using the handle `right9ctrl` had emailed `event-stream`'s original maintainer, Dominic Tarr, asking to help maintain the package. Tarr granted publish rights. He'd lost interest in the package years ago and was glad someone wanted to take it on. The new maintainer published a new version with scrambled code hidden inside, designed to be unreadable to anyone who opened the file. The code activated only when running inside one specific application: the Copay Bitcoin wallet. On any other project, it did nothing. On Copay, it stole the wallet's keys.

The compromise ran undetected for two and a half months.

Tarr's later [public statement](https://gist.github.com/dominictarr/9fd9c1024c94592bc7268d36b8d83b3a) put the failure plainly: *"Open source is driven by sharing! It's great! It worked really well before bitcoin got popular"*.

Anyone could have opened the file, decoded the scrambled section, and noticed what it did. In principle, the source was right there. In practice, nobody looked. There is no review process at the npm publishing gate. Anyone with publish rights pushes a new version straight to millions of users, with no audit, no required test, no second pair of eyes. That was true in 2018, and it is largely still true today.

The same situation now applies to skills. Authors publish, users import, nobody verifies. Skills add one big new problem on top.

When you install an npm package, what you install is fixed: the same code on every machine. Differences between machines do exist (different operating systems, different versions, different libraries), but they can be tested for, found, and fixed. With skills, none of that holds. The same skill, in the same session, can produce different output from one run to the next, because the model interpreting it responds to whatever else is in the context: the model version ([chapter 11](11-skills-not-instructions.md)), the session length ([chapter 1](01-what-is-an-llm.md)), the rest of what you've been doing ([chapter 5](05-one-agent-one-job.md)). A skill that produces correct output on the author's machine today may produce nonsense on yours tomorrow.

## Two problems, two mitigations

This is the eighth engineering principle: **practise supply-chain hygiene**. Every dependency you import is a trust decision. Software engineering has known this for decades, and it has identified two distinct failure modes in any open-source supply chain.

**Malicious actors.** Event-stream's `right9ctrl` is the textbook case. The mitigation that has emerged is third-party review and certification: someone who is neither the author nor the user inspects each release and either approves or rejects it. Apple's App Store is the everyday example. Every app and every update must pass a mandatory review for malware and policy compliance before reaching any user. The process isn't perfect, and malware does occasionally slip through, but the gate is real, and most attempts are caught at the door.

**Degradation.** A library that worked yesterday stops working today, because new versions of dependencies introduce regressions, compilers update, operating systems change. Without protection, a stable system slowly rots. The mitigation is a test harness you can re-run on demand. SQLite is the gold standard: [the project ships with test code roughly 590 times the size of the source code](https://sqlite.org/testing.html) and achieves 100% branch coverage on every release. Every release is verified against the harness, and so is every environment SQLite gets deployed into. If something breaks, the harness catches it before users do.

For each problem, software engineering has built a response. For each, the skill ecosystem currently has nothing.

## Where skills sit

There are no widely-known malicious skills today, but that may be because nobody is looking. The skills ecosystem has none of the audit infrastructure that exposes npm attacks: no advisory databases, no automated scanners, no third-party reviewers. Attacks could already be happening, and nobody would surface them. And nothing in the publication process would stop the next `right9ctrl` from arriving.

**upd**: I was wrong about the first sentence above. Academic researchers have already documented malicious skills in production marketplaces; see [the corrections file](12-using-skills-correction.md).

Degradation is already the dominant problem. The model that interprets the skill keeps changing, your context keeps changing, and the imported skill follows whatever guardrails its author thought to put in, which is usually very few. Without a harness, neither the author nor you can prove the skill works on your setup, and neither of you can detect when it stops working. The skill will quietly start producing wrong numbers, wrong dates, wrong tone. You won't know the import is the cause.

Nobody ships skills with an evaluation harness. Some authors test their skills informally, on their own input, on whatever model they have at the time, but that is one trial run captured in the author's memory, not verification you could run yourself.

## What to do

So how should you actually use someone else's skills? Read them, learn from them, then build your own.

The natural-language readability that makes skills unreliable for the LLM makes them perfectly accessible to you. The good ones show you problems you hadn't thought to solve, prompt structures you hadn't tried, ways of decomposing a procedure that hadn't occurred to you. Take what is useful, copy the idea (not the file) into your own repo, write your own version, and apply the principles from the previous chapters: one agent one job ([chapter 5](05-one-agent-one-job.md)), self-contained ([chapter 6](06-setting-up-a-folder.md)), reviewable ([chapter 7](07-git.md)), scoped to one task ([chapter 8](08-sessions.md)), least privilege ([chapter 9](09-risks.md)), surface-reduced ([chapter 11](11-skills-not-instructions.md)).

Building a skill is fast; building one that holds up under non-determinism is what this book has been about.

Evaluation harnesses for skills are a big enough topic that I'll come back to them in a later chapter.

The alternative is to install a stranger's package and hope. With event-stream, the silent compromise ran for two and a half months before someone filed a GitHub issue. With an imported skill, the failure looks like ordinary LLM mistakes: a wrong number here, a misformatted output there, a procedure that worked last week and now doesn't. You won't file an issue; you'll quietly stop trusting the agent, and you won't know why.

---

Previous: [Skills and scripts](11-skills-not-instructions.md) | Next: [Hooks and linters](13-hooks.md)