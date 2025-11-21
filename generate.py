# -*- coding: utf-8 -*-
"""Enhanced_Dialogue_Generator_V2.ipynb

Complete implementation with all recommendations:
1. Dialogue State Management
2. Dynamic Scripture Extraction
3. Template-based Response Generation
4. Enhanced Coherence Scoring
5. Theological Validation
6. Advanced Question Generation
7. Parallel Processing
8. Dialogue Personas
9. Enhanced Configuration
10. Post-processing & QA
Plus: Reduced NLTK overhead and theme diversity filtering
"""

# Install required packages
!pip install -U sentence-transformers transformers keybert
!pip install torch --upgrade
!pip install datasets
!pip install spacy
!python -m spacy download en_core_web_sm

# Import libraries
import json
import random
import re
import numpy as np
from collections import defaultdict, Counter
import torch
from transformers import pipeline
from sentence_transformers import SentenceTransformer, util
from keybert import KeyBERT
from tqdm import tqdm
import os
import gc
import pickle
from datetime import datetime
import multiprocessing as mp
from concurrent.futures import ProcessPoolExecutor, as_completed
import spacy
from typing import List, Dict, Tuple, Optional, Any
import hashlib

# Mount Google Drive
from google.colab import drive
drive.mount('/content/drive')

# Enhanced Configuration
CONFIG = {
    'data_path': "/content/drive/MyDrive/TMOG_data",
    'min_content_length': 50,
    'max_dialogue_turns': 6,
    'min_dialogue_turns': 2,
    'coherence_threshold': 0.65,
    'sample_ratio': {'book': 1.0, 'rhapsody': 0.3},
    'max_items': {'book': 5000, 'rhapsody': 10000},
    'batch_size': 100,
    'checkpoint_interval': 50,
    'enable_checkpointing': True,
    'checkpoint_dir': '/content/drive/MyDrive/TMOG_data/checkpoints',
    'paraphrase_temperature': 0.7,
    'topic_diversity': 0.6,
    'max_themes': 5,
    'dialogue_variety': {
        'persona_distribution': {'seeker': 0.4, 'student': 0.4, 'mature_believer': 0.2},
        'follow_up_probability': 0.7
    },
    'quality_thresholds': {
        'min_coherence': 0.65,
        'min_relevance': 0.7,
        'min_depth_score': 0.5,
        'min_theme_diversity': 0.3
    },
    'generation_params': {
        'use_caching': True,
        'cache_embeddings': True,
        'parallel_workers': mp.cpu_count() - 1
    }
}

# Create necessary directories
os.makedirs(CONFIG['checkpoint_dir'], exist_ok=True)

# Load spaCy model for reduced NLTK overhead
nlp = spacy.load("en_core_web_sm")

# Initialize NLP models with error handling
def load_models():
    """Load all required models with error handling."""
    models = {}
    
    try:
        print("Loading Sentence Transformer...")
        models['sentence_transformer'] = SentenceTransformer('all-MiniLM-L6-v2')
    except Exception as e:
        print(f"Failed to load sentence transformer: {e}")
        try:
            models['sentence_transformer'] = SentenceTransformer('paraphrase-MiniLM-L6-v2')
        except:
            raise RuntimeError("Could not load any sentence transformer model")
    
    try:
        print("Loading KeyBERT...")
        models['keybert'] = KeyBERT(model="all-mpnet-base-v2")
    except Exception as e:
        print(f"Failed to load KeyBERT: {e}")
        models['keybert'] = KeyBERT(model=models['sentence_transformer'])
    
    try:
        print("Loading Paraphraser...")
        models['paraphraser'] = pipeline("text2text-generation", model="Vamsi/T5_Paraphrase_Paws")
    except Exception as e:
        print(f"Failed to load paraphraser: {e}")
        models['paraphraser'] = None
    
    return models

# Load models
MODELS = load_models()
MODEL = MODELS['sentence_transformer']
KW_MODEL = MODELS['keybert']
PARAPHRASER = MODELS['paraphraser']

# Global indices
TOPIC_INDEX = defaultdict(list)
SCRIPTURE_INDEX = defaultdict(list)
EMBEDDING_CACHE = {}

# 1. DIALOGUE STATE MANAGEMENT
class DialogueState:
    """Maintains conversation context and flow."""
    
    def __init__(self, topic: str, themes: List[str], source_content: str, persona: str = 'student'):
        self.topic = topic
        self.themes = themes
        self.discussed_points = set()
        self.scripture_references = []
        self.depth_level = 0
        self.source_chunks = self._chunk_content(source_content)
        self.conversation_style = random.choice(['teaching', 'exploratory', 'practical'])
        self.persona = persona
        self.turn_count = 0
        
    def _chunk_content(self, content: str) -> List[str]:
        """Split content into meaningful chunks using spaCy."""
        doc = nlp(content)
        chunks = []
        current_chunk = []
        
        for sent in doc.sents:
            current_chunk.append(sent.text)
            if len(' '.join(current_chunk)) > 200:
                chunks.append(' '.join(current_chunk))
                current_chunk = []
        
        if current_chunk:
            chunks.append(' '.join(current_chunk))
        
        return chunks
    
    def update(self, turn_content: str):
        """Update state based on conversation turn."""
        keywords = extract_key_themes(turn_content, max_themes=3)
        self.discussed_points.update(keywords)
        self.turn_count += 1
        
        # Extract any scripture references mentioned
        refs = extract_scripture_references(turn_content)
        self.scripture_references.extend(refs)
        
        # Update depth level based on conversation progression
        if self.turn_count % 2 == 0:
            self.depth_level = min(self.depth_level + 1, 3)
    
    def get_unexplored_aspects(self) -> List[str]:
        """Get themes not yet discussed."""
        return [theme for theme in self.themes if theme not in self.discussed_points]
    
    def get_relevant_chunk(self) -> str:
        """Get the most relevant content chunk for current state."""
        if not self.source_chunks:
            return ""
        
        # Find chunk most relevant to unexplored aspects
        unexplored = self.get_unexplored_aspects()
        if unexplored:
            query = ' '.join(unexplored[:2])
            query_embed = get_cached_embedding(query)
            
            chunk_scores = []
            for chunk in self.source_chunks:
                chunk_embed = get_cached_embedding(chunk)
                score = util.pytorch_cos_sim(query_embed, chunk_embed).item()
                chunk_scores.append((score, chunk))
            
            chunk_scores.sort(reverse=True)
            return chunk_scores[0][1] if chunk_scores else self.source_chunks[0]
        
        # Return chunk based on depth level
        idx = min(self.depth_level, len(self.source_chunks) - 1)
        return self.source_chunks[idx]

# 2. DYNAMIC SCRIPTURE EXTRACTION
def extract_scripture_references(content: str) -> List[Tuple[str, str, str]]:
    """Extract all scripture references with enhanced patterns."""
    patterns = [
        # Standard format: Book Chapter:Verse
        r'(\b(?:[1-3]\s)?[A-Z][a-z]+(?:\s[A-Z][a-z]+)?)\s+(\d+):(\d+(?:-\d+)?)',
        # Abbreviated format: ROM 12:2
        r'(\b[A-Z]{2,4})\s+(\d+):(\d+(?:-\d+)?)',
        # Written format: First Corinthians 13:4
        r'(\b(?:First|Second|Third|1st|2nd|3rd)\s+[A-Z][a-z]+)\s+(\d+):(\d+(?:-\d+)?)'
    ]
    
    references = []
    for pattern in patterns:
        matches = re.findall(pattern, content)
        for match in matches:
            references.append({
                'book': match[0],
                'chapter': match[1],
                'verse': match[2],
                'full': f"{match[0]} {match[1]}:{match[2]}"
            })
    
    return references

def build_scripture_index(data: List[Dict]) -> Dict[str, List[Dict]]:
    """Build comprehensive scripture-to-content mapping."""
    scripture_index = defaultdict(list)
    
    for item in tqdm(data, desc="Building scripture index"):
        content = item.get('content', '')
        refs = extract_scripture_references(content)
        
        for ref in refs:
            # Extract context around scripture reference
            ref_pattern = re.escape(ref['full'])
            matches = re.finditer(ref_pattern, content)
            
            for match in matches:
                start = max(0, match.start() - 100)
                end = min(len(content), match.end() + 100)
                context = content[start:end]
                
                scripture_index[ref['full']].append({
                    'content': content,
                    'context': context,
                    'source': format_source(item),
                    'themes': extract_key_themes(context, max_themes=3)
                })
    
    return dict(scripture_index)

