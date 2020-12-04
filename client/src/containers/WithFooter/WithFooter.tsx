import { Button } from "@material-ui/core";
import React from "react";

interface Props {
  okText?: string;
  closeText?: string;
  hasOK?: boolean;
  hasClose?: boolean;
  onOk?: () => void;
  onClose?: () => void;
}

const WithFooter: React.FC<Props> = ({
  okText = "OK",
  closeText = "Close",
  hasOK,
  hasClose,
  onOk,
  onClose,
  children,
}) => {
  return (
    <div>
      {children}
      <div className="footer-box">
        {hasClose && (
          <Button color="secondary" onClick={onClose}>
            {closeText}
          </Button>
        )}
        {hasOK && (
          <Button color="primary" onClick={onOk}>
            {okText}
          </Button>
        )}
      </div>
    </div>
  );
};

export default WithFooter;
