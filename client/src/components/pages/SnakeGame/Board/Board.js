import React, { useState, useEffect } from "react";
import ReactLoaing from "react-loading";
import "./Board.css";
import axios from "axios";
import { useSelector } from "react-redux";

const boardSize = [15, 15];
const refreshTime = 175;
var snake = [[5, 5]];
var food = [2, 2];
var adder = [0, 1];
var count = 0;

const Board = () => {
  const account = useSelector((state) => state.AppState.account);
  const CreateNFTContract = useSelector(
    (state) => state.AppState.CreateNFTContract
  );
  const [Loading, setLoading] = useState(true);
  const [myList, setMyList] = useState([]);
  const [prevScore, setPrevScore] = useState();

  useEffect(() => {
    mynftlists();
    setLoading(false);
  }, [CreateNFTContract]);

  useEffect(async () => {
    const snakeData = await axios.post(
      `http://15.165.17.43:5000/game/snakeScore`,
      { account: account }
    );
    if (snakeData.data !== null) {
      if (snakeData.data.snakePoint !== null) {
        setPrevScore(snakeData.data.snakePoint);
      }
    }
    setLoading(false);
  }, [account]);
  function sleep(ms) {
    const wakeUpTime = Date.now() + ms;
    while (Date.now() < wakeUpTime) {}
  }
  // 내 nft 리스트
  async function mynftlists() {
    const lists = await CreateNFTContract.methods
      .MyNFTlists()
      .call({ from: account }, (error) => {
        if (!error) {
          console.log("send ok");
        } else {
          console.log(error);
        }
      });
    setMyList(lists);
  }

  const sendPoint = async () => {
    const point = score;

    function test() {
      let rareD;
      if (myList.filter((v) => v.rare === "5").length >= 3) {
        rareD = 3;
      } else if (myList.filter((v) => v.rare === "4").length >= 3) {
        rareD = 2.5;
      } else if (myList.filter((v) => v.rare === "3").length >= 3) {
        rareD = 2;
      } else if (myList.filter((v) => v.rare === "2").length >= 3) {
        rareD = 1.5;
      } else {
        rareD = 1;
      }
      return rareD;
    }

    function jest() {
      let starD;
      if (myList.filter((v) => v.star === "5").length >= 3) {
        starD = 3;
      } else if (myList.filter((v) => v.star === "4").length >= 3) {
        starD = 2.5;
      } else if (myList.filter((v) => v.star === "3").length >= 3) {
        starD = 2;
      } else if (myList.filter((v) => v.star === "2").length >= 3) {
        starD = 1.5;
      } else if (myList.filter((v) => v.star === "1").length >= 3) {
        starD = 1.2;
      } else {
        starD = 1;
      }
      return starD;
    }

    const snakeData = await axios.post(`http://15.165.17.43:5000/game/snake`, {
      point: point * (test() * jest()),
      account: account,
    });

    if (snakeData.data.bool === true) {
      alert(
        "Score(" +
          point +
          ")점" +
          " x ( " +
          "Rare(" +
          test() +
          ")" +
          " x " +
          "Star(" +
          jest() +
          ") ) = " +
          "Result(" +
          point * (test() * jest()) +
          ")점" +
          "\n" +
          snakeData.data.message
      );
      window.location.href = "/game";
    } else if (snakeData.data.bool === false) {
      alert(snakeData.data.message);
    }
  };

  //React variables
  var [start, setStart] = useState(false);
  var [board, setBoard] = useState(
    new Array(boardSize[0])
      .fill(0)
      .map((row) => new Array(15).fill(boardSize[0]))
  );
  var [sectionCard, setSectionCard] = useState(false);
  var [score, setScore] = useState(0);

  // Function
  // Handling restart request
  const handleRestart = () => {
    count = 0;
    setStart(!start);
    setScore(0);
    setSectionCard(false);
  };

  // Changind cell state to empty, snake and food
  const createCell = (snake) => {
    var temp = new Array(15)
      .fill(boardSize[0])
      .map((row) => new Array(boardSize[0]).fill(0));
    temp[food[0]][food[1]] = 2;
    for (var i = 0; i < snake.length; i++) {
      temp[snake[i][0]][snake[i][1]] = 1;
    }
    setBoard(temp);
  };

  // Creating random food cell
  const randomCell = (food, snake, min, max) => {
    do {
      food[0] = Math.ceil(Math.random() * (max - 1));
      food[1] = Math.ceil(Math.random() * (min - 1));
    } while (
      snake.find(
        (snakeCell) => snakeCell[0] === food[0] && snakeCell[1] === food[1]
      )
    );
  };

  // Setting adder value by using if-else block
  const setDirection = (direction) => {
    if (direction === "ArrowUp") {
      adder = [-1, 0];
    } else if (direction === "ArrowDown") {
      adder = [1, 0];
    } else if (direction === "ArrowLeft") {
      adder = [0, -1];
    } else if (direction === "ArrowRight") {
      adder = [0, 1];
    }
  };

  // Game logic
  useEffect(() => {
    // Reset values
    snake = [[5, 5]];
    food = [2, 2];
    adder = [0, 1];

    window.addEventListener("keydown", (event) => setDirection(event.key));

    const frame = setInterval(() => {
      var len = snake.length;
      for (var i = len - 1; i > 0; i--) {
        snake[i] = snake[i - 1];
      }
      snake[0] = [snake[0][0] + adder[0], snake[0][1] + adder[1]];

      if (
        !(
          snake[0][0] === -1 ||
          snake[0][1] === -1 ||
          snake[0][0] === boardSize[0] ||
          snake[0][1] === boardSize[1]
        )
      ) {
        createCell(snake);
        for (var j = 1; j < len; j++) {
          if (snake[0][0] === snake[j][0] && snake[0][1] === snake[j][1]) {
            clearInterval(frame);
            setSectionCard(true);
          }
        }
      } else {
        clearInterval(frame);
        setSectionCard(true);
      }

      if (snake[0][0] === food[0] && snake[0][1] === food[1]) {
        setScore(++count);
        randomCell(food, snake, ...boardSize);
        snake = [
          ...snake,
          [snake[len - 1][0] - adder[0], snake[len - 1][1] - adder[1]],
        ];
      }
      setLoading(false);
    }, refreshTime);

    return () => {
      clearInterval(frame);
      window.removeEventListener("keydown", setDirection);
    };
  }, [start]);

  if (Loading) {
    return (
      <div>
        잠시만 기다려 주세요
        <ReactLoaing type={"bars"} color={"purple"} height={375} width={375} />
      </div>
    );
  } else {
    return (
      <React.Fragment>
        {/* Section card */}
        {sectionCard && (
          <div id="snake_message">
            <div id="snake_card">
              <h3 className="snake_card-heading">Prev Score</h3>
              <h3 className="snake_card-value">
                {prevScore === undefined ? "None" : prevScore}
              </h3>
              <h3 className="snake_card-heading">Score</h3>
              <h3 className="snake_card-value">{score}</h3>
              <div onClick={sendPoint}>점수 등록</div>
              <div
                className="snake_restart button-space"
                onClick={handleRestart}
              ></div>
            </div>
          </div>
        )}
        {/* Display container */}
        <div id="snake_display">
          <div id="snake_score">
            <div id="snake_apple-image"></div>
            <h3>{score}</h3>
          </div>
          <div className="snake_restart" onClick={handleRestart}></div>
        </div>

        {/* Board */}
        <div id="snake_board">
          {board.map((rowValue, rowIndex) => {
            return (
              <div key={rowIndex} className="snake_row">
                {rowValue.map((cellValue, cellIndex) => {
                  return (
                    <div
                      key={cellIndex}
                      className={`snake_cell ${
                        cellValue === 1
                          ? "snake"
                          : cellValue === 2
                          ? "food"
                          : ""
                      }`}
                    ></div>
                  );
                })}
              </div>
            );
          })}
        </div>
        {/* Controller */}
        <div id="snake_controller">
          <div
            id="snake_ArrowLeft"
            className="snake_direction-button"
            onClick={() => setDirection("ArrowLeft")}
          ></div>
          <div
            id="snake_ArrowUp"
            className="snake_direction-button"
            onClick={() => setDirection("ArrowUp")}
          ></div>
          <div
            id="snake_ArrowDown"
            className="snake_direction-button"
            onClick={() => setDirection("ArrowDown")}
          ></div>
          <div
            id="snake_ArrowRight"
            className="snake_direction-button"
            onClick={() => setDirection("ArrowRight")}
          ></div>
        </div>
        {/* Info */}
        <div id="snake_info">
          Controll movement by keyboard or virtual arrrows.
        </div>
      </React.Fragment>
    );
  }
};

export default Board;
