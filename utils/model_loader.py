import os
import sys
from dotenv import load_dotenv
from utils.config_loader import load_config
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_groq import ChatGroq
from logger.custom_logger import CustomLogger
from exception.custom_exception import ResumeAnalysisException
log = CustomLogger().get_logger(__name__)


class ModelLoader:

    def __init__(self):
        
        load_dotenv()
        self._validate_env()
        self.config=load_config()
        log.info("Configuration loaded successfully", config_keys=list(self.config.keys()))

    ## To check if the api key are valid, if missing, then raise error exception, to avoid crushing.  
    def _validate_env(self):
        
        required_vars=["GOOGLE_API_KEY","GROQ_API_KEY"]
        self.api_keys={key:os.getenv(key) for key in required_vars}
        missing = [k for k, v in self.api_keys.items() if not v]
        if missing:
            log.error("Missing environment variables", missing_vars=missing)
            raise ResumeAnalysisException("Missing environment variables", sys)
        log.info("Environment variables validated", available_keys=[k for k in self.api_keys if self.api_keys[k]])
        
    ## To load llm models
    def load_llm(self):
        
        llm_block = self.config["llm"]

        log.info("Loading LLM...")
        
        ## Set google as default llm.
        provider_key = os.getenv("LLM_PROVIDER", "google")
        if provider_key not in llm_block:
            log.error("LLM provider not found in config", provider_key=provider_key)
            raise ValueError(f"Provider '{provider_key}' not found in config")

        llm_config = llm_block[provider_key]
        provider = llm_config.get("provider")
        model_name = llm_config.get("model_name")
        temperature = llm_config.get("temperature", 0.2)
        max_tokens = llm_config.get("max_output_tokens", 2048)
        
        log.info("Loading LLM", provider=provider, model=model_name, temperature=temperature, max_tokens=max_tokens)

        if provider == "google":
            llm=ChatGoogleGenerativeAI(
                model=model_name,
                temperature=temperature,
                max_output_tokens=max_tokens
            )
            return llm

        elif provider == "groq":
            llm=ChatGroq(
                model=model_name,
                api_key=self.api_keys["GROQ_API_KEY"],
                temperature=temperature,
            )
            return llm
            
        else:
            log.error("Invalid LLM provider", provider=provider)
            raise ValueError(f"Invalid LLM provider: {provider}")
        
    
    
if __name__ == "__main__":
    loader = ModelLoader()
    llm = loader.load_llm()
    print(f"LLM Loaded: {llm}")
    result=llm.invoke("Hello, how are you?")
    print(f"LLM: {result.content}")