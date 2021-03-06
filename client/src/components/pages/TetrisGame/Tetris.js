import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";

import ReactLoaing from "react-loading";

import { CANVAS_WIDTH, CANVAS_HEIGHT } from "./constants";

import { renderStartBackground } from "./js/Render";
import { Game } from "./js/Game.js";

import Settings from "./Settings";
import "./styles/Tetris.css";
import axios from "axios";
import { useSelector } from "react-redux";

let sirtet;

const Tetris = ({ setShowModal }) => {
  const [customization, setCustomization] = useState({
    colors: 0,
    style: 0,
    level: 0,
    screenShake: true,
    fxVolume: 0.3,
    musicVolume: 0.1,
  });
  const canvasRef = useRef();
  const [gameState, setGameState] = useState({
    // the game has started
    started: false,
    // the game is over
    over: false,
    // the game is paused
    paused: false,
  });
  const [gameStats, setGameStats] = useState({
    score: 0,
    lines: 0,
    level: 0,
    next: null,
  });
  const [gameMuted, setGameMuted] = useState(false);
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [countdownStyle, setCountdownStyle] = useState({ opacity: 1 });
  const [countdownText, setCountdownText] = useState("");
  const [showSettings, setShowSettings] = useState(false);

  const [Loading, setLoading] = useState(true);

  const account = useSelector((state) => state.AppState.account);
  const CreateNFTContract = useSelector(
    (state) => state.AppState.CreateNFTContract
  );
  const [myList, setMyList] = useState([]);
  const [prevScore, setPrevScore] = useState();

  useEffect(() => {
    mynftlists();
    setLoading(false);
  }, [CreateNFTContract]);
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

  useEffect(async () => {
    const tetrisData = await axios.post(
      `http://15.165.17.43:5000/game/tetrisScore`,
      { account: account }
    );
    if (tetrisData.data !== null) {
      if (tetrisData.data.tetrisPoint !== null) {
        setPrevScore(tetrisData.data.tetrisPoint);
      }
    }
    setLoading(false);
  }, [account]);

  useEffect(() => {
    canvasRef.current.width = CANVAS_WIDTH;
    canvasRef.current.height = CANVAS_HEIGHT;
    const ctx = canvasRef.current.getContext("2d");

    // render static background for start screen
    renderStartBackground().then(setBackgroundImage);

    window.gameContext = ctx;

    // create game
    sirtet = new Game(
      canvasRef.current,
      gameStartHandler,
      gameOverHandler,
      gamePauseHandler,
      setGameStats,
      gameCountdownHandler
    );

    sirtet.init();

    // add game event listener
    window.addEventListener("blur", sirtet.pauseGame, false);

    document.body.style.cssText = `
      position: fixed; 
      top: -${window.scrollY}px;
      overflow-y: scroll;
      width: 100%;`;

    setLoading(false);

    return () => {
      window.removeEventListener("blur", sirtet.pauseGame, false);
      const scrollY = document.body.style.top;
      document.body.style.cssText = "";
      window.scrollTo(0, parseInt(scrollY || "0", 10) * -1);
      sirtet.endGame();
    };
  }, []);

  const gameStartHandler = useCallback(() => {
    setGameState({
      started: true,
      over: false,
      paused: false,
    });
  }, []);

  const gameOverHandler = useCallback(() => {
    setGameState({
      started: true,
      over: true,
      paused: false,
    });
  }, []);

  const gamePauseHandler = useCallback((paused) => {
    setGameState({
      started: true,
      over: false,
      paused,
    });
  }, []);

  const muteHandler = useCallback(() => {
    if (!gameMuted) {
      setGameMuted(true);
      sirtet.setMuted(true);
    } else {
      setGameMuted(false);
      sirtet.setMuted(false);
    }
  }, [gameMuted]);

  const startGameHandler = useCallback(() => {
    sirtet.startGame(customization);
    setGameStats({
      score: 0,
      lines: 0,
      level: 0,
      next: null,
    });
  }, [customization]);

  const gameCountdownHandler = useCallback((count) => {
    setCountdownText(count);
    setCountdownStyle({ opacity: 1, transition: "none" });

    setTimeout(() => {
      setCountdownStyle({
        opacity: 0,
        transition: "opacity 1s ease-in-out",
      });
    });
  }, []);

  const resetGameHandler = useCallback(() => {
    setGameState({
      started: false,
      over: false,
      paused: false,
    });
    setGameStats({
      score: 0,
      lines: 0,
      level: 0,
      next: null,
    });
    sirtet.resetGame();
  }, []);

  const showSettingsHandler = () => {
    setShowSettings(true);
  };

  const hideSettingsHandler = () => {
    setShowSettings(false);
  };

  const mainOverlay = useMemo(() => {
    if (gameState.started) return null;

    const overlayStyle = {
      background: backgroundImage ? `url(${backgroundImage.src})` : "unset",
    };

    const overlayClass = `canvas__overlay vignette ${
      backgroundImage ? "animate__animated animate__fadeIn" : ""
    }`;

    if (Loading) {
      return (
        <div>
          잠시만 기다려 주세요
          <ReactLoaing
            type={"bars"}
            color={"purple"}
            height={375}
            width={375}
          />
        </div>
      );
    } else {
      return (
        <div className={overlayClass} style={overlayStyle}>
          {!showSettings ? (
            <>
              <h1 className="display-3">Tetris</h1>
              <button
                className="btn btn-primary mb-3"
                onClick={startGameHandler}
              >
                Play
              </button>
              <button
                className="btn btn-outline-light"
                onClick={showSettingsHandler}
              >
                Settings
              </button>
            </>
          ) : (
            <Settings
              customization={customization}
              setCustomization={setCustomization}
              onHide={hideSettingsHandler}
              onTestSound={sirtet.playTestSound}
            />
          )}
        </div>
      );
    }
  }, [gameState, showSettings, backgroundImage, customization]);

  const gameOverOverlay = useMemo(() => {
    const sendPoint = async () => {
      const data = gameStats.score;

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

      const tetrisData = await axios.post(
        `http://15.165.17.43:5000/game/tetris`,
        {
          data: data * (test() * jest()),
          account: account,
        }
      );

      if (tetrisData.data.bool === true) {
        alert(
          "Score(" +
            data +
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
            data * (test() * jest()) +
            ")점" +
            "\n" +
            tetrisData.data.message
        );
        window.location.href = "/game";
      } else if (tetrisData.data.bool === false) {
        alert(tetrisData.data.message);
      }
    };

    if (!gameState.over) return null;

    return (
      <div className="canvas__overlay bg-overlay animate__animated animate__fadeIn">
        <h1>Game over!</h1>
        <br />
        <button
          className="btn btn-primary btn-lg mb-3"
          onClick={startGameHandler}
        >
          다시 도전
        </button>
        <button className="btn btn-primary btn-lg mb-3" onClick={sendPoint}>
          점수 등록
        </button>
        <button className="btn btn-outline-light" onClick={resetGameHandler}>
          Menu
        </button>
      </div>
    );
  }, [gameState]);

  const pauseOverlay = useMemo(() => {
    if (!gameState.paused || !gameState.started || gameState.over) return null;

    return (
      <div className="canvas__overlay bg-overlay">
        <h1>Paused</h1>
        <br />
        <button className="btn btn-primary btn-lg" onClick={sirtet.resumeGame}>
          Resume
        </button>
      </div>
    );
  }, [gameState]);

  const countdownOverlay = useMemo(() => {
    if (
      !countdownText ||
      !gameState.started ||
      gameState.paused ||
      gameState.over
    )
      return null;

    return (
      <div className="canvas__overlay" style={countdownStyle}>
        <h1 className="display-1">{countdownText}</h1>
      </div>
    );
  }, [countdownStyle, countdownText, gameState]);

  return (
    <>
      <div className="game_modal__wrapper">
        <div className="game_single__modal">
          <span className="game_close__modal">
            <i
              className="ri-close-line"
              onClick={() => setShowModal(false)}
            ></i>
          </span>
          <div className="d-flex justify-content-center no-select">
            <div className="canvas__container">
              <canvas width="360" height="720" ref={canvasRef}></canvas>
              {mainOverlay}
              {gameOverOverlay}
              {pauseOverlay}
              {countdownOverlay}
            </div>
            <div className="ui__group ml-3">
              <div className="border rounded mb-3 p-3">
                <h3 className="m-0">
                  <u>Prev Score</u>
                  <br />
                  {prevScore === undefined ? "None" : prevScore}
                </h3>
              </div>
              <div className="border rounded mb-3 p-3">
                <h3 className="m-0">
                  <u>Score</u>
                  <br />
                  {gameStats.score}
                </h3>
              </div>
              <div className="border rounded mb-3 p-3">
                <h3 className="m-0">
                  <u>Lines</u>
                  <br />
                  {gameStats.lines}
                </h3>
              </div>
              <div className="border rounded mb-3 p-3">
                <h3 className="m-0">
                  <u>Level</u>
                  <br />
                  {gameStats.level}
                </h3>
              </div>
              <div className="border rounded mb-3 p-3">
                <h3 className="m-0">
                  <u>Next</u>
                  <br />
                  <img src={gameStats.next ? gameStats.next.src : undefined} />
                </h3>
              </div>

              <button
                className="btn btn-outline-dark btn-sm"
                onClick={muteHandler}
              >
                {gameMuted ? "unmute" : "mute"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Tetris;
