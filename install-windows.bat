@echo off
CD %~dp0
call npm install
call npm start
pause
