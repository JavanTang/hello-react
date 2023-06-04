import { useState } from "react";

function Xx({ value, onSquareClick }) {
  return (
    <button className="X" onClick={onSquareClick}>
      {value}
    </button>
  );
}

function calculateWinner(gameSquares, point) {
  // 横
  let h = [];
  // 竖
  let s = [];
  // 斜1
  let x_1 = [];
  // 斜2
  let x_2 = [];
  for (let i = 0; i < 3; i++) {
    h.push(gameSquares[point[0]][i]);
    s.push(gameSquares[i][point[1]]);
    x_1.push(gameSquares[i][i]);
    x_2.push(gameSquares[i][2 - i]);
  }
  if (
    (h[0] && h[0] === h[1] && h[1] === h[2]) ||
    (s[0] && s[0] === s[1] && s[1] === s[2]) ||
    (x_1[0] && x_1[0] === x_1[1] && x_1[1] === x_1[2]) ||
    (x_2[0] && x_2[0] === x_2[1] && x_2[1] === x_2[2])
  ) {
    return true;
  }
  return false;
}

function deepCopy(arr) {
  let copy = [];
  arr.forEach((arr2) => {
    copy.push([...arr2]);
  });
  return copy;
}

function Board({ xIsNext, squares, onPlay }) {
  // 注意下面这三个值是有问题的，因为这三个值呢，它没有绑定任何的属性，
  // 那这个reactor呢，它在数据变动的时候并不会响应这些的变化，
  // 我在下面的函数中有调用到，但是呢，这个调用并不会触及它的改变，
  // 如果想要有所提升的话，必须得将这个东西把它绑定它的这个改变。
  // let isOver = false;
  // let status;
  // let winner;

  const [isOver, setIsOver] = useState(false);
  const [winner, setWinner] = useState(false);

  let status;
  if (isOver) {
    status = "Winner: " + (!xIsNext ? "X" : "O");
  } else {
    status = "Next player: " + (xIsNext ? "X" : "O");
  }

  function handleClick(i, j) {
    if (squares[i][j] || isOver) {
      return;
    }
    const nextSquares = deepCopy(squares);
    if (xIsNext) {
      nextSquares[i][j] = "X";
    } else {
      nextSquares[i][j] = "O";
    }
    onPlay(nextSquares, [i, j]);

    // 状态更新是异步的
    const winner = calculateWinner(nextSquares, [i, j]);
    if (winner) {
      setIsOver(true);
    }
  }

  const roard = (size = squares.length) => {
    let arr = [];
    for (let i = 0; i < size; i++) {
      let row = [];
      for (let j = 0; j < size; j++) {
        row.push(
          <Xx
            value={squares[i][j]}
            onSquareClick={() => handleClick(i, j)}
          ></Xx>
        );
      }
      arr.push(<div>{row}</div>);
    }
    return arr;
  };

  return (
    <div>
      <div className="status">{status}</div>
      <div>{roard()}</div>
    </div>
  );
}

export default function Game() {
  // 第一个下的人

  const [history, setHistory] = useState([
    [
      [null, null, null],
      [null, null, null],
      [null, null, null],
    ],
  ]);

  const [movePoint, setMovePoint] = useState(Array(2).fill(null));

  const [currentMove, setCurrentMove] = useState(0);
  // 声明还是有顺序的
  const xIsNext = currentMove % 2 === 0;

  const [ascent, setAscent] = useState(true);

  const orderButton = (
    <button onClick={() => setAscent(!ascent)}>
      {ascent ? "升序" : "降序"}
    </button>
  );

  // 这个是显示的内容,对它的index进行修改来实现时间旅行
  const currentSquare = history[currentMove]; // 指向最后一个

  function handlePlay(nextSquares, nextPoint) {
    const newHistory = [...history.slice(0, currentMove + 1), nextSquares];
    const newPoint = [...movePoint.slice(0, currentMove + 1), nextPoint];
    setHistory(newHistory);
    setMovePoint(newPoint);
    setCurrentMove(newHistory.length - 1);
  }

  function jumpTo(move) {
    setCurrentMove(move);
  }

  let sortedHistory = ascent ? history : history.slice().reverse();

  const moves = history.map((squares, idx) => {
    const move = ascent ? idx : sortedHistory.length - idx - 1;
    let description = move ? "Go to move #" + movePoint[move] : "Go to game start";
    return (
      <li key={move}>
        <button onClick={() => jumpTo(move)}>{description}</button>
      </li>
    );
  });

  return (
    <div>
      <Board xIsNext={xIsNext} squares={currentSquare} onPlay={handlePlay} />
      <div>{orderButton}</div>

      <div>{moves}</div>
    </div>
  );
}
