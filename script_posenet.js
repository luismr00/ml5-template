// Copyright (c) 2018 ml5
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* ===
ml5 Example
PoseNet example using p5.js
=== */

let video;
let poseNet;
let poses = [];
let crownImage;
let playSound = false;

// Storing the keypoint positions
let keypoints = [];
let interpolatedKeypoints = [];

// p5 function
function preload() {
  crownImage = loadImage("assets/falcon-helmet1.png");

  soundFormats('mp3', 'ogg');
  mySound = loadSound("assets/falcon-taunt.mp3");
}


function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.size(width, height);

  // Create a new poseNet method with a single detection
  poseNet = ml5.poseNet(video, { flipHorizontal: true });
  // This sets up an event that fills the global variable "poses"
  // with an array every time new poses are detected
  poseNet.on("pose", function (results) {
    poses = results;
  });
  // Hide the video element, and just show the canvas
  video.hide();

  // setup original keypoints
  createInitialKeypoints();
}

function updateKeypoints() {
  // If there are no poses, ignore it.
  if (poses.length <= 0) {
    return;
  }

  // Otherwise, let's update the points;
  let pose = poses[0].pose;
  keypoints = pose.keypoints;

  for (let kp = 0; kp < keypoints.length; kp++) {
    let oldKeypoint = interpolatedKeypoints[kp];
    let newKeypoint = keypoints[kp].position;

    let interpX = lerp(oldKeypoint.x, newKeypoint.x, 0.3);
    let interpY = lerp(oldKeypoint.y, newKeypoint.y, 0.3);

    let interpolatedKeypoint = { x: interpX, y: interpY };

    interpolatedKeypoints[kp] = interpolatedKeypoint;
  }
}

function draw() {
  let flippedVideo = ml5.flipImage(video);
  imageMode(CORNER);
  image(flippedVideo, 0, 0, width, height);

  updateKeypoints();

  // drawKeypoints();

  // console.log(interpolatedKeypoints[9]);
  let nosePosition = interpolatedKeypoints[0];
  let leftWristPosition = interpolatedKeypoints[9];
  let leftEarPosition = interpolatedKeypoints[3];
  let rightEarPosition = interpolatedKeypoints[4];

  let earDistance = dist(
    leftEarPosition.x,
    leftEarPosition.y,
    rightEarPosition.x,
    rightEarPosition.y
  );

  let maskHeight = earDistance * 1.5;

  imageMode(CENTER);
  image(
    crownImage,
    nosePosition.x,
    nosePosition.y - 100,
    earDistance * 1.5,
    maskHeight
  );

  if (leftWristPosition.y < height) {
    // tint(0, 153, 204);
    if (playSound === false) {
      mySound.play();
      playSound = true;
    }
  }
  else 
    // tint(255);
    playSound = false;
}

// A function to draw ellipses over the detected keypoints
function drawKeypoints() {
  for (let i = 0; i < interpolatedKeypoints.length; i++) {
    keypoint = interpolatedKeypoints[i];
    fill(255, 0, 0);
    text(i, keypoint.x, keypoint.y); // draw keypoint number on video
    // ellipse(keypoint.x, keypoint.y, 10, 10); // just draw red dots
  }
}

// Create default keypoints for interpolation easing
function createInitialKeypoints() {
  let numKeypoints = 17;
  for (let i = 0; i < numKeypoints; i++) {
    newKeypoint = { x: width / 2, y: height / 2 };

    interpolatedKeypoints.push(newKeypoint);
  }
}
