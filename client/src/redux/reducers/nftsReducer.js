import { SET_NFTS, SELECTED_NFT } from "../actions";

const initialState = {
    name: null,
    description: null,
    image: null,
};

export default function (state = initialState, action) {
    switch (action.type) {
        case SET_NFTS:
            return {
                ...initialState,
                name: action.payload.name,
                description: action.payload.description,
                image: action.payload.image,
            };
        default:
            return state;
    }
}
<<<<<<< HEAD
<<<<<<< HEAD

<<<<<<< HEAD
// NftReducer.js 수정
=======
// NftReducer.js 수정
>>>>>>> 4ca3e93 (Update NftsReducer.js)
=======
// git commit
>>>>>>> 8d54a32 (nftReducer / upperCase)
=======
// git commit
>>>>>>> 2682a65 (fix name)
