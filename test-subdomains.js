import http from 'http';

http.get('http://localhost:3000/api/tools/subdomains?target=example.com', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log(data.substring(0, 500)));
});
