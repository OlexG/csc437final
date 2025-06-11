interface ProfileHeaderProps {
  username: string;
  isOwnProfile?: boolean;
  isEditing?: boolean;
  onEdit?: () => void;
  onSave?: () => void;
  onCancel?: () => void;
  editValue?: string;
  onEditChange?: (value: string) => void;
  editError?: string;
  isLoading?: boolean;
}

const ProfileHeader = ({ 
  username, 
  isOwnProfile = false,
  isEditing = false,
  onEdit,
  onSave,
  onCancel,
  editValue = "",
  onEditChange,
  editError,
  isLoading = false
}: ProfileHeaderProps) => {

  return (
    <div className="profile-header">
      <div className="user-info">
        <div className="name-section">
          {isEditing ? (
            <>
              <label htmlFor="name-edit" className="visually-hidden">
                Edit your username
              </label>
              <input
                id="name-edit"
                type="text"
                value={editValue}
                onChange={(e) => onEditChange?.(e.target.value)}
                className="name-edit-input"
                autoFocus
                disabled={isLoading}
                minLength={3}
                maxLength={20}
              />
              <button 
                onClick={onSave} 
                className="edit-action-btn save"
                aria-label="Save username"
                disabled={isLoading || !editValue}
              >
                {isLoading ? "..." : "✓"}
              </button>
              <button 
                onClick={onCancel} 
                className="edit-action-btn cancel"
                aria-label="Cancel edit"
                disabled={isLoading}
              >
                ✕
              </button>
              {editError && (
                <div style={{ 
                  color: 'var(--record-color)', 
                  fontSize: 'var(--font-size-sm)',
                  marginTop: 'var(--spacing-xs)'
                }}>
                  {editError}
                </div>
              )}
            </>
          ) : (
            <>
              <h2>{username}</h2>
              {isOwnProfile && (
                <button 
                  onClick={onEdit} 
                  className="edit-name-btn"
                  aria-label="Edit username"
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