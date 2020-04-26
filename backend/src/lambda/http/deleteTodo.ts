import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'

import '../../dataLayer/todoItemAccess'
import { TodoItemAccess } from '../../dataLayer/todoItemAccess'
import { createLogger } from '../../utils/logger'
import { getUserId } from '../utils'



export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const userId:string = getUserId (event)
  const todoItemAccess = new TodoItemAccess;

  const logger = createLogger('delete')  
  logger.info('delete todo: ', todoId)

  // TODO: Remove a TODO item by id

  try {  
    
    await todoItemAccess.deleteTodo (todoId, userId)
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
      })
    }
  }
  catch (err) {
    logger.info('delete todo error:', {
      errMsg: err
    })
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        err: 'unable to delete todo'
      })
    }
  }
  
}
