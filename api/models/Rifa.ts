import mongoose, { Schema, model, Model, mongo } from "mongoose";
import * as RifaTypes from "../types/rifa.types.js";

export interface IRifa {
    paymentId: String;
    name: String;
    status: RifaTypes.StatusRifaType;
    amount: number;
    phone: String;
    email: String;
    claimedNumber: number | null;
}

const RifaSchema: Schema<IRifa> = new mongoose.Schema({
    paymentId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    status: { type: String, enum: RifaTypes.STATUSRIFATYPE, required: true },
    amount: { type: Number, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    claimedNumber: { type: Number, default: null, unique: true, sparse: true }
});

const Rifa: Model<IRifa> = model("Rifa", RifaSchema);
export default Rifa;