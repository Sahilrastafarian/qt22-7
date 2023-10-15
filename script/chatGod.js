var socket=io();

let contactsDiv;

const iconNode = document.getElementById("iconForUser");
const usernameNode = document.getElementById("usernameForChat");

const errorNode = document.getElementById("error");
const loadMoreGroupUsers = document.getElementById("loadMoreGroupUsers");
loadMoreGroupUsers.onclick = getAllUsers;

const exportChatNode = document.getElementById("exportChat");


let selectedUsersForGroup = [];

let email = '';
let skip = 0;
let skipUnseen = 0;  // pagenation for unseen messages load
//let currentRoom = 0;   not needed now
let myContacts =[];    // record of my contacts to be kept for group addition actively used in script groupAdd.js
let isInConversation = 0;

const mineContactListNode = document.getElementById("contactListMine"); //to show in group adding div

const allUsersNode = document.getElementById("listAllUsersInDB");// add to contact node
const selectedUsersNode = document.getElementById("selectedUsersToAdd");// user to add to contact



socket.on('connect', function(){
  console.log('Connected to Server');
});

socket.on('yourMessage', function(message){
  inContactListNode = document.getElementById(message.id);
  messageNotification = document.getElementById(message.id+"-Num");
  if(message.id !== isInConversation)
  {
    inContactListNode.innerText = message.message.slice(0,6)+"  from *";
    //sortOnRecieving();  //if reciever end sorting is needed
    if(messageNotification.innerText === "")
    {
      messageNotification.innerText = "1";
      messageNotification.classList.add("notifier");
    }
    else
    {
      let value = parseInt(messageNotification.innerText);
      value +=1;
      messageNotification.innerText = value;
      messageNotification.classList.add("notifier");
    }
  }
  else
  {
    addToMessageOnUserSide(message.message, true);
    inContactListNode.innerText = message.message.slice(0,6)+" from *";
    setTimeout(function(){sendMessageIsReadAcknowledgement(message.id)},100);
    //sendMessageIsReadAcknowledgement(message.id);
  }
})

function sendMessageIsReadAcknowledgement(id)
{
  const req = new XMLHttpRequest();
  req.open("GET",`/messageIsRead?id=${id}`);
  req.send();
  req.addEventListener("load", function(){
    console.log("acknowledgement aaa gyi");
  })
}


const textMessageNode = document.getElementById("textMessage");
const sendMessageBtn = document.getElementById("sendMessage");
sendMessageBtn.onclick = function(){
      textMessageNode.value = '';
      errorNode.innerText = "first select a contact to chat with";
      errorNode.classList.add("errorOccured");
      setTimeout(function(){
        errorNode.classList.remove("errorOccured");
        errorNode.innerText = '';
      },5000);
    };

const overlay = document.getElementById("overlay");
const popup = document.getElementById("popup");
const popupCloseBtn = document.getElementById("popupClose");
popupCloseBtn.onclick = hidePopup;


//const emailNode = document.getElementById("email");
//const searchAndAdd = document.getElementById("searchTheUser"); // in new changes all users in database to be shown
//searchAndAdd.addEventListener("click", addToContact);

const contactListNode = document.getElementById("contactList");
const myChatNode = document.getElementById("chatDisplayer");   //scroll event on this element scroll top

const addNewContactBtn = document.getElementById("newContactAdd");
addNewContactBtn.addEventListener("click", newContactAdd);
addNewContactBtn.addEventListener("click", getAllUsers);

const newGroupBtn = document.getElementById("newGroup");
newGroupBtn.addEventListener("click", getAllUsers)

const loadMoreUsersNode = document.getElementById("loadMoreUsers");
loadMoreUsersNode.onclick = getAllUsers;
let userData = [];
let userSkip = 0;
let userLimit = 5;




