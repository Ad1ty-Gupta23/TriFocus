import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

const PORT=5000;
const app=express();
app.use(express.json());
app.use(cors());
dotenv.config();
mongoose.connect(process.env.MONGO_URI || '').then(()=>{
    console.log('connected to mongodb');
})
.catch((err)=>{
    console.log(err);
})

app.listen(PORT,()=> {
    console.log(`Server is running on port ${PORT}`);
    
})