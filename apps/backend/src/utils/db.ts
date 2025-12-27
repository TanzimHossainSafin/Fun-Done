import mongoose from "mongoose";

let connection: mongoose.Mongoose | null = null;

//connect to the database
const connnectDb = async () => {
    try {
        console.log("Database is connected successfully!!")
        connection = await mongoose.connect(process.env.DATABASE_URL || "")
        return connection
    }
    catch (error) {
        console.log(error)
        return error
    }
};

//get a instance of the DataBase
const getDBInstance = () => {
    if (connection) {
        return connection
    }
    return connnectDb()
};

export default getDBInstance;

