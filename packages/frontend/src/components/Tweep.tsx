import { Link } from "react-router-dom";
import AudioPlayer from "./AudioPlayer";

interface TweepProps {
  username: string;
  duration: string;
}

const Tweep = ({ username, duration }: TweepProps) => {
  return (
    <div className="tweep">
      <div className="tweep-user">
        <Link to={`/profile/${username}`}>{username}</Link>
      </div>
      <AudioPlayer duration={duration} />
    </div>
  );
};

export default Tweep; 