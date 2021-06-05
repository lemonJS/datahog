import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { Providers, providers } from './providers';

const FAILURE_PROBABILITY = 0.5;

/**
 * An implementation of https://bitbucket.org/wonderbill/datahog/src/master/src/server.js
 * that is publicly accessible to avoid setting up reverse DNS
 * @param {APIGatewayProxyEvent} event 
 * @returns {Promise<APIGatewayProxyResult>}
 */
export const handle = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const { id } = event.pathParameters || {};

  if (Math.random() > 1 - FAILURE_PROBABILITY) {
    return {
      statusCode: 500,
      body: '#fail'
    };
  }

  const bills = providers[id as keyof Providers];

  return {
    statusCode: bills ? 200 : 404,
    body: JSON.stringify(bills)
  }
};
