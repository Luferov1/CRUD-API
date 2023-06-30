import { createServer, IncomingMessage, ServerResponse } from 'http';
import { configDotenv } from 'dotenv';

configDotenv();
const port = process.env.PORT;

const posts = [
  {
    title: 'Lorem ipsum',
    content: 'Dolor sit amet',
  },
];

const server = createServer((request: IncomingMessage, response: ServerResponse) => {
  switch (request.url) {
    case '/api/users': {
      if (request.method === 'GET') {
        response.statusCode = 200;
        response.end(JSON.stringify(posts));
      }
      break;
    }
    default: {
      response.statusCode = 404;
      response.end();
    }
  }
});

server.listen(port);

console.log(`Server is running on PORT: ${port}`);