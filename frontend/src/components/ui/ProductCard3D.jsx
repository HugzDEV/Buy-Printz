import React from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle } from 'lucide-react'

const ProductCard3D = ({ 
  title, 
  description, 
  price, 
  image, 
  features = [], 
  link, 
  color = "green",
  className = "" 
}) => {
  // Define color mappings for product categories
  const colorMap = {
    blue: {
      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.9), rgba(37, 99, 235, 0.8))',
      border: '#3b82f6',
      icon: '#3b82f6'
    },
    purple: {
      background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.9), rgba(124, 58, 237, 0.8))',
      border: '#9333ea',
      icon: '#9333ea'
    },
    orange: {
      background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.9), rgba(234, 88, 12, 0.8))',
      border: '#f97316',
      icon: '#f97316'
    },
    yellow: {
      background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.9), rgba(202, 138, 4, 0.8))',
      border: '#eab308',
      icon: '#eab308'
    },
    emerald: {
      background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.9), rgba(5, 150, 105, 0.8))',
      border: '#10b981',
      icon: '#10b981'
    },
    red: {
      background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.9), rgba(220, 38, 38, 0.8))',
      border: '#ef4444',
      icon: '#ef4444'
    },
    green: {
      background: 'linear-gradient(135deg, rgba(0, 215, 85, 0.9), rgba(0, 215, 85, 0.8))',
      border: '#00D755',
      icon: '#00D755'
    }
  }

  const selectedColor = colorMap[color] || colorMap.green

  return (
    <>
      <style jsx>{`
        .parent {
          width: 100%;
          padding: 20px;
          perspective: 1000px;
        }

        .card {
          padding-top: 50px;
          border: 3px solid rgba(255, 255, 255, 0.3);
          transform-style: preserve-3d;
          background: rgba(1, 14, 49, 0.1);
          width: 100%;
          height: 500px;
          box-shadow: rgba(142, 142, 142, 0.3) 0px 30px 30px -10px;
          transition: all 0.5s ease-in-out;
          position: relative;
        }

        .card:hover {
          transform: rotate3d(0.5, 1, 0, 30deg);
        }

        .content-box {
          transition: all 0.5s ease-in-out;
          padding: 60px 25px 25px 25px;
          transform-style: preserve-3d;
          margin-top: 150px;
          height: calc(100% - 150px);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .content-box .card-title {
          display: inline-block;
          color: white;
          font-size: 25px;
          font-weight: 900;
          transition: all 0.5s ease-in-out;
          transform: translate3d(0px, 0px, 50px);
        }

        .content-box .card-title:hover {
          transform: translate3d(0px, 0px, 60px);
        }

        .content-box .card-content {
          margin-top: 10px;
          font-size: 12px;
          font-weight: 700;
          color: #f2f2f2;
          transition: all 0.5s ease-in-out;
          transform: translate3d(0px, 0px, 30px);
        }

        .content-box .card-content:hover {
          transform: translate3d(0px, 0px, 60px);
        }

        .content-box .see-more {
          cursor: pointer;
          margin-top: 1rem;
          display: inline-block;
          font-weight: 900;
          font-size: 9px;
          text-transform: uppercase;
          color: #00D755;
          background: rgba(1, 14, 49, 0.9);
          padding: 0.5rem 0.7rem;
          transition: all 0.5s ease-in-out;
          transform: translate3d(0px, 0px, 20px);
          text-decoration: none;
        }

        .content-box .see-more:hover {
          transform: translate3d(0px, 0px, 60px);
        }

        .price-box {
          position: absolute;
          top: 30px;
          right: 30px;
          height: 60px;
          width: 60px;
          background: rgba(1, 14, 49, 0.9);
          border: 1px solid;
          padding: 10px;
          transform: translate3d(0px, 0px, 80px);
          box-shadow: rgba(100, 100, 111, 0.2) 0px 17px 10px -10px;
        }

        .price-box span {
          display: block;
          text-align: center;
        }

        .price-box .from-text {
          color: var(--price-color, #00D755);
          font-size: 9px;
          font-weight: 700;
        }

        .price-box .price-value {
          font-size: 20px;
          font-weight: 900;
          color: var(--price-color, #00D755);
        }

        .product-image {
          position: absolute;
          top: 0;
          left: 25px;
          right: 25px;
          height: 200px;
          overflow: hidden;
          z-index: 20;
        }

        .product-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

      `}</style>
      
      <div className={`parent ${className}`}>
        <div className="card">
          {/* Product Image */}
          <div className="product-image">
            <img 
              src={image} 
              alt={title}
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop'
              }}
            />
          </div>

          {/* Content Box */}
          <div 
            className="content-box"
            style={{ background: selectedColor.background }}
          >
            <span className="card-title">{title}</span>
            <p className="card-content">{description}</p>
            <Link to={link} className="see-more">See More</Link>
          </div>

          {/* Price Box */}
          <div 
            className="price-box"
            style={{ 
              borderColor: selectedColor.border,
              '--price-color': selectedColor.icon
            }}
          >
            <span className="from-text">FROM</span>
            <span className="price-value">
              {price.replace('From ', '').replace('$', '').split('.')[0]}
            </span>
          </div>
        </div>
      </div>
    </>
  )
}

export default ProductCard3D
