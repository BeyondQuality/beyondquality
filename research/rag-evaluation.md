# RAG evaluation using RAGAS - A proof-of-concept

- Author: [Anupam Krishnamurthy](https://github.com/anupamck)
- Collaborators: [Vitaly Sharovatov](https://sharovatov.github.io/)
- Date: 11 September 2025
- [Discussion thread](https://github.com/BeyondQuality/beyondquality/discussions/8)
- [Repository](https://github.com/anupamck/rag101)

## Abstract
One of the most promising use-cases for Large Langauge Models (LLMs) is  Retrieval Augmented Generation (RAG). RAG helps LLMs handle large amounts of contextual data by helping them overcome the limitations of context stuffing by augmenting the generation capabilities of an LLM with the ability to retrieve the relevant part of a larger context to the corresponding user query. Qualifying an LLM using automated testing is a challenge, given the non-deterministic nature of their responses. To tackle this challenge, several LLM assessment frameworks are on the rise, one of which is RAGAS (RAG Assessment). The aim of this research task is to build a RAG model, qualify it using RAGAS as a proof-of-concept, and share the findings with the community. 

## Introduction

### How does RAG work?
Let us start by breaking down what RAG (Retrieval Augmented Generation) is. Similar to human working memory, LLMs (Lange Language Models) have a limited context window. The more the context window is loaded, the more error prone an LLM's responses can be. ChatGPT currently supports 128k tokens or about 96000 words (as of 11.09.25). Despite this massive size, studies have shown that [LLM performance degrades when working with large context windows](https://arxiv.org/pdf/2307.03172). 

RAG offers an antidote to this degradation. With RAG, a large document or data source is broken down into smaller chunks. These chunks are indexed and stored in a database. When a user queries an LLM, the chunks that are most relevant to the query are retrieved from the databased and inserted into an LLM's context window. The LLM then uses these retrieved chunks to formulate a response. The retrieval is done using more 'old-school' non-LLM techniques such as semantic search. E.g., say you uploaded a high-school general science textbook to an LLM. When you ask a question related to gravitation, the specific chunks that pertain to this topic are retrieved and the LLM then uses these specific chunks to answer the question rather than the entire textbook. 

Having understood how RAG works helps us appreciate how relevant this technique can be. Several companies will benefit from building RAG models that index their interal information and offer users a chat interface to access this information. For E.g., one of my former clients, an industrial pump manufacturer, is currently building a RAG model to help customers choose the right pump for their use case. 

### Qualifying a RAG model
It can be difficult to objectively qualify a RAG model. However, there are some metrics that we can use to qualify most RAG models. Examples include
- Response Relevancy: The degree to which the response provided is relevant to the user's prompt
- Faithfulness: The degree to which the model is faithful to the retrieved context while formulating the answer
- Context Precision: The degree to which the retrieved context is relevant to the user's question

Another challenge with testing LLMs is their non-deterministic nature. Most automated software testing techniques rely on determinism for qualifying software, which makes them unsuitable for LLM testing. This problem also persists with RAG models. 

RAGAS (RAG assessment) is a framework that aims to tackle these challenges. Firstly, RAGAS establishes a set of objective metrics. The three metrics mentioned above (Answer Relevancy, Faithfulness, Context Precision) were were proposed and defined in a paper that announced RAGAS. The framework now offers many more metrics of a similar nature. Secondly, non-determinism is tackled by using another LLM as a judge (link LLM as judge). To evaluate the metrics, the framework uses carefully designed prompts to have an LLM break down a response and provide pass-or-fail scores on the corresponding criteria, which are then aggregated to evaluate the metric. 

## Research objective

The objective for this research task is to build a RAG model, qualify it using RAGAS, and share what we learn with the community. While building a RAG model from scratch can seem an intimidating task, it is made much easier by beginner-friendly tutorials from LangChain. 
The manner in which these learnings can be shared can take the form of a repository, live-demonstrations, articles, webinars etc. We will figure this out as we go. 

## What has been done so far?

The following steps have been done
- A RAG model has been built using LangChain
- Blogposts from my old blog were added to the model as test data
- RAGAS assessment is included to qualify the model
- LangSmith can be used to examine traces of the assessment
All of this work can be viewed in this Jupiter Notebook within the project's repository. 

## Early Observations

Through performing this task, here are a few of our learnings
- Building a custom RAG model offers several levers to customise its behaviour. These include:
	- The choice of retrieval algorithm and its parameters
	- Chunking strategy (choosing how a datasource is to be split up)
	- The choice of embeddings (to store these chunks in a vector DB)
	- The choice of vector DB 
	This control is likely to be crucial to _tame_ a RAG model to behave in the manner that it is intended to. 
- At a first glance, Ragas metrics do what they expected. However, further testing is needed to qualify them, and see where they break. 
- Ragas offer metrics that either rely solely on LLM evaluation or have the LLM use human generated references
- Ragas documentation is quite poor, and has several mistakes. I have had 2 PRs merged to fix errors in documentation already. These are still early days. 
- The RAGAS metrics provide feedback on the model's consistency, rather than its quality per-say. While they tell us if the model is faithful to the retrieved context, and penalise hallucinations, they don't qualify if the model
	- retrieves the most appropriate sources to answer a given question
	- formulates answers in a manner that is compelling for the reader
	Therefore, while they hold promise in detecting regression, human testing is necessary to truly qualify a RAG model.
 



