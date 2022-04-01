import fetch from "node-fetch";
import "dotenv/config";
import axios from "axios";
import qs from "querystring";
import ata_template from './ata-template.js';
const color_map = {
  "#FF4500": 2, // bright red
  "#FFA800": 3, // orange
  "#FFD635": 4, // yellow
  "#00A36": 6, // darker green
  "#7EED56": 8, // lighter green
  "#2450A4": 12, // darkest blue
  "#3690EA": 13, // medium normal blue
  "#51E9F4": 14, // cyan
  "#811E9F": 18, // darkest purple
  "#B44AC0": 19, // normal purple
  "#FF99AA": 23, // pink
  "#9C6926": 25, // brown
  "#000000": 27, // black
  "#898D90": 29, // grey
  "#D4D7D9": 30, // light grey
  "#FFFFFF": 31, // white
};

var pixel_x = 82;
var pixel_y = 88;
var pixel_color_index = color_map["#FFFFFF"];

var username = process.env.ENV_PLACE_USERNAME;
var password = process.env.ENV_PLACE_PASSWORD;
// note: use https://www.reddit.com/prefs/apps
var app_client_id = process.env.ENV_PLACE_APP_CLIENT_ID;
var secret_key = process.env.ENV_PLACE_SECRET_KEY;

var access_token = null;
var current_timestamp = Date.now();
var last_time_placed_pixel = Date.now();
var access_token_expires_at_timestamp = Date.now();
var expires_at_timestamp = Date.now();

// note: reddit limits us to place 1 pixel every 5 minutes
const pixel_place_frequency = 300000;
var first = true;

function randomIntFromInterval(min, max) { // min and max included 
  return Math.floor(Math.random() * (max - min + 1) + min)
}

async function fetch_url(url, opts) {
  return await fetch(url, opts).then((res) => res.json());
}

async function set_pixel(
  access_token_in,
  x,
  y,
  color_index_in,
  canvas_index = 0
) {
  console.log("placing pixel");

  let url = "https://gql-realtime-2.reddit.com/query";

  await axios({
    method: "POST",
    url: "https://gql-realtime-2.reddit.com/query",
    headers: {
        "apollographql-client-name": "mona-lisa",
        "apollographql-client-version": "0.0.1",
        "authorization": `Bearer ${access_token_in}`,
        "content-type": "application/json",
    },
    data: `{\"operationName\":\"setPixel\",\"variables\":{\"input\":{\"actionName\":\"r/replace:set_pixel\",\"PixelMessageData\":{\"coordinate\":{\"x\":${x},\"y\":${y}},\"colorIndex\":${color_index_in},\"canvasIndex\":0}}},\"query\":\"mutation setPixel($input: ActInput!) {\\n  act(input: $input) {\\n    data {\\n      ... on BasicMessage {\\n        id\\n        data {\\n          ... on GetUserCooldownResponseMessageData {\\n            nextAvailablePixelTimestamp\\n            __typename\\n          }\\n          ... on SetPixelResponseMessageData {\\n            timestamp\\n            __typename\\n          }\\n          __typename\\n        }\\n        __typename\\n      }\\n      __typename\\n    }\\n    __typename\\n  }\\n}\\n\"}`
})
}

while (true) {
  let current_timestamp = Date.now();

  // refresh access token if necessary
  if (access_token === null || current_timestamp >= expires_at_timestamp) {
    console.log("refreshing access token...");

    let data = {
      grant_type: "password",
      username: username,
      password: password,
    };

    let credentials = Buffer.from(`${app_client_id}:${secret_key}`).toString(
      "base64"
    );

    let response_data = await fetch_url(
      "https://ssl.reddit.com/api/v1/access_token",
      {
        method: "POST",
        headers: {
          "User-Agent": "Placer bot by Project r/place",
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: qs.stringify(data),
      }
    );

    console.log("received response: ", response_data);

    access_token = response_data["access_token"];
    let access_token_type = response_data["token_type"]; // this is just "bearer"
    let access_token_expires_in_seconds = 3600000; // this is usually "3600"
    let access_token_scope = response_data["scope"]; // this is usually "*"

    // this stores the time in seconds
    expires_at_timestamp = current_timestamp + access_token_expires_in_seconds;

    console.log("received new access token: ", access_token);
  }


    // draw pixel onto screen
  if (
      access_token != null &&
      (current_timestamp >= last_time_placed_pixel + pixel_place_frequency ||
        first == true)
    ) {
      pixel_x = randomIntFromInterval(299, 432)
      pixel_y = randomIntFromInterval(318, 399)
      var y_set = ata_template[pixel_y-318]
      pixel_color_index = y_set[pixel_x-299]

      console.log("target:"+pixel_x+":"+pixel_y+":color:"+pixel_color_index);
      await set_pixel(access_token, pixel_x, pixel_y, pixel_color_index);
      last_time_placed_pixel = Date.now();
      first = false;
    }
}
