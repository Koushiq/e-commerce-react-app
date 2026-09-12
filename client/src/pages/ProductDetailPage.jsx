import { useCart } from '../context/CartContext';
import { useState, useEffect } from 'react';

export default function ProductDetailPage({ productId, onBack }) {
  const { addToCart, addToWishlist } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!productId) return;
    const fetchProduct = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE || 'http://localhost:5000'}/api/Products/${productId}`);
        if (!res.ok) throw new Error('Failed to fetch product');
        const data = await res.json();
        // Assuming API wraps result in { data: ... } per ApiResponse
        setProduct(data?.data || data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  if (loading) return <div className="p-4">Loading product details…</div>;
  if (error) return <div className="p-4 text-red-600">Error: {error}</div>;
  if (!product) return <div className="p-4">Product not found.</div>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <button
        onClick={onBack}
        className="mb-4 text-blue-600 hover:underline"
      >
        ← Back to Products
      </button>
      <div className="flex flex-col md:flex-row gap-6">
        {product.imageUrl && (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full md:w-1/2 h-auto object-cover rounded"
          />
        )}
        <div className="flex-1">
          <h2 className="text-2xl font-bold mb-2">
            {product.name}
          </h2>
          {product.description && (
            <p className="mb-4 text-gray-700">{product.description}</p>
          )}
          <div className="text-xl font-semibold mb-4">
            ৳ {product.price?.toLocaleString()}
          </div>
          {/* Action buttons */}
          <div className="flex gap-4 mb-4">
            <button
              onClick={() => addToCart(product)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Add to Cart
            </button>
            <button
              onClick={() => addToWishlist(product.id)}
              className="px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-700"
            >
              Add to Wishlist
            </button>
          </div>
          {/* Variants placeholder – will render if API supplies a "variants" array */}
          {Array.isArray(product.variants) && product.variants.length > 0 && (
            <div className="mt-4">
              <h3 className="font-medium mb-2">Available Variants</h3>
              <ul className="list-disc list-inside">
                {product.variants.map((v) => (
                  <li key={v.id}>
                    {v.color && `Color: ${v.color} `}
                    {v.type && `Type: ${v.type} `}
                    {v.size && `Size: ${v.size} `}
                    {v.additionalPrice && `(+ ৳${v.additionalPrice})`}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


