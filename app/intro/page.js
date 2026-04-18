"use client";

import "./intro.css";

export default function IntroPage() {
  const moneyPositions = [44, 48, 50, 46, 52, 47, 49, 45, 51, 53, 46, 50, 48, 52, 47];

  return (
    <div className="intro-container">
      <h1 className="title">Save together with your bastie.</h1>
      <p className="subtitle">Your money starts small and grows over time</p>

      <div className="piggy-wrap">
        <div className="slot"></div>

        {moneyPositions.map((pos, i) => (
          <div
            key={i}
            className="money drop"
            style={{
              left: `${pos}%`,
              animationDelay: `${i * 0.25}s`,
            }}
          >
            💰
          </div>
        ))}

        <div className="piggy">
          <div className="ear ear-left"></div>
          <div className="ear ear-right"></div>
          <div className="eye"></div>
          <div className="snout">
            <span></span>
            <span></span>
          </div>
          <div className="leg leg-1"></div>
          <div className="leg leg-2"></div>
          <div className="leg leg-3"></div>
          <div className="leg leg-4"></div>
          <div className="tail"></div>
          <div className="piggy-shine"></div>
        </div>
      </div>
    </div>
  );
}