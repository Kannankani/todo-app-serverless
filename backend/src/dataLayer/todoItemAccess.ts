import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

const XAWS = AWSXRay.captureAWS(AWS)

import { TodoItem } from '../models/TodoItem'
import { TodoUpdate} from '../models/TodoUpdate'
import { createLogger } from '../utils/logger'

export class TodoItemAccess {

  constructor(
    private readonly logger = createLogger('dataAccess'),
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly todoUserIndex = process.env.TODOUSER_INDEX,
    private readonly todoItemTable = process.env.TODOITEM_TABLE) {
  }

  async getTodos (): Promise<TodoItem[]> {
    this.logger.info ('gettodos table scan')
    const query = {
      TableName: this.todoItemTable
    }

    try {
      const result = await this.docClient.scan(query).promise()
      const items = result.Items
      return items as TodoItem[]
    }
    catch (err) {
      throw (err)
      return
    }
  }

  async getUserTodos (userId:string): Promise<TodoItem[]> {

    this.logger.info ('gettodo for user: ', userId)

    const query = {
      TableName: this.todoItemTable,
      IndexName: this.todoUserIndex,
      KeyConditionExpression: "userId = :v_userId",
      ProjectionExpression:
                    'userId, todoId, createdAt, #p_name, \
                     dueDate, done, attachmentUrl',
      ExpressionAttributeValues: {
            ":v_userId": userId 
      },
      ExpressionAttributeNames: {
            '#p_name': 'name'
      }
    }

    try {
      const result = await this.docClient.query(query).promise()
      const items = result.Items
      return items as TodoItem[]
    }
    catch (err) {
      throw (err)
      return
    }

    
  }

  async createTodo(todoitem: TodoItem): Promise<TodoItem> {
    this.logger.info ('create todo', todoitem)

    const query = {
      TableName: this.todoItemTable,
      Item: todoitem
    }

    try {
      await this.docClient.put(query).promise()
      return todoitem
    }
    catch (err) {
      throw (err)
      return
    }
  }

  async updateTodo (id: string, todoupdate: TodoUpdate) 
    :Promise <void> {
    
    this.logger.info ('update todo for: ', id)

    const query = {
      TableName: this.todoItemTable,
      Key : {
          "todoId" : id
      },
      UpdateExpression: 
          "set #p_name = :v_name, dueDate = :v_dueDate, done=:v_done",
      ExpressionAttributeValues:{
          ":v_name": todoupdate.name,
          ":v_dueDate": todoupdate.dueDate,
          ":v_done": todoupdate.done
      },
      ExpressionAttributeNames: {
        '#p_name': 'name'
      },
      ReturnValues:'UPDATED_NEW'
    }
    this.logger.info ('update todo for: ', id)

    try {
      const r = await this.docClient.update(query).promise()
      this.logger.info ("update result: ", r)
    }
    catch (err) {
      throw (err)
    }
    
    return 
  }


  async deleteTodo (id: string, userId: string): Promise <void> {

    this.logger.info ('delete todo for: ', id)
    
    const query = {
      TableName: this.todoItemTable,
      Key: {
        "todoId" : id
      },
      ConditionExpression:"userId = :v_userId",
      ExpressionAttributeValues: {
          ":v_userId": userId
      },
      ReturnItemCollectionMetrics: 'SIZE',
      ReturnValues: 'ALL_OLD'
    }

    try {
      await this.docClient.delete (query).promise()
    } catch (err) {
      throw (err)
    }
    return
  }

}

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    console.log('Creating a local DynamoDB instance')
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }

  return new XAWS.DynamoDB.DocumentClient()
}