import Layout from "../components/Layout";
import RecordingPanel from "../components/RecordingPanel";

const CreateTweepPage = () => {
  return (
    <Layout>
      <div className="create-tweep-page">
        <h1 className="page-title">Create Tweep</h1>
        <RecordingPanel />
      </div>
    </Layout>
  );
};

export default CreateTweepPage; 