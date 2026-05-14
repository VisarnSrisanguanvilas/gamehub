from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from configs.db import lifespan
from controllers.user_controller import router as user_router
from controllers.login_controller import router as login_router
from controllers.xo_controller import router as xo_router

app = FastAPI(title="XO Game (SQLModel ORM + SQLite)", lifespan=lifespan)

app.include_router(user_router)
app.include_router(login_router)
app.include_router(xo_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return{"ping":"pong"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", reload=True)