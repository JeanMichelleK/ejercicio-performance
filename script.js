import http from 'k6/http';
import { check, sleep, fail } from 'k6';
import { SharedArray } from 'k6/data';

function parseCsvRows(text) {
  return text
    .split('\n')
    .map(l => l.trim())
    .filter(l => l && !/^user\s*,\s*passwd/i.test(l))
    .map(l => {
      const [u, p] = l.split(',');
      const username = (u || '').trim().replace(/\r$/, '');
      const password = (p || '').trim().replace(/\r$/, '');
      if (!username || !password) return null;
      return { username, password };
    })
    .filter(Boolean);
}

const users = new SharedArray('usuarios', () => parseCsvRows(open('./usuarios.csv')));

export const options = {
  scenarios: {
    login_test: {
      executor: 'constant-arrival-rate',
      rate: 20,
      timeUnit: '1s',
      duration: '1m',
      preAllocatedVUs: 50,
      maxVUs: 100,
      gracefulStop: '30s',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<1500'], 
    http_req_failed: ['rate<0.03'],   

  },
};

export default function () {
  if (users.length === 0) fail('No hay usuarios válidos en usuarios.csv');

  const user = users[Math.floor(Math.random() * users.length)];
  const payload = JSON.stringify({ username: user.username, password: user.password });
  const headers = { 'Content-Type': 'application/json' };

  const res = http.post('https://fakestoreapi.com/auth/login', payload, { headers });


  const ok = check(res, {
    'status 2xx': (r) => r.status >= 200 && r.status < 300,
    'content-type json': (r) => String(r.headers['Content-Type'] || '').includes('application/json'),
  });


  if (__ENV.DEBUG && __ITER < 3 && !ok) {
    console.log(`status=${res.status} body=${String(res.body).slice(0, 200)}...`);
  }

  sleep(1);
}
