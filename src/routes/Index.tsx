import "../assets/css/index.css";
import NavBar from "../components/NavBar";
import logo from "../assets/img/logos/AnnotaPs-Logo-Pequeno.png";
import { useEffect } from "react";

function Index() {
    useEffect(() => {
        document.title = "AnnotaPS";
    }, []);

    return (
        <>
            <nav>
                <NavBar logoImage={logo} userImage={logo} />
            </nav>
            
            <section>
                <img src={logo} alt="asdasd" />
            </section>
        </>
    )

}

export default Index;