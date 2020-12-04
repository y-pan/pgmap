import { Button } from "@material-ui/core";
import React from "react";

interface Props {
  hasOK?: boolean;
  hasClose?: boolean;
  onOk?: () => void;
  onClose?: () => void;
}

const WithFooter: React.FC<Props> = ({
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
            Close
          </Button>
        )}
        {hasOK && (
          <Button color="primary" onClick={onOk}>
            OK
          </Button>
        )}
      </div>
    </div>
  );
};

export default WithFooter;
