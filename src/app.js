const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();

app.get("/", (req, res) => {
  return res.status(200).sendFile(path.join(__dirname, "hls.html"));
});

app.get("/api/video/express", (req, res) => {
  return res.sendFile(
    path.join(__dirname, "assets", "videos", "trailer1", "trailer.mp4")
  );
});

app.get("/api/video/progressive", (req, res) => {
  const range = req.headers.range;
  if (!range) return res.sendStatus(400);

  const videoPath = path.join(
    __dirname,
    "assets",
    "videos",
    "trailer1",
    "trailer.mp4"
  );
  const videoSize = fs.statSync(videoPath).size;

  const CHUNK_SIZE = 10 ** 6; // 1 mB
  const start = Number(range.replace("bytes=", "").split("-")[0]);
  const end = Math.min(start + CHUNK_SIZE - 1, videoSize - 1);

  const headers = {
    "Content-Range": `bytes ${start}-${end}/${videoSize}`,
    "Accept-Range": "bytes",
    "Content-Length": CHUNK_SIZE,
    "Content-Type": "video/mp4",
  };
  res.writeHead(206, headers);
  const videoStream = fs.createReadStream(videoPath, { start, end });
  videoStream.pipe(res);
});

app.get("/api/video/hls", (req, res) => {
  const m3u8Path = path.join(
    __dirname,
    "assets",
    "videos",
    "trailer1",
    "index.m3u8"
  );

  res.sendFile(m3u8Path);
});

app.get("/api/video/:tsFileName", (req, res) => {
  const filePath = path.join(
    __dirname,
    "assets",
    "videos",
    "trailer1",
    req.params.tsFileName
  );
  res.sendFile(filePath);
});

module.exports = app;
