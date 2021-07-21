/*
    Author: Carlos Field-Sierra
    Description: This is the client side js for the ostaa website
    It gets ajax respones and shows it on the ui. Furthemore, it sends
    responses to the server.
*/
window.onload = () => {

    function addUser(){
        const newUserName = $("#username").val();
        const newPassWord =  $("#password").val();
        let newUser = {
            username: newUserName,
            password: newPassWord,
            listings:[],
            purchases:[],
        }
        newUser = JSON.stringify(newUser);

        $.ajax({
            url: '/add/user/',
            data:{user: newUser},
            method:'POST',
            success: function( result ) {
            }
        });
      
    }


    function addItem(){
        const username = $("#usernameItem").val();
        const title = $("#title").val();
        const description = $("#description").val();
        const image = $("#image").val();
        const price = $("#price").val();
        const stat = $("#stat").val();
        let newItem = {
            title,
            description,
            image,
            price,
            stat,
            username,
        }
        newItem= JSON.stringify(newItem);
        $.ajax({
            url: '/add/item/USERNAME',
            data:{item: newItem},
            method:'POST',
            success: function( result ) {
            }
        });

    }


    function addUserBtnListner(){
        var btn = document.getElementById("addUserBtn");
        btn.addEventListener("click",addUser);
    }
    function addItemBtnListner(){
        var btn = document.getElementById("addItemBtn");
        btn.addEventListener("click",addItem);
    }

    function Main(){
        addUserBtnListner();
        addItemBtnListner();
    }
    Main();
}