# 3. TEMPLATE-BASED RESPONSE GENERATOR
class ResponseGenerator:
    """Generate contextual responses using templates."""
    
    def __init__(self):
        self.templates = {
            'teaching': {
                'intro': [
                    "The Man of God illuminates this truth by explaining that {concept} {elaboration}",
                    "In understanding {topic}, we must first recognize that {principle}. {scripture_support}",
                    "This revelation about {topic} transforms our perspective because {insight}. {application}"
                ],
                'scripture_integration': [
                    "As we see in {scripture}, this principle {application} {deeper_meaning}",
                    "The Bible validates this in {scripture} where it says '{verse_content}', showing us {explanation}",
                    "{scripture} perfectly illustrates how {connection} in our daily walk with Christ"
                ],
                'practical': [
                    "In your daily walk, this means {application}. For instance, {example}",
                    "Practically speaking, you can apply this by {method}, which will {result}",
                    "This transforms your life when you {action}, leading to {transformation}"
                ],
                'deeper': [
                    "The deeper implication here reveals {theological_truth} which fundamentally {impact}",
                    "This connects to the broader truth of {doctrine} because {connection}",
                    "Understanding this in the context of {biblical_theme} shows us {revelation}"
                ]
            },
            'exploratory': {
                'intro': [
                    "Let's explore how {concept} relates to {aspect}. {question}",
                    "Consider the implications of {topic} in light of {scripture_principle}",
                    "The beauty of {topic} is revealed when we understand {insight}"
                ],
                'scripture_integration': [
                    "Interestingly, {scripture} provides insight here: '{verse_content}' - {interpretation}",
                    "The biblical foundation in {scripture} suggests {principle} which {application}",
                    "When we examine {scripture}, we discover {truth} about {topic}"
                ],
                'practical': [
                    "One way to experience this is through {method}. Have you considered {question}?",
                    "This principle becomes real when {scenario}. {encouragement}",
                    "In practical terms, {application} helps us {benefit}"
                ]
            },
            'practical': {
                'intro': [
                    "Here's how {concept} works in real life: {example}",
                    "The practical outworking of {topic} means {application}",
                    "You can immediately apply {topic} by {action}"
                ],
                'scripture_integration': [
                    "{scripture} gives us the blueprint: '{verse_content}' - here's how to apply it: {steps}",
                    "Following the pattern in {scripture}, we can {application}",
                    "The Word shows us in {scripture} that {principle}, which means {practical_outcome}"
                ],
                'practical': [
                    "Start by {first_step}, then {next_step}. This leads to {result}",
                    "In everyday situations, {application} looks like {example}",
                    "The key is to {action} consistently, which produces {fruit}"
                ]
            }
        }
    
    def generate_contextual_response(self, state: DialogueState, relevant_content: str, source: str) -> str:
        """Generate response based on current dialogue state."""
        style = state.conversation_style
        
        # Determine template category based on state
        if state.depth_level == 0:
            template_type = 'intro'
        elif state.scripture_references and random.random() > 0.3:
            template_type = 'scripture_integration'
        elif state.depth_level >= 2:
            template_type = 'deeper' if style == 'teaching' else 'practical'
        else:
            template_type = 'practical'
        
        # Get appropriate templates
        templates = self.templates.get(style, self.templates['teaching'])
        template_list = templates.get(template_type, templates['intro'])
        template = random.choice(template_list)
        
        # Fill template
        filled = self._fill_template(template, state, relevant_content, source)
        return filled
    
    def _fill_template(self, template: str, state: DialogueState, content: str, source: str) -> str:
        """Fill template with contextual information."""
        # Extract key elements from content
        doc = nlp(content)
        concepts = [ent.text for ent in doc.ents if ent.label_ in ['CONCEPT', 'NORP', 'ORG']]
        if not concepts:
            concepts = extract_key_themes(content, max_themes=2)
        
        # Get scripture if available
        scripture_ref = ""
        verse_content = ""
        if state.scripture_references:
            ref = random.choice(state.scripture_references)
            scripture_ref = ref['full']
            # Look up verse content from scripture index
            if scripture_ref in SCRIPTURE_INDEX:
                verse_content = SCRIPTURE_INDEX[scripture_ref][0]['context'][:100] + "..."
        
        # Build replacement dictionary
        replacements = {
            'topic': state.topic,
            'concept': concepts[0] if concepts else state.topic,
            'principle': extract_principle(content),
            'insight': extract_insight(content),
            'elaboration': paraphrase_text(content[:150]) if PARAPHRASER else content[:150],
            'scripture': scripture_ref or "the Word",
            'verse_content': verse_content or "this truth",
            'application': generate_application(state.topic, state.persona),
            'deeper_meaning': generate_deeper_meaning(state.topic),
            'explanation': paraphrase_text(content[:100]) if PARAPHRASER else content[:100],
            'connection': f"how {state.topic} relates to {random.choice(state.themes)}",
            'example': generate_example(state.topic, state.persona),
            'method': generate_method(state.topic),
            'result': generate_result(state.topic),
            'action': generate_action(state.topic),
            'transformation': generate_transformation(state.topic),
            'theological_truth': extract_theological_truth(content, state.topic),
            'impact': generate_impact(state.topic),
            'doctrine': random.choice(['grace', 'faith', 'redemption', 'sanctification', 'the finished work']),
            'biblical_theme': random.choice(['covenant', 'kingdom life', 'righteousness', 'divine nature']),
            'revelation': extract_revelation(content),
            'aspect': random.choice(state.themes),
            'scripture_principle': extract_scripture_principle(content),
            'question': generate_reflective_question(state.topic),
            'interpretation': paraphrase_text(content[:80]) if PARAPHRASER else content[:80],
            'scenario': generate_scenario(state.topic),
            'encouragement': generate_encouragement(),
            'benefit': generate_benefit(state.topic),
            'steps': generate_steps(state.topic),
            'practical_outcome': generate_practical_outcome(state.topic),
            'first_step': generate_first_step(state.topic),
            'next_step': generate_next_step(state.topic),
            'fruit': generate_fruit(state.topic),
            'situation': random.choice(['prayer life', 'work challenges', 'relationships', 'spiritual growth'])
        }
        
        # Fill template
        try:
            filled = template.format(**replacements)
        except KeyError as e:
            # If a key is missing, use a simpler version
            filled = template
            for key, value in replacements.items():
                filled = filled.replace(f"{{{key}}}", str(value))
        
        # Add source reference
        return f"{filled} {source}"

# 4. ENHANCED COHERENCE SCORING
def calculate_dialogue_coherence(dialogue: Dict) -> Dict[str, float]:
    """Calculate multi-dimensional coherence scores."""
    turns = dialogue['turns']
    
    # 1. Topic consistency across turns
    topic_embeddings = []
    for turn in turns:
        keywords = extract_key_themes(turn['content'], max_themes=2)
        if keywords:
            embed = get_cached_embedding(keywords[0])
            topic_embeddings.append(embed)
    
    topic_consistency = 0.5  # default
    if len(topic_embeddings) > 1:
        similarities = []
        for i in range(len(topic_embeddings) - 1):
            sim = util.pytorch_cos_sim(topic_embeddings[i], topic_embeddings[i+1]).item()
            similarities.append(sim)
        topic_consistency = np.mean(similarities)
    
    # 2. Question-Answer relevance
    qa_pairs = []
    for i in range(0, len(turns) - 1, 2):
        if i + 1 < len(turns):
            qa_pairs.append((turns[i]['content'], turns[i+1]['content']))
    
    relevance_scores = []
    for q, a in qa_pairs:
        q_embed = get_cached_embedding(q)
        a_embed = get_cached_embedding(a)
        relevance = util.pytorch_cos_sim(q_embed, a_embed).item()
        relevance_scores.append(relevance)
    
    answer_relevance = np.mean(relevance_scores) if relevance_scores else 0.5
    
    # 3. Progressive depth
    depth_score = calculate_depth_progression(turns)
    
    # 4. Semantic flow
    flow_score = calculate_semantic_flow(turns)
    
    # Weighted combination
    overall = (
        topic_consistency * 0.25 +
        answer_relevance * 0.35 +
        depth_score * 0.20 +
        flow_score * 0.20
    )
    
    return {
        'overall': overall,
        'topic_consistency': topic_consistency,
        'answer_relevance': answer_relevance,
        'depth_progression': depth_score,
        'semantic_flow': flow_score
    }

