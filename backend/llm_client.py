import os
from dotenv import load_dotenv
import requests

load_dotenv()

API_KEY = os.environ.get("LLM_CLIENT_API_KEY")
URL = os.environ.get("LLM_CLIENT_API_URL")
MODEL = "openai/gpt-oss-120b"

FINAL_OUTPUT_SCHEMA = {
    "type": "json_schema",
    "json_schema": {
        "name": "ouput",
        "schema": {
            "type": "object",
            "properties": {
                "course_name": {"type": "string"},
                "summary": {"type": "string"},
                "current_week": {"type": "number"},
                "schedule": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "week": {"type": "string"},
                            "goals": {"type": "string"},
                            "topics": {
                                "type": "array",
                                "items": {"type": "string"}
                            },
                            "lesson": {"type": "object"},
                            "assignment": {
                                "type": "array",
                                "items": {
                                    "type": "object",
                                    "properties": {
                                        "Q": {"type": "string"},
                                        "A": {"type": "string"},
                                    }
                                }
                            }
                        },
                        "additionalProperties": False
                    }
                },
                "resources": {
                    "type": "object",
                    "additionalProperties": {
                        "type": "string"
                    }
                }
            },
            "required": ["course_name", "summary", "current_week", "schedule", "resources"],
            "additionalProperties": False
        }
    }
}
def get_chat_completion(payload):
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {API_KEY}"
    }
    response = requests.post(url=URL, headers=headers, json=payload)
    print(response.json())
    text = response.json()["choices"][0]["message"]["content"]
    return text

def get_study_info(name, weeks_till, paid=False):
    paid_string = "Both paid and free" if paid else "Only free"
    paid_string += " resources"
    prompt = f""" Study plan for {name} that is {weeks_till} weeks long.
    Return this info in proper JSON format:
    -"course_name"(string): Official name. Use acronyms if possible for common names(like AP, IB, Alg, Calc), but keep words seperated.
    -"summary"(string): 3-7 sentences. Friendly message, like "In this course, you'll learn be learning...the main topics we'll be covering are...these skills are crucial later on for areas like ...  Be sure to come prepared for class with [materials]..."
    -"current_week": 1(leave be)
    -"schedule" (array | weekly till finish date)
          Format: 
            [
                {{
                    "week": "Week X",
                    "goals": (string),
                    "topics": [...]
                    "lesson":( One lesson for each topic!
                      "[topic name]": "1-2 paragraph lesson of 6-12 sentences. NO SUMMARY, just main concepts, formulas, and 1 worked example if applicable. Use <mark></mark> for formulas, names, variables, etc. <u></u> ONLY for key points/sentences. Use consistent inline color styling."
                      )(JS Object)
                    "assignment": [("Q": "", "A": "")(JS Object)] // 5 HARD questions related to topic. Check the answers before giving. Clear explanations.
                }}
            ...(more weeks)
            ]

    -"resources"(JSON object(key=resource_name, val=link) | About 10 resources. {paid_string})

    No extra line characters. NO LATEX. 
    VALID JSON ONLY. ENSURE NO ERRORS WITH JSON
    """

    payload = {
        "model": MODEL,
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.1,
        "response_format": FINAL_OUTPUT_SCHEMA
    }
    return get_chat_completion(payload)
