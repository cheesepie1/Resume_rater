from pydantic import BaseModel
from typing import List, Union
from enum import Enum

class ResumeRater(BaseModel):
    overall_score: Union[int, float]
    score_description: str
    skills_match:dict
    experience_match:dict
    education_match:dict
    job_compliance:dict
    additional_points:List[str]
    improvements:List[str]

class JobDescription(BaseModel):
    title: str
    company: str
    location: str
    description: List[str]
    requirements: List[str]
   