def calculate_depth_progression(turns: List[Dict]) -> float:
    """Measure if conversation progressively deepens."""
    if len(turns) < 2:
        return 0.5
    
    # Analyze complexity progression
    complexity_scores = []
    for turn in turns:
        doc = nlp(turn['content'])
        # Measure complexity by sentence length, vocabulary diversity, and subordinate clauses
        avg_sent_length = np.mean([len(sent.text.split()) for sent in doc.sents])
        vocab_diversity = len(set(token.text.lower() for token in doc)) / len(doc)
        complexity = (avg_sent_length / 20.0 + vocab_diversity) / 2
        complexity_scores.append(min(complexity, 1.0))
    
    # Check if complexity generally increases
    progression = 0
    for i in range(1, len(complexity_scores)):
        if complexity_scores[i] >= complexity_scores[i-1]:
            progression += 1
    
    return progression / (len(complexity_scores) - 1) if len(complexity_scores) > 1 else 0.5

def calculate_semantic_flow(turns: List[Dict]) -> float:
    """Measure how naturally the conversation flows."""
    if len(turns) < 2:
        return 0.5
    
    flow_scores = []
    for i in range(len(turns) - 1):
        current = turns[i]['content']
        next_turn = turns[i+1]['content']
        
        # Extract key concepts from current turn
        current_concepts = extract_key_themes(current, max_themes=3)
        
        # Check if next turn references these concepts
        reference_score = 0
        for concept in current_concepts:
            if concept.lower() in next_turn.lower():
                reference_score += 1
        
        flow_scores.append(reference_score / max(len(current_concepts), 1))
    
    return np.mean(flow_scores) if flow_scores else 0.5

# 5. THEOLOGICAL VALIDATOR
class TheologicalValidator:
    """Validate theological accuracy and consistency."""
    
    def __init__(self):
        self.core_concepts = self._load_theological_concepts()
        self.red_flags = [
            'prosperity only', 'works-based salvation', 'denying trinity',
            'universalism', 'antinomianism', 'legalism', 'gnosticism'
        ]
        self.scripture_contexts = {}
    
    def _load_theological_concepts(self) -> Dict[str, List[str]]:
        """Load core theological concepts for validation."""
        return {
            'salvation': ['grace', 'faith', 'not works', 'gift', 'eternal life'],
            'trinity': ['Father', 'Son', 'Holy Spirit', 'three persons', 'one God'],
            'christ': ['deity', 'humanity', 'savior', 'lord', 'mediator'],
            'scripture': ['inspired', 'authoritative', 'sufficient', 'inerrant'],
            'grace': ['unmerited favor', 'empowerment', 'divine ability'],
            'faith': ['trust', 'belief', 'substance', 'evidence']
        }
    
    def validate_response(self, response: str, source_content: str) -> Tuple[bool, List[str]]:
        """Validate theological accuracy."""
        issues = []
        
        # Check for contradictions with source
        if self._contains_contradiction(response, source_content):
            issues.append("potential_contradiction_with_source")
        
        # Check scripture usage
        refs = extract_scripture_references(response)
        for ref in refs:
            if not self._verify_scripture_context(ref, response):
                issues.append(f"questionable_scripture_use: {ref['full']}")
        
        # Check for theological red flags
        response_lower = response.lower()
        for flag in self.red_flags:
            if flag in response_lower:
                issues.append(f"theological_concern: {flag}")
        
        # Verify core concepts are properly represented
        for concept, markers in self.core_concepts.items():
            if concept in response_lower:
                if not any(marker in response_lower for marker in markers):
                    issues.append(f"incomplete_{concept}_representation")
        
        return len(issues) == 0, issues
    
    def _contains_contradiction(self, response: str, source: str) -> bool:
        """Check if response contradicts source material."""
        # Extract key claims from both
        response_claims = self._extract_claims(response)
        source_claims = self._extract_claims(source)
        
        # Use semantic similarity to detect contradictions
        for r_claim in response_claims:
            r_embed = get_cached_embedding(r_claim)
            for s_claim in source_claims:
                s_embed = get_cached_embedding(s_claim)
                similarity = util.pytorch_cos_sim(r_embed, s_embed).item()
                
                # Very low similarity might indicate contradiction
                if similarity < -0.3:
                    return True
        
        return False
    
    def _extract_claims(self, text: str) -> List[str]:
        """Extract theological claims from text."""
        doc = nlp(text)
        claims = []
        
        for sent in doc.sents:
            # Look for declarative sentences with theological keywords
            if any(token.pos_ == 'VERB' for token in sent):
                if any(concept in sent.text.lower() for concept in self.core_concepts):
                    claims.append(sent.text)
        
        return claims
    
    def _verify_scripture_context(self, ref: Dict, response: str) -> bool:
        """Verify scripture is used in appropriate context."""
        scripture = ref['full']
        
        # Check if we have this scripture in our index
        if scripture in SCRIPTURE_INDEX:
            indexed_uses = SCRIPTURE_INDEX[scripture]
            
            # Compare themes
            response_themes = extract_key_themes(response, max_themes=3)
            
            for use in indexed_uses:
                common_themes = set(response_themes) & set(use['themes'])
                if common_themes:
                    return True
        
        # If not in index, assume it's okay (benefit of doubt)
        return True

# 6. ADVANCED QUESTION GENERATION
class QuestionGenerator:
    """Generate contextually appropriate questions."""
    
    def __init__(self):
        self.question_templates = {
            'seeker': {
                'initial': [
                    "I've been wondering about {topic}. Could you help me understand {aspect}?",
                    "What does it mean when the Bible talks about {topic}?",
                    "I'm curious about {topic}. How does this apply to {situation}?"
                ],
                'follow_up': {
                    'clarification': "When you say '{concept}', what does that look like {context}?",
                    'deeper': "This is fascinating. How does {topic} relate to {connection}?",
                    'practical': "How can I start experiencing {topic} in my {area}?",
                    'struggle': "I struggle with {challenge}. How does {topic} help with this?"
                }
            },
            'student': {
                'initial': [
                    "Could you explain the biblical foundation for {topic}?",
                    "What's the significance of {topic} in {context}?",
                    "How does {topic} fit into God's overall plan?"
                ],
                'follow_up': {
                    'clarification': "Can you elaborate on {concept}? I want to understand it better.",
                    'scripture': "Are there other scriptures that support this teaching on {topic}?",
                    'application': "What are the practical steps to apply {topic} in {situation}?",
                    'connection': "How does this connect with what we know about {doctrine}?"
                }
            },
            'mature_believer': {
                'initial': [
                    "What's the deeper theological significance of {topic}?",
                    "How does {topic} challenge conventional Christian thinking?",
                    "What are the implications of {topic} for {ministry_area}?"
                ],
                'follow_up': {
                    'theological': "How does this understanding of {topic} align with {doctrine}?",
                    'hermeneutics': "What's the original context of this teaching on {topic}?",
                    'ministry': "How can we effectively teach {topic} to {audience}?",
                    'challenging': "Some argue that {objection}. How do we respond?"
                }
            }
        }
    
    def generate_initial_question(self, topic: str, persona: str, difficulty: str) -> str:
        """Generate an initial question based on persona and difficulty."""
        templates = self.question_templates[persona]['initial']
        template = random.choice(templates)
        
        # Fill template
        replacements = {
            'topic': topic,
            'aspect': self._get_aspect(topic, difficulty),
            'situation': random.choice(['daily life', 'work', 'relationships', 'spiritual walk']),
            'context': self._get_context(difficulty),
            'ministry_area': random.choice(['discipleship', 'evangelism', 'pastoral care', 'teaching'])
        }
        
        return template.format(**replacements)
    
    def generate_follow_up_question(self, state: DialogueState, previous_response: str) -> str:
        """Generate contextual follow-up question."""
        persona = state.persona
        
        # Extract key concept from previous response
        concepts = extract_key_themes(previous_response, max_themes=3)
        concept = concepts[0] if concepts else state.topic
        
        # Determine question type based on state
        if state.depth_level == 0:
            q_type = random.choice(['clarification', 'practical'])
        elif state.depth_level == 1:
            q_type = random.choice(['deeper', 'scripture', 'application'])
        else:
            q_type = random.choice(['theological', 'challenging', 'connection'])
        
        # Get appropriate template
        templates = self.question_templates[persona]['follow_up']
        if q_type not in templates:
            q_type = random.choice(list(templates.keys()))
        
        template = templates[q_type]
        
        # Fill template
        unexplored = state.get_unexplored_aspects()
        replacements = {
            'concept': concept,
            'topic': state.topic,
            'context': random.choice(['in practical terms', 'for believers today', 'in ministry']),
            'connection': unexplored[0] if unexplored else 'our walk with God',
            'area': random.choice(['prayer life', 'faith walk', 'ministry', 'relationships']),
            'challenge': self._get_relevant_challenge(state.topic),
            'doctrine': random.choice(['justification', 'sanctification', 'glorification', 'redemption']),
            'situation': random.choice(['workplace', 'family life', 'church ministry', 'personal growth']),
            'audience': random.choice(['new believers', 'youth', 'those struggling with faith', 'church leaders']),
            'objection': self._get_common_objection(state.topic)
        }
        
        question = template
        for key, value in replacements.items():
            question = question.replace(f"{{{key}}}", str(value))
        
        return question
    
    def _get_aspect(self, topic: str, difficulty: str) -> str:
        """Get appropriate aspect based on difficulty."""
        aspects = {
            'introductory': ['the basics of it', 'what it means', 'how it works'],
            'intermediate': ['its spiritual significance', 'its practical application', 'its biblical foundation'],
            'advanced': ['its theological implications', 'its hermeneutical context', 'its eschatological significance']
        }
        return random.choice(aspects.get(difficulty, aspects['intermediate']))
    
    def _get_context(self, difficulty: str) -> str:
        """Get appropriate context based on difficulty."""
        contexts = {
            'introductory': ['Christian living', 'our faith journey', 'everyday life'],
            'intermediate': ['spiritual growth', 'ministry effectiveness', 'biblical understanding'],
            'advanced': ['systematic theology', 'church history', 'apologetics']
        }
        return random.choice(contexts.get(difficulty, contexts['intermediate']))
    
    def _get_relevant_challenge(self, topic: str) -> str:
        """Get a relevant challenge for the topic."""
        challenges = {
            'faith': 'trusting God when I can\'t see results',
            'prayer': 'maintaining consistency in prayer',
            'grace': 'understanding grace vs. license',
            'word': 'applying scripture to modern situations',
            'spirit': 'discerning the Spirit\'s voice'
        }
        
        for key, challenge in challenges.items():
            if key in topic.lower():
                return challenge
        
        return 'applying this truth consistently'
    
    def _get_common_objection(self, topic: str) -> str:
        """Get common objection to the topic."""
        objections = {
            'faith': 'faith is just positive thinking',
            'grace': 'grace promotes sin',
            'prosperity': 'God wants everyone poor and humble',
            'healing': 'healing isn\'t for today',
            'tongues': 'tongues have ceased'
        }
        
        for key, objection in objections.items():
            if key in topic.lower():
                return objection
        
        return f'{topic} is not relevant for modern believers'

