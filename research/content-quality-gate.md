# Applying QA Thinking to Content: Building a Quality Gate with RAG

- Author: [Vitaly Sharovatov](https://sharovatov.github.io/)
- Collaborators: [Anupam Krishnamurthy](https://github.com/anupamck)
- Date: March 2026
- [Discussion thread](https://github.com/BeyondQuality/beyondquality/discussions/27)
- [Repository](https://github.com/sharovatov/rag_content_pipeline)
- Building on: [Anupam's RAG evaluation research](https://beyondquality.org/research/rag-evaluation)

## The problem

When a company publishes content — blog posts, help center articles, LinkedIn posts, documentation — every new piece operates on top of everything published before. If a new article contradicts something from six months ago, readers notice. It confuses people and erodes trust.

To me, this looks like a classical regression, just in content rather than in code.

In software, we stopped relying on memory long ago. It's usually economically unjustified to expect someone to remember every behavior across the entire system, so we write automated tests or store test cases in a TMS. But with content, things are still "manual": someone reads a draft, tries to recall if it contradicts anything, and approves it.

A company with hundreds of published pieces has the same problem as a codebase with no tests: changes go out unchecked against existing behavior.

### The bottleneck problem

There's a deeper issue than just "it's hard to remember". Making a human the quality gate for content consistency creates a bottleneck that Little's Law tells us will degrade the entire content pipeline.

As content volume grows — more authors, more channels, higher publishing cadence — the queue in front of the reviewer grows. Either:

1. The pipeline slows down (less content gets published),
2. The reviewer rushes and misses contradictions (quality drops), or
3. You add more reviewers, each of whom needs encyclopedic knowledge of the entire corpus (cost scales linearly with volume).

None of these scale. I was spending up to half a day every week reviewing blog posts and marketing copy for consistency, and still missed things sometimes. I knew that if we wanted more content, I'd be the bottleneck.

## The idea

What if we could build the equivalent of a regression test suite for content? Two checks:

1. **Consistency check.** Does this new piece contradict anything we've already published?
2. **Voice & tone check.** Does it follow the brand guidelines?

Neither needs to be perfect. If it catches 90% of issues, that's already a massive improvement over manual memory. And critically, it removes the human from the critical path — the expert builds and maintains the system, but the actual checking is automated and doesn't create a queue.

## Architecture decisions

### Decision 1: Why RAG, not just feed everything to the LLM?

The obvious approach: dump the entire content corpus alongside the new draft into a prompt and ask the LLM to find contradictions.

This doesn't work:
- **Context window limits.** Hundreds of articles won't fit.
- **Cost.** Even if they fit, you're paying for millions of tokens on every check.
- **Precision.** The more context you give an LLM, the worse it gets at finding specific contradictions. Signal drowns in noise.

RAG solves this by retrieving only the relevant chunks. You ask: "given this paragraph, what have we previously said about the same topic?" and get back just the pieces that matter.

### Decision 2: Per-paragraph verification, not whole-document

I could have fed the entire draft to the LLM and asked "does this contradict our corpus?". But that's like writing one test for an entire feature — when it fails, it's hard to know where.

Instead, the verification tool works per paragraph. The retrieval step splits the text and queries the vector store separately for each paragraph, deduplicating chunks along the way. This ensures that every topic mentioned in the draft gets its own retrieval pass — a draft covering three different topics will retrieve context for all three, not just whichever topic the embedding thinks is "most similar".

The retrieved chunks then feed into the two-stage verification process (see Decision 3 below), where each claim is categorized as **supported**, **contradicted**, or **not covered**. We know exactly which claim has a problem, and we can see which corpus chunks it was checked against. When something is flagged, we have the context to decide if it's a real issue.

### Decision 3: Two-stage claim verification

The initial approach put the full text and the context into a single prompt and asked the LLM to decompose claims and verify them at once. This had a subtle failure mode: the LLM would confuse context statements for claims when both lived in the same prompt.

Anupam Krishnamurthy identified this and proposed splitting verification into two LLM calls:

1. **Decompose**: take the input text and extract individual claims.
2. **Verify**: take those claims and check each one against the retrieved context.

Both prompts include few-shot examples to ground the output format. The structured output is parsed through Pydantic models (`Claim`, `VerificationResponse`) instead of raw JSON parsing, which gives us type safety and validation.

This separation eliminates the confusion between claims and context, and makes the verification more reliable.

### Decision 4: Voice & tone check gets a completely different architecture

For claim verification, RAG is essential — you need to retrieve relevant prior content. For voice & tone, RAG would add noise. Brand guidelines are a single document; there's nothing to retrieve.

So the voice checker is deliberately simple: one LLM call, no embeddings, no vector store. Guidelines in, article in, violations out. Each issue shows the offending passage, which guideline it violates, an explanation, and a suggested rewrite. To me, this looks like a linter.

Choosing the right architecture for each problem matters. RAG is a tool, not a default.

### Decision 5: Chunk size, overlap, and retrieval count

These tuning parameters directly affect what gets caught:

- **Chunk size (400-800 tokens):** Too small and you lose context. Too large and you dilute relevance. This range keeps chunks roughly paragraph-sized — large enough to carry a coherent claim, small enough to stay focused.
- **Overlap (80 tokens):** Claims often span paragraph boundaries. Overlap prevents them from being split across chunks and lost.
- **k (retrieval count, default 8):** How many chunks to retrieve per query. Too few and you miss relevant context. Too many and you give the LLM contradictory noise.

These are the current best values I've found. Part of the ongoing work is testing sensitivity to these parameters.

## Evaluation

You built a RAG. How do you know it works?

Even after expert review, the corpus can still have inconsistencies. Retrieval might miss relevant chunks. The LLM might ignore the chunks and hallucinate anyway. These problems are only catchable through systematic evaluation. Without evaluation, you're hoping, not testing.

We use [RAGAS](https://github.com/explodinggradients/ragas) (RAG Assessment) — an LLM-as-judge framework. A separate LLM evaluates the RAG's output on two metrics:

- **Faithfulness** — did the LLM stick to the retrieved context? (Detects hallucination)
- **Context recall** — did retrieval find the right chunks? (Detects retrieval gaps)

This separation helps diagnose *what* went wrong: low faithfulness means the LLM hallucinated; low context recall means the retrieval missed relevant content.

### Building the evaluation corpus

A RAGAS eval needs ground truths — known facts from the corpus to test against. I tried using LLMs (Cursor, ChatGPT, Claude) to extract key ideas from blog posts. All gave very inconsistent results — the now classical "summarization problem". Had to do it manually: read each article, declare facts and ideas. Half a day for 106 articles, resulting in ~420 ground truths, reduced to 240 after filtering.

The filtering matters. Not every key idea makes a good eval question. I dropped 18% for being self-evident, common knowledge, redundant, or too generic.

### The question design challenge

How do you write eval questions? We went through three iterations:

1. **Quiz questions** — "What is the 5 whys method and where did it originate?" — bad because they imply the person already knows the answer. Nobody types this into a RAG.
2. **Scenario-based questions** — "We keep finding bugs after release. How do we catch them earlier?" — better but still contrived and corporate. Some questions led toward the answer.
3. **Natural questions from someone who genuinely doesn't know** — "how much does bad quality cost?", "separate QA department or QA within a product team?", "software passed all tests but business rejected it — why?" — this is what worked.

The principles we arrived at:
- Simple language. "Bad quality" not "poor software quality economically".
- Short. No scenario preamble.
- Don't lead toward the answer.
- Skip obvious ideas — nobody asks a RAG "does high turnover damage quality?".
- Genuine uncertainty — the asker plausibly doesn't know which way the answer goes.

I also noticed that testing content "after" it's built has the same problem as testing software "after" it's built: it's extremely hard to find gaps after the fact, and you're inclined to write tests that just pass. Proper "after" testing is only feasible by real users, or you should test before development.

## Results

240 questions across 106 articles, evaluated with RAGAS using gpt-4o-mini.

| Metric | Score |
|--------|-------|
| Faithfulness | 0.908 |
| Context Recall | 0.842 |

### Faithfulness

109 out of 240 questions (45%) got perfect 1.00 faithfulness. 17 questions scored below 0.70.

The pattern: low faithfulness correlates with broad, open-ended questions where the LLM "helps" by adding its own knowledge beyond the retrieved chunks. "Should we follow the test pyramid?" scored 0.00 — the LLM answered from general knowledge, not from the corpus. This is the hallucination problem: the LLM knows the topic and fills in rather than sticking to what was retrieved.

### Context recall

159 out of 240 questions (66%) got perfect 1.00 context recall. 9 questions scored 0.00 — the RAG retrieved chunks but completely missed the relevant article content.

The pattern: low context recall points to chunking or embedding issues for specific articles. The content exists in the corpus, but the retrieval didn't find it.

Both signals are useful: faithfulness issues point to where the RAG prompt needs to be more constrained. Context recall issues point to where chunking or embedding needs improvement.

### Prompt tightening

After seeing the faithfulness results, we tightened the RAG prompt: "answer ONLY from the context below", explicit fallback to "not covered", no gap-filling. This was confirmed by a colleague who had independently noticed the LLM filling in blanks when using the tool.

### Cost and time

| Component | Tokens in | Tokens out | Cost |
|-----------|-----------|------------|------|
| RAGAS judge (720 calls) | 1,528,441 | 375,835 | $0.45 |
| RAG answers (240 calls) | ~480,000 | ~120,000 | $0.14 |
| Embeddings | negligible | — | ~$0.00 |
| **Total** | | | **$0.60** |

Total time: ~25 minutes (15 min RAG answer generation + 10.5 min RAGAS judge).

I estimated $0.58 beforehand by extrapolating from a pilot run — off by only 3.4%. Each question costs exactly 3 LLM calls and ~9.5k tokens for the RAGAS evaluation.

### RAGAS internals: what we learned

Each RAGAS evaluation question requires 3 LLM calls:

| Step | Tokens In | Tokens Out | Wall Time |
|------|-----------|------------|-----------|
| Faithfulness: claim extraction | ~610 | ~265 | ~7s |
| Faithfulness: NLI verification | ~3,731 | ~178 | ~7s |
| Context recall: classification | ~3,885 | ~878 | ~27s |
| **Total per question** | **~8,226** | **~1,321** | **~40s** |

We also found three bugs in how RAGAS v0.4.3 was being called. Without an explicit `llm=` parameter, RAGAS silently uses its own internal client, ignoring your model configuration. Combined with `raise_exceptions=False` (the default), errors become silent NaN scores. These bugs were invisible until we added instrumentation — a custom callback handler that intercepts every LLM call and logs prompts, token counts, and timing.

## The HHEM experiment

The NLI verification step (call #2) can potentially be replaced with [HHEM-2.1-Open](https://huggingface.co/vectara/hallucination_evaluation_model), a local T5 classifier from Vectara trained specifically for hallucination detection.

HHEM matches or outperforms GPT-4 on hallucination detection benchmarks:

| Benchmark | HHEM-2.1-Open | GPT-4 (zero-shot) |
|-----------|---------------|---------------------|
| AggreFact-SOTA | **76.6%** | 73.8% |
| RAGTruth-QA | **74.3%** | 74.1% |
| RAGTruth-Summ | **64.4%** | 62.6% |

The appeal: equal or better quality, deterministic (same input = same score), and free.

The reality on our hardware (M3 Air 16GB): +6.2 GB memory spike on the shortest question, token overflow warning (1,922 tokens into a 512-token model), and unknown behavior on longer contexts. The economics don't justify dedicated hardware — the entire 240-question eval costs $0.60 per run.

HHEM's determinism is genuinely valuable for CI/regression testing of RAG quality, where you need reproducible scores. I'm getting a Mac Mini M4 Pro with 64GB RAM by the end of March — that should remove the memory constraint and let me properly test HHEM on longer contexts. If it holds up, it could replace the LLM-based NLI step entirely. For now, we stay with all-LLM faithfulness.

## The finding I didn't expect: the quality gate checked itself

I set out to build a tool that verifies new content against existing content. To evaluate whether the tool works, I wrote eval questions. Running those evaluations didn't just score the pipeline — it revealed gaps in the existing content corpus.

Low context recall scores pointed to articles that weren't well-represented in the RAG. But some of those scores pointed to content that was genuinely missing or inconsistent in the corpus itself.

The mere act of writing tests revealed bugs I didn't know existed. The verification tool became a content audit tool.

This mirrors what we see in software development: writing tests exposes existing defects, not just future regressions.

## What works, what doesn't, and what I don't know yet

**Works well:**
- Catching direct contradictions where the corpus has clear statements on the same topic.
- Voice & tone flags are actionable — specific passages with specific violations.
- Per-paragraph granularity makes results reviewable, not just a pass/fail.
- The two-stage claim decomposition eliminates the claim/context confusion from the original single-prompt approach.

**Known limitations:**
- "Not covered" is the most common result, and it's the least useful — it might mean the topic is genuinely new, or it might mean retrieval missed relevant chunks.
- RAG is great for settled, reference-grade content (published articles, help docs, guidelines, standards). It's the wrong tool for live workflows (tasks, conversations, in-progress decisions).
- Voice & tone consistency across runs needs measurement. Same article, same model, ten runs — are we getting the same issues?

**Open questions:**
- How sensitive are results to model choice? Currently the default is gpt-4o-mini.
- How do you build ground truth for evaluating the evaluator? I need articles with known issues to measure precision and recall of the pipeline itself.
- At what corpus size does this approach stop scaling?

## What's next

- **MCP server.** Some colleagues prefer using the tool through their existing editor/IDE workflow rather than the terminal. Building an MCP server to make the verification accessible without CLI.
- **TDD for content.** Writing the ground truths and eval questions before writing the content, not after. Same principle as test-driven development: define what the content should say, then write it.
- **Expanding the evaluation.** Growing the eval dataset to cover more sources beyond blog content. Each content team can own their eval file.
- **Sensitivity testing.** Measuring how results change with different chunk sizes, overlap, k values, and model choices.

## References

- [Anupam Krishnamurthy — RAG evaluation using Ragas: A proof-of-concept](https://beyondquality.org/research/rag-evaluation)
- [RAGAS: Automated Evaluation of Retrieval Augmented Generation](https://arxiv.org/abs/2309.15217)
- [RAGAS documentation](https://docs.ragas.io/)
- [HHEM-2.1-Open model card](https://huggingface.co/vectara/hallucination_evaluation_model)
- [LLM performance degrades with large context windows](https://arxiv.org/pdf/2307.03172)
- [LLM-as-judge is on par with human evaluation](https://arxiv.org/pdf/2306.05685)
- [Repository: content-quality-gate](https://github.com/sharovatov/rag_content_pipeline)
