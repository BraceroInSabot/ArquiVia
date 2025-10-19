const Validate = {
    name(name: string) {
        if ((name.length < 2) || (name.length > 100)) {
            return [false, "O nome da empresa deve ter entre 2 e 100 caracteres"]
        } 
        return [true, "OK"]
    }
}
export default Validate;