const AWS = require('aws-sdk');
const db = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });
const uuid = require('uuid/v4');


AWS.config.update({
  accessKeyId: process.env.accessKeyId,
  secretAccessKey: process.env.secretAccessKey,
  region:  process.env.region
});

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
  let userPictureKey = uuid()

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
    !reqBody.userPicture

  ) {
    return callback(
      null,
      response(400, {
        error: 'Participante deve ter foto'
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

  let decodedImage = Buffer.from(reqBody.userPicture.replace(/^data:image\/\w+;base64,/, ""), 'base64')

  const type = reqBody.userPicture.split(';')[0].split('/')[1]

  let s3bucket = new AWS.S3({
    Bucket: 'pca-knowns-users',
  });

  var params = {
    Bucket: 'pca-knowns-users',
    Key: `${userPictureKey}.${type}`,
    Body: decodedImage,
    ContentEncoding: 'base64', 
    ContentType: `image/${type}`
  };
  s3bucket.putObject(params, function (err, data) {
    if (err) {
      console.log('error in callback');
      console.log(err);
    } else if (data) {

      let userPicture = 'https://pca-knowns-users.s3.amazonaws.com/' + userPictureKey + '.jpeg'

      const participant = {
        id: reqBody.id,
        createdAt: new Date().toISOString(),
        roomId: reqBody.roomId,
        name: reqBody.name,
        userPicture: `${userPictureKey}.${type}`,

      };

      return db
        .put({
          TableName: participantTable,
          Item: participant,
          ConditionExpression: 'attribute_not_exists(id)',
        })
        .promise()
        .then(() => {
          callback(null, response(201, participant));
        })
        .catch((err) => {
          if (err.statusCode === 400) {
            callback(null, response(400, 'Usuário ja cadastrado na sala'))
          } else {
            response(null, response(err.statusCode, err))
          }

        })

    }
  })

    ;
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
  const reqBody = JSON.parse(event.body)
  const id = reqBody.id;
  const roomId = reqBody.roomId;

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
        error: 'Participante deve ter id da sala '
      })
    );
  }

  const params = {

    KeyConditionExpression: 'id = :id and roomId =:roomId',
    ExpressionAttributeValues: {
      ':id': id,
      ':roomId': roomId
    },
    TableName: participantTable
  };

  return db
    .query(params)
    .promise()
    .then((res) => {
      callback(null, response(200, res.Items.sort(sortByDate)));
    })
    .catch((err) => callback(null, response(err.statusCode, err)));
};

