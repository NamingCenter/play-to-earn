import React, { useEffect, useState } from "react";
import ReactLoaing from "react-loading";
import { Card, Col, Row } from "reactstrap";

import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import NftCard from "../../ui/templete/NftCard";

import axios from "axios";

import { useSelector } from "react-redux";

const OwnerSellList = () => {
    const [nftArray, setnftArray] = useState([]);
    const [Loading, setLoading] = useState(true);

    const Account = useSelector((state) => state.AppState.account);
    const CreateNFTContract = useSelector((state) => state.AppState.CreateNFTContract);

    useEffect(() => {
        ownerselllists([...nftArray].reverse());
        setLoading(null);
    }, [CreateNFTContract]);

    //오너 nft 판매 리스트
    async function ownerselllists() {
        if (CreateNFTContract !== null) {
            const lists = await CreateNFTContract.methods.OwnerSelllists().call({ from: "0xC7E1F2dca144AEDA8ADF4f9093da9aAC18ce7436" }, (error) => {
                if (!error) {
                    console.log("send ok");
                } else {
                    console.log(error);
                }
            });
            const result = await Promise.all(
                lists.map(async (i) => {
                    const tokenURI = await CreateNFTContract.methods.tokenURI(i.tokenId).call({ from: Account });
                    const meta = await axios.get(tokenURI).then((res) => res.data);
                    let item = {
                        fileUrl: await meta.image,
                        formInput: {
                            price: await meta.price,
                            name: await meta.name,
                            description: await meta.description,
                        },
                    };
                    return item;
                })
            );

            setnftArray(result);
        }
    }

    const settings = {
        draggable: true,
        accessibility: true,
        centerMode: false,
        variableWidth: true,
        slidesToShow: 1,
        arrows: true,
        dots: true,
        swipeToSlide: true,
        infinite: false,
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
            <div>
                {/* <button onClick={() => mynftlists()}>마이리스트</button> */}
                <div className="slick-arrow">
                    <Slider {...settings} style={{ width: 1200 }}>
                        {nftArray.map((items, index) => {
                            return (
                                // <motion.div key={index} className="my-items">
                                <Col key={index} className="my-items">
                                    <NftCard
                                        item={items}
                                        id={items.formInput.tokenid}
                                        onClick={async (e) => {
                                            let tokenid = e.target.getAttribute("id");
                                            await CreateNFTContract.methods.tokenURI(tokenid).call({
                                                from: Account,
                                            });
                                        }}
                                    ></NftCard>
                                </Col>
                            );
                        })}
                    </Slider>
                </div>
            </div>
        );
    }
};

export default OwnerSellList;