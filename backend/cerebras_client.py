import os
from dotenv import load_dotenv
from cerebras.cloud.sdk import Cerebras

load_dotenv()

client = Cerebras(
  api_key=os.environ.get("CEREBRAS_API_KEY"),
)



def get_chat_completion(messages, model="qwen-3-coder-480b"):
    chat_completion = client.chat.completions.create(
      messages=messages,
      model=model,
    )
    return chat_completion

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
  prompt_dict = {"role": "user", "content": prompt}
  return get_chat_completion([prompt_dict])
