'use strict';
var AWS = require('aws-sdk');
const faceapi = require('./face-api.min.js');
const fetch = require("node-fetch")
const canvas = require("canvas")
const { Canvas, Image, ImageData } = canvas
faceapi.env.monkeyPatch({ fetch: fetch, Canvas, Image, ImageData })

AWS.config.update({ region: 'sa-east-1' });
const db = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });

function response(statusCode, message) {
  return {
    statusCode: statusCode,
    body: JSON.stringify(message)
  };
}



// async function finalResponse(res, event, callback) {
//   await faceapi.nets.faceRecognitionNet.loadFromDisk('./models'),
//     await faceapi.nets.faceLandmark68Net.loadFromDisk('./models'),
//     await faceapi.nets.ssdMobilenetv1.loadFromDisk('./models')


//   const img = await faceapi.fetchImage(res.Item.url)


//   const detectionsDB = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
//   descriptions.push(detectionsDB.descriptor)

//   let descript = faceapi.LabeledFaceDescriptors(res.Item.name, descriptions)
//   const faceMatcher = new faceapi.FaceMatcher(descript, 0.6)
//   const body = JSON.parse(event.body);
//   const link = body.imgLink
//   const decode = await faceapi.fetchImage(link);
//   image = await faceapi.bufferToImage(decode)
//   const detections = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors()
//   const results = detections.map(d => faceMatcher.findBestMatch(d.descriptor))
//   if (results) {
//     callback(null, response(500, { message: results[0] }))
//   }
// }


module.exports.compareFace = async function (event, context, callback) {

  await faceapi.nets.faceRecognitionNet.loadFromDisk('./models'),
  await faceapi.nets.faceLandmark68Net.loadFromDisk('./models'),
  await faceapi.nets.ssdMobilenetv1.loadFromDisk('./models')
  const body = JSON.parse(event.body);
  const link = body.imgLink
  const decode = await canvas.loadImage(link);
  callback(null, response(500, { message: decode }))
//   image = await faceapi.bufferToImage(decode)

// const img = await faceapi.fetchImage(res.Item.url)


// const detectionsDB = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor()
// descriptions.push(detectionsDB.descriptor)

// let descript = faceapi.LabeledFaceDescriptors(res.Item.name, descriptions)
// const faceMatcher = new faceapi.FaceMatcher(descript, 0.6)
// const body = JSON.parse(event.body);

// const detections = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors()
// const results = detections.map(d => faceMatcher.findBestMatch(d.descriptor))
if (results) {
  callback(null, response(500, { message: results[0] }))
}

  // const params = {
  //   Key: {
  //     id: '1'
  //   },
  //   TableName: 'sala'
  // }

  // return db
  //   .get(params)
  //   .promise()
  //   .then((res) => {

  //     finalResponse(res, event, callback)
  //   })
  //   .catch((err) => {
  //     console.log(callback(null, response(500, { message: 'erro' })))

  //   })



};


