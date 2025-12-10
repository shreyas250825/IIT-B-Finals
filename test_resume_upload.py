#!/usr/bin/env python3
import requests
import json

def test_resume_upload():
    """Test the resume upload functionality"""

    # Test content for a sample resume
    test_content = '''John Doe
Software Engineer
Experience: 3 years
Skills: Python, JavaScript, React, Node.js, SQL, Git
Education: Bachelor's in Computer Science
Projects: Built a web application using React and Node.js'''

    # Create a temporary file
    with open('test_resume.txt', 'w') as f:
        f.write(test_content)  

    try:
        # Test the local endpoint
        url = 'http://localhost:8000/api/resume/parse'

        with open('test_resume.txt', 'rb') as f:
            files = {'file': ('test_resume.txt', f, 'text/plain')}
            response = requests.post(url, files=files)

        print('=== Local Backend Test ===')
        print(f'Status Code: {response.status_code}')
        print(f'Response: {json.dumps(response.json(), indent=2)}')

        # Test the production endpoint if available
        prod_url = 'https://iit-b-finals.onrender.com/api/resume/parse'
        print('\n=== Production Backend Test ===')

        with open('test_resume.txt', 'rb') as f:
            files = {'file': ('test_resume.txt', f, 'text/plain')}
            try:
                prod_response = requests.post(prod_url, files=files, timeout=10)
                print(f'Status Code: {prod_response.status_code}')
                print(f'Response: {json.dumps(prod_response.json(), indent=2)}')
            except requests.exceptions.RequestException as e:
                print(f'Production endpoint not accessible: {e}')

    finally:
        # Clean up
        import os
        if os.path.exists('test_resume.txt'):
            os.remove('test_resume.txt')

if __name__ == '__main__':
    test_resume_upload()
