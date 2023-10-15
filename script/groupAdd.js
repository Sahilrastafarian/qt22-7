const afterClearingSelectedUsers = `<div>
                        <label for="groupName">Group Name</label>
                        <input type="text" name="groupName" id="givenGroupName"/>
                    </div>`;


const groupOverlay = document.getElementById("groupOverlay");

const groupNameNode = document.getElementById("givenGroupName");

const selectedContactForGroupNode = document.getElementById("selectedContactsForGroup");

const groupOverlayCloseBtn = document.getElementById("closeGroupOverlay");
groupOverlayCloseBtn.addEventListener("click", hideGroupOverlay);

newGroupBtn.onclick = showGroupMakingPopup;   //degfined in chatGod.js

const createThisGroupBtn = document.getElementById("createThisGroup");
createThisGroupBtn.onclick = createGroup;

function hideGroupOverlay()
{
  groupOverlay.style.display = "none";
}

function showGroupMakingPopup()
{
  groupOverlay.style.display = "block";
  console.log(myContacts);
}



function addedToGroupList(user)
{
  if( selectedUsersForGroup.length >= 1 )
  {
    createThisGroupBtn.disabled = false;
  }
  let exist = alreadyExist();

  if(exist)
  {
    errorNode.innerText = "user already selected";
    errorNode.classList.add("errorOccured");
    setTimeout(function(){
        errorNode.classList.remove("errorOccured");
        errorNode.innerText = '';
      },5000);

    return;
  }
  function alreadyExist()
  {
    
    for(let counter = 0; counter < selectedUsersForGroup.length; counter++)
    {
      console.log(selectedUsersForGroup[counter].email, user.email);
      if(selectedUsersForGroup[counter].email === user.email)
      {
        return true;
      }
    }
    return false;
  }


  //console.log(user, "added to group list");
  const mainDiv = document.createElement("div");
  mainDiv.classList.add("selecGroupPartMain");
  const name = document.createElement("p");
  name.innerText = user.name;
  const id = document.createElement("span");
  id.innerText = user.email;
  const deleteBtn = document.createElement("span");
  deleteBtn.classList.add("deleteSelectedGroupPart")
  deleteBtn.innerText = "x";

  deleteBtn.addEventListener("click",e=>{
    mainDiv.remove();
    const index = findObj();
    function findObj()
    {
      for(let counter = 0; counter < selectedUsersForGroup.length; counter++)
      {
        if(selectedUsersForGroup[counter].email === user.email)
        {
          console.log(user.email);
          return counter;
        }
      }
    }


    selectedUsersForGroup.splice(index, 1);
    console.log(selectedUsersForGroup);
    });

  mainDiv.appendChild(name);
  mainDiv.appendChild(id);
  mainDiv.appendChild(deleteBtn);
  selectedContactForGroupNode.appendChild(mainDiv);
  selectedUsersForGroup.push({email: user.email});
}

function createGroup()
{
  if( selectedUsersForGroup.length > 1 )
  {
    createThisGroupBtn.disabled = false;
    createThisGroupBtn.onclick = createGroup;
  }
  else
  {
    createThisGroupBtn.disabled = true;
    errorNode.innerText = "should have 2 or more users selected";
    errorNode.classList.add("errorOccured");
    setTimeout(function(){
        errorNode.classList.remove("errorOccured");
        errorNode.innerText = '';
      },5000);
    return;
  }
        //to add group name add functionality after api is done

  sendGroupDataToDB();
}

function sendGroupDataToDB()
{
  groupNameNode.value = groupNameNode.value.trim();
  if(groupNameNode.value === '')
  {
    errorNode.innerText = "group name required";
      errorNode.classList.add("errorOccured");
      setTimeout(function(){
          errorNode.classList.remove("errorOccured");
          errorNode.innerText = '';
        },5000);
    return;
  }
  const req = new XMLHttpRequest();
  req.open("POST", `/newGroup?name=${groupNameNode.value}`);
  req.setRequestHeader("content-type","application/json");
  req.send(JSON.stringify(selectedUsersForGroup));
  req.addEventListener("load", function(){
    if(req.status === 200)
    {
      groupNameNode.value = '';

      const data = [];
      data.push(JSON.parse(req.responseText));
      myContacts = [...myContacts, ...data];
      showInContacts(data);

      selectedContactForGroupNode.innerText = '';
      selectedContactForGroupNode.innerHTML = afterClearingSelectedUsers;
      errorNode.innerText = "group created";
      errorNode.classList.add("noErrorOccured");
      setTimeout(function(){
          errorNode.classList.remove("noErrorOccured");
          errorNode.innerText = '';
        },5000);
      selectedUsersForGroup = [];
    }
    else
    {
      errorNode.innerText = "group not created";
      errorNode.classList.add("errorOccured");
      setTimeout(function(){
          errorNode.classList.remove("errorOccured");
          errorNode.innerText = '';
        },5000);
    }
  })
}