function sortOnRecieving()   // this feature is commented at line 40 socket.on function 
{
  const req = new XMLHttpRequest();   //used to sort contact list realtime with
  req.open("GET", "/getAllChats");     // the resent messging contact at top of the list
  req.send();
  req.addEventListener("load", function(){
    if(req.status === 200)
    {
      myContacts = JSON.parse(req.responseText);
      contactListNode.innerText = '';
      showInContacts(myContacts);
    }
  })
}


function getAllUsers()
{
  addNewContactBtn.removeEventListener("click", getAllUsers);
  newGroupBtn.removeEventListener("click", getAllUsers);
  const req = new XMLHttpRequest();
  req.open("GET", `/userData?userSkip=${userSkip}&userLimit=${userLimit}`);
  req.send();
  req.addEventListener("load", function(){
    
    if(req.status === 200)
    {
      const data = JSON.parse(req.responseText);
      if(!data.length)
      {
        loadMoreUsersNode.remove();
        loadMoreGroupUsers.remove();
      }
      userData = [...userData, ...data];
      showInUserList(data);
      
      userSkip += 5;
    }
    else
    {
      console.log(req.responseText);
    }
  })
}

function showInUserList(data)
{
  data.forEach(item=>{
    appendDivsInList(item);
  })
}

function appendDivsInList(userData)
{
  if(userData.email === email)
  {
    return;
  }
  displayInGroupAdd(userData); //also add in user group node


  const userContainer = document.createElement("div");
  userContainer.classList.add("allUserListDiv")
  const userName = document.createElement("p");
  const userId = document.createElement("span");
  
  userName.innerText = "Name : " + userData.name;
  userId.innerText = "ID : " + userData.email;
  userContainer.appendChild(userName);
  userContainer.appendChild(userId);
  userContainer.addEventListener("click", e=>{
    addOnRightContactListNode(userData);
  })
  allUsersNode.appendChild(userContainer);
}

function addOnRightContactListNode(uId)
{
  selectedUsersNode.innerText = '';
  const title = document.createElement("div");
  title.innerText = "Selected User";
  selectedUsersNode.appendChild(title);
  const userContainer = document.createElement("div");
  userContainer.classList.add("allUserListDiv")
  const userName = document.createElement("p");
  const userId = document.createElement("span");
  
  userName.innerText = "Name : " + uId.name;
  userId.innerText = "ID : " + uId.email;
  userContainer.appendChild(userName);
  userContainer.appendChild(userId);
  selectedUsersNode.appendChild(userContainer);

  const addBtn = document.createElement("button");
  addBtn.innerText = "add selected user";
  addBtn.classList.add("addUserToContact");
  addBtn.addEventListener("click", e=>{addToContact(uId.email);});
  selectedUsersNode.appendChild(addBtn);
}


function newContactAdd()
{
  overlay.style.display = "block";
}

function hidePopup()
{
  overlay.style.display = "none";
}

function addToContact(email)
{
  
  const req = new XMLHttpRequest();
  req.open("POST", "/addToContact");
  req.setRequestHeader("content-type","application/json");
  req.send(JSON.stringify( { email: email }));
  req.addEventListener("load", function(){
    console.log(req.responseText);
    if(req.status === 200) // show acknolegement at the top
    {
      const data = [];
      data.push(JSON.parse(req.responseText));
      myContacts = [...myContacts, ...data];
      showInContacts(data);
      errorNode.innerText = "contact added";
      errorNode.classList.add("noErrorOccured");
      setTimeout(function(){
        errorNode.classList.remove("noErrorOccured");
        errorNode.innerText = '';
      },5000);
    }
    else      // show error at the top 
    {
      errorNode.innerText = req.responseText;
      errorNode.classList.add("errorOccured");
      setTimeout(function(){
        errorNode.classList.remove("errorOccured");
        errorNode.innerText = '';
      },5000);
    }
  })
}

function loadAllChat()
{
  const req = new XMLHttpRequest();
  req.open("GET", "/getAllChats");
  req.send();
  req.addEventListener("load", function(){
    console.log(req.responseText);
    if(req.status === 200)
    {
      showInContacts(JSON.parse(req.responseText));
    }
  })
}



