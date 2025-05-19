import { Link } from "react-router-dom";

const AddTweepButton = () => {
  return (
    <Link to="/create-tweep" className="add-tweep-card">
      <div className="plus-icon">
        <i className="fas fa-plus"></i>
      </div>
      <div className="add-text">Create New Tweep</div>
    </Link>
  );
};

export default AddTweepButton; 