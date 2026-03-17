import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';

async function test() {
  const form = new FormData();
  form.append('type', 'wedding');
  form.append('style', 'luxury');
  form.append('blocks', JSON.stringify([{type: 'title', text: 'Wedding'}, {type: 'names', text: 'Aisha & Ibrahim'}]));
  form.append('backgroundImage', fs.createReadStream('public/images/bg_1773483825915.png'));

  const res = await fetch('http://localhost:3000/api/generate-invitation', {
    method: 'POST',
    body: form
  });

  const text = await res.text();
  console.log(text);
}

test();
