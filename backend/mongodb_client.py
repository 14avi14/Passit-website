import os
import pymongo
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

db_password = os.environ.get("MONGODB_KEY")

cluster = MongoClient(f"mongodb+srv://settavishek_db_user:{db_password}@cluster0.r9p5kdd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")

DB = cluster["aicoursemaker"]
USERS_COLLECTION = DB["users"]