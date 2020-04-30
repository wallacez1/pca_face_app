const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });
const uuid = require('uuid/v4');

const participantTable = process.env.PARTICIPANT_TABLE

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

module.exports.createParticipant = (event, context, callback) => {
  const reqBody = JSON.parse(event.body);

  if (
    !reqBody.id ||
    reqBody.id.trim() === ''

  ) {
    return callback(
      null,
      response(400, {
        error: 'Participante deve ter id '
      })
    );
  }

  if (
    !reqBody.roomId ||
    reqBody.roomId.trim() === ''

  ) {
    return callback(
      null,
      response(400, {
        error: 'Participante deve ter id da Sala '
      })
    );
  }

  if (
    !reqBody.url ||
    reqBody.url.trim() === ''

  ) {
    return callback(
      null,
      response(400, {
        error: 'Participante deve ter url'
      })
    );
  }

  if (
    !reqBody.name ||
    reqBody.name.trim() === ''
  ) {
    return callback(
      null,
      response(400, {
        error: 'Participante deve ter nome'
      })
    );
  }

  const participant = {
    id: reqBody.id,
    createdAt: new Date().toISOString(),
    roomId: reqBody.roomId,
    name: reqBody.name,
    url: reqBody.url,

  };

  return db
    .put({
      TableName: participantTable,
      Item: participant
    })
    .promise()
    .then(() => {
      callback(null, response(201, participant));
    })
    .catch((err) => response(null, response(err.statusCode, err)));
};
// Get all rooms
module.exports.getAllparticipant = (event, context, callback) => {
  return db
    .scan({
      TableName: participantTable
    })
    .promise()
    .then((res) => {
      callback(null, response(200, res.Items.sort(sortByDate)));
    })
    .catch((err) => callback(null, response(err.statusCode, err)));
};
// Update a room
module.exports.getParticipantByRoom = (event, context, callback) => {
  const id = event.pathParameters.id;
  const roomId = event.pathParameters.roomId;

  const params = {

    KeyConditionExpression: 'id = :id and roomId =:roomId',
    ExpressionAttributeValues: {
      ':id': id,
      ':roomId': roomId
    },
    TableName: participantTable
  };

  console.log(params)

  return db
    .query(params)
    .promise()
    .then((res) => {
      callback(null, response(200, res.Items.sort(sortByDate)));
    })
    .catch((err) => callback(null, response(err.statusCode, err)));
};

