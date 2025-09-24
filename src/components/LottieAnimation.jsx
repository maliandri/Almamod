import React from 'react';
import Lottie from 'lottie-react';
// Asegurate de que la ruta a tu archivo JSON sea correcta
import buildingAnimation from '../assets/animation_construction.json'; 
const LottieAnimation = () => {
  return <Lottie animationData={buildingAnimation} loop={true} />;
};

export default LottieAnimation;