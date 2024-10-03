import Mapping from "./components/OrderingTaxi/OrderingTaxi";
import Plans from "./components/Plans";
import "./App.css";
import Header from "./components/Header";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  return (
    <>
      <Header />
      <Mapping />
      <Plans />
      <ToastContainer />
    </>
  );
};

export default App;
