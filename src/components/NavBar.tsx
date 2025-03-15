import "../assets/css/NavBar.css";

interface NavBarProps {
    logoImage : string;
    userImage : string;
}

function NavBar({logoImage, userImage}: NavBarProps) {
  return (
    <div className="navbar">
        <a href="#">
            <img src={logoImage} width="40" height="40" alt="Precisão Logo"/>
        </a>
        <span>
            <a href="#" className="underline-animation">Anotações</a>
        </span>
        <span>
            <a href="#" className="underline-animation">Documentações</a>
        </span>
        <a href="">
            <img src={userImage} className="userImage" width="35" height="35" alt="Precisão Logo"/>
        </a>
    </div>
  )
}

export default NavBar
