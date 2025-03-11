Retail Pulse Image Processing API - Documentation

1. Project Overview

Retail Pulse Image Processing API is a backend service designed to process large batches of images collected from stores. It:

Accepts job requests with image URLs and store IDs.

Downloads the images and calculates their perimeter.

Simulates GPU processing time.

Stores results and provides job status updates.

2. Setup & Installation

Prerequisites

Node.js (v18+ recommended)

MongoDB (local or Atlas)

Postman (for API testing)




Clone the repository:
git clone https://github.com/backend_assignment/retail-pulse-api.gitcd retail-pulse-api

Install dependencies:   
npm install

Run the server:
node server.js
