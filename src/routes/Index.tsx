import "../assets/css/index.css";
import NavBar from "../components/NavBar";
import IndexCards from "../components/IndexCards";
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
                <h1>Vistos Recentementes</h1>

                <IndexCards />
                
            </section>
        </>
    )

}

export default Index;