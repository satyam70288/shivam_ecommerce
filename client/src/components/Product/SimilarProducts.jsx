// SimilarProducts.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ProductCard from '../custom/ProductCard';


const SimilarProducts = ({ productId }) => {
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSimilarProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get(
  `${import.meta.env.VITE_API_URL}/similar/${productId}?limit=6`
              
        );

        if (response.data.success) {
          setSimilarProducts(response.data.data || []);
        } else {
          setError(response.data.message);
        }
      } catch (err) {
        console.error("Error fetching similar products:", err);
        setError("Failed to load similar products");
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchSimilarProducts();
    }
  }, [productId]);

  // Loading skeleton
  if (loading) {
    return (
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Similar Products</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 dark:bg-gray-700 h-40 rounded-lg mb-3"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="mt-8 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  // No similar products
  if (similarProducts.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
        Similar Products
      </h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {similarProducts.map(product => (
          <ProductCard key={product._id} {...product} />
        ))}
      </div>
    </div>
  );
};

export default SimilarProducts;