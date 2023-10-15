const { PORT, DATABASE } = require(__dirname+"/config.js");

let dbConnect, userFunctionsDb, userGroupFunctionsDb, messageFunctionsDb, myPdf;

if( DATABASE === 'mongoDb')
{
	dbConnect = require(__dirname+"/database/dbConnect.js");
	userFunctionsDb = require(__dirname+"/mongoDbServices/usersServices.js");  // login endpoint signup endpoint and userdata endpoint
	userGroupFunctionsDb = require(__dirname+"/mongoDbServices/userGroupsServices.js"); // addToContact endpoint
	messageFunctionsDb = require(__dirname+"/mongoDbServices/messageServices.js");
	myPdf = require(__dirname+"/pdfGenerator/generatesThePdf.js");
}
else
{
	dbConnect = require("./databaseMySql/dbConnect.js").connect;
	userFunctionsDb = require("./mysqlDbServices/userServices.js");
	userGroupFunctionsDb = require("./mysqlDbServices/userGroupsServices.js");
	messageFunctionsDb = require("./mysqlDbServices/messageServices.js");
	myPdf = require(__dirname+"/pdfGeneratorMySQL/generatesThePdf.js");
}

const mailSent = require(__dirname+"/mailSender/mailFunction.js");
const express = require('express');
const session = require('express-session');
const socketIO = require('socket.io');
const http = require('http')
const app = express();
const port = PORT;

let server = http.createServer(app)
let io = socketIO(server)

app.use(session({
	secret: 'keyboard cat',
	resave: false,
	saveUninitialized: true
}))
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(express.static(__dirname+"/CSS"));
app.use(express.static(__dirname+"/script"));

app.get('/exportChat', (req,res) =>{
	if( !req.session.isLoggedIn )
	{
		res.redirect("/login");
	}
	else
	{
		req.session.groupId = req.query.groupId;
		res.sendFile(__dirname+"/html/exportChat.html");
	}
})
app.post('/exportChat', (req,res)=>{
	req.body.groupId = req.session.groupId;
	req.session.groupId = '';
	const sendMailPDF = async ()=>{
		let pdfCreated = await myPdf(req.body.groupId, req.body.limit, req.session.email);
		console.log("pdfCreated");
		mailSent(req.body.email, pdfCreated);
	}
	sendMailPDF();
	res.redirect('/');
})

app.get('/', (req, res) => {
	if( !req.session.isLoggedIn )
	{
		res.redirect("/login");
	}
	else
	{
		res.sendFile(__dirname+"/html/chatAppHome.html");
	}
})


app.route("/login")
.get((req,res)=>{
	if( !req.session.isLoggedIn )
	{
		res.sendFile(__dirname+"/html/login.html");
	}
	else
	{
		res.redirect("/");
	}
})

.post((req,res)=>{
	userFunctionsDb.logMeIn(req.body.email, req.body.password, function(val){
		if(val)
		{
			req.session.isLoggedIn = true;
			req.session.email = req.body.email;
			res.redirect("/");
		}
		else
		{
			res.redirect("/signup");
		}
	});
})

app.route("/signup")
.get((req,res)=>{
	if( !req.session.isLoggedIn )
	{
		res.sendFile(__dirname+"/html/signup.html");
	}
	else
	{
		res.redirect("/signup");
	}
})

.post((req,res)=>{
	const name = req.body.name.trim();
	const email = req.body.email.trim();
	const password = req.body.password.trim();
	userFunctionsDb.signMeUp(name,email,password,function(val){
		if(val)
		{
			res.redirect("/login");
		}
		else
		{
			res.redirect("/signup");
		}
	})
})

app.post("/addToContact", (req,res)=>{
	userGroupFunctionsDb.addThisContact(req.body.email, req.session.email, function(result, data){
		if(result)
		{
			res.status(200).send(data);
		}
		else
		{
			res.status(404).send(data);
		}
	})
})


app.get("/getAllChats", (req,res)=>{
	userGroupFunctionsDb.myContacts(req.session.email, function(result, data){
		if(result)
		{
			res.status(200).json(data);
		}
		else
		{
			res.status(404).send(data);
		}
	})
})

app.get("/myId",(req,res)=>{
	res.status(200).send(req.session.email);
})

app.get("/getMessages",(req,res)=>{
	messageFunctionsDb.getMessages(req.session.email, req.query.groupId, req.query.skip, req.query.limit, function(result, data){
		if(result)
		{
			res.status(200).json(data);
		}
		else
		{
			res.status(404).send(data);
		}
	})
})

app.get("/unseenMessagesNumber",(req,res)=>{
	messageFunctionsDb.getUnseenMessagesNumber(req.query.groupId, req.session.email, function(result, data){
		if(result)
		{
			res.status(200).send(data);
		}
		else
		{
			res.status(404).send(data);
		}
	})
})

app.get("/unseenMessagesForUser",(req,res)=>{
	messageFunctionsDb.getUnseenMessagesUser(req.query.groupId, req.session.email, req.query.skip, req.query.limit, function(result, data){
		if(result)
		{
			res.status(200).json(data);
		}
		else
		{
			res.status(404).send(data);
		}
	})
})

app.get("/getLastMessage",(req,res)=>{
	messageFunctionsDb.getLastMessage(req.query.groupId, req.query.skip, req.query.limit, function(result, data){
		if(result)
		{
			res.status(200).json(data);
		}
		else
		{
			res.status(404).send(data);
		}
	})
})

app.post("/sendTheMessage",(req,res)=>{
	messageFunctionsDb.saveMessage(req.body.text, req.body.senderId, req.body.reciverGroupId, req.session.email, function(result, data){
		if(result)
		{
			res.status(200).json(data);
		}
		else
		{
			res.status(404).send(data);
		}
	})
})

app.post("/newGroup",(req,res)=>{
	req.body.push({email: req.session.email});
	userGroupFunctionsDb.newGroup(req.body, req.query.name+" G*", function(result, data){
		if(result)
		{
			res.status(200).json(data);
		}
		else
		{
			res.status(404).send(data);
		}
	})
})

app.get("/userData",(req,res)=>{
	userFunctionsDb.giveMeUserData(req.query.userSkip, req.query.userLimit, function(done, data){
		if(done)
		{
			res.status(200).send(data);
		}
		else
		{
			res.status(404).send("something went wrong");
		}
	})
})

app.get("/messageIsRead",(req,res)=>{
	messageFunctionsDb.messageRead(req.query.id, req.session.email, function(result){
		if(result)
		{
			res.send("acknowledged");
		}
		else
		{
			res.send("read hua nhi lekin acknowledged");
		}
	})
})


io.on('connection', (socket)=>{
	console.log("user connected");

	 socket.on('join-room', (idOfRoom)=>{
		socket.join(idOfRoom.roomId);
	});

	socket.on('privateMessage',(message)=>{
		socket.broadcast.to(message.id).emit("yourMessage", {message: message.text, id: message.id})
	})

	  socket.on('disconnect', ()=>{
    console.log('disconnected from user');
  });
});






dbConnect(function(message, err = false){
	if(err)
	{
		console.log(message);
	}
	else
	{
		console.log(message);
		server.listen(port,() => {
			console.log(`Example app listening at http://localhost:${port}`)
			});
	}
})


