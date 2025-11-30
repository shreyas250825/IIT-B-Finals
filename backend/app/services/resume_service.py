# backend/app/services/resume_service.py
import pdfplumber
from docx import Document
import re
from typing import Dict, Any, List
from app.models.resume import Resume
from sqlalchemy.orm import Session

class ResumeService:
    def __init__(self, db: Session):
        self.db = db
    
    def parse_resume(self, file_path: str) -> Dict[str, Any]:
        """Parse resume file and extract information"""
        file_ext = file_path.lower().split('.')[-1]
        
        if file_ext == 'pdf':
            text = self._extract_text_from_pdf(file_path)
        elif file_ext == 'docx':
            text = self._extract_text_from_docx(file_path)
        else:
            with open(file_path, 'r', encoding='utf-8') as f:
                text = f.read()
        
        # Extract information from text
        parsed_data = self._extract_resume_data(text)
        
        # Save to database
        resume = Resume(
            file_name=file_path.split('/')[-1],
            file_path=file_path,
            extracted_text=text,
            parsed_data=parsed_data
        )
        
        self.db.add(resume)
        self.db.commit()
        self.db.refresh(resume)
        
        return parsed_data
    
    def _extract_text_from_pdf(self, file_path: str) -> str:
        """Extract text from PDF file"""
        text = ""
        try:
            with pdfplumber.open(file_path) as pdf:
                for page in pdf.pages:
                    text += page.extract_text() or ""
        except Exception as e:
            raise Exception(f"Failed to extract text from PDF: {str(e)}")
        return text
    
    def _extract_text_from_docx(self, file_path: str) -> str:
        """Extract text from DOCX file"""
        try:
            doc = Document(file_path)
            text = "\n".join([paragraph.text for paragraph in doc.paragraphs])
            return text
        except Exception as e:
            raise Exception(f"Failed to extract text from DOCX: {str(e)}")
    
    def _extract_resume_data(self, text: str) -> Dict[str, Any]:
        """Extract structured data from resume text"""
        skills = self._extract_skills(text)
        experience = self._extract_experience(text)
        education = self._extract_education(text)
        
        return {
            "skills": skills,
            "experience": experience,
            "education": education,
            "estimated_role": self._estimate_role(skills),
            "summary": self._generate_summary(skills, experience)
        }
    
    def _extract_skills(self, text: str) -> List[str]:
        """Extract skills from resume text"""
        # Common technical skills
        skill_keywords = [
            'python', 'java', 'javascript', 'typescript', 'react', 'angular', 'vue',
            'node.js', 'django', 'flask', 'spring', 'express', 'sql', 'mongodb',
            'postgresql', 'mysql', 'aws', 'docker', 'kubernetes', 'git', 'jenkins',
            'machine learning', 'deep learning', 'tensorflow', 'pytorch', 'scikit-learn',
            'data analysis', 'pandas', 'numpy', 'tableau', 'power bi', 'excel',
            'agile', 'scrum', 'project management', 'leadership', 'communication'
        ]
        
        found_skills = []
        text_lower = text.lower()
        
        for skill in skill_keywords:
            if skill in text_lower:
                found_skills.append(skill.title())
        
        return list(set(found_skills))[:15]  # Return unique skills, max 15
    
    def _extract_experience(self, text: str) -> Dict[str, Any]:
        """Extract experience information"""
        # Simple experience extraction
        experience_pattern = r'(\d+)\s*(?:years?|yrs?)\s*(?:of)?\s*experience'
        match = re.search(experience_pattern, text.lower())
        
        years_experience = 0
        if match:
            years_experience = int(match.group(1))
        
        return {
            "years_experience": years_experience,
            "level": self._get_experience_level(years_experience)
        }
    
    def _extract_education(self, text: str) -> List[str]:
        """Extract education information"""
        education_keywords = [
            'bachelor', 'master', 'phd', 'doctorate', 'b\.?s\.?', 'm\.?s\.?', 
            'b\.?a\.?', 'm\.?a\.?', 'associate', 'diploma', 'certificate'
        ]
        
        education = []
        lines = text.split('\n')
        
        for line in lines:
            line_lower = line.lower()
            if any(edu in line_lower for edu in education_keywords):
                # Clean and add the education line
                clean_line = re.sub(r'[^\w\s\.]', '', line).strip()
                if clean_line and len(clean_line) > 10:  # Avoid very short lines
                    education.append(clean_line)
        
        return education[:5]  # Return max 5 education entries
    
    def _estimate_role(self, skills: List[str]) -> str:
        """Estimate role based on skills"""
        role_patterns = {
            'Data Scientist': ['python', 'machine learning', 'pandas', 'numpy', 'data analysis'],
            'Software Engineer': ['python', 'java', 'javascript', 'sql', 'git'],
            'Frontend Developer': ['javascript', 'react', 'angular', 'vue', 'typescript'],
            'Backend Developer': ['python', 'java', 'node.js', 'sql', 'mongodb'],
            'ML Engineer': ['python', 'machine learning', 'deep learning', 'tensorflow', 'pytorch'],
            'DevOps Engineer': ['aws', 'docker', 'kubernetes', 'jenkins', 'git']
        }
        
        best_match = 'Software Engineer'
        max_matches = 0
        
        for role, required_skills in role_patterns.items():
            matches = sum(1 for skill in required_skills if any(skill in s.lower() for s in skills))
            if matches > max_matches:
                max_matches = matches
                best_match = role
        
        return best_match
    
    def _get_experience_level(self, years: int) -> str:
        """Get experience level based on years"""
        if years <= 2:
            return "Junior"
        elif years <= 5:
            return "Mid-Level"
        elif years <= 10:
            return "Senior"
        else:
            return "Principal/Lead"
    
    def _generate_summary(self, skills: List[str], experience: Dict[str, Any]) -> str:
        """Generate a summary based on extracted data"""
        level = experience.get('level', 'Junior')
        years = experience.get('years_experience', 0)
        top_skills = skills[:5]
        
        summary = f"{level} professional with {years} years of experience. "
        summary += f"Skilled in {', '.join(top_skills)}."
        
        return summary