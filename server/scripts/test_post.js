(async () => {
  try {
    // Login
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'testuser@example.com', password: 'test1234' }),
    });
    const loginJson = await loginRes.json();
    console.log('LOGIN', loginRes.status, loginJson);

    if (!loginRes.ok) process.exit(1);
    const token = loginJson.token;

    // Create property (multipart form, no files)
    const form = new FormData();
    form.append('title', 'Node Test Property');
    form.append('description', 'Created from test script');
    form.append('price', '18000');
    form.append('currency', 'ZMW');
    form.append('type', 'house');
    form.append('location[township]', 'Kabulonga');

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
