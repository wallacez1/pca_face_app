const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });
const uuid = require('uuid/v4');

const userTable = process.env.USER_TABLE
const roomTable = process.env.ROOM_TABLE
// Create a response
function response(statusCode, message) {
  return {
    statusCode: statusCode,
    body: JSON.stringify(message)
  };
}
function sortByDate(a, b) {
  if (a.createdAt > b.createdAt) {
    return -1;
  } else return 1;
}

module.exports.createRoom = (event, context, callback) => {
  const reqBody = JSON.parse(event.body);

  if (
    !reqBody.userId ||
    reqBody.userId.trim() === ''
  
  ) {
    return callback(
      null,
      response(400, {
        error: 'Sala deve ter id de usuário'
      })
    );
  }

  if (
    !reqBody.title ||
    reqBody.title.trim() === ''
  
  ) {
    return callback(
      null,
      response(400, {
        error: 'Sala deve ter título'
      })
    );
  }

  if (
    !reqBody.descripton ||
    reqBody.descripton.trim() === '' 
  ) {
    return callback(
      null,
      response(400, {
        error: 'Sala deve ter descrição'
      })
    );
  }

  const room = {
    roomId: uuid(),
    createdAt: new Date().toISOString(),
    userId: reqBody.userId,
    title: reqBody.title,
    descripton: reqBody.descripton,
    body: reqBody.body
  };

  return db
    .put({
      TableName: roomTable,
      Item: room
    })
    .promise()
    .then(() => {
      callback(null, response(201, room));
    })
    .catch((err) => response(null, response(err.statusCode, err)));
};
// Get all rooms
module.exports.getAllRooms = (event, context, callback) => {
  return db
    .scan({
      TableName: roomTable
    })
    .promise()
    .then((res) => {
      callback(null, response(200, res.Items.sort(sortByDate)));
    })
    .catch((err) => callback(null, response(err.statusCode, err)));
};

// Get a single room
module.exports.getRoom = (event, context, callback) => {
  const id = event.pathParameters.roomId;

 

  var params = {
    
    KeyConditionExpression: 'roomId = :id',
    ExpressionAttributeValues: {
      ':id': id
    },
    TableName : roomTable,
 
}

console.log(params)
console.log(id)

  return db
    .query(params)
    .promise()
    .then((res) => {
      callback(null, response(200, res.Items));
      
    })
    .catch((err) => callback(null, response(err.statusCode, err)));
};
// Update a room
module.exports.updateRoom = (event, context, callback) => {
  const id = event.pathParameters.id;
  const reqBody = JSON.parse(event.body);
  const { title, description } = reqBody;

  if (
    !reqBody  
  ) {
    return callback(
      null,
      response(400, {
        error: 'Corpo da requisição vazio'
      })
    );
  }

  if (
    !id ||
    id.trim() === ''
  
  ) {
    return callback(
      null,
      response(400, {
        error: 'id não identificado'
      })
    );
  }

  const params = {
    Key: {
      id: id
    },
    TableName: postsTable,
    ConditionExpression: 'attribute_exists(id)',
    UpdateExpression: 'SET title = :title, description = :description',
    ExpressionAttributeValues: {
      ':title': title,
      ':description': description
    },
    ReturnValues: 'ALL_NEW'
  };
 
  return db
    .update(params)
    .promise()
    .then((res) => {
      console.log(res);
      callback(null, response(200, res.Attributes));
    })
    .catch((err) => callback(null, response(err.statusCode, err)));
};

// Get users room
module.exports.userRooms = (event, context, callback) => {
  const userId = event.pathParameters.roomId;
 
  const params = {
    FilterExpression: 'userId = :userId',
    ExpressionAttributeValues: {
      ':userId': userId
    },
    TableName: roomTable
  };

  console.log(params)

  return db
    .scan(params)
    .promise()
    .then((res) => {
      callback(null, response(200, res.Items.sort(sortByDate)));
    })
    .catch((err) => callback(null, response(err.statusCode, err)));
};
// Delete a post
module.exports.deleteRoom = (event, context, callback) => {
  const id = event.pathParameters.id;
  const params = {
    Key: {
      id: id
    },
    TableName: roomTable
  };
  return db
    .delete(params)
    .promise()
    .then(() =>
      callback(null, response(200, { message: 'Sala excluída' }))
    )
    .catch((err) => callback(null, response(err.statusCode, err)));
};

// Create User
module.exports.createUser = (event, context, callback) => {
  const reqBody = JSON.parse(event.body);


  if (
    !reqBody.email ||
    reqBody.email.trim() === ''
  
  ) {
    return callback(
      null,
      response(400, {
        error: 'Usuário deve ter email'
      })
    );
  }

  if (
    !reqBody.password ||
    reqBody.password.trim() === '' 
  ) {
    return callback(
      null,
      response(400, {
        error: 'Usuário deve ter senha'
      })
    );
  }

  const user = {
    id: uuid(),
    createdAt: new Date().toISOString(),
    email: reqBody.email,
    password: reqBody.password,

  };

  return db
    .put({
      TableName: userTable,
      Item: user
    })
    .promise()
    .then(() => {
      callback(null, response(201, user));
    })
    .catch((err) => response(null, response(err.statusCode, err)));
};






