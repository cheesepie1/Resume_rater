import os
from pathlib import Path
from src.resume_rater.data_ingestion import ResumeHandler
from src.resume_rater.data_analisis import ResumeAnalyzer

CV_PATH=r"data/Jinchao_Li.pdf"

class SimFile:
    def __init__(self,file_path):
        self.name=Path(file_path).name
        self._file_path=file_path
    def getbuffer(self):
        return open(self._file_path, "rb").read()

def main():
    dummy_resume=SimFile(CV_PATH)
    handler=ResumeHandler(session_id="test_session")

    saved_path=handler.save_pdf(dummy_resume)

    resume_text=handler.read_pdf(saved_path)

    job_file="tempJob.txt"

    with open(job_file, "r",encoding="utf-8") as file:
        job_description=file.read()

    analyzer=ResumeAnalyzer()

    result=analyzer.analyze_resume(resume_text,job_description)

    for key,value in result.items():
        print(f"{key}: {value}")

if __name__ == "__main__":
    main()