function myEmail()
{
  const req = new XMLHttpRequest();
  req.open("GET", "/myId");
  req.send();
  req.addEventListener("load", function(){
    console.log(req.responseText);
    email = req.responseText;
    loadAllChat();
  })
}

myEmail();

function showInContacts(data)//contactListNode
{
  let userEmail = '';
  myContacts = data;
  data.forEach(item=>{
    if( item.participants.length === 2 )
    {
      for(let i = 0; i < item.participants.length; i++)
      {
        if(item.participants[i].email !== email)
        {
          userEmail = item.participants[i].email;
        }
      }
      //displayInGroupAdd(userEmail);
    }
    joinChatRoom(item._id);
    if(userEmail !== '')
    {
      displayContactInList(item , userEmail);
      userEmail = '';
    }
    else
    {
      displayContactInList(item, item.groupName);
    }
  })

  contactsDiv = document.querySelectorAll(".contact");
}

function displayInGroupAdd(user)       /// used in groupAdd.js
{
  //mineContactListNode to show in group addition node
  const contactGroup = document.createElement("div");
  contactGroup.classList.add("contactListGroup");
  const contactNameGroup = document.createElement("p");
  contactNameGroup.innerText = user.email;
  contactGroup.appendChild(contactNameGroup);
  mineContactListNode.appendChild(contactGroup);
  contactGroup.addEventListener("click", e=>{addedToGroupList(user)});   // function defined in groupAdd.js
}

function displayContactInList(item, userEmail)
{
  const containerDiv = document.createElement("div");
  const para = document.createElement("p");
  const spanLastMessage = document.createElement("span");
  const spanUnseenMessage = document.createElement("span");  // new message counter addition
  console.log(item);
  spanUnseenMessage.id = item._id+"-Num";
  spanUnseenMessage.innerText = "";
  spanUnseenMessage.style.display = "block";
  //spanUnseenMessage.classList.add("notifier");
  getUnseenMessagesNumber(spanUnseenMessage, item._id);

  spanLastMessage.id = item._id;
  spanLastMessage.innerText = "no recent chat";
  spanLastMessage.style.display = "block";

  getLastMessageForThisContact(spanLastMessage, item._id);

  spanLastMessage.classList.add("lastSentMessage");
  para.innerText = userEmail;

  

  containerDiv.appendChild(para);
  containerDiv.appendChild(spanLastMessage);
  containerDiv.appendChild(spanUnseenMessage);
  containerDiv.classList.add("contact");
  contactListNode.appendChild(containerDiv);
  containerDiv.addEventListener("click", event=>{

    usernameNode.innerText = userEmail; // to show at the top
    iconNode.innerText = userEmail[0];
    spanUnseenMessage.innerText = '';
    spanUnseenMessage.classList.remove("notifier");
    

    skip = 0;    // for pagination to show chats in limited order
    skipUnseen = 0;
    showAndDisplayMessageChat(item);
  })
}

function getUnseenMessagesNumber(spanRef, id)
{
  const req = new XMLHttpRequest();
  req.open("GET", `/unseenMessagesNumber?groupId=${id}`);
  req.send();
  req.addEventListener("load", function(){

      console.log(req.responseText," ye number aana chahiya")
      if(req.status === 404)
      {
        return; 
      }
      else
      {
        if(parseInt(req.responseText))
        {
          //spanRef.innerText = req.responseText+" New M*";
          spanRef.innerText = req.responseText;
          spanRef.classList.add("notifier");
        }
      }
  })
}

function showAndDisplayMessageChat(item) /// new changes to show notification if the chat has recieved any messages
{
  myChatNode.innerText = '';
  myChatNode.onscroll = e=>{
    if(myChatNode.scrollTop === 0)
    {
      iWillBringNextFiveMessages(item._id);
    }
    if((myChatNode.scrollHeight - myChatNode.scrollTop) < 450)
    {
      //console.log(myChatNode.scrollTop," ye end hai scroll ka", myChatNode.scrollHeight);
      console.log("line 411");
      getUnseenMessagesForThisUser(item._id);
    }
    }
 
  loadTheChatForThisConvo(item._id);
}

