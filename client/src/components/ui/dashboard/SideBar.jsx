import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import EditProfile from "../myModal/EditProfile";
import Badge from "react-bootstrap/Badge";
import ReactLoaing from "react-loading";
import axios from "axios";
import "./slide-bar.css";
import { utils } from "ethers";

import { useDispatch, useSelector } from "react-redux";
import { updateMyBalance } from "../../../redux/actions/index";

const SideBar = () => {
  const [nickname, setNicName] = useState([]);
  const [imageURL, setImageURL] = useState([]);
  const [email, setEmail] = useState([]);
  // const [address, setAddress] = useState("address");
  const [Loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState(null);
  const [AATclaim, setAATclaim] = useState("");

  const networkid = useSelector((state) => state.AppState.networkid);
  const chainid = useSelector((state) => state.AppState.chainid);

  const [balance, setBalance] = useState([]);

  const [claim, setClaim] = useState(1);

  const account = useSelector((state) => state.AppState.account);
  const CreateNFTContract = useSelector(
    (state) => state.AppState.CreateNFTContract
  );
  const TokenClaimContract = useSelector(
    (state) => state.AppState.TokenClaimContract
  );

  const [EditProfileModal, setEditProfileModal] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    getClaim();
  }, []);

  async function checkMyBalance(account) {
    if (TokenClaimContract !== null) {
      const Mybalance = await TokenClaimContract.methods
        .mybalance()
        .call({ from: account });
      console.log(Mybalance);

      return utils.formatUnits(await Mybalance, 18);
    } else {
      return 0;
    }
  }

  const claimToken = async () => {
    await axios
      .post(`http://localhost:5000/ranking`, { claim, account })
      .then((res) => {
        alert("토큰 클레임 완료");
      });
  };

  const getClaim = async () => {
    if (TokenClaimContract !== null) {
      const result = await TokenClaimContract.methods
        .getClaim()
        .call({ from: account });
      return alert(utils.formatUnits(await result, 18));
    } else {
      alert("컨트랙트 로드 실패!!\n네트워크를 확인하세요");
    }
  };
  const mybalance = async () => {
    if (TokenClaimContract !== null) {
      const result = await TokenClaimContract.methods
        .mybalance()
        .call({ from: account });
      return alert(utils.formatUnits(await result, 18));
    } else {
      alert("컨트랙트 로드 실패!!\n네트워크를 확인하세요");
    }
  };
  const gettoken = async () => {
    if (TokenClaimContract !== null) {
      if (chainid === 1337 ? false : networkid === chainid ? false : true)
        return alert("네트워크 아이디를 확인하세요");
      await TokenClaimContract.methods
        .gettoken()
        .send({ from: account, gas: 3000000 })
        .then(async () => {
          await axios
            .post("http://127.0.0.1:5000/ranking/updateclaim", {
              address: account,
            })
            .then(async (res) => {
              if (res.data.message === "ok") {
                console.log("/////////////////");
                dispatch(
                  updateMyBalance({ Mybalance: await checkMyBalance(account) })
                );
              }
            });
        });
    } else {
      alert("컨트랙트 로드 실패!!\n네트워크를 확인하세요");
    }
  };

  useEffect(async () => {
    if (account !== null) {
      await axios
        .post("http://localhost:5000/user/login", {
          address: account,
        })
        .then((res) => {
          setNicName(res.data.nick);
          setEmail(res.data.email);
          setImageURL(res.data.image);
        })
        .catch((err) => {
          console.log(err);
          window.location.href = "/error";
        });

      setLoading(null);
    }
  }, [account]);

  useEffect(async () => {
    await axios
      .post(`http://localhost:5000/ranking/balance`, { address: account })
      .then((response) => {
        const data = response.data;
        const balanceData = data.map((v, i) => {
          return v.balance;
        });
        setBalance(balanceData);
      })
      .catch((error) => {
        setError(error);
        window.location.href = "/error";
      });

    setLoading(null);
  }, []);

  const onSubmit = async () => {
    const nick = document.getElementById("nick__pfp").innerText;
    const email = document.getElementById("email__pfp").innerText;
    await axios
      .post("http://localhost:5000/user/edit", {
        nick: nick,
        email: email,
        address: account,
      })
      .then((res) => {
        if (res.data.message === "ok") {
          console.log(res.data.message);
        } else {
          console.log(res.data.message);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const updatedProfile = { nickname, email };

  if (Loading) {
    return (
      <div>
        잠시만 기다려 주세요
        <ReactLoaing type={"bars"} color={"purple"} height={375} width={375} />
      </div>
    );
  } else {
    return (
      <div className="slide__container">
        <div className="pfpside__box">
          {/* 여기부터 프로필 이미지 수정 */}
          <div
            className="profile__pic"
            onClick={() => setEditProfileModal(true)}
          >
            <img
              className="pfp__iamge"
              src={imageURL}
              id="upload__pfp"
              onChange={(e) => {
                setImageURL(e.target.value);
              }}
              alt="edit"
            />
            <button id="select__pfp" onClick={() => setEditProfileModal(true)}>
              <label className="select__label">
                <i className="ri-gallery-upload-line"></i>
                <span>Change Profile</span>
              </label>
            </button>
          </div>
          {EditProfileModal && (
            <EditProfile
              setShowModal={setEditProfileModal}
              setImageURL={setImageURL}
            />
          )}
          {/* 여기서부터 닉넴 이메일 수정 */}
          <div className="mypfp__Container">
            <div className="nick__pfp" id="nick__pfp">
              {nickname}
            </div>
            <div className="email__pfp" id="email__pfp">
              {email}
            </div>
          </div>

          {visible && (
            <>
              <input
                className="edit__name"
                placeholder="edit your name"
                type="text"
                value={nickname}
                onChange={(e) => {
                  setNicName(e.target.value);
                }}
              />
              <input
                className="edit__email"
                placeholder="edit your email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
              />
              <button className="submit__btn" onClick={() => onSubmit()}>
                Submit
              </button>
            </>
          )}

          <button
            className="visible__btn"
            onClick={() => {
              setVisible(!visible);
            }}
          >
            {visible ? "Exit" : "Edit"}
            {/* Edit */}
          </button>

          <div className="myBest__ranking" content="">
            <div className="my__Badge">
              <p>Total Claim : {AATclaim} AAT</p>
            </div>

            <button className="get__token" onClick={() => mybalance()}>
              My Balance
            </button>
            <button className="get__token" onClick={() => gettoken()}>
              Get Token
            </button>
          </div>
        </div>
        <div className="link__conatainer">
          <div className="nav__itemBox">
            <button className="slide__button">
              <span className="edit__icon">
                <Link to={`/staking`}>
                  <i className="ri-stack-line">
                    <h5>Staking</h5>
                  </i>
                </Link>
              </span>
            </button>

            <button className="slide__button">
              <span className="slide__icon">
                <Link to="/market">
                  <i className="ri-store-2-line">
                    <h5>NFT Market</h5>
                  </i>
                </Link>
              </span>
            </button>
            <button className="slide__button">
              <span className="slide__icon">
                <Link to="/game">
                  <i className="ri-gamepad-line">
                    <h5>Start Game</h5>
                  </i>
                </Link>
              </span>
            </button>
            <p>Having troubles?</p>
            <button className="contact__button">
              <span className="slide__icon">
                <Link to="/contact">
                  <i className="ri-contacts-book-line">
                    <h5>Contact Us</h5>
                  </i>
                </Link>
              </span>
            </button>
          </div>
        </div>
      </div>
    );
  }
};

export default SideBar;
