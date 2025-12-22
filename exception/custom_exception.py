import sys
import traceback

class ResumeAnalysisException(Exception):
    def __init__(self, error_message, error_details):
        _, _, exc_tb = error_details.exc_info()
        self.filename = exc_tb.tb_frame.f_code.co_filename
        self.lineno = exc_tb.tb_lineno
        self.error_message = str(error_message)
        self.traceback_str = ''.join(traceback.format_exception(*error_details.exc_info()))

     ## To return the error message in a readable format
    def __str__(self):
        return f"""
        Error in [{self.filename}] at line number [{self.lineno}]
        Message: {self.error_message}
        Traceback: {self.traceback_str}
        """
if __name__ == "__main__":
    try:
        a =int("test")
    except Exception as e:
        app_exc = ResumeAnalysisException(e, sys)
        raise app_exc

 

      