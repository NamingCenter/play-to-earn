import React, { useEffect, useState } from "react";
import { Col, Container, Row } from "reactstrap";
import user__bg from "../../../assets/images/user_bg.png";

import ReactLoaing from "react-loading";

import "./evo-profile.css";

import axios from "axios";
import { useSelector } from "react-redux";

import "./evo-profile.css";

const EvoProfile = (props) => {
    const [seletedImg, setSelectedImg] = useState(null);
    const [seletedNFT, setSeletedNFT] = useState(null);
    const [selectIndex, setSelectIndex] = useState(null);
    const [selectTokenId, setSelectTokenId] = useState(null);
    const [profileImage, setprofileImage] = useState("");

    const [nftArray, setnftArray] = useState([]);
    const [Loading, setLoading] = useState(true);

    const Account = useSelector((state) => state.AppState.account);
    const CreateNFTContract = useSelector((state) => state.AppState.CreateNFTContract);

    useEffect(() => {
        try {
            mynftlists();
            setLoading(false);
        } catch (error) {
            console.log(error);
            window.location.href = "/error";
        }
    }, []);

    //내 nft 리스트
    async function mynftlists() {
        if ((await CreateNFTContract) === null) {
            setLoading(true);
        } else {
            const lists = await CreateNFTContract.methods.MyNFTlists().call({ from: Account }, (error) => {
                if (!error) {
                    console.log("send ok");
                } else {
                    console.log(error);
                }
            });

            const result = await Promise.all(
                await lists.map(async (i) => {
                    const tokenURI = await CreateNFTContract.methods.tokenURI(i.tokenId).call({ from: Account });
                    const meta = await axios.get(tokenURI).then((res) => res.data);
                    let item = {
                        fileUrl: await meta.image,
                        formInput: {
                            tokenid: i.tokenId,
                            price: i.price,
                            rare: i.rare,
                            star: i.star,
                            sell: i.sell,
                            name: await meta.name,
                            description: await meta.description,
                        },
                    };
                    return item;
                })
            );
            setnftArray(result);
            setSelectedImg(result[0].fileUrl);
        }
    }

    const onSelect = async () => {
        if (seletedNFT !== null) {
            if (window.confirm("해당 NFT로 진행하시겠습니까?")) {
                props.setBeforeEvo(seletedNFT);
                props.setNFTIndex(selectIndex);
                props.setNFTId(selectTokenId);
                props.setShowModal(false);
            }
        } else {
            alert("진화를 원하는 NFT를 선택하세요");
        }
    };

    if (Loading) {
        return (
            <div>
                잠시만 기다려 주세요
                <ReactLoaing type={"bars"} color={"purple"} height={375} width={375} />
            </div>
        );
    } else {
        return (
            <div className="nft_wrapper">
                <div className="mySingle_modal">
                    <span className="close_modal">
                        <i
                            className="ri-close-line"
                            onClick={() => {
                                props.setShowModal(false);
                                props.setVisible(false);
                            }}
                        ></i>
                    </span>
                    <h5 className="text-center text-light">Change your NFT</h5>
                    <br />
                    {/* <p className="text-center text-light">Buy. Sell. Collect.</p> */}

                    <div className="box__myNft">
                        <div className="mynft__list">
                            <Container className="images__box">
                                <Row>
                                    {/* */}
                                    {/* <NftCard item={item} /> */}

                                    <img src={seletedImg} alt="Selected" className="selected" />

                                    <div className="img__Container">
                                        {nftArray.map((image, index) => (
                                            <Col lg="2" md="4" sm="2" key={index}>
                                                <img
                                                    src={image.fileUrl}
                                                    alt="nfts"
                                                    onClick={() => {
                                                        setSeletedNFT(image);
                                                        setSelectIndex(index);
                                                        setSelectTokenId(image.formInput.tokenid);
                                                        setSelectedImg(image.fileUrl);
                                                    }}
                                                    style={{
                                                        border: seletedImg === image.fileUrl ? "5px solid #5142fc" : "",
                                                    }}
                                                />
                                            </Col>
                                        ))}
                                    </div>
                                </Row>
                                <button
                                    className="selected__btn"
                                    onClick={async () => {
                                        await onSelect();
                                    }}
                                >
                                    Selected
                                </button>
                            </Container>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
};

export default EvoProfile;
