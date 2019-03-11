# Readme

## Mongo db setup
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

## Helpful Sources
- https://medium.com/mongoaudit/how-to-enable-authentication-on-mongodb-b9e8a924efac
- https://medium.freecodecamp.org/introduction-to-mongoose-for-mongodb-d2a7aa593c57
