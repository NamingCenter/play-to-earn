import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import ReactLoaing from "react-loading";
import "./sell-modal.css";

const SellModal = (props) => {
  const [Loading, setLoading] = useState(true);
  const Account = useSelector((state) => state.AppState.account);
  const CreateNFTContract = useSelector(
    (state) => state.AppState.CreateNFTContract
  );

  const [form, setForm] = useState({
    price: props.item.formInput.price,
  });
  console.log(form.bid);

  useEffect(async () => {
    setLoading(null);
  }, [CreateNFTContract]);

  //nft 판매
  async function sellnft(tokenId, price) {
    if (CreateNFTContract.methods === null) {
      setLoading(true);
    } else {
      await CreateNFTContract.methods
        .sellMyNFTItem(tokenId, price)
        .send({ from: Account, gas: 3000000, value: price }, (error) => {
          if (!error) {
            console.log("send ok");
          } else {
            console.log(error);
          }
        });
      window.location.reload();
      setLoading(false);
    }
  }
  console.log(props.item.formInput.tokenId);
  console.log(form);

  if (Loading) {
    return (
      <div>
        잠시만 기다려 주세요
        <ReactLoaing type={"bars"} color={"purple"} height={375} width={375} />
      </div>
    );
  } else {
    return (
      <div className="modal2__wrapper">
        <div className="single2__modal">
          <span className="close__modal">
            <i
              className="ri-close-line"
              onClick={() => props.setShowModal(false)}
            ></i>
          </span>
          <h4 className="text-center text-light">Current price</h4>

          <div className="buy__nfts">
            <div className="must__bid">
              <p>You must bid at least</p>
              <span className="money"> {props.item.formInput.price} ETH</span>
            </div>

            <div className="must__bid">
              <div className="input__item mb-4">
                <input
                  type="number"
                  placeholder="00 . 00 ETH"
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                />
              </div>
            </div>

            <div className="must__bid">
              <p>Total Bid Amount</p>
              <span className="money">{form.price} ETH</span>
            </div>
          </div>
          <button
            className="place__bid-btn"
            onClick={async () => {
              await sellnft(props.item.formInput.tokenId, form.price);
            }}
          >
            Sell Now
          </button>
        </div>
      </div>
    );
  }
};

export default SellModal;
