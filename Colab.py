# -*- coding: utf-8 -*-
"""fine_tune_phi_3_5.py

Fine-tunes Phi-3.5-mini-instruct on TMOG dataset.
"""

# Install required libraries
!pip install --no-deps bitsandbytes accelerate xformers==0.0.29.post3 peft trl triton cut_cross_entropy unsloth_zoo
!pip install sentencepiece protobuf "datasets>=3.4.1" huggingface_hub hf_transfer
!pip install --no-deps unsloth

from unsloth import FastLanguageModel
from unsloth.chat_templates import get_chat_template
from datasets import Dataset
from trl import SFTConfig, SFTTrainer
import torch
import json
from google.colab import drive

# Mount Google Drive
drive.mount('/content/drive')
DATA_PATH = "/content/drive/MyDrive/TMOG_data"
DIALOGUE_PATH = f"{DATA_PATH}/dialogues_for_review.json"

# Load model and tokenizer
MODEL_NAME = "unsloth/Phi-3.5-mini-instruct"
model, tokenizer = FastLanguageModel.from_pretrained(
    model_name=MODEL_NAME,
    max_seq_length=2048,
    dtype=None,
    load_in_4bit=True,
)

# Add LoRA adapters
model = FastLanguageModel.get_peft_model(
    model,
    r=16,
    target_modules=["q_proj", "k_proj", "v_proj", "o_proj", "gate_proj", "up_proj", "down_proj"],
    lora_alpha=16,
    lora_dropout=0,
    bias="none",
    use_gradient_checkpointing="unsloth",
    random_state=3407,
    use_rslora=False,
    loftq_config=None,
)

# Load dialogues
with open(DIALOGUE_PATH, 'r', encoding='utf-8') as f:
    dialogues = json.load(f)

# Convert to ShareGPT format
conversations = []
for dialogue in dialogues:
    convo = [{"from": "human" if turn["role"] == "user" else "gpt", "value": turn["content"]} for turn in dialogue["turns"]]
    conversations.append(convo)

# Create dataset
dataset = Dataset.from_dict({"conversations": conversations})

# Apply Phi-3 chat template
tokenizer = get_chat_template(
    tokenizer,
    chat_template="phi-3",
    mapping={"role": "from", "content": "value", "user": "human", "assistant": "gpt"},
)

def formatting_prompts_func(examples):
    convos = examples["conversations"]
    texts = [tokenizer.apply_chat_template(convo, tokenize=False, add_generation_prompt=False) for convo in convos]
    return {"text": texts}

dataset = dataset.map(formatting_prompts_func, batched=True)

# Training configuration
trainer = SFTTrainer(
    model=model,
    tokenizer=tokenizer,
    train_dataset=dataset,
    dataset_text_field="text",
    max_seq_length=2048,
    dataset_num_proc=2,
    packing=False,
    args=SFTConfig(
        per_device_train_batch_size=2,
        gradient_accumulation_steps=4,
        warmup_steps=5,
        num_train_epochs=1,
        learning_rate=2e-4,
        logging_steps=10,
        optim="adamw_8bit",
        weight_decay=0.01,
        lr_scheduler_type="linear",
        seed=3407,
        output_dir=f"{DATA_PATH}/outputs",
        report_to="none",
    ),
)

# Train
trainer.train()

# Save model in multiple formats
model.save_pretrained(f"{DATA_PATH}/lora_model")
tokenizer.save_pretrained(f"{DATA_PATH}/lora_model")
model.save_pretrained_gguf(f"{DATA_PATH}/model.gguf", tokenizer, quantization_method="q4_k_m")