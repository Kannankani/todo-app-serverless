import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { TodoItemAccess } from '../../dataLayer/todoItemAccess'
import { createLogger } from '../../utils/logger'

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
  const todoItemAccess = new TodoItemAccess

  const logger = createLogger('updateTodos')  
  logger.info('updateTodos for: ', {
    id: todoId,
    up: updatedTodo
  })

  try {
    await todoItemAccess.updateTodo (todoId, updatedTodo)

    // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object
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
        err: 'unable to update todo'
      })
    }
  }
  
  return undefined
}
