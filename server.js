const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let players = [];
let board = Array(9).fill(null);

app.use(express.static(__dirname));

io.on("connection", (socket) => {
  if (players.length < 2) {
    players.push(socket.id);
    const currentPlayer = players.length === 1 ? "X" : "O";
    socket.emit("startGame", currentPlayer);

    if (players.length === 2) {
      io.emit("startGame", "X");
    }
  }

  socket.on("makeMove", ({ index, player }) => {
    if (board[index]) return;

    board[index] = player;
    socket.broadcast.emit("opponentMove", { index, player });

    if (checkWin(player)) {
      io.emit("gameOver", `${player} wins!`);
    } else if (board.every((cell) => cell)) {
      io.emit("gameOver", "It's a tie!");
    }
  });

  socket.on("disconnect", () => {
    players = players.filter((id) => id !== socket.id);
    board = Array(9).fill(null);
    io.emit("gameOver", "Opponent disconnected!");
  });
});

function checkWin(player) {
  const winPatterns = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  return winPatterns.some((pattern) =>
    pattern.every((index) => board[index] === player)
  );
}

server.listen(3000, () => console.log("Server running on http://localhost:3000"));
