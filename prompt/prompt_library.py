from langchain_core.prompts import ChatPromptTemplate

resume_analyser_prompt = ChatPromptTemplate.from_template("""
You are an expert career coach and hiring analyst.
Your task is to evaluate how well a given resume matches a specific job description.

Return ONLY valid JSON that exactly matches the provided schema — no extra text, explanations, or commentary.

{format_instructions}

Analyze based on:
1. Skills match: Identify matching skills and missing skills compared to the job description.
2. Experience relevance: How well past roles and achievements align with the job requirements.
3. Education & certifications: Relevance to the role.
4. Overall suitability score: A numeric score from 0 to 100, where 100 means a perfect match.
5. Scopes for improvement: List of areas for improvement to match the job description.

INPUTS:
Job Description:

{job_description}

Resume Text:

{resume_text}

INSTRUCTIONS:
- Compare the resume only against the job description provided.
- Be strict but fair — missing critical requirements should lower the score significantly.
- Ensure your reasoning is clear in the JSON fields.
- For skills_match, experience_match, education_match, and job_compliance, provide detailed breakdowns with scores for each category.
- Do not output anything except the JSON response.

EXAMPLE STRUCTURE:
{{
  "overall_score": 75,
  "score_description": "Good match with some areas for improvement",
  "skills_match": {{
    "Technical Skills": 80,
    "Soft Skills": 70,
    "Industry Knowledge": 60
  }},
  "experience_match": {{
    "Relevant Experience": 85,
    "Leadership Experience": 70,
    "Project Management": 60
  }},
  "education_match": {{
    "Degree Level": 90,
    "Field of Study": 80,
    "Certifications": 70
  }},
  "job_compliance": {{
    "Required Skills": 75,
    "Experience Level": 80,
    "Education Requirements": 85
  }},
  "additional_points": [
    "Strong technical background",
    "Relevant project experience"
  ],
  "improvements": [
    "Add more specific examples of leadership",
    "Include relevant certifications"
  ]
}}
""")


job_description_scrapper = ChatPromptTemplate.from_template("""
Extract job details from the following text:
{job_text}
Return as JSON according to the following schema:
{format_instructions}
""")

# Central dictionary to register prompts
PROMPT_REGISTRY = {
    "resume_analysis": resume_analyser_prompt,
    "job_description":job_description_scrapper,
}
