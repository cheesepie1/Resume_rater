import os
import sys
from utils.model_loader import ModelLoader
from logger.custom_logger import CustomLogger
from exception.custom_exception import ResumeanalyserException
from model.models import *
from langchain_core.output_parsers import JsonOutputParser, OutputFixingParser
from prompt.prompt_library import PROMPT_REGISTRY
from utils import job_loader


class ResumeAnalyzer:
    
    def __init__(self):
        self.log = CustomLogger().get_logger(__name__)
        try:
            # load llm
            self.loader=ModelLoader()
            self.llm=self.loader.load_llm()
            # load job description
            self.jobdescriptor=job_loader.JobLoader()
            # structure the output into resumeRater
            self.parser = JsonOutputParser(pydantic_object=ResumeRater)

            # adjust the output if it is not good match to ResumeRater.
            self.fixing_parser = OutputFixingParser.from_llm(parser=self.parser, llm=self.llm)
            
            # avoid hard coding, making prompt reusable
            self.prompt = PROMPT_REGISTRY["resume_analysis"]
            
            self.log.info("Resume Analyzer initialized successfully")
            
            
        except Exception as e:
            self.log.error(f"Error initializing Resume Analyzer: {e}")
            raise ResumeanalyserException("Error in Resume Analyzer initialization", sys)
    
    def analyze_resume(self, resume_text:str,job_description:str)-> dict:
        
        try:
            
            url=self.jobdescriptor.url_extractor(job_description)
            if url is not None:
                self.log.info(f"Url Extracted: {url}")
                job_text = self.jobdescriptor.load_job_url(url)
                job_details = self.jobdescriptor.extract_job_details(job_text)
                job_description=job_details
            else:
                self.log.info(f"No URL was extracted")
           
            ## buidling langchain pipeline
            chain = self.prompt | self.llm | self.fixing_parser
            
            self.log.info("Meta-data analysis chain initialized")
            self.log.info(f"Resume text length: {len(resume_text)}")
            self.log.info(f"Job description length: {len(job_description)}")

            response = chain.invoke({
                "format_instructions": self.parser.get_format_instructions(),
                "job_description": job_description,
                "resume_text":resume_text
            })

            self.log.info(f"Raw LLM response type: {type(response)}")
            self.log.info(f"Raw LLM response: {response}")
            
            # Convert to dict if it's a Pydantic model
            # Making sure that any type of returned message is in dict format
            if hasattr(response, 'dict'):
                response_dict = response.dict()
            elif hasattr(response, '__dict__'):
                response_dict = response.__dict__
            else:
                response_dict = response

            self.log.info("Metadata extraction successful", keys=list(response_dict.keys()) if isinstance(response_dict, dict) else 'Not a dict')
            
            return response_dict

        
        except Exception as e:
            ## Record failure message, type and traceback
            self.log.error(f"Metadata analysis failed: {str(e)}")
            self.log.error(f"Exception type: {type(e)}")
            import traceback
            self.log.error(f"Traceback: {traceback.format_exc()}")
            raise ResumeanalyserException("Metadata extraction failed",sys)

            