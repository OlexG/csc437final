import Layout from "../components/Layout";
import Timeline from "../components/Timeline";
import Tweep from "../components/Tweep";

const HomePage = () => {
  const tweeps = [
    { id: 1, username: "lisa", duration: "1:32 min" },
    { id: 2, username: "owen", duration: "0:35 min" },
    { id: 3, username: "alex", duration: "2:30 min" }
  ];

  return (
    <Layout>
      <Timeline>
        {tweeps.map(tweep => (
          <Tweep 
            key={tweep.id}
            username={tweep.username}
            duration={tweep.duration}
          />
        ))}
      </Timeline>
    </Layout>
  );
};

export default HomePage; 