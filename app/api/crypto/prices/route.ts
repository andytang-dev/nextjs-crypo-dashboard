import { NextRequest, NextResponse } from 'next/server'

import AWS from 'aws-sdk'
import moment from 'moment'

// AWS SDK configuration
AWS.config.update({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
})

const dynamoDb = new AWS.DynamoDB.DocumentClient()

export async function GET(request: NextRequest) {
  const today = moment().utc().startOf('day').format('YYYY-MM-DDTHH:mm:ss') + 'Z'
  const yesterday = moment().utc().startOf('day').subtract(1, 'days').format('YYYY-MM-DDTHH:mm:ss') + 'Z'

  console.log('today:', today, yesterday)

  const params = {
    TableName: process.env.AWS_DYNAMODB_TABLE || '',
    FilterExpression: '#date IN (:today, :yesterday)',
    ExpressionAttributeNames: {
      '#date': 'Date',
    },
    ExpressionAttributeValues: {
      ':today': today,
      ':yesterday': yesterday,
    },
  }

  try {
    const data = await dynamoDb.scan(params).promise()
    return NextResponse.json(data.Items)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Error fetching records from DynamoDB' }, { status: 500 })
  }
}
