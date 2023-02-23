const express = require("express")
const app = express()
const mongoose = require("mongoose")
const bodyParser=require("body-parser")
const multer = require('multer')

const passport = require("passport")
const passportLocalMongoose = require("passport-local-mongoose")
const session = require("express-session")
const findOrCreate = require('mongoose-findorcreate')



app.use(bodyParser.urlencoded({extended:true}))



app.use(express.static("public"))
app.set("view engine", "ejs")




//mongo conncetction

mongoose.connect("mongodb+srv://shanyraq:shanyraq9090@toqtama.na7z25i.mongodb.net/?retryWrites=true&w=majority")

const userSchema = mongoose.Schema({
  email: String,
  password: String,
  role: {
    type: String,
    default: 'User'
  },
})



userSchema.plugin(passportLocalMongoose)
userSchema.plugin(findOrCreate)
const User = mongoose.model("User", userSchema)


passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//tutorial______________________________________________________________________
const GoogleStrategy = require('passport-google-oauth20').Strategy
const GOOGLE_CLIENT_ID = '137339416212-84i3uon4req12amk4lhrokr95g40ob6o.apps.googleusercontent.com'
const GOOGLE_CLIENT_SECRET = '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'


passport.use(new GoogleStrategy({
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: "http://localhost:5000/google/callback"
    },
    function(accessToken, refreshToken, profile, cb) {
        User.findOrCreate({ googleId: profile.id }, function (err, user) {
            return cb(err, user);
        });
    }
));
// _______________________________________________________________


//express session
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false
}))


// passport
app.use(passport.initialize())
app.use(passport.session())

// for file and picture by tutorual
const storage = multer.diskStorage({//Для настройки сохранения файлов
  destination: function(req, file, callback){//для место хранения
    callback(null, './public/uploads')
  },
  filename: function(req, file, callback) {//определяет имя для загруженных файлов
    callback(null, file.originalname)
  },
})
const upload = multer({
  storage: storage,
})
//-----
//___________________________________________________
const GenreSchema = mongoose.Schema({
  id: Number,
  name: String
})
const Genre = mongoose.model('Genre', GenreSchema)
//___________________________________________________
const { Schema } = require('mongoose');
const filmSchema = mongoose.Schema({
  title:{
    type:String,
    required:true
},
  content:{
    type:String,
    required:true
},
  img:String,
  video:String,
  duration:{
    type:String,
},
   genre:String,
   country:String,
   category:String,
   year:String,
   producer:String
})
const film = mongoose.model('film', filmSchema)

app.get('/addfilms',((req, res) => {
  if(req.isAuthenticated()){
    let user= req.user.username
    res.render("addfilms",{user:user,req:req})
  }else{
    res.redirect("/signIN")
  }
}))

//__________________________________________________

app.post("/addfilms", upload.single('myFile') ,(req,res) => { // upload.single() для загрузки\сохранения файла
    const films = new film({
     title: req.body.title,
     content: req.body.content,
     video :req.body.video,
     duration:req.body.duration,
     category:req.body.category,
     year:req.body.year,
     myFile: req.file.filename ,
     genre:req.body.genre,
     country: req.body.country,
    producer:req.body.producer
 })
 films.save();
 res.redirect("/addfilms")

})
// __________________________________________________

const homeSchema = new mongoose.Schema({
  city:{
      type:String
},
  conditions:String,
  day:{
      type:String
    },
  myFile:{
      type:String,
  },
  author:{
    type:String
  },
  location:{
    type:String
  },
  time:{
    type: String,
  },
  clock:{
    type: String,
  }
})
const savSchema = new mongoose.Schema({
  teg:{
      type:String
},
  city:{
      type:String
},
  conditions:String,
  day:{
      type:String
    },
  myFile:{
      type:String,
  },
  author:{
    type:String
  },
  me:{
    type:String
  },
  location:{
    type:String
  },
  time:{
    type: String,
  },
  clock:{
    type: String,
  }
})
const commentSchema = new mongoose.Schema({
  teg:String,
  comments:String,
  avtor:String

})
const Comment = mongoose.model('Com', commentSchema)//модель на основе схемы
const House = mongoose.model('house', homeSchema)//модель на основе схемы
const Save = mongoose.model('save', savSchema)//модель на основе схемы

