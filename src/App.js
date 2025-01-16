import { useState,useEffect } from "react";
function Square({ value, onSquareClick, isWinning }) {
  return (
    <button className={`square ${isWinning ? 'winning-square' : ''}`} onClick={onSquareClick} >
      {value}
    </button>
  );
  //相当于square这个子组件上面要绑定一个onsquareclick的点击事件
  //这个点击事件具体内容放在board父组件上定义
}

function Board({ xIsNext, squares, onPlay }) {
  // const [squares, setSquares] = useState(Array(9).fill(null));
  //要从多个子组件收集数据，或让两个子组件相互通信，请改为在其父组件中声明共享 state
  //父组件可以通过 props 将该 state 传回给子组件。这使子组件彼此同步并与其父组件保持同步
  function handleClick(i) {
    if (squares[i] || calculateWinner(squares).winner) {
      return;
    } //如果该方块已经有值，那么return
    //如果calculateWinner返回的是squares[a]，那么return
    const nextSquares = squares.slice(); //相当于squares的副本
    //为什么要建立副本（不变性）？1、便于撤销和重做2、便于重新渲染时比较数据是否改变
    const row = Math.floor(i / 3); // 计算行
    const col = i % 3; // 计算列

    if (xIsNext) {
      nextSquares[i] = "X";
    } else {
      nextSquares[i] = "O";
    }
    onPlay(nextSquares,row,col);//变成用onplay来控制board的状态
    // setSquares(nextSquares);
    // //让 React 知道组件的 state 已经改变
    // //触发使用 squares state 的组件（Board）及其子组件（构成棋盘的 Square 组件）的重新渲染
    // setXIsNext(!xIsNext); //相当于使用了一个布尔值，这个布尔值初始时为true，即x落子，落子后布尔值翻转，变为o落子
  }
  //定义了具体的onSquareClick点击事件内容

 const [winningSquares, setWinningSquares] = useState([]); // 用于存储获胜方块索引
  useEffect(() => {
    const { winner, winningSquares } = calculateWinner(squares);
    if (winner) {
      setWinningSquares(winningSquares);
    } else {
      setWinningSquares([]);
    }
  }, [squares]); // 当 `squares` 变化时，重新计算获胜者
  let status; //显示下一步的状态
  const { winner } = calculateWinner(squares);
  const isDraw = !winner && squares.every(square => square !== null); // 检查是否为平局
  if (winner) {
    status = "Winner: " + winner;
  } else if (isDraw) {
    status = "It's a draw!";
  } else {
    status = "Next player: " + (xIsNext ? "X" : "O");
  }
  


  return (
    <>
      <div className="status">{status}</div>
      {Array.from({ length: 3 }, (_, row) => (
        <div className="board-row" key={row}>
          {Array.from({ length: 3 }, (_, col) => (
            <Square
              key={row * 3 + col}
              value={squares[row * 3 + col]}
              onSquareClick={() => handleClick(row * 3 + col)}
              isWinning={winningSquares.includes(row * 3 + col)} // 传递获胜信息
            />
          ))}
            </div>
      ))}
    </>
  );
}


//定义一个game组件来控制board中的数据
//注意export default要添加在game前面，因为要告诉index.js，game成为了顶层组件
export default function Game() {
  // const [xIsNext, setXIsNext] = useState(true);
  const [history, setHistory] = useState([{ squares: Array(9).fill(null), movePosition: null }]);
  const [currentMove, setCurrentMove] = useState(0);
  const [isAscending, setIsAscending] = useState(true); // 新增状态用于排序顺序
  const xIsNext = currentMove % 2 === 0;
  const current = history[currentMove];
  const currentSquares = current.squares;
  // const currentSquares = history[history.length - 1];//从 history 中读取最后一个 squares 数组

  function handlePlay(nextSquares,row, col) {
    const nextHistory = [...history.slice(0, currentMove + 1), { squares: nextSquares, movePosition: { row, col } }];
    console.log(nextHistory, "squares")
    setHistory(nextHistory);
     // 获取最新一步的 squares 的长度
    setCurrentMove(nextHistory.length - 1);
    // setHistory([...history, nextSquares]);//枚举 history中的所有元素
    // setXIsNext(!xIsNext);//相当于使用了一个布尔值，这个布尔值初始时为true，即x落子，落子后布尔值翻转，变为o落子
  }
  //board组件可以通过调用这个函数来实现更新

  function jumpTo(nextMove) {
    setCurrentMove(nextMove);
    // setXIsNext(nextMove % 2 === 0);
  }

  //定义一个moves
  //通过.map(()=>{})来实现一个新数组
  const moveItems = [...history.keys()].map(move => {
   const { movePosition } = history[move];
    let description;
    if (move === currentMove) {
      description = 'You are at move #' + move;
      if (movePosition) {
        description += ` (Position: ${movePosition.row}, ${movePosition.col})`;
      }
    } else if (move > 0) {
      description = 'Go to move #' + move;
      if (movePosition) {
        description += ` (Position: ${movePosition.row}, ${movePosition.col})`;
      }
    } else {
      description = 'Go to game start';
    }
    return { move, description };
  }).sort((a, b) => isAscending ? a.move - b.move : b.move - a.move);
  const sortedMoves = moveItems.map(({ move, description }) => (
    <li key={move}>
      <button onClick={() => jumpTo(move)}>{description}</button>
    </li>
  ));

  return (
    <div className="game">
      <div className="game-board">
       <Board xIsNext={xIsNext} squares={currentSquares} onPlay={(nextSquares, row, col) => handlePlay(nextSquares, row, col)} />
      </div>
     <div className="game-info">
        <button onClick={() => setIsAscending(!isAscending)}>
          {isAscending ? 'Switch to Descending' : 'Switch to Ascending'}
        </button>
        <ol>{sortedMoves}</ol>
      </div>
    </div>
  );
}


//定义一个能判断出winner的function
function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];

    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
     return { winner: squares[a], winningSquares: [a, b, c] };
    }
    //先检查squares[a]是否非空，再检查squares[a] === squares[b]，再检查squares[a] === squares[c]
  }
  return { winner: null, winningSquares: [] };
}