function iWillBringNextFiveMessages(id)
{
  //console.log("scroll hua scroll hua");
  loadTheChatForThisConvo(id, true);
}

function getUnseenMessagesForThisUser(id)
{
  console.log("give me unseen messages right now");
  const req = new XMLHttpRequest();
  req.open("GET", `/unseenMessagesForUser?groupId=${id}&skip=${skipUnseen}&limit=5`);
  req.send();
  req.addEventListener("load", function(){
    if( req.status !== 200)
    {
      console.log("no chat found");
      myChatNode.onscroll = e=>{
      if(myChatNode.scrollTop === 0)
      {
        iWillBringNextFiveMessages(id);
      }
      }
    }
    else
    {
      const data = JSON.parse(req.responseText);
      skipUnseen += 0;  //no need for skip as read is being changed dynamically
      data.forEach(item=>{
        populateMyChat(item, false, true);
      })
    }
  })
}

function loadTheChatForThisConvo(id ,scroll= false)   //scroll to use when user loads more chat
{
  sendMessageBtn.onclick = function(){
      sendTheMessage(id);
      console.log("send ho ja");
      }
      textMessageNode.onkeyup = function(e){
        if(e.key === "Enter")
        {
          sendTheMessage(id);
          console.log("send ho ja");
        }
      }
  isInConversation = id;
  exportChatNode.innerText = "export this chat";
  exportChatNode.href = `/exportChat?groupId=${id}`;
  const req = new XMLHttpRequest();
  req.open("GET", `/getMessages?groupId=${id}&skip=${skip}&limit=10`);
  req.send();
  req.addEventListener("load", function(){
    isInConversation = id;   /// to know if person is on this chat for socket to display message
    if(req.status !== 200)
    {
      console.log("line 475");
      getUnseenMessagesForThisUser(id);
      return;
    }

    const data = JSON.parse(req.responseText);
    skip += 10;
    data.forEach(item=>{
      populateMyChat(item, scroll);
    });
    //let noMultipleRequestsFlag = 0;
    if(skip === 10 && data.length < 8)
      {
        console.log("line 487");
        //noMultipleRequestsFlag = 1;
        getUnseenMessagesForThisUser(id);
      }
    if(myChatNode.scrollTop === 0)
    {
      //noMultipleRequestsFlag = 0;
      console.log("line 492");
      getUnseenMessagesForThisUser(id);
    }
    
    
  })
}

function populateMyChat(item, scroll, isUnseenMessage=false)
{
  const time = new Date(item.timeStamp);
  const messageContainer = document.createElement("div");
  messageContainer.classList.add("messageContainer")
  const messageDiv = document.createElement("div");
  const para = document.createElement("p");
  para.innerText = item.message;
  messageDiv.appendChild(para);
  messageContainer.appendChild(messageDiv);
  const senderDiv = document.createElement("div");
  const timeDiv = document.createElement("div");
  timeDiv.innerText = time.toLocaleTimeString();
  if(item.senderId === email)
  {
    messageDiv.classList.add("messageMy");
    senderDiv.innerText = "you *";
    senderDiv.classList.add("messageMyTop");
    timeDiv.classList.add("timeStampMy");
  }
  else
  {
    messageDiv.classList.add("messageFrom");
    senderDiv.innerText = "* from";
    senderDiv.classList.add("messageFromTop");
    timeDiv.classList.add("timeStampFrom");
  }
  messageDiv.appendChild(senderDiv);
  messageDiv.appendChild(timeDiv);

  
  if(!isUnseenMessage)          //isme time lagega
  {
    myChatNode.prepend(messageContainer);
    if(!scroll)
    {
      myChatNode.scrollTop = myChatNode.scrollHeight - myChatNode.scrollTop - 30;
    }
    else
    {
      myChatNode.scrollTop += 5;
    }
  }
  else
  {
    myChatNode.appendChild(messageContainer);
    //myChatNode.scrollTop = myChatNode.scrollHeight - myChatNode.scrollTop - 50;
  }
}