//_________________________________________________________________________________
app.get('/',(async(req, res) => {
  if(req.isAuthenticated()){
    let user= req.user
    let films = await film.find({})
    res.render('film', {req: req,user:user,films:films})
  }else{
      let home = await House.find({})
    res.render('index1')
  }

}))
app.post('/',(async(req, res) => {
  if(req.isAuthenticated()){
    let user= req.user
    console.log(req.body.time);
    let home = await House.find({city: req.body.city, day:req.body.day})
      res.render('film', {req: req,home:home,user:user})
  }else{
    console.log(req.body.time);
    let home = await House.find({city: req.body.city, day:req.body.day})
      res.render('index1')
  }


}))
app.get('/index1', ((req, res) => {
  res.render('index1')
}))
app.get('/index2', ((req, res) => {
  res.render('index2')
}))
app.get('/cartoon', (async(req, res) => {
  if(req.isAuthenticated()){
    let user= req.user
    let home = await House.find({})
    res.render('cartoon', {req: req,user:user})
  }else{
      let home = await House.find({})
    res.render('index1')}
}))
app.get('/signIN',((req, res) => {
    let user= req.user
      res.render('signIN',{req: req})
  }))
app.get('/account',((req, res) => {
  if(req.isAuthenticated()){
  let user= req.user
  res.render('account', {req: req,user:user})
}else{
  res.redirect('/signIN')
}


}))
app.get('/about',((req, res) => {
  if(req.isAuthenticated()){
  let user= req.user
res.render('about', {req: req,user:user})
}else{
res.render('about', {req: req})
}

}))
app.get('/users',(async(req, res) => {
  if(req.isAuthenticated()){
      let user= req.user.username
    let users= await User.find({})
res.render('users', {req: req,users:users,user:user})
}else{
res.render('signIN')
}

}))
app.get('/home',(async(req, res) => {
  if(req.isAuthenticated()){
    let user= req.user
    let home = await House.find({author:user.username})
res.render('home', {req: req,user:user,home:home})
}else{
    res.redirect("/signIN")
}

}))
app.get("/registr",((req, res) => {

    res.render("registration", {req: req})

}))
app.get('/saved',(async(req, res) => {
  if(req.isAuthenticated()){
    let user= req.user
    let save = await Save.find({me:user.username})
res.render('saved', {req: req,user:user,save:save})
}else{
    res.redirect("/signIN")
}
}))
app.get('/liked',(async(req, res) => {
  if(req.isAuthenticated()){
    let user= req.user
    let save = await Save.find({me:user.username})
res.render('liked', {req: req,user:user,save:save})
}else{
    res.redirect("/signIN")
}
}))
app.post('/addcomments/:_id',(async(req,res)=>{
  let id=req.params._id
  let films = await film.find({})
  let user=req.user.username
  console.log("wowowo222");
  const com = new Comment ({
    teg:id,
    comments:req.body.comments,
    avtor:user
  })
  com.save()
  res.redirect("/watch")
}))
app.get('/addhome',((req, res) => {
  if(req.isAuthenticated()){
    let user= req.user.username
    res.render("addHome",{user:user,req:req})
  }else{
    res.redirect("/signIN")
  }

}))
var ObjectId = require('mongodb').ObjectID;
app.get("/watch/:_id",function(req,res){

  film.findById( ObjectId(req.params._id), function(err, search){
    if(!err){
      res.render("watch",{search:search,user:req.user.username});
  
   }else {
    console.log('Failed to retrieve the News: ' + err);
  }
})});
    
app.get("/search", function(req, res){
  res.render('search',{username:req.user.usernames})
})
app.get("/qyzyq", function(req, res){
  res.render('qyzyq',{user:req.user})
})
app.post("/search", function(req,res){
    let films =  film.findOne({title:req.body.keyword}, function(err,films){
      if(!err){
        res.render("search",{films:films,username:req.user.username});
     }else {
      console.log('Failed to retrieve the News: ' + err);
  }
   });
   
  });

//__________________________________________________

app.post("/addhome/:username", upload.single('myFile') ,(req,res) => { // upload.single() для загрузки\сохранения файла

     let user=req.params.username
      const d = new Date();
       const home = new House({
        city: req.body.city,
        conditions: req.body.conditions,
        day:req.body.day,
        myFile: req.file.filename ,
        author:user,
    location:req.body.location,
      time: d.toLocaleString('en-US', {day:'numeric', month: 'numeric', year: 'numeric'}),
      clock:d.toLocaleString('en-US',{hour: 'numeric', second: 'numeric', minute: 'numeric', hour12: true})
    })
    home.save();
    res.redirect("/home")

})
// __________________________________________________

