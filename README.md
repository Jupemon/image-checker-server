## Deployed on heroku
## Info
Server for the face recognizer app

## Image Checker app
application which contains server, frontend client and a database. It contains signin/registering functionalities and saves user profile on a postgres database. It also detects faces from any image links provided. The face detection is handled by API called clarifai 

view app : https://jupemon.github.io/image-checker/
server/database code : https://github.com/Jupemon/image-checker-server
frontend client code : https://github.com/Jupemon/image-checker

## Important info
Clarifai API only allows certain number of requests to their server per month. Heavy usage of the app will cause the facial recognizer part of the app to fail for a certain period.
