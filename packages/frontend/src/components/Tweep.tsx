import { Link } from "react-router-dom";
import AudioPlayer from "./AudioPlayer";
import { useTweeps } from "../context/TweepsContext";

interface TweepProps {
  id: string;
  username: string;
  duration: string;
  createdAt: string;
  showDelete?: boolean;
}

const Tweep = ({ id, username, duration, createdAt, showDelete = false }: TweepProps) => {
  const { deleteTweep } = useTweeps();

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this tweep?")) {
      const success = await deleteTweep(id);
      if (!success) {
        alert("Failed to delete tweep. Please try again.");
      }
    }
  };

  // Format the created date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="tweep">
      <div className="tweep-user">
        <Link to={`/profile/${username}`}>{username}</Link>
        <span className="tweep-timestamp">{formatDate(createdAt)}</span>
        {showDelete && (
          <button 
            onClick={handleDelete}
            className="delete-tweep-btn"
            aria-label="Delete this tweep"
          >
            <i className="fas fa-trash"></i>
          </button>
        )}
      </div>
      <AudioPlayer duration={duration} tweepId={id} />
    </div>
  );
};

export default Tweep; 