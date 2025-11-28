import express from "express";
import { main } from "../app.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const data = req.body.question;
    const response = await main(data);
    res.send({
      response: response,
    });
  } catch (err) {
    console.log(err);
  }
});

export default router;
