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
    try {
      const r = await this.docClient.update( {
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
    }).promise()
    console.log ("update success: ", r)
    }
    catch (err) {
      console.log ("update fail: ", err)
    }
    
    return 
  }


  async deleteTodo (id: string): Promise <void> {
    console.log (' datalayer delete for id: ', id)

    /*
    var params = {
      TableName : this.todoItemTable,
      Key: {
        "todoId" : id
      }
    };
    */

    try {
      const r = await this.docClient.delete ({
        TableName: this.todoItemTable,
        Key: {
          "todoId" : id
        },
        ReturnItemCollectionMetrics: 'SIZE',
        ReturnValues: 'ALL_OLD'
      }).promise()

      console.log('delete success: ', r)

    } catch (err) {
      console.log ('error in delete: ', err)
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