const visitorSchema = new mongoose.Schema(
  {
    name: String,
    mobile: String,
    qid: String,
  },
  { timestamps: true }
);

export const Vehicle = mongoose.model("Visitor", visitorSchema);
