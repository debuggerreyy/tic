const socket = io(); // Connect to the server
const cells = document.querySelectorAll("[data-cell]");
const statusDisplay = document.getElementById("status");

let currentPlayer = "X";
let isMyTurn = false;

socket.on("startGame", (player) => {
  isMyTurn = player === currentPlayer;
  statusDisplay.textContent = isMyTurn ? "Your turn!" : "Waiting for opponent...";
});

cells.forEach((cell, index) => {
  cell.addEventListener("click", () => {
    if (cell.textContent || !isMyTurn) return;

    cell.textContent = currentPlayer;
    cell.classList.add("taken");
    isMyTurn = false;
    statusDisplay.textContent = "Waiting for opponent...";

    socket.emit("makeMove", { index, player: currentPlayer });
  });
});

socket.on("opponentMove", ({ index, player }) => {
  cells[index].textContent = player;
  cells[index].classList.add("taken");
  isMyTurn = true;
  statusDisplay.textContent = "Your turn!";
});

socket.on("gameOver", (message) => {
  statusDisplay.textContent = message;
  cells.forEach((cell) => cell.classList.add("taken"));
});
