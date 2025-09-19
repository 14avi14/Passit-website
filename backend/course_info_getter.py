from fastapi import APIRouter, HTTPException, status, Header
from fastapi.requests import HTTPConnection
from typing import Optional, Annotated
from pydantic import BaseModel
import bcrypt
import random
import json

from cerebras_client import get_study_info

router = APIRouter()

class UserInfo(BaseModel):
	username: str
	password: str

def verify_user(username: str, key: str, connection: HTTPConnection):
	user_exists = connection.app.database.count_documents({"username": username})
	if user_exists == 0:
		raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Username `{username}` does not exist.")

	user = connection.app.database.find_one({"username": username})
	if user["allowed_to_access"] != key:
		raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Not logged in.")
	return user

@router.post("/accounts/create_account", response_description="Create account.")
def create_account(user_info: UserInfo, connection: HTTPConnection):
	username = user_info.username
	password = user_info.password
	user_exists = connection.app.database.count_documents({"username": username})
	if user_exists != 0:
		raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=f"Username `{username}` already exists.")


	password = password.encode()
	salt = bcrypt.gensalt()
	hashed_password = bcrypt.hashpw(password, salt)
	connection.app.database.insert_one({
		"username": username, 
		"hashed_password": hashed_password,
		"allowed_to_access": None,
		"courses_data": {}
		}) 
	
	return login(user_info, connection)
	

@router.post("/accounts/login", response_description="Login.")
def login(user_info: UserInfo, connection: HTTPConnection):
	key_chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
	key = "".join(random.choices(list(key_chars), k=128))

	username = user_info.username
	password = user_info.password
	user_exists = connection.app.database.count_documents({"username": username})
	
	if user_exists == 0:
		raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Username or password is incorrect.")
	
	user = connection.app.database.find_one({"username": username})
	user_password_check = bcrypt.checkpw(password.encode(), user["hashed_password"])
	if not user_password_check:
		raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Username or password is incorrect.")

	connection.app.database.update_one({"username": username}, {"$set": {"allowed_to_access": key}})
	return key

@router.get("/courses/get_courses", response_description="Get list of courses.")
def get_courses(*, 
	username: str,
	login_key: Annotated[str | None, Header()] = None,
	connection: HTTPConnection):
	
	user = verify_user(username, login_key, connection)

	course_data = []
	for course in user["courses_data"].values():
		course_data.append({
			"course_name": course["course_name"],
			"current_week": course["current_week"]
		})

	return course_data

@router.get("/courses/get_course_prep_info", response_description="Get the course info")
def get_course_prep_info(*,
	course_name: str, 
	weeks: int, 
	paid: Optional[bool]=False,
	username: str,
	login_key: Annotated[str | None, Header()] = None,
	connection: HTTPConnection):
	
	user = verify_user(username, login_key, connection)
	if course_name not in user["courses_data"]:
		response = get_study_info(course_name, weeks, paid=False)
		chat_content = response.choices[0].message.content
		chat_content_json = json.loads(chat_content)
		user["courses_data"][chat_content_json["course_name"]] = chat_content_json
		course_name = chat_content_json["course_name"]
		connection.app.database.update_one({"username": username}, {"$set": {"courses_data": user["courses_data"]}})
	return user["courses_data"][course_name]