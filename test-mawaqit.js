import https from 'https';

https.get('https://mawaqit.net/api/2.0/mosque/search?lat=48.8566&lon=2.3522', (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Headers:', res.headers);
    console.log('Body:', data.substring(0, 500));
  });
}).on('error', (err) => {
  console.log('Error:', err.message);
});
