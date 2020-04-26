import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { TodoItemAccess } from '../../dataLayer/todoItemAccess';
import { getUserId } from '../utils';
import { createLogger } from '../../utils/logger';

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // TODO: Get all TODO items for a current user

  const todoItemAccess = new TodoItemAccess
  const userId         = getUserId (event)

  const logger = createLogger('getTodos')  
  logger.info('getTodos for: ', userId)

  try {
    const todos = await todoItemAccess.getUserTodos (userId)

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        items: todos
      })
    }
  }
  catch (err) {
    logger.info('get todo error:', {
      errMsg: err
    })
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        err: 'unable to read todo'
      })
    }
  }


}