app.post("/admin/remove/section/:_id/qwe",async function(req,res){
  if(req.isAuthenticated()){
    let user = req.user._id
     let homeid = req.params._id
     await Comment.deleteOne({_id:homeid})
        res.redirect("/")
}else{
    res.redirect("/signIN")
}
})
app.post("/admin/remove/users/:_id",async function(req,res){
  if(req.isAuthenticated()){
    let user = req.user._id
     let homeid = req.params._id
     await User.deleteOne({_id:homeid})
        res.redirect("/users")
}else{
    res.redirect("/signIN")
}
})
app.post('/:actoin/:_id/op', async function(req,res){
   let homeid = req.params._id
  let button=req.body.button
    console.log(button);
    if (button=="delete"){
     await House.deleteOne({_id:  homeid})
        res.redirect("/home")
    }
    else if (button=="deleteSave"){
      let user= req.user.username
      await Save.deleteOne({_id:  homeid, me:user})
         res.redirect("/saved")
    }
  else if (button=="edit"){
     let home= await House.findOne({_id: homeid})
     let user= req.user
        res.render("edit",{req:req,home:home,user:user})
    }

})
app.get("/search", function(req, res){
  let user= req.user
  res.render("search",{user:user});
})
app.post("/search", function(req,res){
  //database.findOne({title:req.body.keyword}, function(err, search){})
  // if(!err){
    let user= req.user
     res.render("search",{user:user});
     //console.log(search)
 // }else {
 //  console.log('Failed to retrieve the News: ' + err);
//}
});


app.post('/update/:_id/oe', upload.single('myFile'),(async (req,res) => {


    let homeid = req.params._id
    let user= req.user.username
    let d=new Date()
    if(req.body.button=="edit"){
       await House.updateOne({ _id: homeid }, {$set:{
         city: req.body.city,
         conditions: req.body.conditions,
         day:req.body.day,
         myFile: req.file.filename ,
         author:user,
     location:req.body.location,
       time: d.toLocaleString('en-US', {day:'numeric', month: 'numeric', year: 'numeric'}),
       clock:d.toLocaleString('en-US',{hour: 'numeric', second: 'numeric', minute: 'numeric', hour12: true})
    }})
    }
    res.redirect('/home')
}))
app.get('/read/:_id/:_city', async function(req, res) {
  if(req.isAuthenticated()){
    let user= req.user.username
    let u = req.params._id
    let home = await House.findOne({_id:u})
    res.render("readHome", {home:home,user:user,req:req})
  }else{

    res.redirect("/home")
  }
})
app.post("/read/:_id",(async(req,res)=>{
  if(req.isAuthenticated()){
    let user= req.user
    let id=req.params._id
    let films = await film.findOne({_id:id})
    let comments = await Comment.find({teg:id})
    res.render('read', {req: req,user:user,films:films,comments:comments})
}else{
  let id=req.params._id
  let films = await films.findOne({_id:id})
  let comments = await Comment.find({teg:id})
  res.render('read',{req:req,films:films,comments:comments})
}
}))

app.post("/saved/:_id/home", async function(req,res){
try {
  let homeid = req.params._id
    let user= req.user.username
    let undefind = await Save.findOne({teg:homeid, me:user})
    console.log(undefind);
    if (!undefind){
  console.log("io");
  let homes= await House.findOne({_id:homeid})

      const save = new Save({
        teg:homeid,
       city: homes.city,
       conditions: homes.conditions,
       day:homes.day,
       myFile: homes.myFile ,
       author:homes.author,
       me:user,
   location:homes.location,
     time:homes.time,
     clock:homes.clock
   })
   save.save()
res.redirect("/");

}
else{
  res.redirect("/");

}
  }catch (e) {
    console.log(e);
  }


    })



app.route("/registr")

.get(function(req, res){
      res.render("registration")
  })

.post(function(req, res) {
  User.register({
    username: req.body.username,
    email: req.body.username
  }, req.body.password, function(err, user) {
    if (err) {
      console.log(err)
      res.redirect("/registr")
    } else {
      passport.authenticate("local")(req, res, function() {
        res.redirect("/")
      })
    }
  })
})
//_____________________________________________________

app.route("/signIN")
  .get(function(req, res) {

    res.render("signIN")
  })
  .post(function(req, res) {

    const user = new User({
      username: req.body.username,
      password: req.body.password
    })

    req.login(user, function(err) {
      if (err) {
        console.log(err);
        res.redirect("/signIN")

        console.log(err)
      } else {
        passport.authenticate("local")(req, res, function() {
          res.redirect("/")
        })
      }
    })
  })




  app.get("/editacc", function(req,res){
    res.render("editacc",{email:req.user.username})
 })

 app.post("/editacc", upload.single('image'),function(req,res){
const newImage = new account({
  img: req.file.filename,
  name: req.body.name,
  surname: req.body.surname,
  age:req.body.age,
  country:req.body.country,
  number:req.body.number,
  region:req.body.region,
  email:req.user.username
});
newImage.save(),
 res.redirect('/index')

 })

// ____________________________________________________________

app.get('/logout', function(req, res, next) {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});



app.listen(5000,()=>{
    console.log(`5000 gotov k robote.GoooodLuck`)
    console.log("//AigerimSuperCode");
})
// tutorial______________________________________________________________________
app.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/registr' }),
    function(req, res) {
        res.redirect('/');

    });
/*
 * in order to fix errors:
 * 1) add a route '/home' with get method which will send 'home.html' as a response
 * 2) go to the file "index.html" and change <a href="home.html"> to <a href="home.html">
 */
