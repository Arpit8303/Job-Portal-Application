import JWT from "jsonwebtoken"

const userAuth = async(req,res,next)=>{

    const authHeader = req.headers.authorization;

    if(!authHeader || !authHeader.startsWith("Bearer")){
        return res.status(401).json({ success: false, message: "Auth Failed" });
    }

    const token = authHeader.split(" ")[1];

    try{
        const payload = JWT.verify(token, process.env.JWT_SECRET); 
   //hmara data payload ke andar hota hai, usko hum req.user ke andar store kar denge taki aage ke middleware ya route handler me use kar sake
    
   req.user = {userId : payload.userId}
   next();
}
    catch(error){
   return res.status(401).json({ success: false, message: "Auth Failed" });
    }
}

export default userAuth;