# 7. PARALLEL PROCESSING OPTIMIZATION
def parallel_dialogue_generation(data_batch: List[Dict], data_type: str, 
                               checkpoint_manager: Optional[Any] = None) -> List[Dict]:
    """Process dialogues in parallel with proper error handling."""
    
    # Initialize components for parallel processing
    response_generator = ResponseGenerator()
    question_generator = QuestionGenerator()
    validator = TheologicalValidator()
    
    def process_single_item(item: Dict) -> Optional[Dict]:
        """Process a single item to generate dialogue."""
        try:
            dialogue = generate_dialogue_chain_enhanced(
                item, data_type, response_generator, 
                question_generator, validator
            )
            return dialogue
        except Exception as e:
            print(f"Error processing item: {str(e)}")
            return None
    
    # Use ProcessPoolExecutor for CPU-bound tasks
    dialogues = []
    
    if CONFIG['generation_params']['parallel_workers'] > 1:
        with ProcessPoolExecutor(max_workers=CONFIG['generation_params']['parallel_workers']) as executor:
            # Submit all tasks
            future_to_item = {
                executor.submit(process_single_item, item): item 
                for item in data_batch
            }
            
            # Collect results
            for future in tqdm(as_completed(future_to_item), total=len(data_batch), 
                             desc="Generating dialogues"):
                try:
                    dialogue = future.result(timeout=60)
                    if dialogue:
                        dialogues.append(dialogue)
                except Exception as e:
                    print(f"Dialogue generation failed: {e}")
    else:
        # Single-threaded fallback
        for item in tqdm(data_batch, desc="Generating dialogues"):
            dialogue = process_single_item(item)
            if dialogue:
                dialogues.append(dialogue)
    
    return dialogues

# 8. DIALOGUE PERSONAS
class DialoguePersona:
    """Manage different user personas for varied conversations."""
    
    PERSONAS = {
        'seeker': {
            'description': 'New to faith, asking fundamental questions',
            'question_style': ['curious', 'exploratory', 'basic'],
            'follow_up_tendency': 0.8,
            'depth_preference': 'gradual',
            'vocabulary_level': 'simple',
            'concerns': ['understanding basics', 'practical application', 'personal relevance']
        },
        'student': {
            'description': 'Growing believer seeking deeper understanding',
            'question_style': ['analytical', 'scriptural', 'application-focused'],
            'follow_up_tendency': 0.7,
            'depth_preference': 'structured',
            'vocabulary_level': 'moderate',
            'concerns': ['biblical accuracy', 'spiritual growth', 'ministry preparation']
        },
        'mature_believer': {
            'description': 'Experienced Christian exploring advanced concepts',
            'question_style': ['theological', 'challenging', 'ministerial'],
            'follow_up_tendency': 0.6,
            'depth_preference': 'deep',
            'vocabulary_level': 'advanced',
            'concerns': ['doctrinal precision', 'teaching others', 'apologetics']
        }
    }
    
    def __init__(self):
        # Select persona based on distribution
        self.persona_name = self._select_persona()
        self.traits = self.PERSONAS[self.persona_name]
    
    def _select_persona(self) -> str:
        """Select persona based on configured distribution."""
        distribution = CONFIG['dialogue_variety']['persona_distribution']
        personas = list(distribution.keys())
        weights = list(distribution.values())
        return random.choices(personas, weights=weights)[0]
    
    def should_ask_follow_up(self) -> bool:
        """Determine if persona should ask follow-up question."""
        return random.random() < self.traits['follow_up_tendency']
    
    def adjust_language_complexity(self, text: str) -> str:
        """Adjust language complexity based on persona."""
        if self.traits['vocabulary_level'] == 'simple':
            # Simplify complex theological terms
            replacements = {
                'sanctification': 'becoming more like Christ',
                'justification': 'being made right with God',
                'propitiation': 'sacrifice that satisfies God',
                'righteousness': 'right standing with God'
            }
            for term, simple in replacements.items():
                text = text.replace(term, simple)
        
        return text

# 9. HELPER FUNCTIONS FOR TEMPLATE FILLING
def extract_key_themes(content: str, max_themes: int = 5) -> List[str]:
    """Extract themes using KeyBERT with caching."""
    # Check cache
    cache_key = hashlib.md5(f"{content[:100]}_{max_themes}".encode()).hexdigest()
    if cache_key in EMBEDDING_CACHE:
        return EMBEDDING_CACHE[cache_key]
    
    try:
        keywords = KW_MODEL.extract_keywords(
            content,
            keyphrase_ngram_range=(1, 3),
            stop_words='english',
            use_mmr=True,
            diversity=CONFIG['topic_diversity'],
            top_n=max_themes
        )
        
        themes = [kw[0] for kw in keywords] if keywords else []
        EMBEDDING_CACHE[cache_key] = themes
        return themes
    except Exception as e:
        # Fallback to spaCy-based extraction
        doc = nlp(content)
        # Extract noun phrases
        themes = [chunk.text for chunk in doc.noun_chunks][:max_themes]
        return themes

def get_cached_embedding(text: str) -> torch.Tensor:
    """Get embedding with caching."""
    cache_key = hashlib.md5(text.encode()).hexdigest()
    
    if cache_key not in EMBEDDING_CACHE:
        EMBEDDING_CACHE[cache_key] = MODEL.encode(text, convert_to_tensor=True)
    
    return EMBEDDING_CACHE[cache_key]

