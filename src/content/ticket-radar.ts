// Project description sent to the chat model as part of its system prompt.
export const TICKET_RADAR = `Ticket Radar
Code: https://github.com/cpalmquist19/ticket_radar
Tags: Python, PyTorch, ONNX, Hugging Face Transformers

What it is:
A ticket classification system built on a fine-tuned DistilBERT model. It sorts support tickets into three categories: Change, Issue, or Request. It is a complete ML pipeline from training through optimized deployment format.

Results:
- 98.20% accuracy on the held-out test set.
- Precision, recall and F1 are 0.97 to 0.99 for every class (Change, Issue, Request).
- The model was exported to ONNX, shrinking it from 255 MB to 0.7 MB (a 99.7% reduction) while keeping 100% prediction agreement with the original PyTorch model.

How it works:
- Training: fine-tunes distilbert-base-uncased for sequence classification with AdamW, a 2e-5 learning rate, batch size 16 and 3 epochs. Class weights are computed automatically so imbalanced classes don't skew the model. It uses a GPU when one is available. Input is up to 512 tokens.
- Data: trained on a multi-language support ticket dataset, with a cleaning script and a label-checking script to prepare and inspect the data.
- Conversion: a script exports the trained PyTorch model to ONNX. INT8 quantization is supported as an option.
- Validation: a separate script compares the ONNX model against the PyTorch model on hundreds of samples, checking that predictions match, logits are within tolerance, and accuracy is identical. This proves the optimized model behaves the same as the original.
- Inference: a command-line script classifies a single text, a text file, or a CSV column. It uses ONNX by default, can fall back to PyTorch, returns a confidence score and per-class probabilities, and can output JSON for programmatic use.

Why it matters / what it shows:
It shows the full path from raw data to a small, verified, deployable model, with the kind of regression check (ONNX versus PyTorch agreement) a QA engineer would insist on. The README and docs lay out the model's results and a project plan.

Status and roadmap:
The model is trained and validated. The next milestones are a FastAPI service, Docker deployment, Kafka event streaming for tracking predictions, a Snowflake warehouse for drift detection, LLM-as-a-judge quality monitoring, and Terraform infrastructure. These are part of a larger "Ticket Classifier Observability Hub" vision and are not built yet.`;
