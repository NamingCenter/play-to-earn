import React, { useEffect, useState } from "react";
import { Col, Container, Row } from "reactstrap";
import ReactLoaing from "react-loading";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";

import AdminInfo from "./AdminInfo";
import Accept from "./Accept";
import OwnerSellList from "./OwnerSellList";

import "./admin.css";
import { Link } from "react-router-dom";
import Error404 from "../../ui/templete/Error404";
import { setTimer } from "../../../redux/actions/index";

const Admin = () => {
  const [Loading, setLoading] = useState(true);
  const [error, setError] = useState("/404-not-found");

  const account = useSelector((state) => state.AppState.account);
  const networkid = useSelector((state) => state.AppState.networkid);
  const chainid = useSelector((state) => state.AppState.chainid);
  const AmusementArcadeTokenContract = useSelector(
    (state) => state.AppState.AmusementArcadeTokenContract
  );
  const TokenClaimContract = useSelector(
    (state) => state.AppState.TokenClaimContract
  );

  const [rankingDB, setRankingDB] = useState(null);
  const dispatch = useDispatch();

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
          window.location.href = "/error";
        });
    }
    setLoading(false);
  }, [account]);

  const sendRank = async () => {
    if (chainid === 1337 ? false : networkid === chainid ? false : true)
      return alert("네트워크 아이디를 확인하세요");
    const arry = ["mineranker", "snakeranker", "puzzleranker", "tetrisranker"];
    let temp = [];
    for (let i = 0; i < arry.length; i++) {
      if (rankingDB[arry[i]].length !== 0) {
        for (let k = 0; k < rankingDB[arry[i]].length; k++) {
          temp.push(rankingDB[arry[i]][k].address);
        }
      }
    }
    await axios
      .post(`http://localhost:5000/ranking`, {
        rankingDB: rankingDB,
        address: temp,
        owner: account,
      })
      .then(async (res) => {
        if (res.data.message === "ok") {
          const arry = await res.data.totalclaim;
          const timer = await res.data.count;
          const result = arry.reduce((sum, element) => {
            return sum + element.balance;
          }, 0);
          const contractbalance = await TokenClaimContract.methods
            .contractbalance()
            .call();
          const sendamount =
            parseInt(result) * (10 ^ 18) - parseInt(contractbalance);

          const claimAddress = await TokenClaimContract.options.address;
          await AmusementArcadeTokenContract.methods
            .transfer(claimAddress, sendamount)
            .send({ from: account, gas: 3000000 })
            .then(() => {
              dispatch(setTimer({ timer: parseInt(timer) }));
              alert("DB 전송 완료");
              window.location.reload();
            });
        } else {
          alert("아직 미승인된 유저가 있습니다.");
        }
      });
  };

  if (Loading) {
    return (
      <div>
        잠시만 기다려 주세요
        <ReactLoaing type={"bars"} color={"purple"} height={600} width={375} />
      </div>
    );
  } else {
    return (
      <React.Fragment>
        <Container
          style={{
            display: "flex",
            height: " 120vh",
            background:
              "linear-gradient(to bottom right, white 0%, # e6e4ff 70%)",
            borderRadius: "2rem",
            marginBottom: "10px",
          }}
        >
          <div className="admin__dash">
            <div className="sub__container2">
              <div className="section1__one">
                <Col xs="4">
                  <AdminInfo />
                  <div className="btn__admin">
                    <button
                      className="sendRank__btn"
                      type="button"
                      onClick={() => sendRank()}
                    >
                      Send Ranking
                    </button>
                    <button className="staking__btn" type="button">
                      <i className="ri-shield-keyhole-line"></i>
                      <Link to={"/aatadmin"}>&nbsp;AAT Staking</Link>
                    </button>
                  </div>
                </Col>
                <Col xs="8">
                  <Accept />
                </Col>
              </div>
              <Row>
                <div className="section2__two">
                  <Col>
                    <h5>Naming Center's All Nfts</h5>
                    <OwnerSellList />
                  </Col>
                </div>
              </Row>
            </div>
          </div>
        </Container>
      </React.Fragment>
    );
  }
};

export default Admin;
