import { useParams } from "react-router-dom";
import Layout from "../components/Layout";
import ProfileHeader from "../components/ProfileHeader";
import Timeline from "../components/Timeline";
import Tweep from "../components/Tweep";
import AddTweepButton from "../components/AddTweepButton";

const ProfilePage = () => {
  const { username } = useParams<{ username: string }>();
  const isOwnProfile = username === "oleks";
  
  // Mock data based on username
  const userTweeps = {
    lisa: [
      { id: 1, duration: "1:32 min" },
      { id: 2, duration: "2:15 min" },
      { id: 3, duration: "0:58 min" },
    ],
    owen: [
      { id: 1, duration: "0:35 min" },
      { id: 2, duration: "1:42 min" },
    ],
    alex: [
      { id: 1, duration: "2:30 min" },
      { id: 2, duration: "1:15 min" },
    ],
    oleks: [
      { id: 1, duration: "3:12 min" },
      { id: 2, duration: "0:5 min" },
      { id: 3, duration: "1:20 min" },
    ]
  };
  
  // Default to empty array if username not found
  const tweeps = username ? (userTweeps[username as keyof typeof userTweeps] || []) : [];

  return (
    <Layout>
      <div className="user-timeline">
        <ProfileHeader username={username || ""} isOwnProfile={isOwnProfile} />
        
        <h2 className="visually-hidden">{username}'s Tweeps</h2>
      
        <Timeline>
          {isOwnProfile && <AddTweepButton />}
          {tweeps.map(tweep => (
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