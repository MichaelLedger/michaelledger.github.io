![Kimi K3](https://github.com/MoonshotAI/Kimi-K3/blob/main/assets/kimi-logo.png?raw=true)

| | | | | | | |
|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| [🤖Chat](https://www.kimi.com) | [Homepage](https://www.moonshot.ai) | [Hugging Face](https://huggingface.co/moonshotai) |  [Twitter Follow](https://twitter.com/kimi_moonshot) | [Discord](https://discord.gg/TYU2fdJykW) | [ModelScope](https://modelscope.cn/organization/moonshotai) | [License](https://huggingface.co/moonshotai/Kimi-K3/blob/main/LICENSE) |
| 📰[Tech Blog](https://www.kimi.com/blog/kimi-k3) | 📄[Full Report](https://github.com/MoonshotAI/Kimi-K3/blob/main/k3_tech_report.pdf) |

## 1. Model Introduction

Kimi K3 is an open-weight, native multimodal agentic model and our most capable model to date. It is a 2.8T-parameter model built on Kimi Delta Attention (KDA) and Attention Residuals (AttnRes), with native vision capabilities and a 1-million-token context window. It is the world's first open 3T-class model, designed for frontier intelligence across long-horizon coding, knowledge work, and reasoning.

### Key Features
- **New Architecture**: Kimi K3 is built on Kimi Delta Attention (KDA) and Attention Residuals (AttnRes), and scales up MoE sparsity with a Stable LatentMoE framework that activates 16 out of 896 experts — yielding an approximate 2.5× improvement in overall scaling efficiency over Kimi K2.
- **Long-Horizon Coding**: Operating with minimal human oversight, Kimi K3 sustains long engineering sessions, navigates massive repositories, and orchestrates terminal tools — from GPU kernel optimization and compiler development to vision-in-the-loop game dev, CAD, and even chip design.
- **Agentic Knowledge Work**: Kimi K3 advances end-to-end knowledge work, producing deep research with interactive visualizations, widgets and dashboards, and motion design and video editing, powered by its native multimodal architecture.
- **Native Multimodality & Long Context**: Kimi K3 understands text, images, and video within the same model, and supports a 1-million-token context window.
- **Open Frontier Weights**: We release the full Kimi K3 model weights under the Kimi K3 License, making frontier intelligence openly available for research, deployment, and further innovation.

## 2. Model Summary

| | |
|---|---|
| **Architecture** | Mixture-of-Experts (MoE) |
| **Total Parameters** | 2.8T |
| **Activated Parameters** | 104B |
| **Number of Layers** | 93 |
| **Number of Dense Layers** | 1 |
| **Attention-Layer Composition** | 69 KDA + 24 Gated MLA |
| **Attention Hidden Dimension** | 7168 |
| **Number of Attention Heads** | 96 |
| **Latent MoE Dimension** | 3584 |
| **MoE Hidden Dimension** (per Expert) | 3072 |
| **Number of Experts** | 896 |
| **Selected Experts per Token** | 16 |
| **Number of Shared Experts** | 2 |
| **Vocabulary Size** | 160K |
| **Context Length** | 1048576 |
| **Attention Mechanism** | KDA & Gated MLA |
| **Activation Function** | SiTU-GLU |
| **Vision Encoder** | MoonViT-V2 |
| **Parameters of Vision Encoder** | 401M |
| **Quantization** | MXFP4 weights / MXFP8 activations (quantization-aware training) |
| **Modality** | Text, Image |


## 3. Evaluation Results

| Benchmark | Kimi K3 (max) | Claude Fable 5 (max, w/ fallback) | GPT-5.6 Sol (max) | Claude Opus 4.8 (max) | GPT-5.5 (xhigh) | GLM-5.2 (max) |
|---|---|---|---|---|---|---|
| **Reasoning & Knowledge** | | | | | | |
| GPQA Diamond | 93.5 | 92.6 | 94.1 | 91.0 | 93.5 | 91.2 |
| CritPt | 23.4 | 28.6 | 32.3 | 20.9 | 27.1 | 20.9 |
| AA-LCR | 74.7 | 70.0 | 73.7 | 67.7 | 74.3 | 71.3 |
| HLE-Full | 43.5 / 56.0 | 53.3 / 63.0 | 44.5 / 58.0 | 49.8 / 57.9 | 41.4 / 52.2 | — |
| **Coding** | | | | | | |
| DeepSWE | 67.5 | 70.0 | 73.0 | 59.0 | 67.0 | 46.2 |
| ProgramBench | 77.8 | 76.8 | 77.6 | 71.9 | 70.8 | 63.7 |
| Terminal-Bench 2.1 | 88.3 | 88.0 | 88.8 | 84.6 | 83.4 | 82.7 |
| FrontierSWE | 81.2 | 86.6 | 71.3 | 66.7 | 64.9 | 67.3 |
| SWE-Marathon | 42.0 | 35.0 | 39.0 | 40.0 | 14.0 | 13.0 |
| PostTrainBench | 36.6 | 41.4 | 34.6 | 34.1 | 28.4 | 34.3 |
| MLS-Bench-Lite | 48.3 | 49.9 | 46.2 | 42.8 | 35.5 | 40.4 |
| SciCode | 58.7 | 60.2 | 56.1 | 53.5 | 56.1 | 50.5 |
| Kimi Code Bench 2.0 | 72.9 | 76.9 | 64.8 | 71.7 | 69.0 | 64.2 |
| **Agentic** | | | | | | |
| BrowseComp | 91.2 | 88.0 | 90.4 | 84.3 | 84.4 | — |
| DeepSearchQA (F1) | 95.0 | 94.2 | — | 93.1 | — | — |
| ResearchRubrics | 76.2 | — | 73.8 | 73.5 | 64.0 | 71.1 |
| GDPval-AA v2 (Elo) | 1686 | 1747 | 1736 | 1593 | 1491 | 1510 |
| Toolathlon-Verified | 76.5 | 77.9 | 74.9 | 76.2 | 73.5 | 59.9 |
| MCPMark-Verified | 94.5 | 87.4 | 92.9 | 76.4 | 92.9 | — |
| MCP-Atlas | 84.2 | 84.7 | 83.6 | 83.6 | 82.8 | 82.6 |
| AutomationBench | 30.8 | 29.1 | 29.7 | 27.2 | 22.7 | 12.9 |
| JobBench | 54.3 | 57.4 | 45.4 | 48.4 | 38.3 | 43.4 |
| AA-Briefcase (Elo) | 1548 | 1583 | 1495 | 1354 | 1158 | 1260 |
| Agents' Last Exam | 28.3 | 25.7† | 29.6 | 27.0 | 26.6 | 20.4 |
| APEX-Agents | 41.0 | 43.3 | 39.9 | 39.4 | 38.5 | 35.6 |
| OfficeQA Pro | 63.3 | 69.9 | 63.2 | 63.9 | 60.9 | 41.4 |
| SpreadsheetBench 2 | 34.8 | 34.7 | 32.4 | 31.6 | 29.1 | 28.1 |
| OSWorld-Verified | 84.8 | 85.0 | 83.0 | 83.4 | 79.0 | — |
| OSWorld 2.0 | 58.3 | 66.1 | 62.6 | 55.7 | 49.5 | — |
| SaaS-Bench | 60.1 | — | 61.4 | 56.1 | 43.8 | — |
| τ³-Banking | 33.4 | 26.8 | 33.0 | 27.6 | 31.3 | 26.8 |
| Harvey Lab-AA | 94.6 | 93.6 | 87.2 | 91.1 | 86.3 | 91.0 |
| CorpFin v2 | 71.6 | 71.8 | 64.4 | 66.7 | 68.4 | 66.1 |
| Finance Agent v2 | 54.4 | 56.3 | 53.8 | 53.9 | 51.8 | 49.7 |
| Legal Research Bench | 44.2 | 49.5 | 48.1 | 43.8 | 40.4 | 31.3 |
| **Vision** | | | | | | |
| WorldVQA ForceAnswer | 51.0 | 56.7 | 41.8 | 39.1 | 38.5 | — |
| OmniDocBench | 91.1 | 89.8 | 85.8 | 87.9 | 89.4 | — |
| PerceptionBench | 58.5 | 57.2 | 59.7 | 47.2 | 55.8 | — |
| Video-MME (w. sub) | 90.0 | — | 89.5 | 86.0 | 89.3 | — |
| MMVU | 82.1 | — | 81.2 | 79.2 | 81.7 | — |
| BabyVision w/ python | 85.7 | 90.5 | 88.9 | 81.2 | 83.6 | — |
| MMMU-Pro | 81.6 / 83.4 | 81.2 / 86.5 | 83.0 / 84.6 | 78.9 / 82.7 | 81.2 / 83.2 | — |
| CharXiv (RQ) | 84.8 / 91.3 | 88.9 / 93.5 | 84.6 / 89.1 | 80.5 / 89.9 | 84.1 / 89.0 | — |
| MathVision | 94.3 / 97.8 | 94.8 / 98.6 | 95.8 / 97.8 | 86.7 / 97.1 | 92.2 / 96.8 | — |
| ZeroBench (pass@5) | 23.0 / 41.0 | 23.0 / 46.0 | 17.0 / 35.0 | 17.0 / 34.0 | 22.0 / 41.0 | — |

### Footnotes

All Kimi K3 results are obtained with reasoning effort set to 'max' and temperature = 1.0. For single-step tasks, such as GPQA Diamond, HLE-Full, and vision benchmarks without tools, we set top-p = 0.95; for agentic tasks, we set top-p = 1.0. For HLE-Full, MMMU-Pro, CharXiv (RQ), MathVision, and ZeroBench, each cell reports the scores without and with tool augmentation (general tools for HLE-Full, Python for the vision benchmarks), in that order.

1. **Reasoning & knowledge benchmarks**
   - **CritPt and AA-LCR.** Scores are cited from [Artificial Analysis](https://artificialanalysis.ai/) as of July 23, 2026.
2. **Coding benchmarks**
   - **DeepSWE.** Kimi K3 is evaluated with the Kimi Code harness. The GLM-5.2 score is taken from the [GLM-5.2 release blog](https://z.ai/blog/glm-5.2); all remaining scores are from the official [DeepSWE leaderboard](https://deepswe.datacurve.ai/), under which Kimi K3 attains 67.3 with the mini-SWE-agent harness. We report the DeepSWE v1.1 tasks.
   - **Terminal-Bench 2.1.** Kimi K3 is evaluated with the Kimi Code harness. For all other models, we report the best score across harnesses: GLM-5.2 with Claude Code ([GLM-5.2 release blog](https://z.ai/blog/glm-5.2)); Claude Opus 4.8 and Claude Fable 5 with Terminus 2 ([Artificial Analysis](https://artificialanalysis.ai/evaluations/terminalbench-v2-1)); GPT-5.5 and GPT-5.6 Sol with Codex ([OpenAI](https://openai.com/index/previewing-gpt-5-6-sol/)).
   - **ProgramBench.** Kimi K3 is evaluated with the Kimi Code harness. The GLM-5.2 score is from the [GLM-5.2 release blog](https://z.ai/blog/glm-5.2); all other scores are from [Vals AI](https://www.vals.ai/benchmarks/programbench).
   - **SWE-Marathon.** Kimi K3, Claude Opus 4.8, and Claude Fable 5 are evaluated with the Claude Code harness; GPT-5.6 Sol is evaluated with the Codex harness. The GLM-5.2 score is from the [GLM-5.2 release blog](https://z.ai/blog/glm-5.2). Our evaluation is based on an H20-calibrated branch of the [official tasks](https://www.swe-marathon.org/) as of July 9, 2026, prior to the final v1.1 release: the Docker images, performance gates, and reference oracles for the GPU tasks have been recalibrated for H20, while the correctness and anti-cheat validators remain unchanged. Additionally, Claude Fable 5 hit fallbacks on 35% of the tasks in our evaluation, which may have negatively impacted its measured performance.
   - **FrontierSWE.** Kimi K3 is evaluated with the Kimi Code harness and GPT-5.6 Sol with the Codex harness; all other results are from [FrontierSWE](https://www.frontierswe.com/). Dominance scores are recomputed from the raw scores using the official evaluation script and are current as of July 16, 2026.
   - **PostTrainBench.** Scores for GLM-5.2, GPT-5.5, and Claude Opus 4.8 are adopted from the official [PostTrainBench](https://posttrainbench.com/) results. Kimi K3, Claude Fable 5, and GPT-5.6 Sol are evaluated with the official Harbor implementation at maximum reasoning effort, averaged over three runs on H20 GPUs (instead of H100 in the official setting) — Kimi K3 and Claude Fable 5 with the Claude Code harness, and GPT-5.6 Sol with the Codex harness.
   - **MLS-Bench-Lite.** Kimi K3 is evaluated with the Kimi Code harness; GLM-5.2 and the Claude models with the Claude Code harness; GPT-5.5 and GPT-5.6 Sol with the Codex harness.
   - **SciCode.** Scores are cited from [Artificial Analysis](https://artificialanalysis.ai/) as of July 23, 2026.
   - **Kimi Code Bench 2.0 (in-house).** Kimi K3 is evaluated with the Kimi Code harness (it attains 73.7 with the Claude Code harness); GLM-5.2, Claude Opus 4.8, and Claude Fable 5 with the Claude Code harness; GPT-5.5 and GPT-5.6 Sol with the Codex harness. All models are evaluated at maximum reasoning effort, except GPT-5.5, which uses the "xhigh" setting. As the benchmark includes cybersecurity and safety-related tasks, we also disclose the fraction of refused or fallback tasks: Claude Fable 5 hit 13 fallbacks and 1 refusal out of 80 tasks; 10 refusals out of 80 tasks entered GPT-5.6 Sol's cyber guard; GPT-5.5 had 3 refusals out of 80 tasks.
3. **Agentic benchmarks**
   - **OfficeQA Pro.** Each test case provides the agent with the entire PDF corpus, with all PDFs rendered as images and no machine-readable text available.
   - **OfficeQA Pro and SpreadsheetBench 2.** Kimi K3, GLM-5.2, Claude Opus 4.8, and Claude Fable 5 are evaluated with the Claude Code harness; GPT-5.5 and GPT-5.6 Sol with the Codex harness.
   - **MCP-Atlas.** All models are evaluated on the 500-task public subset with a 100-turn limit, using Gemini 3.1 Pro as the judge.
   - **AutomationBench.** All models are evaluated on the 600-task public subset, following the official GitHub setup in all other respects.
   - **BrowseComp.** We adopt a context-compaction strategy triggered at 300K tokens. When evaluated with the full 1M-token context window and no context management, Kimi K3 achieves a score of 90.4. The results of Claude Fable 5, Claude Opus 4.8, GPT-5.6 Sol, and GPT-5.5 are cited from [Anthropic](https://www.anthropic.com/news/claude-fable-5-mythos-5) and [OpenAI](https://openai.com/index/gpt-5-6/).
   - **GDPval-AA v2, AA-Briefcase, τ³-Banking, Harvey Lab-AA, and APEX-Agents.** Scores are cited from [Artificial Analysis](https://artificialanalysis.ai/) and the [APEX-Agents leaderboard](https://www.mercor.com/apex/apex-agents-leaderboard/) as of July 23, 2026. For Harvey Lab-AA, we report the criterion pass rate.
   - **CorpFin v2, Finance Agent v2, and Legal Research Bench.** Scores are cited from [Vals AI](https://www.vals.ai/).
   - **Agents' Last Exam.** Scores are cited from the [official leaderboard](https://agents-last-exam.org/leaderboard) as of July 23, 2026; we report the leaderboard's primary pass-rate metric. On the leaderboard, each model is paired with a specific harness: Kimi K3 with Kimi Code; GPT-5.6 Sol and GPT-5.5 with Codex; Claude Fable 5, Claude Opus 4.8, and GLM-5.2 with Claude Code. † The Claude Fable 5 entry runs at xhigh effort with 40% of tasks annotated as downgraded.
4. **Multimodal benchmarks**
   - Except for ZeroBench, which follows the official setting and is run five times, all multimodal scores are averaged over three runs. MMMU-Pro is evaluated following the official protocol, preserving the original input order and prepending images to the text input.
   - **PerceptionBench** is an in-house benchmark that focuses on atomic visual perception capabilities.

## 4. Native MXFP4 Quantization

Kimi K3 applies quantization-aware training from the SFT stage onward, using MXFP4 weights with MXFP8 activations for broad hardware compatibility.

## 5. Deployment

> [!Note]
> You can access Kimi K3's API on https://platform.kimi.ai by selecting `kimi-k3`, and we provide OpenAI/Anthropic-compatible API for you. Currently, Kimi K3 is recommended to run on the following inference engines:

- [vLLM](https://github.com/vllm-project/vllm) — see [recipes](https://recipes.vllm.ai/moonshotai/Kimi-K3)
- [SGLang](https://github.com/sgl-project/sglang) — see [cookbook](https://docs.sglang.io/cookbook/autoregressive/Moonshotai/Kimi-K3)
- [TokenSpeed](https://github.com/lightseekorg/tokenspeed) — see [recipes](https://lightseek.org/tokenspeed/recipes/models#kimi-k3)

---
## 6. Model Usage

Kimi K3 always has thinking enabled, and will return `reasoning_content`. Thinking effort is configured with the top-level `reasoning_effort` request field, which supports `"low"`, `"high"`, and `"max"` (default `"max"`).

Kimi K3 was trained in the preserved thinking history mode. For multi-turn conversations and tool calls, Kimi K3 requires the complete assistant message returned by the API to be passed back to `messages` as-is — including `reasoning_content` and `tool_calls`, not just `content`:

```python
import openai

def chat_with_preserved_thinking(client: openai.OpenAI, model_name: str):
    messages = [
        {
            "role": "user",
            "content": "Tell me three random numbers."
        },
        {
            "role": "assistant",
            "reasoning_content": "I'll start by listing five numbers: 473, 921, 235, 215, 222, and I'll tell you the first three.",
            "content": "473, 921, 235"
        },
        {
            "role": "user",
            "content": "What are the other two numbers you have in mind?"
        }
    ]

    response = client.chat.completions.create(
        model=model_name,
        messages=messages,
        stream=False,
        max_tokens=4096,
        reasoning_effort="max",
    )
    # the assistant should mention 215 and 222 that appear in the prior reasoning content
    print(f"response: {response.choices[0].message.reasoning}")
    return response.choices[0].message.content
```

For full guides and examples (vision input, structured output, partial mode, tool choice, dynamic tool loading, context caching), see the [Kimi K3 Quickstart](https://platform.kimi.ai/docs/guide/kimi-k3-quickstart) and [Thinking Effort](https://platform.kimi.ai/docs/guide/use-thinking-effort).

### Coding Agent Framework

Kimi K3 works best with [Kimi Code CLI](https://www.kimi.com/code) as its agent framework. We warmly invite you to give it a try — run Kimi Code in your terminal and select Kimi K3 using the `/model` command. We hope you enjoy building with Kimi K3, and we would love to hear your feedback!


---

## 7. License

Both the code repository and the model weights are released under the [Kimi K3 License](https://huggingface.co/moonshotai/Kimi-K3/blob/main/LICENSE).

```
Kimi K3 License

Copyright (c) 2026 Moonshot AI

Permission is hereby granted, free of charge, to any person (the "Licensee")
obtaining a copy of this software — including the model weights, parameters,
configuration files, inference and training code, and associated documentation
(collectively, the "Software") — to deal in the Software without restriction.
This includes, without limitation, the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of the Software; to run,
deploy, fine-tune, or otherwise modify the Software and create derivative works
from it; and to permit persons to whom the Software is furnished to do so, in
each case subject to the following conditions:

1. The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software. Licensee's use of the
Software must comply with applicable laws and regulations.

2. "Model as a Service" means giving a third party access to language model
inference or fine-tuning (e.g., via API) in a manner that allows such third
party to exercise meaningful control over the inputs, parameters, or training
data. This does not include (a) end-user products with model capabilities solely
embedded within specific features or harnesses, or (b) mere relaying of requests
to models hosted by others.

If the Licensee or any of its affiliates operates a Model as a Service business,
and the aggregate revenue of the Licensee and its affiliates exceeds 20 million
US dollars (or the equivalent in other currencies) in total over any consecutive
12 months, the Licensee must enter into a separate agreement with Moonshot AI
before using the Software or its derivative works for any commercial purpose. 

3. If the Software (or any derivative works thereof) is used for any of the
Licensee's commercial products or services that have more than 100 million
monthly active users, or more than 20 million US dollars (or equivalent in other
currencies) in monthly revenue, "Kimi K3" must be prominently displayed on the
user interface of such product or service.

4. The requirements set forth in Sections 2 and 3 do not apply to: (a) internal
use of the Software, defined as any use that does not make the Software, its
outputs, or its underlying capabilities available to third parties; or (b) any
use of the Software accessed through Moonshot AI's official products or
certified inference partners.

5. THE SOFTWARE AND ANY OUTPUT AND RESULTS THEREFROM ARE PROVIDED ON AN “AS IS”
BASIS, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT
LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE
AND NONINFRINGEMENT. IN NO EVENT SHALL MOONSHOT AI OR ITS AFFILIATES OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

For any questions regarding this license, please contact <license@moonshot.ai>.
```

---

## 8. Contact Us

If you have any questions, please reach out at [support@moonshot.ai](mailto:support@moonshot.ai).

--------

## PS: Cursor 使用 Kimi K3：费用流向与模型托管方式总结

## 问题一：在 Cursor 中使用 Kimi K3，Kimi 母公司（Moonshot AI / 月之暗面）会收到我付的钱吗？

**结论：一般不会直接到 Moonshot 账上，取决于接入方式。**

### 1. 在 Cursor 里直接选 Kimi K3（内置模型）

- 你支付的是 **Cursor 订阅费 / 用量费**，收款方是 **Cursor（Anysphere）** 或其支付处理商（Stripe、Paddle、Apple 等）。
- Kimi K3 属于 Cursor 的 **Other Models** 用量池，按第三方模型 API 费率计费（约 $3 / 百万输入 token，$15 / 百万输出 token）。
- Cursor 是否向 Moonshot 支付模型授权/采购费用、支付多少，属于双方商业协议，对用户不透明。
- 即：**你不是在直接给 Kimi 付费，而是在给 Cursor 付费。**

### 2. 在 Cursor 里配置自己的 Moonshot API Key

- 模型 API 调用费用由 **Moonshot 开放平台**直接向你收取。
- Cursor 订阅费仍归 Cursor，两部分费用分开。

### 3. 通过 App Store / Google Play 付款

- 平台可能代收，但商户/发票主体一般仍不是 Kimi 母公司。

### 简单判断方法

看账单/发票上的收款方：

- Cursor / Anysphere / Stripe / Paddle / Apple → 不是直接付给 Moonshot
- Moonshot 开放平台充值记录或发票 → 这部分钱才是付给 Kimi 母公司

---

## 问题二：Cursor 是自己部署了 Kimi 模型，还是直接调 Moonshot 的 API？

**结论：无法从客户端判断是哪种，官方口径是三种可能之一。**

Cursor 官方文档（Models & Pricing FAQ）的原话：

> Models are hosted by the model provider, a trusted partner, or Cursor.

即 Kimi K3 的上游可能是：

1. **Moonshot 自己的 API**；
2. **Cursor 信任的推理合作伙伴**（第三方报道提到 Together AI、Modal 等，但 Cursor 官方未点名确认）；
3. **Cursor 自己或合作方部署的开放权重**（Kimi K3 已于 2026-07-27 前后释出完整权重，自托管在技术上成立，但没有证据表明 Cursor 采用了这种方式）。

### 关键事实

- **内置 Kimi K3 的请求统一走 Cursor 后端**，不是你客户端直连 `api.moonshot.ai`。
- Cursor 文档中 Kimi K3 的 Provider 标为 Moonshot，这只是标明模型来源和计费目录，不代表网络请求直达 Moonshot。
- 即使是 BYOK（自带 API Key）模式，Cursor 官方也说明：所有请求都会经过 Cursor 服务器做最终 prompt 构建，Key 加密传输且不持久化。
- Cursor 官方 BYOK 支持的标准提供商为：OpenAI、Anthropic、Google、Azure、AWS Bedrock；自定义 Key 只影响 chat 类模型，**Tab 补全始终使用 Cursor 内置模型**。

### 两种使用方式对比

**内置 Kimi K3**

- 在 Settings → Models 中启用即可（默认隐藏）。
- 无 Moonshot API Key 入口。
- 费用走 Cursor 用量池 / 按需计费。
- 隐私政策按 Cursor（ZDR 等）执行。

**自己接 Moonshot API**

- 需要自备 Moonshot API Key（可通过 OpenAI 兼容端点 / 网关接入，支持范围以当前 Cursor 版本为准）。
- 形成你与 Moonshot 的直接计费关系。
- 数据隐私遵循 Moonshot 的政策，不适用 Cursor 的 Zero Data Retention。

---

## 补充说明

- **付款流向 ≠ 数据流向**：即使钱付给 Cursor，使用内置 Kimi K3 时你的 prompt 和代码上下文仍会被发送给模型服务方（Moonshot、推理伙伴或 Cursor 自托管）。数据是否保留、是否用于训练，取决于 Cursor 的隐私设置（Privacy Mode / ZDR）和其 sub-processor 协议。
- 普通用户无法可靠判断 Cursor 后端到上游的真实链路；企业用户可通过商业合同和 sub-processor 清单（trust.cursor.com/subprocessors）进一步了解。

---

## 补充分析：从 Kimi K3 许可证看 Cursor 是否必须向 Moonshot 付费

> 依据：[Kimi K3 License](https://huggingface.co/api/resolve-cache/models/moonshotai/Kimi-K3/9f62e4e9fffbd0a83ddd60e1c209d828994b3569/LICENSE)（Copyright (c) 2026 Moonshot AI）

### 支持"Cursor 必须付费"的条款

许可证**第 2 条**：若被授权方经营 "Model as a Service"（MaaS）业务，且其及关联方在任意连续 12 个月内总收入超过 **2000 万美元**，则必须在将模型用于商业用途**之前**与 Moonshot AI 签订单独协议。

- Cursor（Anysphere）的收入远超该门槛（公开报道其 ARR 达数亿美元）。
- 因此**若** Cursor 自托管 Kimi K3 权重、且其服务被认定为 MaaS，则必须与 Moonshot 签单独商业协议——此类协议几乎必然涉及付费或收入分成。

### 许可证中的两个"豁免口"

**1. MaaS 定义的排除项（第 2 条）**，以下情形不算 MaaS：

> (a) end-user products with model capabilities solely embedded within specific features or harnesses, or (b) mere relaying of requests to models hosted by others.

- Cursor IDE 可主张自己属于 (a)：模型能力仅嵌入在 chat、agent、autocomplete 等具体功能中，而非向第三方出售原始 API 访问权。
- 第 2 条真正针对的是转售 API 的推理商（Together、Fireworks、OpenRouter 等）。

**2. 第 4 条豁免**：第 2、3 条不适用于：

> (b) any use of the Software accessed through Moonshot AI's official products or certified inference partners.

- 若 Cursor 通过 Moonshot 官方 API 或其**认证推理伙伴**使用 K3，则无需单独签协议（此时 Cursor 本来就在按量支付 API 费用）。

### 分场景结论

| 场景 | Moonshot 能否获得收入 |
| --- | --- |
| Cursor 走 Moonshot 官方 API | 能，直接收取 API 调用费 |
| Cursor 走认证推理伙伴 | 能，通过伙伴的商业安排间接获益 |
| 自托管 + 被认定为 MaaS | 大概率能，须签单独商业协议（但条款只要求 "agreement"，未强制收费） |
| 自托管 + 被认定为嵌入式终端产品 | 可能不能，落入 MaaS 排除项，无需协议 |

### 侧面佐证

第 3 条要求：月流水超 2000 万美元或 MAU 超 1 亿的产品，必须在 UI 显著展示 "Kimi K3"。Cursor 模型选择器中确实明确标注了 "Kimi K3 / Moonshot"，与该条款一致（但也可能只是产品惯例，不能作为付费证据）。

### 小结

**多数现实场景下 Moonshot 都能从 Cursor 的生意中获得收入**（API 费、伙伴分成或商业授权协议）；但单看许可证文本，仍存在合法路径（自托管 + 嵌入式终端产品豁免）使 Cursor 无需直接付费。实际路径取决于 Cursor 未公开的上游部署方式，许可证本身无法证明。

## Hardware tiers — what you actually need

These are planning brackets based on Moonshot's published architecture and standard MoE serving math. Adjust once you've run your own load test.

|TIER|HARDWARE|REALISTIC K3 USE|
|:|:|:|
|A — API only|Any desktop|Production today via kimi-k3 API, no local GPU needed|
|B — K2.7 local|2–8x A100/H100 or high-end consumer + quant|Open-weight coding today — not full K3|
|C — K3 quant lab|4–8x H100 80GB|Loads the full model; limited concurrency, realistic first milestone|
|D — K3 production local|Multi-node H100/H200 cluster|Full-speed serving, large-batch, long-context workloads|
|E — MacBook / single consumer GPU|24–48GB unified or VRAM|K2.7 quantized only — full K3 is not viable here even quantized, until a lower-fidelity community GGUF exists|

A single RTX 4090 or Mac Studio cannot load full-precision K3 — that hasn't changed since release. What's changed is that Tier C is no longer hypothetical: it's the actual entry point if you want to self-host today rather than wait for smaller quantizations. Compare against Mac vs. dedicated GPU local LLM economics and the Fable local hardware projection — frontier open weights at this scale still outrun consumer hardware by a wide margin.

## 参考链接

- [Cursor Models & Pricing](https://cursor.com/docs/models-and-pricing)
- [Cursor BYOK（自带 API Key）](https://cursor.com/help/models-and-usage/api-keys)
- [Cursor 隐私与数据治理](https://cursor.com/docs/enterprise/privacy-and-data-governance)
- [Moonshot Kimi K3 Quickstart](https://platform.kimi.ai/docs/guide/kimi-k3-quickstart)
- [MoonshotAI/Kimi-K3 GitHub](https://github.com/MoonshotAI/Kimi-K3)
- [Kimi K3 License 全文](https://huggingface.co/api/resolve-cache/models/moonshotai/Kimi-K3/9f62e4e9fffbd0a83ddd60e1c209d828994b3569/LICENSE)
- [How to Use Kimi K3 in Cursor Without Breaking Your Agent Workflow](https://www.yalc.ai/blog/how-to-use-kimi-k3-in-cursor/)
- [How to Run Kimi K3 Locally — Confirmed Hardware Tiers and vLLM Setup (2026)](https://explainx.ai/blog/kimi-k3-run-locally-open-weights-desktop-july-2026)