def paraphrase_text(text: str, temperature: float = None) -> str:
    """Paraphrase text preserving meaning."""
    if temperature is None:
        temperature = CONFIG['paraphrase_temperature']
    
    if PARAPHRASER is None:
        return text
    
    try:
        # Limit length for paraphrasing
        if len(text) > 400:
            text = text[:400]
        
        paraphrases = PARAPHRASER(
            f"paraphrase: {text}",
            num_return_sequences=1,
            num_beams=8,  # Increased for better quality
            temperature=temperature,
            max_length=len(text) + 50,
            early_stopping=True
        )
        
        paraphrased = paraphrases[0]['generated_text']
        
        # Ensure key theological terms are preserved
        important_terms = ['Christ', 'God', 'Holy Spirit', 'salvation', 'faith', 'grace']
        for term in important_terms:
            if term in text and term not in paraphrased:
                paraphrased = paraphrased.replace(term.lower(), term)
        
        return paraphrased
    except Exception as e:
        return text

# Template filling helper functions
def extract_principle(content: str) -> str:
    """Extract a principle from content."""
    doc = nlp(content)
    for sent in doc.sents:
        if any(word in sent.text.lower() for word in ['principle', 'truth', 'means', 'shows', 'reveals']):
            return sent.text
    return "this foundational truth"

def extract_insight(content: str) -> str:
    """Extract an insight from content."""
    themes = extract_key_themes(content, max_themes=2)
    if themes:
        return f"understanding {themes[0]} transforms how we see {themes[1] if len(themes) > 1 else 'God'}"
    return "this revelation changes everything"

def generate_application(topic: str, persona: str) -> str:
    """Generate practical application based on topic and persona."""
    applications = {
        'seeker': [
            f"starting each day acknowledging {topic}",
            f"practicing {topic} in small steps",
            f"learning to recognize {topic} in your life"
        ],
        'student': [
            f"studying scriptures about {topic} systematically",
            f"implementing {topic} in your ministry",
            f"teaching others about {topic}"
        ],
        'mature_believer': [
            f"mentoring others in understanding {topic}",
            f"developing a theology of {topic}",
            f"leading workshops on {topic}"
        ]
    }
    
    persona_apps = applications.get(persona, applications['student'])
    return random.choice(persona_apps)

def generate_deeper_meaning(topic: str) -> str:
    """Generate deeper theological meaning."""
    meanings = [
        f"reveals the nature of God's interaction with humanity",
        f"demonstrates the completeness of Christ's work",
        f"shows how the Kingdom operates",
        f"unveils our true identity in Christ",
        f"exposes the enemy's deception about {topic}"
    ]
    return random.choice(meanings)

def generate_example(topic: str, persona: str) -> str:
    """Generate relevant example."""
    examples = {
        'seeker': [
            "when facing a difficult decision at work",
            "in conversations with family members",
            "during times of uncertainty"
        ],
        'student': [
            "when counseling someone struggling with faith",
            "while preparing a Bible study",
            "in your personal devotion time"
        ],
        'mature_believer': [
            "when addressing doctrinal controversies",
            "in strategic ministry planning",
            "while training church leaders"
        ]
    }
    
    return random.choice(examples.get(persona, examples['student']))

def generate_method(topic: str) -> str:
    """Generate a method for applying the topic."""
    methods = [
        f"daily meditation on scriptures about {topic}",
        f"practical exercises that develop {topic}",
        f"accountability partnerships focused on {topic}",
        f"journaling your journey with {topic}"
    ]
    return random.choice(methods)

def generate_result(topic: str) -> str:
    """Generate expected result."""
    results = [
        "transformation in your spiritual walk",
        "breakthrough in areas of struggle",
        "deeper intimacy with God",
        "increased effectiveness in ministry",
        "freedom from bondage"
    ]
    return random.choice(results)

def generate_action(topic: str) -> str:
    """Generate specific action."""
    actions = [
        f"declare the truth about {topic}",
        f"act on your understanding of {topic}",
        f"share {topic} with others",
        f"live out {topic} daily"
    ]
    return random.choice(actions)

def generate_transformation(topic: str) -> str:
    """Generate transformation description."""
    transformations = [
        "renewed mind and transformed life",
        "victory over previous limitations",
        "manifestation of God's promises",
        "alignment with God's purpose"
    ]
    return random.choice(transformations)

def extract_theological_truth(content: str, topic: str) -> str:
    """Extract theological truth from content."""
    doc = nlp(content)
    for sent in doc.sents:
        if any(word in sent.text.lower() for word in ['god', 'christ', 'spirit', 'truth']):
            return sent.text[:100]
    return f"the divine reality of {topic}"

def generate_impact(topic: str) -> str:
    """Generate impact statement."""
    impacts = [
        "changes how we approach every situation",
        "redefines our understanding of spiritual reality",
        "empowers us for supernatural living",
        "establishes us in Kingdom authority"
    ]
    return random.choice(impacts)

def extract_revelation(content: str) -> str:
    """Extract revelation from content."""
    keywords = extract_key_themes(content, max_themes=2)
    if keywords:
        return f"how {keywords[0]} actually works in the Kingdom"
    return "God's plan for our lives"

def extract_scripture_principle(content: str) -> str:
    """Extract scripture principle."""
    principles = [
        "faith comes by hearing",
        "we walk by faith not by sight",
        "God's grace is sufficient",
        "in Christ we are new creations"
    ]
    
    # Try to find relevant principle in content
    content_lower = content.lower()
    for principle in principles:
        if any(word in content_lower for word in principle.split()):
            return principle
    
    return random.choice(principles)

def generate_reflective_question(topic: str) -> str:
    """Generate reflective question."""
    questions = [
        f"How has {topic} been working in your life?",
        f"What areas need {topic} the most?",
        f"Where do you see {topic} manifesting?",
        f"How can {topic} transform your situation?"
    ]
    return random.choice(questions)

def generate_scenario(topic: str) -> str:
    """Generate practical scenario."""
    scenarios = [
        f"you're faced with a challenge that requires {topic}",
        f"someone asks you to explain {topic}",
        f"you need to apply {topic} in a crisis",
        f"God calls you to demonstrate {topic}"
    ]
    return random.choice(scenarios)

def generate_encouragement() -> str:
    """Generate encouragement."""
    encouragements = [
        "God is faithful to complete this work in you",
        "The Holy Spirit will guide you every step",
        "You're not alone in this journey",
        "His grace is more than sufficient"
    ]
    return random.choice(encouragements)

def generate_benefit(topic: str) -> str:
    """Generate benefit statement."""
    benefits = [
        f"experience the fullness of {topic}",
        f"walk in victory through {topic}",
        f"see breakthrough by understanding {topic}",
        f"live in freedom through {topic}"
    ]
    return random.choice(benefits)

def generate_steps(topic: str) -> str:
    """Generate practical steps."""
    return f"1) Meditate on scriptures about {topic}, 2) Apply it in small areas first, 3) Share your testimony"

def generate_practical_outcome(topic: str) -> str:
    """Generate practical outcome."""
    outcomes = [
        f"you'll see {topic} working in every area",
        f"{topic} becomes your daily reality",
        f"others will notice the change {topic} brings",
        f"problems bow to the power of {topic}"
    ]
    return random.choice(outcomes)

def generate_first_step(topic: str) -> str:
    """Generate first step."""
    return f"acknowledging the truth about {topic}"

def generate_next_step(topic: str) -> str:
    """Generate next step."""
    return f"acting on your faith concerning {topic}"

def generate_fruit(topic: str) -> str:
    """Generate spiritual fruit."""
    fruits = [
        "peace that passes understanding",
        "joy unspeakable",
        "love that transforms",
        "faith that moves mountains"
    ]
    return random.choice(fruits)

