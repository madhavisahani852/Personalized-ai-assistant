import os
import json
import logging
import re
from typing import List, Dict, Any, Optional
from langchain_chroma import Chroma
from langchain_core.prompts import PromptTemplate
from langchain_ollama import OllamaLLM

from app.config.settings import CHROMA_DB_DIR, DEFAULT_LLM_MODEL, DEFAULT_RETRIEVAL_K, OLLAMA_BASE_URL
from app.services.embedding_service import get_embedding_model
from app.models.schemas import SourceDoc, QuizQuestion, Flashcard

logger = logging.getLogger(__name__)

class RAGService:
    def __init__(self):
        self.persist_directory = str(CHROMA_DB_DIR)
        self.embedding_function = get_embedding_model()
        self._db = None

    @property
    def db(self) -> Chroma:
        """
        Lazy loader for Chroma vector store instance.
        """
        if self._db is None:
            self._db = Chroma(
                persist_directory=self.persist_directory,
                embedding_function=self.embedding_function
            )
        return self._db

    def add_documents(self, documents):
        """
        Add document chunks to Chroma vector store.
        """
        if not documents:
            return
        self.db.add_documents(documents)
        logger.info(f"Added {len(documents)} document chunks to ChromaDB at {self.persist_directory}")

    def delete_document(self, file_id: str):
        """
        Delete all vectors corresponding to a file_id from Chroma vector store.
        """
        try:
            results = self.db.get(where={"file_id": file_id})
            ids_to_delete = results.get("ids", [])
            if ids_to_delete:
                self.db.delete(ids=ids_to_delete)
                logger.info(f"Deleted {len(ids_to_delete)} vectors for file_id {file_id}")
        except Exception as e:
            logger.error(f"Error deleting vectors for file_id {file_id}: {str(e)}")

    def retrieve_documents(self, question: str, file_ids: Optional[List[str]] = None, k: int = DEFAULT_RETRIEVAL_K):
        """
        Retrieve relevant documents using similarity search.
        Preserves logic from existing retriever.py while supporting multi-PDF filtering.
        """
        filter_dict = None
        if file_ids and len(file_ids) == 1:
            filter_dict = {"file_id": file_ids[0]}
        elif file_ids and len(file_ids) > 1:
            filter_dict = {"file_id": {"$in": file_ids}}

        try:
            if filter_dict:
                results = self.db.similarity_search(question, k=k, filter=filter_dict)
            else:
                results = self.db.similarity_search(question, k=k)
            return results
        except Exception as e:
            logger.warning(f"Chroma similarity search with filter failed, falling back to unfiltered search: {e}")
            return self.db.similarity_search(question, k=k)

    def get_llm(self, model_name: str = DEFAULT_LLM_MODEL) -> OllamaLLM:
        """
        Get Ollama LLM instance (Preserved from existing chain.py).
        """
        return OllamaLLM(
            model=model_name,
            base_url=OLLAMA_BASE_URL,
            temperature=0.3
        )

    def check_ollama_status(self, model_name: str = DEFAULT_LLM_MODEL) -> bool:
        """
        Test if local Ollama service is reachable.
        """
        try:
            import requests
            res = requests.get(f"{OLLAMA_BASE_URL}/api/tags", timeout=3)
            return res.status_code == 200
        except Exception:
            return False

    def answer_question(
        self,
        question: str,
        file_ids: Optional[List[str]] = None,
        history: Optional[List[Dict[str, str]]] = None,
        model_name: str = DEFAULT_LLM_MODEL,
        k: int = DEFAULT_RETRIEVAL_K
    ) -> Dict[str, Any]:
        """
        QA execution (Preserved from existing pdf_qa.py and chain.py).
        """
        results = self.retrieve_documents(question, file_ids=file_ids, k=k)
        
        sources = []
        context_parts = []
        for doc in results:
            context_parts.append(doc.page_content)
            filename = doc.metadata.get("filename", "Document.pdf")
            page = doc.metadata.get("page", 1)
            sources.append(
                SourceDoc(
                    filename=filename,
                    page=page,
                    content_snippet=doc.page_content[:200] + "..."
                )
            )

        context = "\n\n---\n\n".join(context_parts) if context_parts else "No context found."

        # Format history string if present
        history_str = ""
        if history:
            formatted_history = []
            for msg in history[-4:]:  # last 4 turns
                role = "Student" if msg.get("role") == "user" else "Assistant"
                formatted_history.append(f"{role}: {msg.get('content')}")
            history_str = "\nConversation Memory:\n" + "\n".join(formatted_history) + "\n"

        prompt_template = PromptTemplate(
            template="""
You are a helpful study assistant.

Answer the question clearly and accurately using ONLY the provided context below. If the answer cannot be determined from the context, state that clearly.

{history_str}
Context:
{context}

Question:
{question}

Answer:
""",
            input_variables=["context", "question", "history_str"]
        )

        try:
            llm = self.get_llm(model_name)
            chain = prompt_template | llm
            response = chain.invoke({
                "context": context,
                "question": question,
                "history_str": history_str
            })
            answer_text = str(response).strip()
        except Exception as e:
            logger.error(f"Error invoking Ollama LLM: {e}")
            if not self.check_ollama_status(model_name):
                answer_text = f"⚠️ Could not connect to local Ollama server at {OLLAMA_BASE_URL}. Please make sure Ollama is running and model '{model_name}' is installed (`ollama run {model_name}`)."
            else:
                answer_text = f"An error occurred while generating answer with LLM model '{model_name}': {str(e)}"

        return {
            "answer": answer_text,
            "sources": sources,
            "model_used": model_name
        }

    def generate_summary(
        self,
        file_id: Optional[str] = None,
        file_ids: Optional[List[str]] = None,
        summary_type: str = "comprehensive",
        model_name: str = DEFAULT_LLM_MODEL
    ) -> Dict[str, Any]:
        """
        Generate structured summary from PDF documents.
        """
        target_file_ids = file_ids if file_ids else ([file_id] if file_id else None)
        docs = self.retrieve_documents("overview main topics summary key concepts definitions", file_ids=target_file_ids, k=8)
        context = "\n\n".join([d.page_content for d in docs]) if docs else ""
        
        filename = docs[0].metadata.get("filename", "Uploaded PDF Document") if docs else "Uploaded PDF Document"

        if not context:
            return {
                "title": f"Summary of {filename}",
                "summary": "No text content could be extracted from the selected document.",
                "key_points": ["Upload a valid PDF document to generate summaries."]
            }

        prompt = PromptTemplate(
            template="""
You are an expert academic study assistant.
Based on the following study materials extracted from the student's PDF, generate a structured summary.

Context:
{context}

Format your response strictly as follows:
TITLE: [Concise Study Topic Title based on the text]
SUMMARY:
[Write a 2-3 paragraph overview of the key concepts from the context]
KEY POINTS:
- [Point 1]
- [Point 2]
- [Point 3]
- [Point 4]
- [Point 5]
""",
            input_variables=["context"]
        )

        try:
            llm = self.get_llm(model_name)
            chain = prompt | llm
            res = chain.invoke({"context": context})
            raw_text = str(res)

            # Parse formatted response
            title = filename
            if "TITLE:" in raw_text:
                title_match = re.search(r"TITLE:\s*(.*?)(?=\n|SUMMARY:|$)", raw_text, re.IGNORECASE)
                if title_match:
                    title = title_match.group(1).strip()

            summary_text = raw_text
            if "SUMMARY:" in raw_text and "KEY POINTS:" in raw_text:
                summary_part = raw_text.split("SUMMARY:")[1].split("KEY POINTS:")[0].strip()
                summary_text = summary_part

            key_points = []
            if "KEY POINTS:" in raw_text:
                kp_part = raw_text.split("KEY POINTS:")[1].strip()
                for line in kp_part.split("\n"):
                    cleaned = re.sub(r"^[\s\-\*\d\.]+", "", line).strip()
                    if cleaned and len(cleaned) > 5:
                        key_points.append(cleaned)
            
            if not key_points:
                # Dynamically pull key sentences from context
                sentences = [s.strip() for s in re.split(r'[\.\n]+', context) if len(s.strip()) > 20]
                key_points = sentences[:5]

        except Exception as e:
            logger.error(f"Summary generation error: {e}")
            sentences = [s.strip() for s in re.split(r'[\.\n]+', context) if len(s.strip()) > 20]
            title = f"Study Notes: {filename}"
            summary_text = "\n\n".join(sentences[:3]) if sentences else context[:500]
            key_points = sentences[3:8] if len(sentences) >= 8 else (sentences[:5] if sentences else ["Key points extracted from document."])

        return {
            "title": title,
            "summary": summary_text,
            "key_points": key_points
        }

    def generate_quiz(
        self,
        file_id: Optional[str] = None,
        file_ids: Optional[List[str]] = None,
        num_questions: int = 5,
        topic: Optional[str] = None,
        model_name: str = DEFAULT_LLM_MODEL
    ) -> Dict[str, Any]:
        """
        Generate Multiple Choice Questions (MCQs) strictly from uploaded PDF content.
        """
        target_file_ids = file_ids if file_ids else ([file_id] if file_id else None)
        query = topic if topic else "important definitions concepts principles rules key facts"
        docs = self.retrieve_documents(query, file_ids=target_file_ids, k=8)
        context = "\n\n".join([d.page_content for d in docs]) if docs else ""
        filename = docs[0].metadata.get("filename", "Uploaded PDF Document") if docs else "Uploaded PDF"

        prompt = PromptTemplate(
            template="""
You are an expert exam creator.
Create {num_questions} Multiple Choice Questions (MCQs) based strictly on the context below.

Context:
{context}

Respond strictly with valid JSON list format containing objects with keys:
"id" (number), "question" (string), "options" (array of 4 strings), "correct_answer" (string matching exact option text), "explanation" (string).

JSON Output:
""",
            input_variables=["context", "num_questions"]
        )

        questions = []
        try:
            llm = self.get_llm(model_name)
            chain = prompt | llm
            raw_res = chain.invoke({"context": context, "num_questions": num_questions})
            
            json_str = str(raw_res)
            match = re.search(r"\[.*\]", json_str, re.DOTALL)
            if match:
                json_str = match.group(0)
            
            parsed = json.loads(json_str)
            for item in parsed:
                opts = item.get("options", [])
                if len(opts) >= 2:
                    ans = item.get("correct_answer", opts[0])
                    questions.append(
                        QuizQuestion(
                            id=item.get("id", len(questions) + 1),
                            question=item.get("question", "Question based on PDF material"),
                            options=opts[:4] if len(opts) >= 4 else (opts + ["None of the above", "All of the above"])[:4],
                            correct_answer=ans,
                            explanation=item.get("explanation", "Extracted directly from study context.")
                        )
                    )
        except Exception as e:
            logger.error(f"Quiz LLM JSON generation error: {e}")

        # Dynamic fallback: build quiz questions directly from PDF text sentences if LLM didn't return valid JSON
        if not questions and context:
            sentences = [s.strip() for s in re.split(r'[\.\n]+', context) if len(s.strip()) > 30 and len(s.strip()) < 200]
            for i, stmt in enumerate(sentences[:num_questions]):
                words = stmt.split()
                key_concept = words[0] if len(words) > 0 else "Concept"
                questions.append(
                    QuizQuestion(
                        id=i + 1,
                        question=f"According to {filename}: {stmt} - What is the key concept referenced here?",
                        options=[
                            f"{key_concept} Principle",
                            "Unrelated Standard",
                            "General Exception",
                            "None of the above"
                        ],
                        correct_answer=f"{key_concept} Principle",
                        explanation=f"Direct quote from document: '{stmt}'"
                    )
                )

        if not questions:
            questions = [
                QuizQuestion(
                    id=1,
                    question=f"What is the main topic covered in {filename}?",
                    options=["Core Academic Concepts", "General Reference", "Appendix Material", "Introduction"],
                    correct_answer="Core Academic Concepts",
                    explanation="Extracted from the indexed PDF document."
                )
            ]

        return {
            "title": f"Practice Quiz for {filename} ({len(questions)} Questions)",
            "questions": questions
        }

    def generate_flashcards(
        self,
        file_id: Optional[str] = None,
        file_ids: Optional[List[str]] = None,
        num_cards: int = 5,
        topic: Optional[str] = None,
        model_name: str = DEFAULT_LLM_MODEL
    ) -> Dict[str, Any]:
        """
        Generate study flashcards (Question/Front and Answer/Back) strictly from uploaded PDF content.
        """
        target_file_ids = file_ids if file_ids else ([file_id] if file_id else None)
        query = topic if topic else "key terms definitions concepts formulas principles rules"
        docs = self.retrieve_documents(query, file_ids=target_file_ids, k=8)
        context = "\n\n".join([d.page_content for d in docs]) if docs else ""
        filename = docs[0].metadata.get("filename", "Uploaded PDF Document") if docs else "Uploaded PDF"

        prompt = PromptTemplate(
            template="""
You are a study card generator.
Create {num_cards} flashcards based strictly on the context below.

Context:
{context}

Respond strictly with valid JSON list format containing objects with keys:
"id" (number), "front" (question or concept name), "back" (detailed explanation or answer), "topic" (short topic category).

JSON Output:
""",
            input_variables=["context", "num_cards"]
        )

        cards = []
        try:
            llm = self.get_llm(model_name)
            chain = prompt | llm
            raw_res = chain.invoke({"context": context, "num_cards": num_cards})
            
            json_str = str(raw_res)
            match = re.search(r"\[.*\]", json_str, re.DOTALL)
            if match:
                json_str = match.group(0)
            
            parsed = json.loads(json_str)
            for item in parsed:
                if item.get("front") and item.get("back"):
                    cards.append(
                        Flashcard(
                            id=item.get("id", len(cards) + 1),
                            front=item.get("front"),
                            back=item.get("back"),
                            topic=item.get("topic", filename)
                        )
                    )
        except Exception as e:
            logger.error(f"Flashcard LLM JSON generation error: {e}")

        # Dynamic fallback: build flashcards directly from PDF text sentences if LLM didn't return valid JSON
        if not cards and context:
            sentences = [s.strip() for s in re.split(r'[\.\n]+', context) if len(s.strip()) > 25 and len(s.strip()) < 250]
            for i, stmt in enumerate(sentences[:num_cards]):
                words = stmt.split()
                front_term = " ".join(words[:4]) if len(words) >= 4 else "Key Concept"
                cards.append(
                    Flashcard(
                        id=i + 1,
                        front=f"Define / Explain: {front_term}...",
                        back=stmt,
                        topic=filename
                    )
                )

        if not cards:
            cards = [
                Flashcard(
                    id=1,
                    front=f"Core Concept from {filename}",
                    back="Key material extracted from uploaded PDF.",
                    topic=filename
                )
            ]

        return {
            "title": f"Flashcard Deck for {filename} ({len(cards)} Cards)",
            "cards": cards
        }

# Global singleton RAG service instance
rag_service = RAGService()
