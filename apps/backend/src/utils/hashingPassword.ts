import bcrypt from "bcrypt";

//hash the password
export const hashPassword=async(password:string)=>{
    const saltRounds=parseInt(process.env.SALT || "10", 10);
    const afterHashPassword=await bcrypt.hash(password,saltRounds);
    return afterHashPassword;
}

//compare the password
export const comparePassword=async(password:string,hashPassword:string)=>{
    const isCorrectPassword=await bcrypt.compare(password,hashPassword);
    return isCorrectPassword;
}
