import 'source-map-support/register'

import * as uuid from 'uuid'

import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from 'aws-lambda'

import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { TodoItemAccess} from '../../dataLayer/todoItemAccess'
import { TodoItem } from '../../models/TodoItem'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'

const bucketName = process.env.IMAGES_S3_BUCKET

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  
  const newTodo: CreateTodoRequest = JSON.parse(event.body)
  const todoItemAccess = new TodoItemAccess;
  const userId:string = getUserId (event)
  var todoItem = <TodoItem> {}
  var newTodoItem = <TodoItem> {}

  const logger = createLogger('create')  
  logger.info('create todo:', newTodo)

  todoItem.userId        = userId
  todoItem.todoId        = uuid.v4()
  todoItem.createdAt     = new Date().toISOString()
  todoItem.name          = newTodo.name
  todoItem.dueDate       = newTodo.dueDate
  todoItem.done          = false
  todoItem.attachmentUrl = "https://" + bucketName + ".s3.amazonaws.com/" + 
                              todoItem.todoId
                              
  // TODO: Implement creating a new TODO item
  try {

    newTodoItem = await todoItemAccess.createTodo (todoItem);
    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        item: newTodoItem
      })
    }

  }
  catch (err) {
    logger.info('create todo error:', {
      errMsg: err
    })
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        err: 'unable to create todo'
      })
    }
  }

}
