import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'

const XAWS = AWSXRay.captureAWS(AWS)

import { TodoItem } from '../models/TodoItem'
import { TodoUpdate} from '../models/TodoUpdate'

export class TodoItemAccess {

  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly todoUserIndex = process.env.TODOUSER_INDEX,
    private readonly todoItemTable = process.env.TODOITEM_TABLE) {
  }

  async getTodos (): Promise<TodoItem[]> {
    console.log('Getting all TodoItem')

    const result = await this.docClient.scan({
      TableName: this.todoItemTable
    }).promise()

    const items = result.Items
    return items as TodoItem[]
  }

  async getUserTodos (userId:string): Promise<TodoItem[]> {
    console.log('Getting todo for user: ' + userId)

    const result = await this.docClient.query({
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
    }).promise()

    const items = result.Items
    return items as TodoItem[]
  }

  async createTodo(todoitem: TodoItem): Promise<TodoItem> {
    console.log ('creating todo ' + todoitem)
    await this.docClient.put({
      TableName: this.todoItemTable,
      Item: todoitem
    }).promise()

    return todoitem
  }

  async updateTodo (id: string, todoupdate: TodoUpdate) 
    :Promise <void> {
    console.log ('update todo for: ' + id)
    await this.docClient.update( {
        TableName: this.todoItemTable,
        Key : {
            "todoId" : id
        },
        UpdateExpression: 
            "set name = :name, dueDate = :dueDate, done=:done",
        ExpressionAttributeValues:{
            ":name": todoupdate.name,
            ":dueDate": todoupdate.dueDate,
            ":done": todoupdate.done
        },
        // ReturnValues:"UPDATED_NEW"
    }).promise
    return
  }


  async deleteTodo (id: string): Promise <void> {
    await this.docClient.delete ({
      TableName: this.todoItemTable,
      Key: {
        "todoId" : id
      }
    }).promise
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