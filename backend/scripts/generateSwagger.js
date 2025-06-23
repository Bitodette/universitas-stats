const fs = require('fs');
const path = require('path');
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Universitas Statistics API',
      version: '1.0.0',
      description: 'API for university admission statistics',
      contact: {
        name: 'API Support',
        email: 'support@example.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Local Development Server'
      },
      {
        url: 'https://universitas-stats.vercel.app/api',
        description: 'Production Server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./routes/*.js', './controllers/*.js', './models/*.js'], // Path to the API docs
};

const specs = swaggerJsdoc(options);
const outputFile = path.resolve(__dirname, '../public/swagger.json');

// Ensure directory exists
const dir = path.dirname(outputFile);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

// Write swagger.json
fs.writeFileSync(outputFile, JSON.stringify(specs, null, 2));

console.log(`Swagger documentation generated at ${outputFile}`);
