import { BrowserRouter as Router, Route,Routes} from 'react-router-dom';
import Header from "./Components/Header/Header";
import Home from "./Components/Home/Home";
import Bucket from './Components/Bucket/Bucket';
import RegisterPage from './Components/Register/Register';
import LoginPage from './Components/Login/Login';
import Profile from './Components/Profile/Profile';

function App() {
  return (
    <Router>
    <Header/>
    <Routes>
    <Route path='/' Component={Home}/>
    <Route path='/profile' Component={Profile}/>
    <Route path='/register' Component={RegisterPage}/>
    <Route path='/bucket' Component={Bucket}/> <Route path='/login' Component={LoginPage}/>
   </Routes>
  
   </Router>
  );
}

export default App;
