import type { ReactNode } from "react";

interface TimelineProps {
  children: ReactNode;
}

const Timeline = ({ children }: TimelineProps) => {
  return (
    <div className="timeline">
      <h2 className="visually-hidden">Audio Timeline</h2>
      {children}
    </div>
  );
};

export default Timeline; 