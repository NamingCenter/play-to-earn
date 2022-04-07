import { Fragment, useEffect, useState } from "react";
import { Col, Container, Row } from "reactstrap";
import CommonSection from "../../ui/templete/CommonSection";
import "./ranking.css";
import axios from "axios";
import { useSelector } from "react-redux";
import Clock from "./Clock";
import Slider from "react-slick";

import { FaArrowRight, FaArrowLeft } from "react-icons/fa";

const Ranking = () => {
  const [loading, setLoading] = useState(true);
  const [toggleState, setToggleState] = useState(1);
  const account = useSelector((state) => state.AppState.account);

  const [timerDays, setTimerDays] = useState();
  const [timerHours, setTimerHours] = useState();
  const [timerMinutes, setTimerMinutes] = useState();
  const [timerSeconds, setTimerSeconds] = useState();

  const [isStop, setIsStop] = useState(false);

  useEffect(async () => {
    const countdownDate = await axios.get(`http://localhost:5000/user/time`);

    let interval = setInterval(() => {
      // var weeks = new Date(now.getDate() + 7);

      const now = new Date().getTime();
      const distance = 604800000 + parseInt(countdownDate.data.count) - now;
      // console.log(typeof now);
      // console.log(countdownDate.data.count);
      // console.log(distance);

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      if (!isStop) {
        // update timer
        setTimerDays(days);
        setTimerHours(hours);
        setTimerMinutes(minutes);
        setTimerSeconds(seconds);
      } else {
        clearInterval(interval);
      }
    }, 1000);
    return () => {
      setIsStop(true);
    };
  }, []);

  const toggleTab = (index) => {
    setToggleState(index);
  };

  const [rankingDB, setRankingDB] = useState(null);
  const [weekly, setWeekly] = useState(null);
  const [error, setError] = useState(null);
  console.log(rankingDB);

  useEffect(() => {
    if (account !== null) {
      axios
        .post(`http://localhost:5000/game/ranking`, { address: account })
        .then((response) => {
          const data = response.data;
          setRankingDB(data);
        })
        .catch((error) => {
          setError(error);
        });
    }
    setLoading(false);
  }, [account]);

  useEffect(() => {
    axios
      .post(`http://localhost:5000/game/weekly`)
      .then((response) => {
        const data = response.data;
        console.log(data);
        setWeekly(data);
      })
      .catch((error) => {
        setError(error);
      });
  }, []);

  function RankingListForm(form) {
    const result = [];
    for (let i = 0; i < 3; i++) {
      if (form[i] === undefined) {
        // console.log("위쪽");
        result.push(
          <Fragment key={i}>
            <p>{i + 1}등 : 바로당신의 자리 </p>
          </Fragment>
        );
      } else {
        // console.log("아래쪽");
        result.push(
          <Fragment key={i}>
            <p>
              {i + 1}등 : {form[i].nick}
            </p>
          </Fragment>
        );
      }
    }
    return result;
  }

  return (
    <>
      <CommonSection title="Ranking" />
      {loading ? (
        <strong> loading... </strong>
      ) : (
        <div className="Ranking__container">
          <Row>
            <Col lg="8" md="6" sm="6">
              <div className="bloc-tabs">
                <button
                  className={toggleState === 1 ? "tabs active-tabs" : "tabs"}
                  onClick={() => toggleTab(1)}
                >
                  Overall Ranking
                </button>
                <button
                  className={toggleState === 2 ? "tabs active-tabs" : "tabs"}
                  onClick={() => toggleTab(2)}
                >
                  Weekly Ranking
                </button>
                <button
                  className={toggleState === 3 ? "tabs active-tabs" : "tabs"}
                  onClick={() => toggleTab(3)}
                >
                  My Ranking
                </button>
              </div>

              <div className="content-tabs">
                <div
                  className={
                    toggleState === 1 ? "content  active-content" : "content"
                  }
                >
                  <h2>Overall Ranking</h2>
                  <hr />
                  <Container className="my__rank">
                    <div className="ranking__box">
                      <ul>
                        <li>SnakeGame</li>
                        <br />
                        {rankingDB !== null
                          ? RankingListForm(rankingDB.snakeranker)
                          : false}
                        <br />
                        <li>TetrisGame</li>
                        <br />
                        {rankingDB !== null
                          ? RankingListForm(rankingDB.tetrisranker)
                          : false}
                        <br />
                        <li>2048Game</li>
                        <br />
                        {rankingDB !== null
                          ? RankingListForm(rankingDB.puzzleranker)
                          : false}
                        <br />
                        <li>MineGame</li>
                        <br />
                        {rankingDB !== null
                          ? RankingListForm(rankingDB.mineranker)
                          : false}
                      </ul>
                    </div>
                  </Container>
                </div>

                <div
                  className={
                    toggleState === 2 ? "content  active-content" : "content"
                  }
                >
                  <h2>Weekly Ranking</h2>
                  <hr />
                  <Container>
                    <div className="ranking__box">
                      여기에 주간랭킹 순위표만들기
                    </div>
                  </Container>
                </div>

                <div
                  className={
                    toggleState === 3 ? "content  active-content" : "content"
                  }
                >
                  <h2>My Ranking</h2>
                  <hr />
                  <Container className="my__rank">
                    <ul>
                      <li>SnakeGame</li>
                      <br />
                      <p>
                        {rankingDB !== null
                          ? rankingDB.snakeMyRanking === 0
                            ? "순위없음"
                            : rankingDB.snakeMyRanking + " 등"
                          : false}
                      </p>
                      <br />
                      <li>2048Game</li>
                      <br />
                      <p>
                        {rankingDB !== null
                          ? rankingDB.puzzleMyRanking === 0
                            ? "순위없음"
                            : rankingDB.puzzleMyRanking + " 등"
                          : false}
                      </p>
                      <br />
                      <li>TetrisGame</li>
                      <br />
                      <p>
                        {rankingDB !== null
                          ? rankingDB.tetrisMyRanking === 0
                            ? "순위없음"
                            : rankingDB.tetrisMyRanking + " 등"
                          : false}
                      </p>
                      <br />
                      <li>MineGame</li>
                      <br />
                      <p>
                        {rankingDB !== null
                          ? rankingDB.mineMyRanking === 0
                            ? "순위없음"
                            : rankingDB.mineMyRanking + " 등"
                          : false}
                      </p>
                    </ul>
                  </Container>
                </div>
              </div>
            </Col>
            <Col className="time__limit" lg="4" md="3" sm="3">
              <h4>Time Limit</h4>
              <Clock
                className="clock__box"
                timerDays={timerDays}
                timerHours={timerHours}
                timerMinutes={timerMinutes}
                timerSeconds={timerSeconds}
              />
            </Col>
          </Row>
        </div>
      )}
    </>
  );
};

export default Ranking;