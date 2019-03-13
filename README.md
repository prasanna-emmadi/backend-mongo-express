# Readme

## Mongo db setup
- sudo apt get install docker.io
- sudo apt-get install docker-compose
- npm install
- npm install jquery@1.9.1
- npm install popper.js@^1.14.7
- npm install typescript
- cd docker
- sudo docker-compose up -d
- $ sudo docker exec -it docker_mongo_1 bash
- $ mongo -u root -p example
- $ use todos1
- $ db.createUser(
              {
              user: "root",
              pwd: "example",
              roles: [ { role: "readWrite", db: "todos1" } ]
              }
              )

## Running
- node server.js

## Helpful Sources
- https://medium.com/mongoaudit/how-to-enable-authentication-on-mongodb-b9e8a924efac
- https://medium.freecodecamp.org/introduction-to-mongoose-for-mongodb-d2a7aa593c57
