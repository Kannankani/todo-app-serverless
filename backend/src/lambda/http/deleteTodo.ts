import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'

import '../../dataLayer/todoItemAccess'
import { TodoItemAccess } from '../../dataLayer/todoItemAccess'


export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const todoItemAccess = new TodoItemAccess;

  // TODO: Remove a TODO item by id
  
  await todoItemAccess.deleteTodo (todoId)

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
