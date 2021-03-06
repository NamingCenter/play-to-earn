import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import "./modal.css";
import axios from "axios";
import { useParams } from "react-router-dom";
import { utils } from "ethers";
import { updateMyLists, updateSellLists } from "../../../redux/actions";

import { css } from "@emotion/react";
import FadeLoader from "react-spinners/FadeLoader";

const Modal = (props) => {
  useEffect(() => {
    document.body.style.cssText = `
      position: fixed; 
      top: -${window.scrollY}px;
      overflow-y: scroll;
      width: 100%;`;
    return () => {
      const scrollY = document.body.style.top;
      document.body.style.cssText = "";
      window.scrollTo(0, parseInt(scrollY || "0", 10) * -1);
    };
  }, []);

  const dispatch = useDispatch();
  let params = useParams();

  const account = useSelector((state) => state.AppState.account);

  const CreateNFTContract = useSelector(
    (state) => state.AppState.CreateNFTContract
  );
  const UtilsContract = useSelector((state) => state.AppState.UtilsContract);
  const Selllists = useSelector((state) => state.AppState.Selllists);
  const MyNFTlists = useSelector((state) => state.AppState.MyNFTlists);
  const AmusementArcadeTokenContract = useSelector(
    (state) => state.AppState.AmusementArcadeTokenContract
  );
  const networkid = useSelector((state) => state.AppState.networkid);
  const chainid = useSelector((state) => state.AppState.chainid);

  const override = css`
    display: block;
    margin: 0 auto;
    border-color: #5900ff;
    width: 100%;
    height: 100%;
    background: #34343465;
  `;

  const [Loading, setLoading] = useState(false);
  function sleep(ms) {
    const wakeUpTime = Date.now() + ms;
    while (Date.now() < wakeUpTime) {}
  }
  useEffect(async () => {
    console.log(props);
    setLoading(false);
  }, [CreateNFTContract]);
  // utils.formatUnits(price, 18)
  //nft 구매

  async function buynft(tokenId, price) {
    props.setShowModal(false);
    if (AmusementArcadeTokenContract === null) {
      alert("컨트렉트 호출 실패 네트워크를 확인하세요");
    } else {
      if (chainid === 1337 ? false : networkid === chainid ? false : true)
        return alert("네트워크 아이디를 확인하세요");
      props.setLoading(true);
      await AmusementArcadeTokenContract.methods
        .approve(
          UtilsContract.options.address,
          utils.parseEther(price.toString())
        )
        .send({ from: account, gas: 3000000 })
        .then(async () => {
          await UtilsContract.methods
            .GetNFTItem(parseInt(tokenId), utils.parseEther(price.toString()))
            .send(
              {
                from: account,
                gas: 3000000,
              },
              (error) => {
                if (!error) {
                  console.log("send ok");
                } else {
                  //sleep(2000);
                  props.setLoading(false);
                  console.log(error);
                }
              }
            )
            .then(async (res) => {
              await axios
                .post(`http://15.165.17.43:5000/history`, {
                  tokenId: res.events.GetNFTResult.returnValues.tokenId,
                  from: res.events.GetNFTResult.returnValues.from,
                  to: res.events.GetNFTResult.returnValues.to,
                })
                .then(async (res) => {
                  console.log(res.data.message);
                  if (res.data.message === "ok") {
                    console.log(res.data.message);
                    const findIndex = await Selllists.findIndex((lists) => {
                      console.log(parseInt(tokenId));
                      console.log(parseInt(lists.formInput.tokenid));
                      if (
                        parseInt(tokenId) === parseInt(lists.formInput.tokenid)
                      ) {
                        return true;
                      }
                    });
                    dispatch(
                      updateSellLists({
                        Selllists: Selllists,
                      })
                    );
                    dispatch(
                      updateMyLists({
                        MyNFTlists: [
                          ...MyNFTlists,
                          Selllists.splice(findIndex, 1),
                        ],
                      })
                    );
                    //sleep(2000);
                    props.setLoading(false);
                  } else {
                    //sleep(2000);
                    props.setLoading(false);
                    console.log(res.data.message);
                  }
                });
            });
        })
        .catch(() => {
          //sleep(2000);
          props.setLoading(false);
        });
    }
  }

  return (
    <div className="modal__wrapper">
      {Loading ? (
        <div
          className={Loading ? "parentDisable" : ""}
          width="100%"
          height="100%"
        >
          <div className="overlay-box">
            <FadeLoader
              size={150}
              color={"#ffffff"}
              css={override}
              loading={Loading}
              z-index={"-9999"}
              text="Loading your content..."
            />
          </div>
        </div>
      ) : (
        false
      )}
      <div className="single__modal">
        <span className="close__modal">
          <i
            className="ri-close-line"
            onClick={() => props.setShowModal(false)}
          ></i>
        </span>
        <h4 className="text-center text-light">Current price</h4>

        <div className="buy__nfts">
          <div className="must__bid">
            <p>Top bid</p>
            <span className="money"> {props.item.formInput.price} AAT</span>
          </div>
          <h5 className="text-center text-light">
            현재 작업은 토큰전송과 함께 가스비가 발생합니다. 진행하시겠습니까?
          </h5>
          {/* 
            <div className="must__bid">
              <p>Sale ends</p>
              <span className="money">April 22, 2022 at 2:44am</span>
            </div>

            <div className="must__bid">
              <p>Total Bid Amount</p>
              <span className="money">{props.item.formInput.price} AAT</span>
            </div> */}
        </div>
        <button
          className="place__bid-btn"
          onClick={async () => {
            console.log(props);
            await buynft(
              props.item.formInput.tokenid,
              props.item.formInput.price
            );
          }}
        >
          Buy now
        </button>
      </div>
    </div>
  );
};

export default Modal;
