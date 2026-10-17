// Project description sent to the chat model as part of its system prompt.
export const QUARK = `Quark
Code: https://github.com/cpalmquist19/quark
Tags: Python, PyTorch, LLM

What it is:
A composable workbench for small GPT models. It starts from a baseline GPT, lets you swap in techniques from recent research papers as interchangeable components, and answers a practical question: does a given component actually help? Training runs on Google Colab (a free T4 GPU) or locally.

How it works:
- Components: a model is built from slots (one choice each, such as position encoding, attention, norm, MLP, block and head) and toggles (independent add-ons). Available components include RoPE, ALiBi and NoPE position encodings, RMSNorm, SwiGLU and ReLU-squared MLPs, the Muon and AdamW optimizers, WSD and cosine learning rate schedules, QK-norm and z-loss. Components are picked in a YAML config, and invalid combinations fail before training starts with a clear reason (for example a "did you mean" suggestion for a typo).
- Paired-seed ablations: the compare command trains every arm (a partial override of a base config) once per seed on the same token budget. Paired seeds share data order and initial weights, so most run-to-run noise cancels. The report gives each arm's difference in final validation loss versus the reference with a standard error, how many seeds agree, an estimate at equal wall-clock time, speed and memory, and a verdict of better, worse or within noise. Curves show whether a gap was still widening.
- Size ladder: small presets (about 8.5M parameters for screening every component, about 38M for finalists) are designed so that results transfer to the larger target model.
- Data mixtures: a recipe lists data sources, each with filters and a token target. Collection is resumable, each source has its own validation split, and source weights can be varied as experiment arms without re-preparing data. Warnings fire when a source would be repeated too many times.
- Workflow: a CLI (quark new, data, train, generate, compare, components) and four Colab or local notebooks. Colab keeps data and results on Google Drive and can resume after a disconnect. Training can be stopped and resumed, and resuming with a changed config is refused unless explicitly allowed.

Goal:
The target is a chatbot of roughly 125M to 350M parameters with a 2048-token context for children to talk to. It is trained on general educational English, with extra weight on education, early childhood, and neurodiversity-affirming content about neurodivergence. Final training will run on a paid GPU, while components and data weights are chosen with small, cheap experiments.

Status:
- Done: the scaffold, a baseline GPT with data pipeline, trainer, generation and notebooks (reaching validation loss 1.48 on TinyStories, with resume from Drive verified), the component registry, the first add-on components, the compare tool, the size ladder, FineWeb-Edu streaming, and data mixtures.
- In progress: the first 8-arm component comparison on FineWeb-Edu is running, and the first chatbot data mix is being built and its content curation reviewed.
- Planned: more components, weight experiments on the data mix, the target-size run, then chat fine-tuning with child safety.`;
