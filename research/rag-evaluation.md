# RAG evaluation using Ragas - A proof-of-concept

- Author: [Anupam Krishnamurthy](https://github.com/anupamck)
- Collaborators: [Vitaly Sharovatov](https://sharovatov.github.io/)
- Date: 11 September, 2025
- [Discussion thread](https://github.com/BeyondQuality/beyondquality/discussions/8)
- [Repository](https://github.com/anupamck/rag101)

## Summary
One of the most promising use-cases for Large Language Models (LLMs) is  Retrieval Augmented Generation (RAG). RAG helps LLMs handle large amounts of contextual data by helping them overcome the limitations of context stuffing by augmenting the generation capabilities of an LLM with the ability to retrieve the relevant part of a larger context to the corresponding user query. Qualifying an LLM using automated testing is a challenge, given the non-deterministic nature of their responses. To tackle this challenge, several LLM assessment frameworks are on the rise, one of which is Ragas (RAG Assessment). The aim of this research task is to build a RAG model, qualify it using Ragas as a proof-of-concept, and share the findings with the community. 

## Why conduct this research?

### How does RAG work?
Let us start by breaking down what RAG (Retrieval Augmented Generation) is. Similar to human working memory, LLMs (Large Language Models) have a limited context window. The more the context window is loaded, the more error prone an LLM's responses can be. ChatGPT currently supports 128k tokens or about 96000 words (as of 11.09.25). Despite this massive size, studies have shown that [LLM performance degrades when working with large context windows](https://arxiv.org/pdf/2307.03172). 

RAG offers an antidote to this degradation. With RAG, a large document or data source is broken down into smaller chunks. These chunks are indexed and stored in a database. When a user queries an LLM, the chunks that are most relevant to the query are retrieved from the database and inserted into an LLM's context window. The LLM then uses these retrieved chunks to formulate a response. The retrieval is done using non-LLM techniques such as semantic search. E.g., say you uploaded a high-school general science textbook to an LLM. When you ask a question related to gravitation, the specific chunks that pertain to this topic are retrieved and the LLM then uses these specific chunks to answer the question rather than the entire textbook. 

Having understood how RAG works helps us appreciate how relevant this technique can be. Several companies will benefit from building RAG models that index their internal information and offer users a chat interface to access this information. For E.g., one of my former clients, an industrial pump manufacturer, is currently implementing a RAG model to build an LLM that help customers choose the right pump for their application. 

### Qualifying a RAG model
It can be difficult to objectively qualify a RAG model. However, there are some metrics that we can use to qualify most RAG models. Examples include
- Answer Relevance: The degree to which the response provided is relevant to the user's prompt
- Faithfulness: The degree to which the model is faithful to the retrieved context while formulating the answer
- Context Relevance: The degree to which the retrieved context is relevant to the user's question

Another challenge with testing LLMs is their non-deterministic nature. Most automated software testing techniques rely on determinism for qualifying software, which makes them unsuitable for LLM testing. This challenge also persists with RAG models. 

[Ragas](https://github.com/explodinggradients/ragas) (RAG assessment) is a framework that aims to tackle these challenges. Firstly, Ragas establishes a set of objective metrics. The three metrics mentioned above (Answer Relevance, Faithfulness, Context Relevance) were were proposed and defined in a paper that announced Ragas. The framework now offers [many more metrics](https://docs.ragas.io/en/stable/concepts/metrics/) of a similar nature. Secondly, non-determinism is tackled by using another LLM as a judge. [This study](https://arxiv.org/pdf/2306.05685) found LLM-as-judge to be on par with human evaluation within its context. To evaluate the metrics, Ragas uses carefully designed prompts to have an LLM break down a response and provide pass-or-fail scores on the corresponding criteria, which are then aggregated to evaluate the metric. 

## Research objective

The objective for this research task is to build a RAG model, qualify it using Ragas, and share what we learn with the community. While building a RAG model from scratch can seem an intimidating task, it is made much easier by [beginner-friendly tutorials from LangChain](https://python.langchain.com/docs/tutorials/rag/). 
The manner in which these learnings can be shared can take the form of a repository, live-demonstrations, articles, webinars etc. We will figure this out as we go. 

## What has been done so far?

The following steps have been done
- A RAG model has been built using LangChain.
- [The 37signals Employee Handbook](https://basecamp.com/handbook) has been used as test data for the model. This information is representative of the data companies will use to build RAG models.
- Ragas assessment is included to qualify the model.
- LangSmith can be used to examine traces of the assessment.  

All of this work can be viewed in this [Jupiter Notebook](https://github.com/anupamck/rag101/blob/main/basecampHandbookRagWithRagas.ipynb) within the project's repository. 

## Observations

Overall, the task has met its objectives. We were able to build a PoC, and here are a few of our learnings
- Building a custom RAG model offers several levers to customise its behaviour. These include:
	- The choice of retrieval algorithm and its parameters
	- Chunking strategy (choosing how a datasource is to be split up)
	- The choice of embeddings (to store these chunks in a vector DB)
	- The choice of vector DB 
	
 	This control is likely to be crucial to _tame_ a RAG model to behave in the manner that it is intended to. 
- Ragas offer metrics that either rely solely on LLM evaluation or combine this evaluation with human generated references.
- These are still early days in the field. We were able to contribute [2 PRs](https://github.com/explodinggradients/ragas/commits?author=anupamck) to fix errors in Ragas documentation.
- A bug report we filed led to the discovery of a [security vulnerability in LangChain](https://github.com/langchain-ai/langchain/issues/32709).
- Anybody who gets involved now can easily contribute to this field. 
- The Ragas metrics are intended to provide objective feedback on the model's behaviour. While this is valuable, a RAG model's quality will continue to rely on subjective human judgement for factors such as whether the model
  - retrieves the most appropriate sources to answer a given question
  - formulates answers in a manner that is compelling for the reader
  
  Therefore, such automated evaluations need to complement human testing to quality a RAG model, rather than replace it. 

## Exploratory Testing Results (WIP)

- The Ragas evaluation is somewhat unstable. When I run the entire Jupyter notebook code in one shot, the kernel crashes and restarts. However, if I pause one step before the evaluation and then run it, it works fine. This appears to be some resource management issue that is hard to debug. 
- Ragas evaluation (as of v0.3.5) currently doesn't work with models that use reasoning mode (like gpt-5), since these models don't expose temperate as a parameter that can be modified. Ragas pins temperature values down (temperature=0 or temperature=0.1) to get more stable, and less stochastic outputs.  

## Next Steps

- Perform exploratory testing with Ragas to see what the framework can do well, and find out its limitations
- Compare and contrast different chunking strategies, to see their effect on the outputs
  - Broad chunking, with each page being its own chunk
  - Narrow chunking, with each heading being its own chunk
  - Random chunking, with each chunk being a certain size, with overlaps to adjacent chunks
  
We aim to share these findings as artifacts, one of which is this article. Other promising avenues are live-demoes and video recordings. 


## References / Recommended Reading
- [A Practitioners Guide to Retrieval Augmented Generation (RAG)](https://cameronrwolfe.substack.com/p/a-practitioners-guide-to-retrieval)
- [Ragas: Automated Evaluation of Retrieval Augmented Generation](https://arxiv.org/abs/2309.15217)
- [Ragas Repository](https://github.com/explodinggradients/ragas)
- [Ragas Documentation](https://docs.ragas.io/en/stable/)
- [Build a Retrieval Augmented Generation (RAG) App](https://python.langchain.com/docs/tutorials/rag/)
- [Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena](https://arxiv.org/pdf/2306.05685)
