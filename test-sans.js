import https from 'https';

https.get('https://isc.sans.edu/api/infocon?json', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log(data));
});
