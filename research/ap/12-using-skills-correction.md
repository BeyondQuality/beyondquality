# Correction to chapter 12: malicious skills are documented in the research

In [chapter 12](12-using-skills.md) I wrote that "there are no widely-known malicious skills today, but that may be because nobody is looking". The first half of that sentence was already wrong by the time I published. The second half stands: there is no advisory database, no automated scanner, no third-party reviewer in the skills supply chain. But academic researchers had been publishing on this since at least January 2026, including empirical studies of real production marketplaces that found malicious skills at scale.

This file collects the relevant papers, with the exact passages from each abstract. All abstracts were retrieved directly from arxiv.

---

## 1. Liu et al, January 2026: 8,126 vulnerable skills found across two major marketplaces

**Title**: Agent Skills in the Wild: An Empirical Study of Security Vulnerabilities at Scale

**Authors**: Yi Liu, Weizhe Wang, Ruitao Feng, Yao Zhang, Guangquan Xu, Gelei Deng, Yuekang Li, Leo Zhang

**Submitted**: 15 Jan 2026

**Link**: https://arxiv.org/abs/2601.10338

**Exact quote from the abstract**:

> "We conduct the first large-scale empirical security analysis of this emerging ecosystem, collecting 42,447 skills from two major marketplaces and systematically analyzing 31,132 using SkillScan, a multi-stage detection framework integrating static analysis with LLM-based semantic classification. Our findings reveal pervasive security risks: 26.1% of skills contain at least one vulnerability, spanning 14 distinct patterns across four categories: prompt injection, data exfiltration, privilege escalation, and supply chain risks. Data exfiltration (13.3%) and privilege escalation (11.8%) are most prevalent, while 5.2% of skills exhibit high-severity patterns strongly suggesting malicious intent."

---

## 2. Liu et al, February 2026: 157 confirmed malicious skills in two community registries

**Title**: Malicious Agent Skills in the Wild: A Large-Scale Security Empirical Study

**Authors**: Yi Liu, Zhihao Chen, Yanjun Zhang, Gelei Deng, Yuekang Li, Jianting Ning, Ying Zhang, Leo Yu Zhang

**Submitted**: 6 Feb 2026; revised 14 Mar 2026

**Link**: https://arxiv.org/abs/2602.06547

**Exact quote from the abstract**:

> "We construct the first labeled dataset of malicious agent skills by behaviorally verifying 98,380 skills from two community registries, confirming 157 malicious skills with 632 vulnerabilities. These attacks are not incidental. Malicious skills average 4.03 vulnerabilities across a median of three kill chain phases, and the ecosystem has split into two archetypes: Data Thieves that exfiltrate credentials through supply chain techniques, and Agent Hijackers that subvert agent decision-making through instruction manipulation. A single actor accounts for 54.1% of confirmed cases through templated brand impersonation. Shadow features, capabilities absent from public documentation, appear in 0% of basic attacks but 100% of advanced ones; several skills go further by exploiting the AI platform's own hook system and permission flags. Responsible disclosure led to 93.6% removal within 30 days."

---

## 3. Li et al, April 2026: five confirmed security incidents, structural threat analysis

**Title**: Towards Secure Agent Skills: Architecture, Threat Taxonomy, and Security Analysis

**Authors**: Zhiyuan Li, Jingzheng Wu, Xiang Ling, Xing Cui, Tianyue Luo

**Submitted**: 3 Apr 2026

**Link**: https://arxiv.org/abs/2604.02837

**Exact quote from the abstract**:

> "We validate the taxonomy through analysis of five confirmed security incidents in the Agent Skills ecosystem. Based on these findings, we discuss defense directions for each threat category, identify open research challenges, and provide actionable recommendations for stakeholders. Our analysis reveals that the most severe threats arise from structural properties of the framework itself, including the absence of a data-instruction boundary, a single-approval persistent trust model, and the lack of mandatory marketplace security review, and cannot be addressed through incremental mitigations alone."

