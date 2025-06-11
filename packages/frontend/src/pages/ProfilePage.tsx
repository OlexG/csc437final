import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import ProfileHeader from "../components/ProfileHeader";
import Timeline from "../components/Timeline";
import Tweep from "../components/Tweep";
import AddTweepButton from "../components/AddTweepButton";
import { useTweeps } from "../context/TweepsContext";
import { useAuth } from "../context/AuthContext";
import { api } from "../utils/api";

interface ProfileUser {
  id: string;
  username: string;
  createdAt: string;
}

const ProfilePage = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated, updateUsername } = useAuth();
  const { tweepsByUser, refreshUserTweeps } = useTweeps();
  
  const [profileUser, setProfileUser] = useState<ProfileUser | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [usernameLoading, setUsernameLoading] = useState(false);

  const isOwnProfile = isAuthenticated && user && username === user.username;

  // Fetch user profile data and their tweeps
  useEffect(() => {
    const fetchProfile = async () => {
      if (!username) return;
      
      setProfileLoading(true);
      setProfileError(null);
      
      try {
        // Fetch user profile and their tweeps in parallel
        const [userResult] = await Promise.all([
          api.getUserByUsername(username),
          refreshUserTweeps(username)
        ]);
        
        if (userResult) {
          setProfileUser(userResult.user);
        } else {
          setProfileError("User not found");
        }
      } catch {
        setProfileError("Failed to load profile");
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

  const handleUsernameEdit = () => {
    setIsEditingUsername(true);
    setNewUsername(user?.username || "");
    setUsernameError("");
  };

  const handleUsernameSave = async () => {
    if (!newUsername || newUsername === user?.username) {
      setIsEditingUsername(false);
      return;
    }

    setUsernameLoading(true);
    setUsernameError("");

    try {
      const result = await updateUsername(newUsername);
      
      if (result.success) {
        setIsEditingUsername(false);
        // Redirect to new username URL
        navigate(`/profile/${newUsername}`, { replace: true });
      } else {
        setUsernameError(result.error || "Failed to update username");
      }
    } catch {
      setUsernameError("An unexpected error occurred");
    } finally {
      setUsernameLoading(false);
    }
  };

  const handleUsernameCancel = () => {
    setIsEditingUsername(false);
    setNewUsername("");
    setUsernameError("");
  };

  // Show loading while fetching profile
  if (profileLoading) {
    return (
      <Layout>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading profile...</p>
        </div>
      </Layout>
    );
  }

  // Show error if profile not found or failed to load
  if (profileError) {
    return (
      <Layout>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h2>Profile Not Found</h2>
          <p>{profileError}</p>
        </div>
      </Layout>
    );
  }

  // Don't render if no profile data
  if (!profileUser) {
    return (
      <Layout>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          Loading profile...
        </div>
      </Layout>
    );
  }

  // Get the user's tweeps or an empty array if not found
  const userTweeps = username ? (tweepsByUser[username] || []) : [];

  return (
    <Layout>
      <div className="user-timeline">
        <ProfileHeader 
          username={profileUser.username}
          isOwnProfile={!!isOwnProfile}
          isEditing={isEditingUsername}
          onEdit={handleUsernameEdit}
          onSave={handleUsernameSave}
          onCancel={handleUsernameCancel}
          editValue={newUsername}
          onEditChange={setNewUsername}
          editError={usernameError}
          isLoading={usernameLoading}
        />
        
        <h2 className="visually-hidden">{profileUser.username}'s Tweeps</h2>
      
        <Timeline>
          {!!isOwnProfile && <AddTweepButton />}
          {userTweeps.length > 0 ? (
            userTweeps.map(tweep => (
              <Tweep 
                key={tweep.id}
                id={tweep.id}
                username={tweep.username}
                duration={tweep.duration}
                createdAt={tweep.createdAt}
                showDelete={!!isOwnProfile}
              />
            ))
          ) : (
            <div style={{ 
              textAlign: 'center', 
              padding: '2rem',
              color: 'var(--light-text)'
            }}>
              <p>{isOwnProfile ? "You haven't posted any tweeps yet." : `${profileUser.username} hasn't posted any tweeps yet.`}</p>
              {isOwnProfile && <p>Create your first tweep to get started!</p>}
            </div>
          )}
        </Timeline>
      </div>
    </Layout>
  );
};

export default ProfilePage; 