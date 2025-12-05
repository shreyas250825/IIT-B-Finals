# backend/app/services/resume_service.py
import pdfplumber
from docx import Document
import re
from datetime import datetime
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
        projects = self._extract_projects(text)
        education = self._extract_education(text)
        
        return {
            "skills": skills,
            "experience_years": experience.get("years_experience", 0),
            "experience": experience,
            "projects": projects,
            "education": education,
            "estimated_role": self._estimate_role(skills),
            "summary": self._generate_summary(skills, experience)
        }
    
    def _extract_skills(self, text: str) -> List[str]:
        """Extract skills from resume text using advanced techniques"""
        # Comprehensive skill database
        skill_keywords = {
            # Programming Languages
            'python', 'java', 'javascript', 'typescript', 'c++', 'c#', 'c', 'go', 'rust', 'kotlin', 
            'swift', 'php', 'ruby', 'scala', 'r', 'matlab', 'perl', 'shell', 'bash', 'powershell',
            # Web Technologies
            'react', 'angular', 'vue', 'next.js', 'nuxt', 'svelte', 'ember', 'jquery', 'html', 'css',
            'sass', 'scss', 'less', 'webpack', 'vite', 'babel', 'es6', 'typescript', 'jsx',
            # Backend Frameworks
            'node.js', 'express', 'nestjs', 'django', 'flask', 'fastapi', 'spring', 'spring boot',
            'laravel', 'symfony', 'rails', 'asp.net', 'dotnet', '.net', 'gin', 'echo',
            # Databases
            'sql', 'mysql', 'postgresql', 'postgres', 'mongodb', 'redis', 'cassandra', 'elasticsearch',
            'dynamodb', 'oracle', 'sqlite', 'mariadb', 'neo4j', 'couchdb', 'firebase',
            # Cloud & DevOps
            'aws', 'azure', 'gcp', 'google cloud', 'docker', 'kubernetes', 'k8s', 'terraform',
            'ansible', 'jenkins', 'ci/cd', 'github actions', 'gitlab ci', 'circleci', 'travis',
            'nginx', 'apache', 'linux', 'unix', 'bash scripting',
            # ML/AI
            'machine learning', 'deep learning', 'neural networks', 'tensorflow', 'pytorch', 'keras',
            'scikit-learn', 'pandas', 'numpy', 'matplotlib', 'seaborn', 'opencv', 'nltk', 'spacy',
            'nlp', 'computer vision', 'reinforcement learning', 'xgboost', 'lightgbm',
            # Data Science
            'data analysis', 'data science', 'data visualization', 'tableau', 'power bi', 'looker',
            'qlik', 'excel', 'vba', 'sql', 'spark', 'hadoop', 'hive', 'pig', 'kafka',
            # Mobile
            'android', 'ios', 'react native', 'flutter', 'xamarin', 'ionic', 'swift', 'kotlin',
            # Tools & Others
            'git', 'svn', 'mercurial', 'jira', 'confluence', 'agile', 'scrum', 'kanban',
            'microservices', 'rest api', 'graphql', 'grpc', 'soap', 'oauth', 'jwt',
            'project management', 'leadership', 'communication', 'team collaboration'
        }
        
        found_skills = []
        text_lower = text.lower()
        lines = text.split('\n')
        
        # First, try to find a dedicated skills section
        in_skills_section = False
        skills_section_text = ""
        
        for i, line in enumerate(lines):
            line_lower = line.lower().strip()
            # Check for skills section headers
            if any(keyword in line_lower for keyword in ['skills', 'technical skills', 'core competencies', 
                                                          'technologies', 'tools & technologies', 'expertise']):
                if len(line.strip()) < 50:  # Likely a section header
                    in_skills_section = True
                    continue
            
            if in_skills_section:
                # Collect skills from this section
                if line.strip() and not line.strip().startswith(('experience', 'education', 'projects', 'work')):
                    skills_section_text += " " + line.lower()
                else:
                    # End of skills section
                    break
        
        # Search in skills section first, then whole text
        search_text = skills_section_text if skills_section_text else text_lower
        
        # Extract skills using keyword matching
        for skill in skill_keywords:
            # Use word boundaries for better matching
            pattern = r'\b' + re.escape(skill.lower()) + r'\b'
            if re.search(pattern, search_text):
                # Format skill name properly
                skill_name = skill.title() if len(skill.split()) == 1 else skill.title()
                found_skills.append(skill_name)
        
        # Also extract skills mentioned in comma-separated lists
        skill_list_pattern = r'(?:skills?|technologies?|tools?)[\s:]+([^\.\n]{10,200})'
        skill_lists = re.findall(skill_list_pattern, text_lower)
        for skill_list in skill_lists:
            # Split by common delimiters
            potential_skills = re.split(r'[,;•\-\|]', skill_list)
            for potential_skill in potential_skills:
                skill_clean = potential_skill.strip()
                if len(skill_clean) > 2 and len(skill_clean) < 30:
                    # Check if it matches any known skill
                    for known_skill in skill_keywords:
                        if known_skill.lower() in skill_clean.lower() or skill_clean.lower() in known_skill.lower():
                            found_skills.append(skill_clean.title())
                            break
        
        # Remove duplicates and return
        unique_skills = []
        seen = set()
        for skill in found_skills:
            skill_lower = skill.lower()
            if skill_lower not in seen:
                seen.add(skill_lower)
                unique_skills.append(skill)
        
        return unique_skills[:20]  # Return top 20 skills
    
    def _extract_experience(self, text: str) -> Dict[str, Any]:
        """Extract experience information using advanced date parsing"""
        years_experience = 0
        companies = []
        positions = []
        text_lower = text.lower()
        
        # Method 1: Look for explicit years of experience
        experience_patterns = [
            r'(\d+)\s*(?:years?|yrs?)\s*(?:of)?\s*experience',
            r'(\d+)\+?\s*(?:years?|yrs?)\s*(?:in|of)',
            r'experience[:\s]+(\d+)\s*(?:years?|yrs?)',
        ]
        
        for pattern in experience_patterns:
            match = re.search(pattern, text_lower)
            if match:
                years_experience = max(years_experience, int(match.group(1)))
        
        # Method 2: Calculate from employment dates
        # Look for date patterns like "Jan 2020 - Present" or "2020-2023"
        date_patterns = [
            r'(\w+\s+\d{4}|\d{4})\s*[-–—]\s*(present|current|now|\w+\s+\d{4}|\d{4})',
            r'(\d{1,2}[/-]\d{4})\s*[-–—]\s*(present|current|now|\d{1,2}[/-]\d{4})',
        ]
        
        from datetime import datetime
        current_year = datetime.now().year
        employment_periods = []
        
        for pattern in date_patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                start_str = match.group(1).strip()
                end_str = match.group(2).strip().lower()
                
                # Parse start date
                start_year = None
                try:
                    if len(start_str) == 4:  # Just year
                        start_year = int(start_str)
                    elif '/' in start_str:
                        parts = start_str.split('/')
                        start_year = int(parts[-1]) if len(parts[-1]) == 4 else int(parts[1])
                    else:
                        # Try to extract year
                        year_match = re.search(r'\d{4}', start_str)
                        if year_match:
                            start_year = int(year_match.group())
                except:
                    pass
                
                # Parse end date
                end_year = current_year
                if end_str not in ['present', 'current', 'now']:
                    try:
                        if len(end_str) == 4:
                            end_year = int(end_str)
                        elif '/' in end_str:
                            parts = end_str.split('/')
                            end_year = int(parts[-1]) if len(parts[-1]) == 4 else int(parts[1])
                        else:
                            year_match = re.search(r'\d{4}', end_str)
                            if year_match:
                                end_year = int(year_match.group())
                    except:
                        pass
                
                if start_year and start_year <= current_year:
                    employment_periods.append((start_year, end_year))
        
        # Calculate total years from employment periods
        if employment_periods:
            # Merge overlapping periods
            sorted_periods = sorted(employment_periods)
            merged = []
            for start, end in sorted_periods:
                if not merged or start > merged[-1][1]:
                    merged.append([start, end])
                else:
                    merged[-1][1] = max(merged[-1][1], end)
            
            # Calculate total months
            total_months = 0
            for start, end in merged:
                total_months += (end - start) * 12
            
            calculated_years = total_months / 12
            years_experience = max(years_experience, int(calculated_years))
        
        # Extract company names (look for common patterns)
        company_patterns = [
            r'(?:at|with|worked at|employed at|company:)\s+([A-Z][A-Za-z0-9\s&]+?)(?:\s|,|\.|$)',
            r'([A-Z][A-Za-z0-9\s&]{3,30})\s+(?:Inc|LLC|Ltd|Corp|Corporation|Technologies|Tech|Systems|Solutions)',
        ]
        
        for pattern in company_patterns:
            matches = re.finditer(pattern, text)
            for match in matches:
                company = match.group(1).strip()
                if len(company) > 2 and len(company) < 50:
                    companies.append(company)
        
        # Extract job titles
        title_patterns = [
            r'(?:position|role|title)[:\s]+([A-Z][A-Za-z\s]+?)(?:\s|,|\.|$)',
            r'(Senior|Junior|Lead|Principal|Staff)?\s*(Software Engineer|Developer|Engineer|Manager|Analyst|Scientist|Architect)',
        ]
        
        for pattern in title_patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                title = match.group(0).strip()
                if len(title) > 3 and len(title) < 60:
                    positions.append(title)
        
        return {
            "years_experience": years_experience,
            "level": self._get_experience_level(years_experience),
            "companies": list(set(companies))[:5],
            "positions": list(set(positions))[:5]
        }
    
    def _extract_projects(self, text: str) -> List[str]:
        """Extract projects from resume text using advanced pattern matching"""
        projects = []
        lines = text.split('\n')
        text_lower = text.lower()
        
        # Method 1: Section-based extraction
        project_keywords = ['project', 'projects', 'portfolio', 'personal projects', 'side projects', 
                           'academic projects', 'key projects', 'notable projects']
        in_project_section = False
        project_buffer = []
        current_project = []
        
        for i, line in enumerate(lines):
            line_lower = line.lower().strip()
            line_original = line.strip()
            
            # Detect project section
            if any(keyword in line_lower for keyword in project_keywords):
                if len(line_original) < 50 and not any(skip in line_lower for skip in ['experience', 'education', 'skills']):
                    in_project_section = True
                    continue
            
            if in_project_section:
                # Detect end of project section
                if any(end_marker in line_lower for end_marker in ['experience', 'education', 'skills', 'certifications', 'awards']):
                    if current_project:
                        projects.append(' '.join(current_project))
                        current_project = []
                    in_project_section = False
                    continue
                
                # Detect project entries (bullet points, numbered, or project names)
                if line_original.startswith(('•', '-', '*', '▪', '▸')) or \
                   re.match(r'^\d+[\.\)]\s+', line_original) or \
                   (line_original and len(line_original) > 15 and 
                    not line_original.startswith(('EDUCATION', 'EXPERIENCE', 'SKILLS', 'CERTIFICATIONS'))):
                    
                    clean_line = re.sub(r'^[•\-*▪▸\d\.\)\s]+', '', line_original).strip()
                    
                    # Check if this is a new project (has project-like keywords or is capitalized)
                    if (any(word in clean_line.lower() for word in ['project', 'app', 'system', 'platform', 'tool', 'website', 'application']) or
                        (clean_line[0].isupper() and len(clean_line.split()) <= 5)):
                        # Save previous project
                        if current_project:
                            projects.append(' '.join(current_project))
                        current_project = [clean_line]
                    else:
                        # Continue current project
                        if clean_line and len(clean_line) > 10:
                            current_project.append(clean_line)
        
        # Save last project
        if current_project:
            projects.append(' '.join(current_project))
        
        # Method 2: Pattern-based extraction (action verbs + technologies)
        action_verbs = ['built', 'developed', 'created', 'designed', 'implemented', 'architected', 
                       'engineered', 'constructed', 'deployed', 'launched', 'established']
        tech_keywords = ['python', 'java', 'javascript', 'react', 'node', 'django', 'flask', 
                        'aws', 'docker', 'kubernetes', 'mongodb', 'sql', 'machine learning']
        
        project_patterns = [
            # Action verb + description + technology
            r'(?:' + '|'.join(action_verbs) + r')\s+[^\.]{15,150}(?:using|with|in|via)\s+(?:' + '|'.join(tech_keywords) + r')',
            # Project name + description
            r'([A-Z][A-Za-z0-9\s]{3,40})\s*[-–—]?\s*([^\.]{20,150})',
            # "Project: ..." pattern
            r'project[:\s]+([^\.]{20,150})',
        ]
        
        for pattern in project_patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                project_text = ' '.join(match.groups()) if match.groups() else match.group(0)
                project_text = project_text.strip()
                if len(project_text) > 20 and len(project_text) < 250:
                    # Clean up the text
                    project_text = re.sub(r'\s+', ' ', project_text)
                    projects.append(project_text)
        
        # Method 3: Extract from work experience (projects mentioned in job descriptions)
        experience_section = False
        for i, line in enumerate(lines):
            line_lower = line.lower()
            if 'experience' in line_lower and len(line.strip()) < 30:
                experience_section = True
                continue
            
            if experience_section and any(verb in line_lower for verb in action_verbs):
                # Look for project descriptions in experience
                if len(line.strip()) > 30 and len(line.strip()) < 200:
                    # Check if it mentions technologies
                    if any(tech in line_lower for tech in tech_keywords):
                        projects.append(line.strip())
        
        # Clean and deduplicate
        cleaned_projects = []
        seen = set()
        for project in projects:
            # Remove extra whitespace and normalize
            project_clean = re.sub(r'\s+', ' ', project.strip())
            project_lower = project_clean.lower()
            
            # Skip if too short, too long, or duplicate
            if (len(project_clean) > 20 and len(project_clean) < 250 and 
                project_lower not in seen and
                not any(skip in project_lower for skip in ['email', 'phone', 'address', 'linkedin'])):
                seen.add(project_lower)
                cleaned_projects.append(project_clean)
        
        return cleaned_projects[:15]  # Return top 15 projects
    
    def _extract_education(self, text: str) -> List[str]:
        """Extract education information with degree types and institutions"""
        education = []
        lines = text.split('\n')
        text_lower = text.lower()
        
        # Degree patterns
        degree_patterns = [
            r'(Bachelor|Master|PhD|Doctorate|Associate|Diploma|Certificate)\s+(?:of|in)?\s*(?:Science|Arts|Engineering|Technology|Business|Computer Science|Information Technology|IT)',
            r'(B\.?S\.?|M\.?S\.?|B\.?A\.?|M\.?A\.?|Ph\.?D\.?|MBA|MCA|B\.?Tech|M\.?Tech)\s+(?:in|of)?\s*([A-Z][A-Za-z\s]+)',
            r'(Bachelor|Master|PhD|Doctorate)\s+(?:Degree|of Science|of Arts|of Engineering)',
        ]
        
        # Institution patterns
        institution_keywords = ['university', 'college', 'institute', 'school', 'academy']
        
        in_education_section = False
        education_buffer = []
        
        for i, line in enumerate(lines):
            line_lower = line.lower().strip()
            line_original = line.strip()
            
            # Detect education section
            if 'education' in line_lower and len(line_original) < 30:
                in_education_section = True
                continue
            
            if in_education_section:
                # Check for end of education section
                if any(end in line_lower for end in ['experience', 'skills', 'projects', 'certifications', 'awards']):
                    if education_buffer:
                        education.append(' '.join(education_buffer))
                        education_buffer = []
                    in_education_section = False
                    continue
                
                # Collect education lines
                if line_original and len(line_original) > 5:
                    education_buffer.append(line_original)
                elif not line_original and education_buffer:
                    # Empty line - save buffer
                    education.append(' '.join(education_buffer))
                    education_buffer = []
        
        # Save remaining buffer
        if education_buffer:
            education.append(' '.join(education_buffer))
        
        # Pattern-based extraction
        for pattern in degree_patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                # Get context around the match (next 2-3 lines)
                match_start = match.start()
                # Find the line containing this match
                line_start = text.rfind('\n', 0, match_start) + 1
                line_end = text.find('\n', match_start)
                if line_end == -1:
                    line_end = len(text)
                
                education_line = text[line_start:line_end].strip()
                if len(education_line) > 10 and len(education_line) < 200:
                    # Try to include institution if nearby
                    next_lines = text[match_start:match_start+200]
                    if any(inst in next_lines.lower() for inst in institution_keywords):
                        # Include next line if it has institution
                        next_line_end = text.find('\n', line_end)
                        if next_line_end != -1 and next_line_end - line_end < 100:
                            education_line += ' ' + text[line_end+1:next_line_end].strip()
                    
                    education.append(education_line)
        
        # Also extract standalone education mentions
        for line in lines:
            line_lower = line.lower()
            if any(keyword in line_lower for keyword in ['bachelor', 'master', 'phd', 'doctorate', 
                                                          'degree', 'university', 'college', 'institute']):
                if len(line.strip()) > 15 and len(line.strip()) < 150:
                    # Check if it's a valid education entry
                    if not any(skip in line_lower for skip in ['experience', 'skills', 'projects']):
                        education.append(line.strip())
        
        # Clean and deduplicate
        cleaned_education = []
        seen = set()
        for edu in education:
            edu_clean = re.sub(r'\s+', ' ', edu.strip())
            edu_lower = edu_clean.lower()
            if edu_lower not in seen and len(edu_clean) > 10:
                seen.add(edu_lower)
                cleaned_education.append(edu_clean)
        
        return cleaned_education[:5]  # Return max 5 education entries
    
    def validate_resume(self, parsed: Dict[str, Any]) -> List[str]:
        """Validate resume data and return list of missing required fields"""
        required = ["skills", "projects", "experience_years"]
        missing = []
        
        for field in required:
            value = parsed.get(field)
            if not value:
                missing.append(field)
            elif field == "skills" and (not isinstance(value, list) or len(value) == 0):
                missing.append(field)
            elif field == "projects" and (not isinstance(value, list) or len(value) == 0):
                missing.append(field)
            elif field == "experience_years" and (not isinstance(value, (int, float)) or value == 0):
                # Experience years can be 0, but we'll still flag it if it's missing
                if field not in parsed:
                    missing.append(field)
        
        return missing
    
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