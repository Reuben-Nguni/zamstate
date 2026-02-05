import fs from 'fs';
import path from 'path';

const fetch = global.fetch || (await import('node-fetch')).default;

(async () => {
  try {
    // Login
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'testuser@example.com', password: 'test1234' }),
    });
    const loginJson = await loginRes.json();
    console.log('LOGIN', loginRes.status, loginJson.message);

    if (!loginRes.ok) {
      console.error(loginJson);
      process.exit(1);
    }
    const token = loginJson.token;

    // Prepare form with a local upload file
    const filePath = path.resolve('./uploads/371a005818ded799311a670712cdbc6f');
    const stat = fs.statSync(filePath);
    console.log('Uploading file:', filePath, stat.size);

    const form = new FormData();
    form.append('title', 'Image Test Property');
    form.append('description', 'Created with image via test script');
    form.append('price', '20000');
    form.append('currency', 'ZMW');
    form.append('type', 'apartment');
    form.append('location[township]', 'Kabulonga');
    form.append('images', fs.createReadStream(filePath));

    const postRes = await fetch('http://localhost:5000/api/properties', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    const postJson = await postRes.json();
    console.log('POST', postRes.status, postJson);
  } catch (err) {
    console.error('ERROR', err);
    process.exit(1);
  }
})();
