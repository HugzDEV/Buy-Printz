import React from 'react'

const WideFeatureCard3D = ({ 
  title, 
  description, 
  options = [],
  icons = [],
  color = "green",
  className = "" 
}) => {
  // Define color mappings
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
    pink: {
      background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.9), rgba(219, 39, 119, 0.8))',
      border: '#ec4899',
      icon: '#ec4899'
    },
    green: {
      background: 'linear-gradient(135deg, rgba(0, 215, 85, 0.9), rgba(0, 215, 85, 0.8))',
      border: '#00D755',
      icon: '#00D755'
    }
  }

  const selectedColor = colorMap[color] || colorMap.green

  return (
    <div className={`feature-parent ${className}`}>
      <div className="feature-card">
        <div 
          className="feature-content-box"
          style={{ background: selectedColor.background }}
        >
          <span className="feature-card-title">{title}</span>
          <div className="feature-card-content">
            {description && <p>{description}</p>}
            {options.length > 0 && (
              <div className="feature-options">
                {options.map((option, index) => (
                  <div key={index} className="feature-option-item">
                    {option}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        {icons.map((icon, index) => (
          <div 
            key={index}
            className="feature-icon-box"
            style={{ 
              borderColor: selectedColor.border,
              '--icon-color': selectedColor.icon,
              right: `${20 + (index * 45)}px`
            }}
          >
            {icon}
          </div>
        ))}
      </div>
      
      <style jsx>{`
        .feature-parent {
          width: 100%;
          padding: 20px;
          perspective: 1000px;
        }

        .feature-card {
          padding-top: 30px;
          border: 3px solid rgba(255, 255, 255, 0.3);
          transform-style: preserve-3d;
          background: rgba(1, 14, 49, 0.1);
          width: 100%;
          min-height: 250px;
          height: auto;
          box-shadow: rgba(142, 142, 142, 0.3) 0px 30px 30px -10px;
          transition: all 0.5s ease-in-out;
          position: relative;
        }

        @media (min-width: 640px) {
          .feature-card {
            padding-top: 50px;
            min-height: 300px;
          }
        }

        .feature-card:hover {
          transform: rotate3d(0.5, 1, 0, 30deg);
        }

        .feature-content-box {
          transition: all 0.5s ease-in-out;
          padding: 40px 15px 20px 15px;
          transform-style: preserve-3d;
          margin-top: 30px;
          min-height: calc(100% - 30px);
          height: auto;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        @media (min-width: 640px) {
          .feature-content-box {
            padding: 60px 25px 25px 25px;
            margin-top: 50px;
            min-height: calc(100% - 50px);
          }
        }

        .feature-content-box .feature-card-title {
          display: inline-block;
          color: white;
          font-size: 18px;
          font-weight: 900;
          transition: all 0.5s ease-in-out;
          transform: translate3d(0px, 0px, 50px);
        }

        @media (min-width: 640px) {
          .feature-content-box .feature-card-title {
            font-size: 25px;
          }
        }

        .feature-content-box .feature-card-title:hover {
          transform: translate3d(0px, 0px, 60px);
        }

        .feature-content-box .feature-card-content {
          margin-top: 8px;
          font-size: 11px;
          font-weight: 700;
          color: #f2f2f2;
          transition: all 0.5s ease-in-out;
          transform: translate3d(0px, 0px, 30px);
        }

        @media (min-width: 640px) {
          .feature-content-box .feature-card-content {
            margin-top: 10px;
            font-size: 12px;
          }
        }

        .feature-content-box .feature-card-content:hover {
          transform: translate3d(0px, 0px, 60px);
        }

        .feature-options {
          margin-top: 8px;
        }

        .feature-content-box .feature-option-item {
          margin: 3px 0;
          font-size: 10px;
          line-height: 1.3;
        }

        @media (min-width: 640px) {
          .feature-options {
            margin-top: 10px;
          }
          
          .feature-content-box .feature-option-item {
            margin: 4px 0;
            font-size: 12px;
            line-height: 1.4;
          }
        }

        .feature-icon-box {
          position: absolute;
          top: 20px;
          right: 20px;
          height: 50px;
          width: 50px;
          background: rgba(1, 14, 49, 0.9);
          border: 1px solid;
          padding: 8px;
          transform: translate3d(0px, 0px, 80px);
          box-shadow: rgba(100, 100, 111, 0.2) 0px 17px 10px -10px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        @media (min-width: 640px) {
          .feature-icon-box {
            top: 30px;
            right: 30px;
            height: 60px;
            width: 60px;
            padding: 10px;
          }
        }


        .feature-icon-box svg {
          color: var(--icon-color, #00D755);
          width: 20px;
          height: 20px;
        }

        @media (min-width: 640px) {
          .feature-icon-box svg {
            width: 24px;
            height: 24px;
          }
        }

      `}</style>
    </div>
  )
}

export default WideFeatureCard3D
