import os
import fitz
import sys
import uuid
from datetime import datetime
from logger.custom_logger import CustomLogger
from exception.custom_exception import ResumeAnalysisException

class ResumeHandler:

    def __init__(self, data_dir=None, session_id=None):
        try:
            self.log=CustomLogger().get_logger(__name__)
            self.data_dir = data_dir or os.getenv(
                "DATA_STORAGE_PATH",
                os.path.join(os.getcwd(), "data", "resume_analysis")
            )
            self.session_id = session_id or f"session_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:8]}"

            ## Create base session dir
            self.session_path = os.path.join(self.data_dir, self.session_id)
            os.makedirs(self.session_path, exist_ok=True)

            self.log.info("ResumeHandler Initialized", session_id=self.session_id, session_path=self.session_path)
        except Exception as e:
            self.log.error(f"error initialized ResumeHandler: {e}")
            raise ResumeAnalysisException(f"Error initializing ResumeHandler", sys)
    
    def save_pdf(self,uploaded_file):
        try:
            filename = None
            if hasattr(uploaded_file, "filename") and uploaded_file.filename:
                filename = os.path.basename(uploaded_file.filename)
            elif hasattr(uploaded_file, "name") and uploaded_file.name:
                filename = os.path.basename(uploaded_file.name)
            
            ## Dealing with errors: no file found && wrong file type
            if not filename:
                raise ResumeAnalysisException("Could not determine filename from uploaded file.", sys)
            
            if not filename.lower().endswith(".pdf"):
                raise ResumeAnalysisException("Invalid file type. Only PDFs are allowed.",sys)

            save_path = os.path.join(self.session_path, filename)
            
            ## Get bytes from file for different frames: eg. fastapi/flask/python/streamlit
            file_bytes = None
            # for fastApi
            if hasattr(uploaded_file, "file") and hasattr(uploaded_file.file, "read"):
                file_bytes = uploaded_file.file.read()
            # for streamLit
            elif hasattr(uploaded_file, "getbuffer"):
                file_bytes = uploaded_file.getbuffer()
            # for Python / Flask / BytesIO
            elif hasattr(uploaded_file, "read"):
                file_bytes = uploaded_file.read()
            else:
                raise ResumeAnalysisException("Unsupported upload file type: cannot read bytes.", sys)

            with open(save_path, "wb") as f:
                f.write(file_bytes)

            self.log.info("Resume saved successfully", file=filename, save_path=save_path, session_id=self.session_id)
            
            return save_path
        
        except Exception as e:
            self.log.error(f"Error saving Resume: {e}")
            raise ResumeAnalysisException("Error saving Resume", e) from e

    def read_pdf(self, pdf_path:str)->str:
        try:
            text_chunks = []
            with fitz.open(pdf_path) as doc:
                for page_num, page in enumerate(doc, start=1):
                    text_chunks.append(f"\n--- Page {page_num} ---\n{page.get_text()}")
            text = "\n".join(text_chunks)

            self.log.info("Resume read successfully", pdf_path=pdf_path, session_id=self.session_id, pages=len(text_chunks))
            return text
        except Exception as e:
            self.log.error(f"Error reading PDF resume: {e}")
            raise ResumeAnalysisException("Error reading PDF resume", e) from e