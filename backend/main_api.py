from fastapi import FastAPI
from course_info_getter import router
from fastapi.middleware.cors import CORSMiddleware
from mongodb_client import USERS_COLLECTION

# https://fastapi.tiangolo.com/tutorial/cors/#origin for CORS warnings and usage
app = FastAPI()

origins = [
    "https://passit-67b2.onrender.com/",
] 

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup") 
def startup():
	app.database = USERS_COLLECTION # Temporary! Will need a better db later.
	print("Starting up!")

@app.on_event("shutdown")
def shutdown():
	print("Shutting down!")

app.include_router(router)