import React from "react";

interface Props {
  onClick: () => void;
}

const WithX: React.FC<Props> = ({ onClick, children }) => {
  return (
    <div style={{ width: "100%", height: "100%" }}>
      <span
        style={{
          float: "right",
          padding: 5,
          cursor: "pointer",
          fontWeight: "bold",
          color: "grey",
        }}
        onClick={onClick}
      >
        X
      </span>
      {children}
    </div>
  );
};

export default WithX;