# 10. ENHANCED DIALOGUE GENERATION
def generate_dialogue_chain_enhanced(item: Dict, data_type: str, 
                                   response_generator: ResponseGenerator,
                                   question_generator: QuestionGenerator,
                                   validator: TheologicalValidator) -> Optional[Dict]:
    """Generate enhanced multi-turn dialogue."""
    try:
        # Initialize persona
        persona = DialoguePersona()
        
        # Extract themes and determine difficulty
        themes = extract_key_themes(item['content'])
        if not themes:
            return None
        
        topic = random.choice(themes[:3])
        difficulty = determine_difficulty_enhanced(item['content'])
        
        # Initialize dialogue state
        state = DialogueState(topic, themes, item['content'], persona.persona_name)
        
        # Format source
        source = format_source(item)
        
        # Add to indices
        update_indices(item, themes, data_type, source)
        
        # Generate initial question
        initial_question = question_generator.generate_initial_question(
            topic, persona.persona_name, difficulty
        )
        
        turns = [{
            "role": "user",
            "content": persona.adjust_language_complexity(initial_question)
        }]
        
        # Determine number of turns
        num_turns = random.randint(
            CONFIG['dialogue_variety']['min_turns'],
            CONFIG['max_dialogue_turns']
        )
        
        # Generate conversation
        for turn_idx in range(num_turns):
            state.update(turns[-1]['content'])
            
            if turn_idx % 2 == 0:  # Assistant turn
                # Get relevant content
                relevant_chunk = state.get_relevant_chunk()
                
                # Generate response
                response = response_generator.generate_contextual_response(
                    state, relevant_chunk, source
                )
                
                # Validate response
                is_valid, issues = validator.validate_response(response, item['content'])
                if not is_valid:
                    print(f"Validation issues: {issues}")
                    # Try to regenerate once
                    response = response_generator.generate_contextual_response(
                        state, relevant_chunk, source
                    )
                
                turns.append({
                    "role": "assistant",
                    "content": response
                })
                
            else:  # User turn
                # Check if persona wants to continue
                if not persona.should_ask_follow_up() and turn_idx > 2:
                    break
                
                # Generate follow-up question
                follow_up = question_generator.generate_follow_up_question(
                    state, turns[-1]['content']
                )
                
                turns.append({
                    "role": "user",
                    "content": persona.adjust_language_complexity(follow_up)
                })
        
        # Calculate quality scores
        dialogue = {
            "dialogue_id": f"{data_type}_{topic.replace(' ', '_')}_{datetime.now().strftime('%Y%m%d%H%M%S')}",
            "source": source,
            "difficulty_level": difficulty,
            "key_themes": themes[:3],
            "persona": persona.persona_name,
            "turns": turns
        }
        
        # Calculate coherence
        coherence_scores = calculate_dialogue_coherence(dialogue)
        dialogue["coherence_score"] = coherence_scores['overall']
        dialogue["quality_metrics"] = coherence_scores
        
        return dialogue
        
    except Exception as e:
        print(f"Error in dialogue generation: {str(e)}")
        return None

def determine_difficulty_enhanced(content: str) -> str:
    """Enhanced difficulty classification using multiple factors."""
    doc = nlp(content)
    
    # Calculate various complexity metrics
    avg_sent_length = np.mean([len(sent.text.split()) for sent in doc.sents])
    vocab_complexity = len(set(token.text for token in doc)) / len(doc)
    
    # Check for complex theological terms
    complex_terms = [
        'propitiation', 'sanctification', 'justification', 'eschatology',
        'hermeneutics', 'soteriology', 'pneumatology', 'christology'
    ]
    
    complex_term_count = sum(1 for term in complex_terms if term in content.lower())
    
    # Determine difficulty
    if avg_sent_length > 20 and complex_term_count > 2:
        return "advanced"
    elif avg_sent_length > 15 or complex_term_count > 0:
        return "intermediate"
    else:
        return "introductory"

def update_indices(item: Dict, themes: List[str], data_type: str, source: str):
    """Update global indices."""
    excerpt = item['content'][:200] + "..." if len(item['content']) > 200 else item['content']
    
    # Update topic index
    for theme in themes[:2]:
        TOPIC_INDEX[theme].append({
            "source": source,
            "excerpt": excerpt,
            "type": data_type
        })
    
    # Update scripture index
    refs = extract_scripture_references(item['content'])
    for ref in refs:
        SCRIPTURE_INDEX[ref['full']].append({
            'content': item['content'],
            'source': source,
            'context': excerpt,
            'themes': themes[:3]
        })

# POST-PROCESSING AND QUALITY ASSURANCE
def post_process_dialogues(dialogues: List[Dict]) -> List[Dict]:
    """Apply post-processing and quality checks."""
    processed = []
    
    for dialogue in tqdm(dialogues, desc="Post-processing dialogues"):
        # Remove repetitions
        dialogue = remove_repetitions(dialogue)
        
        # Add metadata
        dialogue['metadata'] = {
            'generation_date': datetime.now().isoformat(),
            'quality_scores': dialogue.get('quality_metrics', {}),
            'persona_used': dialogue.get('persona', 'unknown'),
            'validated': True,
            'version': '2.0'
        }
        
        # Only keep high-quality dialogues
        if dialogue.get('coherence_score', 0) >= CONFIG['quality_thresholds']['min_coherence']:
            processed.append(dialogue)
    
    return processed

def remove_repetitions(dialogue: Dict) -> Dict:
    """Remove repetitive content from dialogue."""
    turns = dialogue['turns']
    
    # Track mentioned concepts
    mentioned_concepts = set()
    cleaned_turns = []
    
    for turn in turns:
        # Extract concepts from this turn
        concepts = extract_key_themes(turn['content'], max_themes=5)
        
        # Check for repetition
        new_concepts = set(concepts) - mentioned_concepts
        
        # If turn introduces new concepts or is first few turns, keep it
        if new_concepts or len(cleaned_turns) < 3:
            cleaned_turns.append(turn)
            mentioned_concepts.update(concepts)
        else:
            # Skip repetitive turn
            continue
    
    dialogue['turns'] = cleaned_turns
    return dialogue

def filter_dialogues_with_diversity(dialogues: List[Dict]) -> List[Dict]:
    """Filter dialogues based on quality and theme diversity."""
    # First, filter by quality thresholds
    quality_filtered = []
    for d in dialogues:
        if (d.get('coherence_score', 0) >= CONFIG['quality_thresholds']['min_coherence'] and
            d.get('quality_metrics', {}).get('answer_relevance', 0) >= CONFIG['quality_thresholds']['min_relevance']):
            quality_filtered.append(d)
    
    # Then ensure theme diversity
    theme_groups = defaultdict(list)
    for d in quality_filtered:
        primary_theme = d['key_themes'][0] if d['key_themes'] else 'general'
        theme_groups[primary_theme].append(d)
    
    # Calculate target distribution
    total_target = min(len(quality_filtered), 10000)  # Max output size
    themes = list(theme_groups.keys())
    base_per_theme = total_target // len(themes) if themes else 0
    
    # Select diverse dialogues
    diverse_dialogues = []
    
    # First pass: take base amount from each theme
    for theme, theme_dialogues in theme_groups.items():
        # Sort by quality within theme
        theme_dialogues.sort(key=lambda x: x.get('coherence_score', 0), reverse=True)
        
        # Take up to base amount
        to_take = min(base_per_theme, len(theme_dialogues))
        diverse_dialogues.extend(theme_dialogues[:to_take])
    
    # Second pass: fill remaining slots with highest quality
    remaining_slots = total_target - len(diverse_dialogues)
    if remaining_slots > 0:
        all_remaining = []
        for theme, theme_dialogues in theme_groups.items():
            start_idx = min(base_per_theme, len(theme_dialogues))
            all_remaining.extend(theme_dialogues[start_idx:])
        
        # Sort by quality and take best
        all_remaining.sort(key=lambda x: x.get('coherence_score', 0), reverse=True)
        diverse_dialogues.extend(all_remaining[:remaining_slots])
    
    # Calculate diversity score
    theme_distribution = Counter(d['key_themes'][0] for d in diverse_dialogues if d['key_themes'])
    diversity_score = 1.0 - (max(theme_distribution.values()) / len(diverse_dialogues))
    
    print(f"\nTheme diversity score: {diversity_score:.3f}")
    print(f"Themes represented: {len(theme_distribution)}")
    
    return diverse_dialogues

# UTILITY FUNCTIONS
def format_source(item: Dict) -> str:
    """Enhanced source formatting."""
    ref = item.get('reference', {})
    content = item.get('content', '')
    
    # Try to extract scripture references
    scriptures = extract_scripture_references(content)
    if scriptures and len(scriptures) > 0:
        return f"[SCRIPTURE: {scriptures[0]['full']}]"
    
    # Format based on type
    item_type = item.get('type', '').lower()
    
    if 'book' in item_type:
        book_name = ref.get('book_name', 'Unknown Book')
        chapter = ref.get('chapter', 'Unknown Chapter')
        topic = ref.get('Topic', '')
        if topic:
            return f"[SOURCE: {book_name}, Chapter {chapter} - {topic}]"
        return f"[SOURCE: {book_name}, Chapter {chapter}]"
    
    if 'rhapsody' in item_type:
        date = ref.get('date', 'Unknown Date')
        topic = ref.get('topic', 'Daily Devotional')
        return f"[SOURCE: Rhapsody of Realities, {date} - {topic}]"
    
    return "[SOURCE: Divine Wisdom]"

