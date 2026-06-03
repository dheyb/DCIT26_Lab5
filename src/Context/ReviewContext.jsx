import { createContext, useContext, useEffect, useState } from "react";
import api from "../config/api";

const REVIEWS_KEY = "takipsilim_reviews";
const ReviewContext = createContext(null);

export const ReviewProvider = ({ children }) => {
  const [reviews, setReviews] = useState({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(REVIEWS_KEY);
      if (raw) setReviews(JSON.parse(raw));
    } catch {}
  }, []);

  const addReview = async (itemId, review) => {
    try {
      await api.post("/reviews", {
        itemId:  itemId,
        rating:  review.rating,
        comment: review.comment,
      });
    } catch {}
    setReviews((prev) => {
      const existing = prev[itemId] ?? [];
      const updated = { ...prev, [itemId]: [review, ...existing] };
      localStorage.setItem(REVIEWS_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const loadItemReviews = async (itemId) => {
    try {
      const res = await api.get(`/reviews/item/${itemId}`);
      const apiReviews = res.data.map(r => ({
        username: r.username,
        rating:   r.rating,
        comment:  r.comment,
        date:     new Date(r.date).toLocaleDateString(),
      }));
      setReviews(prev => {
        const updated = { ...prev, [itemId]: apiReviews };
        localStorage.setItem(REVIEWS_KEY, JSON.stringify(updated));
        return updated;
      });
    } catch {}
  };

  const getItemReviews = (itemId) => reviews[itemId] ?? [];

  const getItemAvgRating = (itemId) => {
    const list = reviews[itemId];
    if (!list || list.length === 0) return 0;
    return list.reduce((sum, r) => sum + r.rating, 0) / list.length;
  };

  return (
    <ReviewContext.Provider value={{ reviews, addReview, loadItemReviews, getItemReviews, getItemAvgRating }}>
      {children}
    </ReviewContext.Provider>
  );
};

export const useReviews = () => {
  const ctx = useContext(ReviewContext);
  if (!ctx) throw new Error("useReviews must be used within ReviewProvider");
  return ctx;
};
