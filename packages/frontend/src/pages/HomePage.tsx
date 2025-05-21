import Layout from "../components/Layout";
import Timeline from "../components/Timeline";
import Tweep from "../components/Tweep";
import { useTweeps } from "../context/TweepsContext";

const HomePage = () => {
  const { tweeps } = useTweeps();
  
  // Combine all users' tweeps into a single array with usernames
  const allTweeps = Object.entries(tweeps).flatMap(([username, userTweeps]) => 
    userTweeps.map(tweep => ({
      ...tweep,
      username
    }))
  );
  
  // Sort by timestamp (newest first)
  const sortedTweeps = allTweeps.sort((a, b) => b.timestamp - a.timestamp);

  return (
    <Layout>
      <Timeline>
        {sortedTweeps.map(tweep => (
          <Tweep 
            key={`${tweep.username}-${tweep.id}`}
            username={tweep.username}
            duration={tweep.duration}
          />
        ))}
      </Timeline>
    </Layout>
  );
};

export default HomePage; 