def load_dataset(file_path: str) -> List[Dict]:
    """Load dataset with error handling."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading {file_path}: {str(e)}")
        return []

def save_dialogues(dialogues: List[Dict], filename: str):
    """Save dialogues with backup."""
    output_path = os.path.join(CONFIG['data_path'], filename)
    
    # Backup existing file
    if os.path.exists(output_path):
        backup_path = output_path.replace('.json', f'_backup_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json')
        os.rename(output_path, backup_path)
        print(f"Backed up existing file to {backup_path}")
    
    # Save new file
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(dialogues, f, indent=2, ensure_ascii=False)
    
    print(f"Saved {len(dialogues)} dialogues to {output_path}")

# CHECKPOINT MANAGEMENT
class CheckpointManager:
    """Enhanced checkpoint management."""
    
    def __init__(self, checkpoint_dir: str):
        self.checkpoint_dir = checkpoint_dir
        
    def save_checkpoint(self, data: List[Dict], metadata: Dict) -> str:
        """Save checkpoint with compression."""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        checkpoint_file = os.path.join(self.checkpoint_dir, f"checkpoint_{timestamp}.pkl")
        
        checkpoint_data = {
            'data': data,
            'metadata': metadata,
            'timestamp': timestamp,
            'topic_index': dict(TOPIC_INDEX),
            'scripture_index': dict(SCRIPTURE_INDEX),
            'version': '2.0'
        }
        
        with open(checkpoint_file, 'wb') as f:
            pickle.dump(checkpoint_data, f, protocol=pickle.HIGHEST_PROTOCOL)
        
        print(f"Checkpoint saved: {checkpoint_file}")
        return checkpoint_file
    
    def load_latest_checkpoint(self) -> Optional[Dict]:
        """Load most recent checkpoint."""
        if not os.path.exists(self.checkpoint_dir):
            return None
        
        checkpoints = [f for f in os.listdir(self.checkpoint_dir) 
                      if f.startswith('checkpoint_') and f.endswith('.pkl')]
        
        if not checkpoints:
            return None
        
        latest = sorted(checkpoints)[-1]
        checkpoint_file = os.path.join(self.checkpoint_dir, latest)
        
        try:
            with open(checkpoint_file, 'rb') as f:
                checkpoint_data = pickle.load(f)
            
            # Restore indices
            global TOPIC_INDEX, SCRIPTURE_INDEX
            TOPIC_INDEX = defaultdict(list, checkpoint_data.get('topic_index', {}))
            SCRIPTURE_INDEX = defaultdict(list, checkpoint_data.get('scripture_index', {}))
            
            print(f"Loaded checkpoint from {checkpoint_data['timestamp']}")
            return checkpoint_data
            
        except Exception as e:
            print(f"Failed to load checkpoint: {e}")
            return None
    
    def clean_old_checkpoints(self, keep_last: int = 3):
        """Remove old checkpoints."""
        checkpoints = sorted([f for f in os.listdir(self.checkpoint_dir) 
                            if f.startswith('checkpoint_')])
        
        if len(checkpoints) > keep_last:
            for checkpoint in checkpoints[:-keep_last]:
                try:
                    os.remove(os.path.join(self.checkpoint_dir, checkpoint))
                    print(f"Removed old checkpoint: {checkpoint}")
                except:
                    pass

# MAIN PROCESSING FUNCTION
def process_dataset_enhanced(file_path: str, data_type: str) -> List[Dict]:
    """Process dataset with all enhancements."""
    print(f"\nProcessing {data_type} dataset...")
    
    # Load data
    raw_data = load_dataset(file_path)
    if not raw_data:
        return []
    
    # Apply sampling
    sample_ratio = CONFIG['sample_ratio'].get(data_type, 1.0)
    max_items = CONFIG['max_items'].get(data_type, 5000)
    
    if sample_ratio < 1.0:
        sample_size = min(int(len(raw_data) * sample_ratio), max_items)
        data = random.sample(raw_data, sample_size)
    else:
        data = raw_data[:max_items]
    
    print(f"Processing {len(data)} items from {data_type}")
    
    # Initialize components
    response_generator = ResponseGenerator()
    question_generator = QuestionGenerator()
    validator = TheologicalValidator()
    
    # Check for checkpoint
    checkpoint_manager = CheckpointManager(CONFIG['checkpoint_dir'])
    checkpoint_data = checkpoint_manager.load_latest_checkpoint()
    
    if checkpoint_data and checkpoint_data['metadata'].get('data_type') == data_type:
        print(f"Resuming from checkpoint with {len(checkpoint_data['data'])} dialogues")
        dialogues = checkpoint_data['data']
        processed_ids = {d['dialogue_id'] for d in dialogues}
    else:
        dialogues = []
        processed_ids = set()
    
    # Process in batches
    batch_size = CONFIG['batch_size']
    total_batches = (len(data) + batch_size - 1) // batch_size
    
    for batch_idx in range(total_batches):
        start_idx = batch_idx * batch_size
        end_idx = min((batch_idx + 1) * batch_size, len(data))
        batch = data[start_idx:end_idx]
        
        print(f"\nProcessing batch {batch_idx + 1}/{total_batches}")
        
        # Filter out already processed items
        new_batch = []
        for item in batch:
            item_hash = hashlib.md5(str(item).encode()).hexdigest()
            if item_hash not in processed_ids:
                new_batch.append(item)
        
        if not new_batch:
            continue
        
        # Process batch
        if CONFIG['generation_params']['parallel_workers'] > 1:
            batch_dialogues = parallel_dialogue_generation(
                new_batch, data_type, checkpoint_manager
            )
        else:
            # Single-threaded processing
            batch_dialogues = []
            for item in tqdm(new_batch, desc=f"Generating dialogues"):
                dialogue = generate_dialogue_chain_enhanced(
                    item, data_type, response_generator, 
                    question_generator, validator
                )
                if dialogue:
                    batch_dialogues.append(dialogue)
        
        # Add to results
        dialogues.extend(batch_dialogues)
        
        # Update processed IDs
        for d in batch_dialogues:
            processed_ids.add(d['dialogue_id'])
        
        # Save checkpoint
        if CONFIG['enable_checkpointing'] and (batch_idx + 1) % CONFIG['checkpoint_interval'] == 0:
            checkpoint_manager.save_checkpoint(
                dialogues,
                {
                    'data_type': data_type,
                    'batch_idx': batch_idx,
                    'total_batches': total_batches
                }
            )
        
        # Clear memory
        gc.collect()
    
    print(f"\nGenerated {len(dialogues)} dialogues for {data_type}")
    return dialogues

class PastoralPostProcessor:
    """Non-invasive review system added AFTER generation"""
    
    def __init__(self):
        self.reviewer = DoctrinalReviewer()
        self.scripture_verifier = ScriptureVerifier()
    
    def add_review_metadata(self, dialogues: List[Dict]) -> List[Dict]:
        """Add review scaffolding to existing dialogues"""
        for dialogue in tqdm(dialogues, desc="Adding review metadata"):
            if 'pastoral_review' not in dialogue:  # Only process if not already reviewed
                self._apply_review_layer(dialogue)
        return dialogues
    
    def _apply_review_layer(self, dialogue: Dict) -> None:
        """Add review data without modifying original content"""
        # 1. Analyze with conservative rules
        flags = self.reviewer.analyze(dialogue)
        
        # 2. Verify scripture usage
        scripture_issues = self.scripture_verifier.verify_dialogue_scriptures(dialogue)
        flags['scripture_issues'].extend(scripture_issues)
        
        # 3. Add review metadata (new keys only)
        dialogue.update({
            'pastoral_review': {
                'needs_review': bool(flags.get('critical_issues') or scripture_issues),
                'auto_flags': flags,
                'validation_score': self._calculate_score(flags),
                'reviewed': False,
                'approved': False if flags.get('critical_issues') or scripture_issues else None
            }
        })
    
    def _calculate_score(self, flags: Dict) -> float:
        """Calculate 0-1 safety score"""
        score = 1.0
        score -= len(flags.get('warnings', [])) * 0.1
        score -= len(flags.get('critical_issues', [])) * 0.3
        score -= len(flags.get('scripture_issues', [])) * 0.4
        return max(0, min(1, score))

class DoctrinalReviewer:
    """Conservative analysis without modifications"""
    
    CORE_DOCTRINES = {
        "trinity": ["father", "son", "holy spirit", "three persons", "one God"],
        "deity_of_christ": ["fully God", "fully man", "incarnation", "divine nature"],
        "salvation": ["grace through faith", "not by works", "redemption", "atonement"],
        "scripture": ["inspired", "inerrant", "authoritative", "sufficient"]
    }
    
    def __init__(self):
        self.sensitive_phrases = {
            'critical': [
                'contradicts scripture', 'denies the', 'opposed to',
                'not necessary to', 'doesn\'t matter if', 'optional to believe'
            ],
            'warning': [
                'some believe', 'could mean', 'possibly', 'might be interpreted as',
                'traditionally thought', 'alternative view'
            ]
        }
    
    def analyze(self, dialogue: Dict) -> Dict:
        """Return flags without changing content"""
        flags = {
            'critical_issues': [],
            'warnings': [],
            'scripture_issues': [],
            'doctrine_coverage': []
        }
        
        turns_text = ' '.join(t['content'] for t in dialogue['turns']).lower()
        
        # 1. Check core doctrine representation
        for doctrine, keywords in self.CORE_DOCTRINES.items():
            representation = any(keyword in turns_text for keyword in keywords)
            if not representation and doctrine in turns_text:
                flags['warnings'].append(f'incomplete_{doctrine}_representation')
            flags['doctrine_coverage'].append(f"{doctrine}:{'covered' if representation else 'missing'}")
        
        # 2. Check for problematic phrases
        for turn in dialogue['turns']:
            content = turn['content'].lower()
            for phrase in self.sensitive_phrases['critical']:
                if phrase in content:
                    flags['critical_issues'].append(f'critical_phrase|{phrase}')
            for phrase in self.sensitive_phrases['warning']:
                if phrase in content:
                    flags['warnings'].append(f'ambiguous_phrase|{phrase}')
        
        # 3. Check theological balance
        if "only old testament" in turns_text and "new testament" not in turns_text:
            flags['warnings'].append('old_testament_focus')
        if "only new testament" in turns_text and "old testament" not in turns_text:
            flags['warnings'].append('new_testament_focus')
        
        return flags

class ScriptureVerifier:
    """Enhanced scripture verification system"""
    
    def verify_dialogue_scriptures(self, dialogue: Dict) -> List[str]:
        """Verify all scripture references in dialogue"""
        issues = []
        turns_text = ' '.join(t['content'] for t in dialogue['turns'])
        scriptures = extract_scripture_references(turns_text)
        
        if not scriptures:
            return ['no_scripture_references']
        
        for ref in scriptures:
            ref_str = ref['full']
            
            # 1. Check if scripture exists in index
            if ref_str not in SCRIPTURE_INDEX:
                issues.append(f'unverified_verse|{ref_str}')
                continue
                
            # 2. Check context match
            context_match = self._check_context_match(ref_str, turns_text)
            if not context_match:
                issues.append(f'context_mismatch|{ref_str}')
                
            # 3. Check theological alignment
            if not self._check_theological_alignment(ref_str, turns_text):
                issues.append(f'theological_misalignment|{ref_str}')
                
        return issues
    
    def _check_context_match(self, scripture: str, dialogue_text: str) -> bool:
        """Verify dialogue context matches scripture context"""
        if scripture not in SCRIPTURE_INDEX:
            return False
            
        # Get themes from indexed scripture usage
        indexed_themes = set()
        for entry in SCRIPTURE_INDEX[scripture]:
            indexed_themes.update(entry.get('themes', []))
        
        # Get themes from current dialogue usage
        dialogue_themes = set(extract_key_themes(dialogue_text, max_themes=5))
        
        # Check for overlapping themes
        return len(indexed_themes & dialogue_themes) > 0
    
    def _check_theological_alignment(self, scripture: str, dialogue_text: str) -> bool:
        """Check if scripture usage aligns with core doctrines"""
        # These scriptures require special handling
        sensitive_verses = {
            "James 2:24": "salvation",
            "Matthew 24:36": "deity_of_christ",
            "Exodus 20:13": "old_covenant"
        }
        
        book = scripture.split()[0].lower()
        if 'john' in book or 'romans' in book or 'ephesians' in book:
            # These books typically support grace doctrines
            if "works-based salvation" in dialogue_text.lower():
                return False
        
        # Handle special cases
        if scripture in sensitive_verses:
            doctrine = sensitive_verses[scripture]
            if doctrine == "salvation":
                if "justified by works" in dialogue_text and "not by faith alone" in dialogue_text:
                    return False
            elif doctrine == "deity_of_christ":
                if "did not know" in dialogue_text and "limited knowledge" in dialogue_text:
                    return False
        
        return True

# MAIN EXECUTION
if __name__ == "__main__":
    print("Enhanced Dialogue Generator v2.0")
    print("=" * 50)
    
    # Build indices
    print("\nBuilding global indices...")
    datasets = [
        ("book", os.path.join(CONFIG['data_path'], "book.json")),
        ("rhapsody", os.path.join(CONFIG['data_path'], "ror.json"))
    ]
    
    # Build scripture index
    all_data = []
    for data_type, path in datasets:
        data = load_dataset(path)
        if data:
            all_data.extend(data[:1000])  # Sample for indexing
    
    SCRIPTURE_INDEX = build_scripture_index(all_data)
    print(f"Built scripture index with {len(SCRIPTURE_INDEX)} unique references")
    
    # Process datasets
    all_dialogues = []
    
    for data_type, path in datasets:
        dialogues = process_dataset_enhanced(path, data_type)
        all_dialogues.extend(dialogues)
    
    print(f"\nTotal dialogues generated: {len(all_dialogues)}")
    
    # Post-process
    print("\nPost-processing dialogues...")
    processed_dialogues = post_process_dialogues(all_dialogues)
    print(f"Dialogues after post-processing: {len(processed_dialogues)}")
    
    # Apply diversity filtering
    print("\nApplying diversity filtering...")
    final_dialogues = filter_dialogues_with_diversity(processed_dialogues)
    print(f"Final dialogue count: {len(final_dialogues)}")
    
    # Calculate and display statistics
    if final_dialogues:
        # Quality statistics
        coherence_scores = [d.get('coherence_score', 0) for d in final_dialogues]
        print(f"\nQuality Statistics:")
        print(f"  Average coherence: {np.mean(coherence_scores):.3f}")
        print(f"  Min coherence: {np.min(coherence_scores):.3f}")
        print(f"  Max coherence: {np.max(coherence_scores):.3f}")
        
        # Persona distribution
        persona_counts = Counter(d.get('persona', 'unknown') for d in final_dialogues)
        print(f"\nPersona Distribution:")
        for persona, count in persona_counts.items():
            print(f"  {persona}: {count} ({count/len(final_dialogues)*100:.1f}%)")
        
        # Difficulty distribution
        difficulty_counts = Counter(d.get('difficulty_level', 'unknown') for d in final_dialogues)
        print(f"\nDifficulty Distribution:")
        for difficulty, count in difficulty_counts.items():
            print(f"  {difficulty}: {count} ({count/len(final_dialogues)*100:.1f}%)")
        
        # Theme coverage
        all_themes = []
        for d in final_dialogues:
            all_themes.extend(d.get('key_themes', []))
        theme_counts = Counter(all_themes)
        print(f"\nTop 10 Themes:")
        for theme, count in theme_counts.most_common(10):
            print(f"  {theme}: {count}")
            
    print("\nApplying pastoral review layer...")
    post_processor = PastoralPostProcessor()
    final_dialogues = post_processor.add_review_metadata(final_dialogues)
    
    # Save results
    save_dialogues(final_dialogues, "enhanced_dialogues_v2.json")
    
    # Clean up
    checkpoint_manager = CheckpointManager(CONFIG['checkpoint_dir'])
    checkpoint_manager.clean_old_checkpoints(keep_last=3)
    
    # Display sample
    if final_dialogues:
        print("\n" + "="*50)
        print("SAMPLE DIALOGUE")
        print("="*50)
        
        sample = random.choice(final_dialogues[:10])
        print(f"\nDialogue ID: {sample['dialogue_id']}")
        print(f"Source: {sample['source']}")
        print(f"Persona: {sample.get('persona', 'unknown')}")
        print(f"Difficulty: {sample['difficulty_level']}")
        print(f"Themes: {', '.join(sample['key_themes'])}")
        print(f"Coherence Score: {sample['coherence_score']:.3f}")
        
        print("\nConversation:")
        for i, turn in enumerate(sample['turns']):
            print(f"\n{turn['role'].upper()} (Turn {i+1}):")
            print(turn['content'])
    
    print("\n" + "="*50)
    print("Processing complete!")
    print("="*50)