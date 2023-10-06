const express = require('express');
const axios = require('axios');

const app = express();
const port = 8008;

axios.defaults.timeout = 10000;

app.get('/numbers', async (req, res) => {
  const urls = req.query.url;

  if (!urls || !Array.isArray(urls)) {
    return res.status(400).json({ error: 'Invalid URLs provided.' });
  }

  try {
    const result = await Promise.all(
      urls.map(async (url) => {
        try {
          
          new URL(url);

          const response = await axios.get(url);
          const data = response.data;

          if (data && Array.isArray(data.numbers)) {
            return data.numbers;
          } else {
            console.error(`Invalid JSON structure received from ${url}`);
            return [];
          }
        } catch (error) {
          
          if (axios.isAxiosError(error) && error.code === 'ECONNABORTED') {
            console.error(`Timeout error for ${url}`);
            return [];
          } else {
            console.error(`Error fetching data from ${url}: ${error.message}`);
            return [];
          }
        }
      })
    );

    
    const combinedNumbers = result.reduce((acc, numbers) => acc.concat(numbers), []);

    
    const orderedUniqueNumbers = Array.from(new Set(combinedNumbers)).sort((a, b) => a - b);

    res.json({ numbers: orderedUniqueNumbers });
  } catch (error) {
    console.error(`Error processing request: ${error.message}`);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

app.listen(port, () => {
  console.log(`Number Management Service is running on port ${port}`);
});
