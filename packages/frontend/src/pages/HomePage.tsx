import Layout from "../components/Layout";
import Timeline from "../components/Timeline";
import Tweep from "../components/Tweep";
import { useTweeps } from "../context/TweepsContext";

const HomePage = () => {
  const { tweeps, loading } = useTweeps();

  return (
    <Layout>
      <Timeline>
        {loading ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '2rem',
            color: 'var(--light-text)'
          }}>
            <i className="fas fa-spinner fa-spin"></i>
            <p>Loading tweeps...</p>
          </div>
        ) : tweeps.length > 0 ? (
          tweeps.map(tweep => (
            <Tweep 
              key={tweep.id}
              id={tweep.id}
              username={tweep.username}
              duration={tweep.duration}
              createdAt={tweep.createdAt}
            />
          ))
        ) : (
          <div style={{ 
            textAlign: 'center', 
            padding: '2rem',
            color: 'var(--light-text)'
          }}>
            <h2>Welcome to Tweeper!</h2>
            <p>No tweeps yet. Start by creating your first audio tweet!</p>
          </div>
        )}
      </Timeline>
    </Layout>
  );
};

export default HomePage; 