This paper independently confirms the chapter's argument that the absence of a marketplace review process is a structural problem.

---

## 4. Schmotz, Beurer-Kellner, Abdelnabi, Andriushchenko, February 2026: 80% attack success rate via skill files on frontier LLMs

**Title**: Skill-Inject: Measuring Agent Vulnerability to Skill File Attacks

**Authors**: David Schmotz, Luca Beurer-Kellner, Sahar Abdelnabi, Maksym Andriushchenko

**Submitted**: 23 Feb 2026; revised 25 Feb 2026

**Link**: https://arxiv.org/abs/2602.20156

**Exact quote from the abstract**:

> "Our results show that today's agents are highly vulnerable with up to 80% attack success rate with frontier models, often executing extremely harmful instructions including data exfiltration, destructive action, and ransomware-like behavior. They furthermore suggest that this problem will not be solved through model scaling or simple input filtering, but that robust agent security will require context-aware authorization frameworks."

---

## 5. Duan et al, April 2026: real-world skills exploitable via adversarial prompting

**Title**: SkillAttack: Automated Red Teaming of Agent Skills through Attack Path Refinement

**Authors**: Zenghao Duan, Yuxin Tian, Zhiyi Yin, Liang Pang, Jingcheng Deng, Zihao Wei, Shicheng Xu, Yuyao Ge, Xueqi Cheng

**Submitted**: 5 Apr 2026

**Link**: https://arxiv.org/abs/2604.04989

**Exact quote from the abstract**:

> "Experiments across 10 LLMs on 71 adversarial and 100 real-world skills show that SkillAttack outperforms all baselines by a wide margin (ASR 0.73--0.93 on adversarial skills, up to 0.26 on real-world skills), revealing that even well-intended skills pose serious security risks under realistic agent interactions."

---

## 6. Feng et al, April 2026: theoretical backdoor attack with a 3,000-skill dataset

**Title**: SkillTrojan: Backdoor Attacks on Skill-Based Agent Systems

**Authors**: Yunhao Feng, Yifan Ding, Yingshui Tan, Boren Zheng, Yanming Guo, Xiaolong Li, Kun Zhai, Yishan Li, Wenke Huang

**Submitted**: 8 Apr 2026

**Link**: https://arxiv.org/abs/2604.06811

**Exact quote from the abstract**:

> "We propose SkillTrojan, a backdoor attack that targets skill implementations rather than model parameters or training data. SkillTrojan embeds malicious logic inside otherwise plausible skills and leverages standard skill composition to reconstruct and execute an attacker-specified payload. The attack partitions an encrypted payload across multiple benign-looking skill invocations and activates only under a predefined trigger."

---

## 7. Tie et al, April 2026: backdoor attacks via bundled models in skills

**Title**: BadSkill: Backdoor Attacks on Agent Skills via Model-in-Skill Poisoning

**Authors**: Guiyao Tie, Jiawen Shi, Pan Zhou, Lichao Sun

**Submitted**: 10 Apr 2026

**Link**: https://arxiv.org/abs/2604.09378

**Exact quote from the abstract**:

> "We present BadSkill, a backdoor attack formulation that targets this model-in-skill threat surface. In BadSkill, an adversary publishes a seemingly benign skill whose embedded model is backdoor-fine-tuned to activate a hidden payload only when routine skill parameters satisfy attacker-chosen semantic trigger combinations."

---

## What this means for chapter 12

The chapter's structural argument (no advisory database, no scanner, no marketplace review) is correct and is independently reinforced by Li et al. What I got wrong was the framing that malicious skills are not yet a documented problem. They are. The papers above span January through April 2026 and include empirical studies of real production marketplaces, threat taxonomies validated against confirmed incidents, and benchmarks showing up to 80% attack success rates on frontier LLMs.

The reason most users have not heard of any of this is exactly what the chapter argues: the detection infrastructure that surfaces npm attacks does not exist for skills. Attacks get cleaned up quietly when researchers responsibly disclose, and the user base never finds out.
