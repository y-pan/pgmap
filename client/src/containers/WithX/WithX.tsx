import React from "react";

interface Props {
  onClick: () => void;
}

const WithX: React.FC<Props> = ({ onClick, children }) => {
  return (
    <div>
      <span className="closeX" onClick={onClick}>
        X
      </span>
      {children}
    </div>
  );
};

export default WithX;
