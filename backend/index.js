var GoogleStrategy = require("passport-google-oauth20").Strategy;
const passport=require("passport")
const jwt=require("jsonwebtoken")

const express=require("express");
const {seq} =require("./config/db");
require("dotenv").config()
// const  cors =require("cors");
 


const app = express();
// app.use(cors({origin:"*"}))
// app.use(express.json())
 


app.get("/",(req,res)=>{
    res.send("<h1>welcome to my world</h1>")
})

const { v4: uuidv4 } = require("uuid");
const { User } = require("./model/userMdel");
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.clientID,
      clientSecret: process.env.clientSecret,
      callbackURL: process.env.callbackURL,
    },
    async function (accessToken, refreshToken, profile, cb) {
    //  let avatar =profile._json.picture 
    let email = profile._json.email;
      let udata = await User.findOne({ where: { email } });
      if (udata) {
        return cb(null, udata);
      }
      let name = profile._json.name;
    
      let user =  User.build({
        name,
        email,
        password: uuidv4()
      });
      console.log(user)
      await user.save();
      return cb(null, user);
     }
  )
);



app.get(
    "/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
  );
  
  app.get(
    "/auth/google/callback",
    passport.authenticate("google", {
      failureRedirect: "/google/login",
      session: false,
    }),
    function (req, res) {
      let user = req.user;
       var token = jwt.sign({userID:user.id,email:user.email}, process.env.SECRET_KEY);
        res.redirect(`https://webledger-assignment.vercel.app?token=${token}&userID=${user.id}&name=${user.name}`);
    }
  );

 
seq.sync().then(()=>{
    app.listen(process.env.PORT,()=>{
                console.log(`connected at port ${process.env.PORT}`);
        
    })
})
