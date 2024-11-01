@echo off
REM Start Redis Server (Assuming Redis is installed and in PATH)
redis-server

REM Start Django Server
call venv\Scripts\activate
start cmd /k python manage.py runserver

REM Start React Server
cd frontend
start cmd /k npm start
