import "../assets/css/NavBar.css";
import { Dropdown, Button } from "react-bootstrap";

interface NavBarProps {
  logoImage: string;
  userImage: string;
}

function NavBar({ logoImage, userImage }: NavBarProps) {
  
  return (
    <div className="navbar">
      <a href="/">
        <img src={logoImage} width="40" height="40" alt="Precisão Logo" />
      </a>
      <span>
        <a href="#" className="underline-animation">Anotações</a>
      </span>
      <span>
        <a href="#" className="underline-animation">Documentações</a>
      </span>
      <Dropdown className="menuContainer">
        <Dropdown.Toggle as={Button} variant="light" id="dropdownMenuButton" className="DropdownBotao">
          <img src={userImage} className="userImage" width="35" height="35" alt="Precisão Logo" />
        </Dropdown.Toggle>

        <Dropdown.Menu align="end" className="menuDropdown">
          <Dropdown.Item href="/perfil">Perfil</Dropdown.Item>
          <Dropdown.Item href="#">Setor</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
}

export default NavBar;
