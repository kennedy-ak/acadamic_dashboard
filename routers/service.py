from groq import Groq
from fastapi import HTTPException
import os
import re

def get_groq_client():
    """
    Create and return a Groq client instance
    """
    try:
        api_key = ""
        if not api_key:
            raise HTTPException(status_code=500, detail="GROQ_API_KEY not found in environment variables.")
        
        client = Groq(api_key=api_key)
        return client
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error initializing Groq client: {str(e)}")

def format_review_for_html(review_text):
    """
    Process the review text to convert markdown to HTML and apply inline CSS styles
    """
    # Convert markdown headers to HTML headers with inline styles
    # Replace ## headers with styled h2 tags
    review_text = re.sub(
        r'## ([^\n]+)',
        r'<h2 style="color: #3498db; margin-top: 25px; border-left: 4px solid #3498db; padding-left: 10px;">\1</h2>',
        review_text
    )
    
    # Convert markdown bold (**text**) to HTML bold with inline styles
    review_text = re.sub(
        r'\*\*([^*]+)\*\*',
        r'<strong style="font-weight: bold;">\1</strong>',
        review_text
    )
    
    # Convert bullet points (* item) to HTML list items
    if "* " in review_text:
        # First, identify bullet point lists and wrap them in <ul> tags
        bullet_list_pattern = r'(\n\* [^\n]+(?:\n\* [^\n]+)*)'
        
        def replace_bullet_list(match):
            bullet_list = match.group(1)
            items = bullet_list.strip().split('\n* ')
            items = [item for item in items if item]
            
            html_list = '<ul style="padding-left: 20px;">\n'
            for item in items:
                html_list += f'<li style="margin-bottom: 8px;">{item}</li>\n'
            html_list += '</ul>'
            
            return html_list
        
        review_text = re.sub(bullet_list_pattern, replace_bullet_list, '\n' + review_text)
    
    # Add paragraph tags to text blocks
    paragraphs = review_text.split('\n\n')
    formatted_paragraphs = []
    
    for p in paragraphs:
        if not p.strip():
            continue
        if not (p.startswith('<h2') or p.startswith('<ul') or p.startswith('<li') or p.startswith('<strong')):
            p = f'<p style="margin-bottom: 15px; line-height: 1.6;">{p}</p>'
        formatted_paragraphs.append(p)
    
    review_text = '\n'.join(formatted_paragraphs)
    
    # Style percentage mentions
    percentage_pattern = r'(\d{1,3}%)'
    review_text = re.sub(
        percentage_pattern, 
        r'<span style="font-weight: bold; color: #3498db;">\1</span>', 
        review_text
    )
    
    return review_text

def review_cv(cv_text):
    """
    Review CV content using Groq AI and return both raw and formatted review
    """
    try:
        client = get_groq_client()
        
        # Create system and user message based on inputs
        
        
        system_message = (
                "You are a professional CV reviewer and career coach. "
                "Provide a detailed analysis of the CV with percentage scores. Focus on: "
                "1. Overall structure and formatting (score this out of 100%), "
                "2. Content quality and clarity (score this out of 100%), "
                "3. Skills presentation (score this out of 100%), "
                "4. Experience highlights (score this out of 100%), "
                "5. Specific improvement suggestions, "
                
                "Also provide an overall CV score as a percentage based on the average of all sections. "
                
                "Format your response in clear sections with markdown formatting using ## for section headers, "
                "* for bullet points, and **bold text** for important points. Include percentages for each major section. "
                "For each section, explain the reasoning behind the score and what could be improved. "
                "Use a professional and constructive tone."
            )
        user_message = f"Here is the CV content:\n\n{cv_text}"
        
        # Choose model
        model = "llama-3.3-70b-versatile"
        
        # Generate review
        chat_completion = client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": user_message}
            ],
            model=model,
            temperature=0.7,
            max_tokens=1500,
            top_p=0.9
        )
        
        # Get review text
        review = chat_completion.choices[0].message.content
        
        # Format the review for display with inline styles
        formatted_review = format_review_for_html(review)
        
        return review , formatted_review
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error during CV review: {str(e)}")
