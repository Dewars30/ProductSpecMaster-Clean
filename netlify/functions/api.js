// Netlify serverless function to proxy API requests to your backend
const https = require('https');
const http = require('http');

// This will be set to your actual backend URL in production
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

exports.handler = async function(event, context) {
  // Get the path and query parameters from the request
  const path = event.path.replace('/.netlify/functions/api', '');
  const queryString = event.queryStringParameters 
    ? Object.keys(event.queryStringParameters)
        .map(key => `${key}=${encodeURIComponent(event.queryStringParameters[key])}`)
        .join('&')
    : '';
  
  // Construct the URL to forward to
  const url = `${BACKEND_URL}${path}${queryString ? '?' + queryString : ''}`;
  
  // Forward the request to the backend
  try {
    const response = await new Promise((resolve, reject) => {
      const client = url.startsWith('https') ? https : http;
      const req = client.request(url, {
        method: event.httpMethod,
        headers: {
          ...event.headers,
          host: new URL(BACKEND_URL).host
        }
      }, (res) => {
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body
          });
        });
      });
      
      req.on('error', (error) => {
        reject(error);
      });
      
      // If there's a body, send it
      if (event.body) {
        req.write(event.body);
      }
      
      req.end();
    });
    
    return {
      statusCode: response.statusCode,
      headers: response.headers,
      body: response.body
    };
  } catch (error) {
    console.error('Error proxying request:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to proxy request to backend' })
    };
  }
};
