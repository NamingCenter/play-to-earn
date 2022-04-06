import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import EditProfile from "../myModal/EditProfile";
import ReactLoaing from "react-loading";
import Badge from "react-bootstrap/Badge";

import axios from "axios";

import "./slide-bar.css";
import { useSelector } from "react-redux";

const SideBar = () => {
  const [nickname, setNicName] = useState([]);
  const [imageURL, setImageURL] = useState([]);
  const [email, setEmail] = useState([]);
  const [Loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState(null);

  const [balance, setBalance] = useState([]);

  const [claim, setClaim] = useState(1);

  const account = useSelector((state) => state.AppState.account);
  const CreateNFTContract = useSelector(
    (state) => state.AppState.CreateNFTContract
  );

  const [EditProfileModal, setEditProfileModal] = useState(false);
  console.log("Balance", balance);

  const claimToken = async () => {
    await axios
      .post(`http://localhost:5000/ranking`, { claim, account })
      .then((res) => {
        console.log(res.data);
        alert("토큰 클레임 완료");
      });
  };

  useEffect(() => {
    if (account !== null) {
      console.log("실행");

      axios
        .post("http://localhost:5000/user/login", {
          address: account,
        })
        .then((res) => {
          console.log(res.data.nick);
          setNicName(res.data.nick);
          setEmail(res.data.email);
          setImageURL(res.data.image);
        })
        .catch((err) => {
          console.log(err);
        });

      setLoading(null);
    }
  }, [account]);

  useEffect(() => {
    axios
      .post(`http://localhost:5000/ranking/balance`, { address: account })
      .then((response) => {
        const data = response.data;
        console.log(data);
        const balanceData = data.map((v, i) => {
          return v.balance;
        });
        setBalance(balanceData);
      })
      .catch((error) => {
        setError(error);
      });

    setLoading(null);
  }, [account]);

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
          </button>

          <div className="myBest__ranking" content="">
            <Badge pill bg="dark" text="dark" className="my__Badge">
              <p>Claimable Token</p>
              {balance.length === 0
                ? "Counting Token"
                : balance
                    .filter((v, i) => {
                      return i < 1;
                    })
                    .map((v, i) => {
                      let sum = 0;
                      for (let i = 0; i < balance.length; i++) {
                        sum += balance[i];
                      }
                      return <div key={i}>{sum}</div>;
                    })}
            </Badge>
            <button className="get__token" onClick={claimToken}>
              Claim Token
            </button>
          </div>
        </div>
        <div className="link__conatainer">
          <div className="nav__itemBox">
            <button className="slide__button">
              <span className="edit__icon">
                <i className="ri-edit-2-line">
                  <h5>Edit Profile</h5>
                </i>
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
