import { createServer, IncomingMessage, ServerResponse } from 'http';
import { configDotenv } from 'dotenv';
import { v4 } from 'uuid';
import path from 'path';
import { ENDPOINTS, METHODS, UUID } from './utilies/constants';
import dataBase from './dataBase';
import { User } from './utilies/models';

configDotenv();
const port = process.env.PORT;
const db = dataBase;

const server = createServer((request: IncomingMessage, response: ServerResponse) => {
  try {
    if (request.url === ENDPOINTS.USERS) {

      if (request.method === METHODS.GET) {
        response.statusCode = 200;
        response.end(JSON.stringify(db));

      } else if (request.method === METHODS.POST) {
        let data = '';
        request.on('data', (chunk) => {
          data += chunk.toString();
        });
        request.on('end', () => {
          const user: User = JSON.parse(data);
          const hasThreeProps = Object.keys(user).length === 3;
          const hasUsername = user.hasOwnProperty('username');
          const hasAge = user.hasOwnProperty('age');
          const hasHobbies = user.hasOwnProperty('hobbies');
          if (hasThreeProps && hasAge && hasHobbies && hasUsername) {
            user.id = v4();
            db.push(user);
            response.statusCode = 201;
            response.end(JSON.stringify(user));
          } else {
            response.statusCode = 400;
            response.end();
          }
        });
      } else {
        response.statusCode = 400;
        response.end();
      }

    } else if (request.url && request.url.startsWith(ENDPOINTS.USER)) {
      const userId = path.basename(request.url);

      if (!UUID.test(userId)) {
        response.statusCode = 400;
        response.end();
      } else {
        const user = db.find(({ id }) => id === userId);
        if (user) {
          if (request.method === METHODS.GET) {
            response.statusCode = 200;
            response.end(JSON.stringify(user));
          }

          if (request.method === METHODS.PUT) {
            let data = '';
            request.on('data', (chunk) => {
              data += chunk.toString();
            });
            request.on('end', () => {
              const updatedUser: User = JSON.parse(data);
              const hasThreeProps = Object.keys(updatedUser).length === 3;
              const hasUsername = updatedUser.hasOwnProperty('username');
              const hasAge = updatedUser.hasOwnProperty('age');
              const hasHobbies = updatedUser.hasOwnProperty('hobbies');
              if (hasThreeProps && hasAge && hasHobbies && hasUsername) {
                const userIndex = db.indexOf(user);
                updatedUser.id = db[userIndex].id;
                db.splice(userIndex, 1, updatedUser);
                response.statusCode = 200;
                response.end(JSON.stringify(updatedUser));
              } else {
                response.statusCode = 400;
                response.end();
              }
            });
          }

          if (request.method === METHODS.DELETE) {
            const userIndex = db.indexOf(user);
            db.splice(userIndex, 1);
            response.statusCode = 204;
            response.end();
          }

        } else {
          response.statusCode = 404;
          response.end();
        }
      }

    } else {
      response.statusCode = 404;
      response.end();
    }
  } catch {
    response.statusCode = 500;
    response.end();
  }
});

server.listen(port);

console.log(`Server is running on PORT: ${port}`);