function sendTheMessage(id)
{
  console.log(id);
  
  if(textMessageNode.value.trim() === '')
  {
    textMessageNode.value = '';

    errorNode.innerText = "empty or space filled messages are invalid";
      errorNode.classList.add("errorOccured");
      setTimeout(function(){
        errorNode.classList.remove("errorOccured");
        errorNode.innerText = '';
      },5000);

    return;
  }
  else
  {
    console.log("message sent to db");
    const req = new XMLHttpRequest();
    req.open("POST", "/sendTheMessage");
    req.setRequestHeader("content-type","application/json");
    req.send(JSON.stringify({ senderId: email, reciverGroupId: id, text: textMessageNode.value }));
    req.addEventListener("load", function(){
      if(req.status === 200)
      {
        const chatText = textMessageNode.value;
        addToMessageOnUserSide(chatText);
        inContactListNode = document.getElementById(id); // to display recent message in contact list
        inContactListNode.innerText = chatText.slice(0,6)+"  you *";
        textMessageNode.value = '';
        //console.log(JSON.parse(req.responseText));

        //myContacts = JSON.parse(req.responseText);  //for real time sorting
        //contactListNode.innerText = '';
        //showInContacts(myContacts);
      }
    })
  }

  socket.emit("privateMessage", {
    id: id,
    text: textMessageNode.value
  });

}

function addToMessageOnUserSide(text,from=false)
{
  const time = new Date(Date.now());
  const messageContainer = document.createElement("div");
  messageContainer.classList.add("messageContainer")
  const messageDiv = document.createElement("div");
  const para = document.createElement("p");
  para.innerText = text;
  messageDiv.appendChild(para);
  messageContainer.appendChild(messageDiv);
  const timeDiv = document.createElement("div");
  timeDiv.innerText = time.toLocaleTimeString();

  const senderDiv = document.createElement("div");
  if(!from)
  {
    messageDiv.classList.add("messageMy");
    timeDiv.classList.add("timeStampMy");
    senderDiv.classList.add("messageMyTop");
    senderDiv.innerText = "you *";
  }
  else
  {
    messageDiv.classList.add("messageFrom");
    timeDiv.classList.add("timeStampFrom");
    senderDiv.classList.add("messageFromTop");
    senderDiv.innerText = "* from";
  }
  messageDiv.appendChild(senderDiv);
  messageDiv.appendChild(timeDiv);


  myChatNode.appendChild(messageContainer);
  myChatNode.scrollTop = myChatNode.scrollHeight;
  
}


function joinChatRoom(id)
{
  const unchangeId = id
  socket.emit('join-room', {
    roomId: unchangeId
  })
}


function getLastMessageForThisContact(spanRef, id)
{
  const req = new XMLHttpRequest();
  req.open("GET", `/getLastMessage?groupId=${id}&skip=0&limit=1`);
  req.send();
  req.addEventListener("load", function(){
    
      if(req.status === 404)
      {
        return; 
      }
      else
      {
        const data = JSON.parse(req.responseText);
        //console.log(data,"ye hai last message ka scene");
        if( data[0].senderId === email)
          {
            spanRef.innerText = data[0].message.slice(0,6)+" you *";
          }
        else
        {
          spanRef.innerText = data[0].message.slice(0,6)+" from *";
        }
      }
  })
}

const searchNode = document.getElementById("searchNode");
searchNode.addEventListener("keyup", e=>{
  searchAndDisplay(e);
})

function searchAndDisplay()
{
  contactsDiv.forEach(item=>{
    
    if(item.children[0].innerText.toLowerCase().includes(searchNode.value))
    {
      item.style.display = "block";
    }
    else
    {
      item.style.display = "none";
    }
  })
}