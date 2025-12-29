# Resume Rater

Resume Rater is a backend-focused project that evaluates resumes against job descriptions using LLMs.  
It extracts structured information from resumes, analyzes job requirements, and generates a score and feedback based on alignment.

The project is designed with clear separation of concerns, extensibility, and LLM-output validation in mind.

---

## 🚀 Features

- 📄 **Resume Parsing**

  - Supports PDF resume input
  - Extracts structured resume content for downstream analysis

- 🧠 **LLM-based Resume Scoring**

  - Compares resume content with job descriptions
  - Produces a relevance score and qualitative feedback

- 📐 **Strict Output Validation**

  - Uses **Pydantic models** to enforce structured LLM responses
  - Prevents malformed or unexpected outputs from the LLM

- 🔌 **RESTful API**

  - Built with FastAPI
  - Clean separation between API layer, business logic, and LLM chains

- 🧪 **Prompt & Chain Modularity**
  - Prompts and parsers are easy to modify or extend
  - Supports future multi-model or multi-chain setups

---

## 🔄 Example API Flow

1. Client sends:

   - Resume file (PDF)
   - Job description text

2. Backend process:

   - Resume is parsed into structured text
   - Job description and resume are passed into an LLM chain
   - LLM output is validated using a Pydantic schema

3. Response returned:
   - Resume score
   - Strengths and weaknesses
   - Matching analysis against job requirements

---

## ⚙️ Installation & Setup

### Clone the repository,

activate the env,
install the dependency,
add .env file to store your api key, example:(OPENAI_API_KEY=your_api_key_here),
then run the app

```bash
git clone https://github.com/cheesepie1/Resume_rater.git
cd Resume_rater

python -m venv resume_scorer
source resume_scorer/bin/activate  # macOS / Linux
resume_scorer\Scripts\activate     # Windows

pip install -r requirements.txt

uvicorn src.main:app --reload
```
