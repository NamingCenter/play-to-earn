import React, { Fragment, useState } from "react";
import { Link, Routes, Route } from "react-router-dom";
import { Col, Container, Row } from "reactstrap";

import "./game.css";
import CommonSection from "../ui/CommonSection";
import Ranking from "./Ranking";
import Compensation from "./Compensation";
import GameCard from "../ui/gamePreview/GameCard";

import { GAMECARD__DATA } from "../../assets/data/gamecard";

function Game() {
  const [showModal, setShowModal] = useState(false);

  return (
    <Fragment>
      <CommonSection title="GAME'S FEATURES" />
      <Container>
        <Row>
          <Col>
            <div className="game__infoBox">
              <button className="ranking__btn">
                <Link to="/ranking">랭킹 확인</Link>
              </button>

              <button
                className="Compensation__btn"
                onClick={() => setShowModal(true)}
              >
                랭킹별 보상리스트
              </button>

              {showModal && <Compensation setShowModal={setShowModal} />}
            </div>
          </Col>
        </Row>
        <Row>
          {/* <Col lg="12" className="mb-5">
          <div className="live__list__top">
            <h3>Play Now</h3>
          </div>
        </Col> */}

          {GAMECARD__DATA.slice(0, 4).map((item, index) => (
            <Col lg="3" md="4" sm="6" key={index} className="mb-4">
              <GameCard key={item.id} item={item} />
            </Col>
          ))}
        </Row>
      </Container>
    </Fragment>
  );
}

export default Game;
