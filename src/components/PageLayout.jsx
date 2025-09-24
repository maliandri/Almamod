// frontend/src/components/PageLayout.jsx
import React from 'react';

const PageLayout = ({ children }) => {
  return (
    <section className="animation-section">
      {children}
    </section>
  );
};

export default PageLayout;