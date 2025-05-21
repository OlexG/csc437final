import { useParams } from "react-router-dom";
import Layout from "../components/Layout";
import ProfileHeader from "../components/ProfileHeader";
import Timeline from "../components/Timeline";
import Tweep from "../components/Tweep";
import AddTweepButton from "../components/AddTweepButton";
import { useTweeps } from "../context/TweepsContext";

const ProfilePage = () => {
  const { username } = useParams<{ username: string }>();
  const isOwnProfile = username === "oleks";
  const { tweeps } = useTweeps();
  
  // Get the user's tweeps or an empty array if not found
  const userTweeps = username ? (tweeps[username] || []) : [];

  return (
    <Layout>
      <div className="user-timeline">
        <ProfileHeader username={username || ""} isOwnProfile={isOwnProfile} />
        
        <h2 className="visually-hidden">{username}'s Tweeps</h2>
      
        <Timeline>
          {isOwnProfile && <AddTweepButton />}
          {userTweeps.map(tweep => (
            <Tweep 
              key={tweep.id}
              username={username || ""}
              duration={tweep.duration}
            />
          ))}
        </Timeline>
      </div>
    </Layout>
  );
};

export default ProfilePage; 