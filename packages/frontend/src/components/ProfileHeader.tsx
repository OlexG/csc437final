import { useState, useEffect } from "react";

interface ProfileHeaderProps {
  username: string;
  isOwnProfile?: boolean;
}

const ProfileHeader = ({ username, isOwnProfile = false }: ProfileHeaderProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(username);
  const [displayName, setDisplayName] = useState(username);

  // Update state when username prop changes (when navigating between profiles)
  useEffect(() => {
    setDisplayName(username);
    setEditedName(username);
    setIsEditing(false);
  }, [username]);

  const handleEditClick = () => {
    setIsEditing(true);
    setEditedName(displayName);
  };

  const handleSaveClick = () => {
    setDisplayName(editedName);
    setIsEditing(false);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
  };

  return (
    <div className="profile-header">
      <div className="user-info">
        <div className="name-section">
          {isEditing ? (
            <>
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="name-edit-input"
                autoFocus
              />
              <button 
                onClick={handleSaveClick} 
                className="edit-action-btn save"
                aria-label="Save name"
              >
                ✓
              </button>
              <button 
                onClick={handleCancelClick} 
                className="edit-action-btn cancel"
                aria-label="Cancel edit"
              >
                ✕
              </button>
            </>
          ) : (
            <>
              <h2>{displayName}</h2>
              {isOwnProfile && (
                <button 
                  onClick={handleEditClick} 
                  className="edit-name-btn"
                  aria-label="Edit name"
                >
                  <span className="edit-icon">✎ Edit</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader; 