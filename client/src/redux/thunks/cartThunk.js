import axios from "axios";
import { cartRequest, setCart, cartFailure } from "../slices/cartSlice";

const API = import.meta.env.VITE_API_URL;

/* =====================
   FETCH CART
===================== */
export const fetchCartThunk = (userId) => async (dispatch) => {
  try {
    if (!userId) return;

    dispatch(cartRequest());

    const res = await axios.get(`${API}/cart/${userId}`);
    dispatch(setCart(res.data));
  } catch (err) {
    dispatch(cartFailure(err.message));
  }
};

/* =====================
   ADD TO CART
===================== */
export const addToCartThunk =
  ({ userId, productId, quantity, price, color, size, toast }) =>
  async (dispatch) => {
    try {
      dispatch(cartRequest());

      await axios.post(`${API}/add`, {
        userId,
        productId,
        quantity,
        price,
        color,
        size,
      });

      const res = await axios.get(`${API}/cart/${userId}`);
      dispatch(setCart(res.data));

      toast?.({ title: "Product added to cart" });
    } catch (err) {
      dispatch(cartFailure(err.message));
      toast?.({ title: "Failed to add product" });
    }
  };

/* =====================
   INCREASE QTY
===================== */
export const increaseQtyThunk =
  ({ userId, cartItemId, toast }) =>
  async (dispatch) => {
    try {
      dispatch(cartRequest());

      await axios.post(`${API}/cart/increase`, {
        userId,
        cartItemId,
      });

      const res = await axios.get(`${API}/cart/${userId}`);
      dispatch(setCart(res.data));

      toast?.({ title: "Quantity increased" });
    } catch (err) {
      dispatch(cartFailure(err.message));
    }
  };

/* =====================
   DECREASE QTY
===================== */
export const decreaseQtyThunk =
  ({ userId, cartItemId, toast }) =>
  async (dispatch) => {
    try {
      dispatch(cartRequest());

      await axios.post(`${API}/cart/decrease`, {
        userId,
        cartItemId,
      });

      const res = await axios.get(`${API}/cart/${userId}`);
      dispatch(setCart(res.data));

      toast?.({ title: "Quantity decreased" });
    } catch (err) {
      dispatch(cartFailure(err.message));
    }
  };

/* =====================
   REMOVE ITEM
===================== */
export const removeItemThunk =
  ({ userId, cartItemId, toast }) =>
  async (dispatch) => {
    try {
      dispatch(cartRequest());

      await axios.post(`${API}/cart/remove`, {
        userId,
        cartItemId,
      });

    dispatch(fetchCartThunk(userId));


      toast?.({ title: "Item removed" });
    } catch (err) {
      dispatch(cartFailure(err.message));
    }
  };

