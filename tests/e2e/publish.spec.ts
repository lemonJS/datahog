import Chance from 'chance';
import fetch from 'node-fetch';

const chance = Chance();

describe('Publish events to the deployed API', () => {
  describe('when the event body is invalid', () => {
    const url = 'https://datahog.lemonjs.uk/collect';

    const body = {
      provider: chance.string(),
      callbackUrl: chance.url(),
    };

    it('rejects with a 400 status code', async () => {
      const response = await fetch(url, { 
        method: 'POST', 
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const { message } = await response.json();

      expect(response.status).toEqual(400);
      expect(message).toEqual('Invalid request body');
    });
  });

  describe('when the event body is valid', () => {
    const url = 'https://datahog.lemonjs.uk/collect';

    const body = {
      provider: 'gas',
      callbackUrl: chance.url(),
    };

    it('returns a 202 status code', async () => {
      const response = await fetch(url, { 
        method: 'POST', 
        body: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const { message } = await response.json();

      expect(response.status).toEqual(202);
      expect(message).toEqual('Accepted');
    });
  });
});
