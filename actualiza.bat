@echo off
SET /p mensaje=Cual es el mensaje del commit?
git status
git pull
git add -A
git commit -am "%mensaje%"
git push
git status