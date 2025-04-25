const dictionary = async () => {
    try {
        const response = await fetch('/br-utf8.txt'); // Caminho relativo à raiz pública
        const text = await response.text();
        const array = text.split("\n").map(word => word.trim()).filter(Boolean);
        return array;
    } catch (error) {
        console.error("Erro ao ler o arquivo:", error);
        return [];
    }
};

dictionary().then(result => console.log(result));
