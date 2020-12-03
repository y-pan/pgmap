import React from "react";

const isEscEvent = (event) => {
  return event.key === "Escape" || event.code === "Escape";
};

interface Props {
  onEsc: () => void;
  children?: any;
}

const EscAware = React.forwardRef<any, Props>(({ onEsc, children }, ref) => {
  return (
    <div
      ref={ref}
      onKeyDown={(event) => {
        if (isEscEvent(event)) {
          event.stopPropagation();
          event.preventDefault();
          onEsc();
        }
      }}
      tabIndex={0}
    >
      {children}
    </div>
  );
});

export default EscAware;
