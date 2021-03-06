import express from "express";
import path from "path";
import socketIO from "socket.io";
import UserModel from "../models/User";
import bcrypt from "bcryptjs";
import validate from "./validateFields";

const messages = [];

const controller = {
  roomPath: express.static(
    path.resolve(__dirname, "..", "..", "public", "views", "room")
  ),
  loginPath: express.static(
    path.resolve(__dirname, "..", "..", "public", "views", "login")
  ),
  RegisterPath: express.static(
    path.resolve(__dirname, "..", "..", "public", "views", "register")
  ),
  messagesRooms: (server) => {
    const io = socketIO(server);
    const room = io.of(`/room`).on("connection", (socket) => {
      console.log("new_connection");
      socket.emit("update_messages", messages);
      socket.on("new_connection", (data) => {
        messages.push(data);
        room.emit("update_messages", messages);
      });
    });
  },

  userRegister: async (req, res) => {
    //Validate fields input
    const { error } = validate.registerValidate(req.body);
    if (error) {
      return res.status(400).json({ message: error.message });
    }
    //verify if username already exists
    const selectedUsername = await UserModel.findOne({
      username: req.body.username,
    });
    if (selectedUsername) {
      return res.status(400).json({ message: "Username already existe" });
    }

    //verify if email already exists
    const seletecEmail = await UserModel.findOne({ email: req.body.email });
    if (seletecEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const user = new UserModel({
      //getting body params of requisition
      name: req.body.name,
      username: req.body.username,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password),
    });
    try {
      const savedUser = await user.save();
      //return used save in database
      res.json({ message: savedUser });
    } catch (error) {
      res.status(400).json({ message: error });
    }
  },

  userLogin: async (req, res) => {
    //Validate fields input
    const { error } = validate.loginValidate(req.body);
    if (error) {
      return res.status(400).json({ message: error.message });
    }

    //Selected user in database where email == emais body
    const userSelected = await UserModel.findOne({ email: req.body.email });
    if (!userSelected) {
      return res.status(400).json({ message: "Email or Password not exists" });
    }

    //compare password, the password database and password body
    const verifyPassword = bcrypt.compareSync(
      req.body.password,
      userSelected.password
    );
    if (!verifyPassword) {
      return res.status(400).json({ message: "Email or Password not exists" });
    }
    res.json({ message: "login", user: userSelected.username });
  },
};
export default controller;
