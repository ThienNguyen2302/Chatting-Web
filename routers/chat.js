const express = require("express")
const router = express.Router()
const Conversation = require("../model/conversation")
const Auth = require("../midlewares/Auth")
const Messages = require("../model/messages")
const User = require("../model/user")

router.get("/:id", Auth.authorize ,async (req,res) => {
    let id = req.params.id

    //get conversation
    let conver = await Conversation.findOne({
        user1: req.session.user._id,
        user2: id
    })

    if(!conver) {
        conver = await Conversation.findOne({
            user2: req.session.user._id,
            user1: id
        })
        if(!conver){
            conver = new Conversation({
                user2: req.session.user._id,
                user1: id
            })
            conver = await conver.save()
        }
    }
    req.session.room = conver._id
    var data,receiver_fullname;
    User.find({}, function (err, users) {
        users = users.filter(u => u.email !== req.session.user.email)
        data = {
          users: users.map(function (user) {
            return {
              email: user.email,
              name: user.fullname,
              id: user._id
            };
          })
        };
      });
    const messages = await Messages.find({room: conver._id}).sort({time: 1})
    User.findOne({_id:id}, (err, user)=> {
        receiver_fullname=user.fullname;
    });
    var context = {
        messages: messages.map(function (message) {
            let style;
            if(req.session.user._id.toString() !== message.user){
                style = "hoder"
            }
            else {
                style = "me"
            }
          return {
            sender: message.user,
            style: style,
            message: message.message,
            time: message.time
          };
        }),
        
        roomid: conver._id,
        userid: req.session.user._id,
        userfullname:req.session.user.fullname,
        data,
      };
    return res.render("chat", context)
})

module.exports = router